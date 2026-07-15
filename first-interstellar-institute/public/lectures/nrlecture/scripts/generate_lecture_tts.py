#!/usr/bin/env python3
"""Generate Alnilam lecture WAVs for every slide, then glue into one track.

Resumable: skips slides that already have a matching .wav.
Requires StoryLens backend deps and Gemini keys.
"""

from __future__ import annotations

import asyncio
import json
import os
import subprocess
import sys
from pathlib import Path

BACKEND = Path("/home/nik/Desktop/github/storylens/backend")
LECTURE_ROOT = Path(
    "/home/nik/Desktop/github/FII/first-interstellar-institute/public/lectures/nrlecture"
)
VOICEOVER_PATH = LECTURE_ROOT / "data" / "lecture-voiceover.json"
OUT_DIR = LECTURE_ROOT / "tts-lecture-alnilam"
VOICE = "Alnilam"
GAP_SECONDS = 0.6  # pause between slides in the full mix


def pcm_to_wav(pcm: bytes, rate: int, wav_path: Path) -> None:
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "s16le",
            "-ar",
            str(rate),
            "-ac",
            "1",
            "-i",
            "pipe:0",
            str(wav_path),
        ],
        input=pcm,
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def slug(title: str) -> str:
    import re

    s = re.sub(r"[^a-zA-Z0-9]+", "-", title).strip("-").lower()
    return (s[:55] or "slide")


def silence_wav(path: Path, seconds: float, rate: int = 24000) -> None:
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "lavfi",
            "-i",
            f"anullsrc=r={rate}:cl=mono",
            "-t",
            str(seconds),
            str(path),
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def glue_all(wavs: list[Path], out_path: Path) -> None:
    gap = OUT_DIR / "_gap.wav"
    silence_wav(gap, GAP_SECONDS)
    list_file = OUT_DIR / "_concat.txt"
    lines: list[str] = []
    for i, w in enumerate(wavs):
        lines.append(f"file '{w.resolve()}'")
        if i < len(wavs) - 1:
            lines.append(f"file '{gap.resolve()}'")
    list_file.write_text("\n".join(lines) + "\n", encoding="utf-8")
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(list_file),
            "-c",
            "copy",
            str(out_path),
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


async def main() -> None:
    os.environ.setdefault(
        "TTS_KEY_POOL_STATE_PATH", "/tmp/storylens-tts-state/tts_key_pool_state.json"
    )
    os.environ.setdefault(
        "GEMINI_SPEND_TRACKER_PATH", "/tmp/storylens-tts-state/gemini_spend_tracker.json"
    )

    sys.path.insert(0, str(BACKEND))
    from dotenv import load_dotenv

    load_dotenv(BACKEND / ".env", override=False)
    os.environ["TTS_KEY_POOL_STATE_PATH"] = (
        "/tmp/storylens-tts-state/tts_key_pool_state.json"
    )
    os.environ["GEMINI_SPEND_TRACKER_PATH"] = (
        "/tmp/storylens-tts-state/gemini_spend_tracker.json"
    )

    from app.services.llm_service import llm_service

    data = json.loads(VOICEOVER_PATH.read_text(encoding="utf-8"))
    slides = data["slides"]
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    manifest = {
        "lecture": data.get("lecture"),
        "voice": VOICE,
        "gap_seconds": GAP_SECONDS,
        "slides": [],
    }

    produced: list[Path] = []
    ok = 0
    fail = 0

    for s in slides:
        sid = s["id"]
        title = s.get("title") or f"slide-{sid}"
        text = (s.get("voiceover") or "").strip()
        fname = f"slide{sid:02d}_{VOICE}_{slug(title)}.wav"
        out = OUT_DIR / fname
        txt = OUT_DIR / fname.replace(".wav", ".txt")

        entry = {
            "id": sid,
            "title": title,
            "file": fname,
            "chars": len(text),
            "status": "pending",
        }

        if not text:
            entry["status"] = "skipped_empty"
            manifest["slides"].append(entry)
            print(f"[{sid:02d}] skip empty", flush=True)
            continue

        txt.write_text(
            f"title: {title}\nvoice: {VOICE}\nchars: {len(text)}\n\n{text}\n",
            encoding="utf-8",
        )

        if out.exists() and out.stat().st_size > 1000:
            entry["status"] = "exists"
            manifest["slides"].append(entry)
            produced.append(out)
            print(f"[{sid:02d}] exists {fname}", flush=True)
            ok += 1
            continue

        print(f"[{sid:02d}] generating {fname} ({len(text)} chars)", flush=True)
        success = False
        last_err: Exception | None = None
        for attempt in range(1, 4):
            try:
                pcm, rate = await llm_service.generate_audio(
                    text=text,
                    voice_name=VOICE,
                    timeout_seconds=120.0,
                    max_chars=1000,
                )
                pcm_to_wav(pcm, rate, out)
                entry["status"] = "ok"
                entry["bytes"] = out.stat().st_size
                entry["sample_rate"] = rate
                produced.append(out)
                ok += 1
                success = True
                print(f"[{sid:02d}] OK {out.stat().st_size} bytes", flush=True)
                break
            except Exception as e:
                last_err = e
                msg = str(e)
                wait = 20 * attempt if ("503" in msg or "429" in msg or "UNAVAILABLE" in msg or "RESOURCE_EXHAUSTED" in msg) else 5 * attempt
                print(
                    f"[{sid:02d}] attempt {attempt}/3 failed: {type(e).__name__}: {e}",
                    flush=True,
                )
                print(f"[{sid:02d}] waiting {wait}s before retry...", flush=True)
                await asyncio.sleep(wait)
                # clear local cooldown so retries can proceed
                for p in Path("/tmp/storylens-tts-state").glob("tts_key_pool_state.json*"):
                    try:
                        p.unlink()
                    except OSError:
                        pass

        if not success:
            entry["status"] = "failed"
            entry["error"] = f"{type(last_err).__name__}: {last_err}" if last_err else "unknown"
            fail += 1
            print(f"[{sid:02d}] FAILED after retries", flush=True)
        else:
            # polite pause between successes to reduce 503/429
            await asyncio.sleep(2.5)

        manifest["slides"].append(entry)

    # Prefer chronological order of all existing slide wavs for the glue
    produced = sorted(
        [p for p in OUT_DIR.glob("slide*_Alnilam_*.wav") if p.stat().st_size > 1000],
        key=lambda p: p.name,
    )

    full = OUT_DIR / f"FULL_LECTURE_{VOICE}.wav"
    if produced and fail == 0:
        print(f"Gluing {len(produced)} tracks -> {full.name}", flush=True)
        glue_all(produced, full)
        manifest["full_lecture"] = full.name
        manifest["full_bytes"] = full.stat().st_size
        print(f"Full lecture: {full} ({full.stat().st_size} bytes)", flush=True)
    elif produced:
        print(
            f"Skipping full glue: {fail} slides still failed. Have {len(produced)} wavs.",
            flush=True,
        )
        # Still write a partial mix for listening
        partial = OUT_DIR / f"PARTIAL_LECTURE_{VOICE}.wav"
        glue_all(produced, partial)
        manifest["partial_lecture"] = partial.name
        print(f"Wrote partial: {partial}", flush=True)
    else:
        print("Nothing to glue", flush=True)

    (OUT_DIR / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"Done: ok={ok} fail={fail} total={len(slides)}", flush=True)


if __name__ == "__main__":
    asyncio.run(main())
