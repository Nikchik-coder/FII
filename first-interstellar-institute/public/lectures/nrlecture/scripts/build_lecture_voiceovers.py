#!/usr/bin/env python3
"""Build continuous, spoken lecture voiceovers for every slide.

Rewrites notes into TTS-friendly narration: spoken symbols, no UI drag cues,
light bridges so the full audio feels like one lecture.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NOTES_PATH = ROOT / "data" / "slide-notes.json"
OUT_PATH = ROOT / "data" / "lecture-voiceover.json"

# Continuous lecture narration keyed by slide id (spoken aloud as-is).
VOICEOVERS: dict[int, str] = {
    0: (
        "Welcome. This lecture is called Slicing Spacetime. "
        "Einstein published general relativity in nineteen fifteen with pen and paper. "
        "Today we will see how supercomputers and GPUs turned those impossible equations "
        "into a digital laboratory for the cosmos."
    ),
    1: (
        "Here is the big picture. Artificial intelligence and numerical relativity both had "
        "decades-long dark ages: the theory existed, but the algorithms and hardware could not deliver. "
        "Both broke through when better mathematics met GPUs and massive compute. "
        "For numerical relativity, remember the path: A D M, then B S S N, then C C Z four, "
        "the two thousand five breakthrough, and LIGO in two thousand fifteen."
    ),
    2: (
        "Why do we need numerical relativity? Einstein predicted gravitational waves in nineteen sixteen, "
        "but for nearly a century nobody could compute what a black hole merger actually sounds like. "
        "Pen-and-paper approximations work for the slow inspiral, and perturbation theory handles the ringdown. "
        "But the merger — the loudest, most informative part — is violently non-linear. "
        "Only full numerical relativity can solve it. "
        "LIGO matched GW one five zero nine one four against about two hundred thousand numerical templates. "
        "Without those templates, gravitational-wave astronomy would be blind."
    ),
    3: (
        "So why general relativity in the first place? Newton's gravity implies instantaneous action at a distance. "
        "If the Sun vanished, Earth would instantly change orbit — even though sunlight takes about eight minutes to arrive. "
        "Special relativity forbids faster-than-light information. "
        "Einstein spent a decade fixing this: in general relativity, gravity propagates at the speed of light. "
        "If the Sun vanished, Earth would keep orbiting for about eight point three minutes until the disturbance arrived — "
        "just as electromagnetic changes travel at c in Maxwell's theory."
    ),
    4: (
        "Einstein did not invent the math of curved space. He inherited a nineteenth-century toolkit. "
        "Gauss showed how to measure intrinsic curvature of a surface. "
        "Riemann generalized that to n-dimensional manifolds with a metric — the ancestor of the metric tensor. "
        "Christoffel introduced connection symbols that track how directions twist. "
        "Ricci and Levi-Civita forged tensor calculus so laws look the same in every coordinate system. "
        "Einstein's leap was physical: gravity is the geometry of spacetime. "
        "Without that inheritance, the field equation could not have been written."
    ),
    5: (
        "Here is Einstein's field equation in one line. "
        "The left side is geometry: how spacetime curves. "
        "The right side is matter and energy: how much stuff is there and how it moves. "
        "It looks as simple as E equals m c squared. That is a trap — it is shorthand for ten equations."
    ),
    6: (
        "That elegant line shatters into ten coupled, non-linear partial differential equations. "
        "Coupled means you cannot solve one alone. Non-linear means gravity feeds back on itself. "
        "Pen and paper only handle the simplest cases. Dynamic mergers need machines."
    ),
    7: (
        "To unpack the geometry, start with the metric. "
        "On a flat table, distance is Pythagoras: d s squared equals d x squared plus d y squared. "
        "In spacetime, d s squared equals g mu nu times d x mu times d x nu. "
        "Coordinates are just addresses. The metric converts address differences into real distances and times. "
        "When the metric changes from place to place, that change is gravity — geometry, not a mystical force."
    ),
    8: (
        "Here is the idea visually. In flat space, every little ruler has the same length everywhere, "
        "and physical distance matches coordinate distance. "
        "Near a mass, the same coordinate gap can stretch into a much larger real distance. "
        "Far from the mass, both look almost the same. Only near the mass does curved space stretch. "
        "That contrast is the metric in action."
    ),
    9: (
        "Next: Christoffel symbols — the road-map corrections. "
        "On a flat table, forward means the same everywhere. On a globe, forward at the equator "
        "and forward at the pole point in different directions. "
        "Christoffel symbols track how directions twist as you move. "
        "In flat space they vanish. Near a black hole they become huge. "
        "They are the building blocks of curvature, not curvature itself yet."
    ),
    10: (
        "Parallel transport makes that concrete. Carry an arrow around a closed loop, keeping it as straight as possible. "
        "On a flat surface it returns unchanged. On a sphere it returns rotated. "
        "That rotation is curvature showing up. The result depends on the path — that is the definition of curvature."
    ),
    11: (
        "The Riemann curvature tensor is the full answer to how curved spacetime is here. "
        "Physically, it measures tidal forces: how nearby freely falling objects drift apart or squeeze together. "
        "Two balls falling toward Earth drift closer because gravity converges toward the center. "
        "That relative drift is curvature, built from Christoffels and how they change."
    ),
    12: (
        "Geodesic deviation says the same thing with a picture. "
        "Two walkers start side by side and go straight ahead. On a flat table they stay parallel. "
        "On a sphere — or in curved spacetime — they converge or diverge. "
        "The rate of that drift is what Riemann measures. "
        "In general relativity there is no force between them; the space between them is curved."
    ),
    13: (
        "We compress Riemann into the Ricci tensor, then into the Ricci scalar, "
        "and finally into the Einstein tensor G. "
        "G is specially built so energy is automatically conserved. "
        "This is the left-hand side of Einstein's equation."
    ),
    14: (
        "The right-hand side is the stress-energy tensor. "
        "It answers: how much stuff is here, and how is it moving? "
        "For ordinary fluids we use density, pressure, and velocity. "
        "For exotic wormhole matter we use a scalar field whose energy and pressure come from its gradients and potential. "
        "Normal matter attracts. Exotic negative energy can effectively repel."
    ),
    15: (
        "Motion in curved spacetime means geodesics: the straightest possible paths. "
        "The rubber-sheet funnel is only an analogy, but the idea is right. "
        "Near the mass the geometry is steep, so paths bend sharply. "
        "There is no mystical force yanking objects in — they move as inertially as the geometry allows."
    ),
    16: (
        "The geodesic equation is Newton's F equals m a rewritten for curved spacetime. "
        "The Christoffel symbols play the role of gravity. "
        "In flat space they vanish and you get straight lines. "
        "Tau is time on the falling object's own clock."
    ),
    17: (
        "Here is the key difficulty: gravity creates gravity. "
        "In electromagnetism, light does not source more light in the same way. "
        "In general relativity, gravitational field energy itself gravitates. "
        "That feedback loop makes dynamic analytical solutions almost impossible."
    ),
    18: (
        "Light cones near a black hole show the geometric trap. "
        "Far away, cones are upright and light can escape. "
        "Near the horizon they tilt inward. "
        "Inside, both futures point inward — there is no outward escape path. "
        "Nothing escapes not because of suction, but because geometry has no outward future."
    ),
    19: (
        "Now we turn toward computation. Computers cannot store smooth continuous functions. "
        "They chop space into a grid and replace derivatives with finite differences between neighbors. "
        "Production runs use huge grids, often with finer nested grids near black holes. "
        "The challenge of numerical relativity is rewriting Einstein's equations so this grid approach is stable and accurate."
    ),
    20: (
        "Resolution matters. A coarse grid looks jagged and wrong. "
        "Finite differences amplify errors, so derivatives are even harder than the function itself. "
        "That is why numerical relativity needs fine grids and high-order stencils — fourth or sixth order."
    ),
    21: (
        "Part two begins here. Einstein's equation treats space and time symmetrically. "
        "There is no built-in now and next. "
        "A computer needs an initial-value problem: give me geometry now, compute geometry one step later. "
        "So we deliberately break four-dimensional symmetry and rewrite general relativity as three-dimensional space evolving through time — "
        "like frames in a movie. Everything that follows — A D M, B S S N, C C Z four — is the same physics with better bookkeeping."
    ),
    22: (
        "The A D M three-plus-one decomposition splits the metric into a spatial metric, a lapse, and a shift — "
        "ten numbers in total, the same information as the original metric, reorganized for time-stepping. "
        "The spatial metric is the shape of space on each now slice. "
        "The lapse is clock speed between slices. "
        "The shift is how the coordinate grid slides sideways."
    ),
    23: (
        "Picture the history of the universe as a loaf of bread. "
        "Each slice is space at one instant. "
        "The computer flips from slice to slice like a flipbook. "
        "That is the three-plus-one picture made visual."
    ),
    24: (
        "Lapse, shift, and extrinsic curvature are the evolution variables. "
        "Near a black hole we often drive the lapse toward zero so the simulation never reaches the singularity. "
        "The shift keeps coordinates from tangling as black holes move. "
        "Extrinsic curvature tells how fast the slice's shape is stretching or compressing."
    ),
    25: (
        "In practice: high lapse means lots of proper time between slices; low lapse means clocks nearly freeze. "
        "Nonzero shift tilts the connecting lines of the grid. "
        "These are coordinate tools — not new physics — chosen for stable simulations."
    ),
    26: (
        "Feed the three-plus-one split back into Einstein and the ten equations sort into two kinds. "
        "Six evolution equations march the geometry forward in time. "
        "Four constraint equations have no time derivatives — they must already be true on every slice: "
        "one Hamiltonian constraint and three momentum constraints. "
        "If initial data fails the constraints, it is not a valid universe — the simulation crashes immediately."
    ),
    27: (
        "The A D M evolution equations are the heart of the marching scheme. "
        "The shape of space changes because the slice is bending. "
        "The bending rate itself changes because of clock gradients, existing curvature, and matter. "
        "Shape drives bending, and bending drives shape. That feedback is what each timestep solves."
    ),
    28: (
        "Think of constraints like Sudoku rules. They do not tell you the next move; they say whether the current board is legal. "
        "The Hamiltonian checks the energy budget. The momentum constraints check the flow budget. "
        "In exact math, valid data stays valid. On a computer, rounding errors leak each step. "
        "With raw A D M those errors piled up for about thirty years and blew up simulations. "
        "B S S N and C C Z four fix the form, not the physics."
    ),
    29: (
        "Why does A D M crash? A good numerical system needs disturbances to travel at definite finite speeds. "
        "A D M has modes with zero or undefined speed, so numerical junk sits and grows exponentially. "
        "The physics was right; the packaging was wrong for grids. "
        "The path of progress is A D M, then B S S N, then C C Z four."
    ),
    30: (
        "Watch the contrast. Same initial data, same tiny numerical noise. "
        "A D M: the noise has no speed limit and explodes. "
        "B S S N: the same noise is carried away at finite speed and stays bounded. "
        "That is why numerical relativity was stuck for decades."
    ),
    31: (
        "B S S N is not new gravity. It is a change of variables. "
        "We separate the overall scale of space from its shape, "
        "split average expansion from uneven stretching, "
        "and evolve coordinate-drift quantities explicitly. "
        "Result: disturbances travel at known finite speeds, so noise is carried away instead of exploding."
    ),
    32: (
        "Instead of one tangled set of equations, we march cleaner pieces: "
        "the scale factor, the rescaled shape of space, the average curvature, and more. "
        "Numerical noise propagates away harmlessly. "
        "This is why long simulations finally stopped dying after decades of failure."
    ),
    33: (
        "C C Z four adds the clean-up crew. "
        "B S S N stops errors from exploding, but they can still slowly drift. "
        "Extra fields measure how far you are from a valid solution, "
        "and damping parameters act like friction that drag errors back to zero. "
        "Think of B S S N as a ball on a flat table, and C C Z four as a ball in a bowl. "
        "This is what modern codes like GRTeclyn lean on."
    ),
    34: (
        "Gauge conditions are free coordinate choices, not physics. "
        "One-plus-log slicing slows clocks near singularities so we never arrive at the singularity. "
        "The Gamma-driver shift steers the grid to follow moving black holes — like a camera tracking a car. "
        "Together with B S S N, that is the moving-punctures recipe that unlocked two thousand five."
    ),
    35: (
        "Two thousand five: the binary black hole problem was finally solved. "
        "Three groups, same era — Pretorius with generalized harmonic coordinates, "
        "and Campanelli and Baker with moving punctures plus B S S N. "
        "Today's standard recipe is B S S N or C C Z four, with one-plus-log slicing and Gamma-driver shift: "
        "stable inspiral, merger, and ringdown."
    ),
    36: (
        "Here is what numerical relativity computes. "
        "Inspiral: the orbit shrinks and the frequency rises — the chirp — as energy is lost to gravitational waves. "
        "Merger: the loudest, fully non-linear peak. "
        "Ringdown: the remnant rings like a struck bell. "
        "That waveform is what LIGO matches. Without numerical relativity, the merger piece is missing."
    ),
    37: (
        "LIGO is a Michelson interferometer with two four-kilometer arms at right angles. "
        "A laser is split, travels each arm, and returns. Normally the recombination is dark. "
        "A gravitational wave stretches one arm and squeezes the other by about ten to the minus twenty-one — absurdly small — "
        "shifting the interference pattern. "
        "GW one five zero nine one four was two black holes merging about one point three billion light-years away. "
        "Nobel Prize two thousand seventeen — enabled by numerical templates."
    ),
    38: (
        "Gravitational waves have two polarizations: plus and cross. "
        "Plus stretches and squeezes along the axes; cross does the same rotated forty-five degrees. "
        "A ring of free particles deforms as the wave passes. "
        "LIGO's perpendicular arms are well suited to catch the plus polarization."
    ),
    39: (
        "Part four: trust. A grid is an approximation. "
        "To check you are not staring at junk, run the same problem at three resolutions. "
        "If the code is correct, differences between solutions shrink at a rate set by the finite-difference order."
    ),
    40: (
        "The convergence factor Q is the sanity-check number. "
        "For a fourth-order scheme we expect Q to approach sixteen. "
        "If Q is wild, there is a bug or the run is under-resolved. "
        "GRTeclyn uses fourth-order stencils, so we expect Q to sixteen."
    ),
    41: (
        "In action: coarse, medium, and fine solutions converge together. "
        "The Q readout approaches sixteen for a fourth-order code. "
        "That is how we validate that the answer is real physics, not a numerical artifact."
    ),
    42: (
        "Now power. C P U cores are islands that talk over slow links — packets stall. "
        "A G P U has thousands of cores sharing one fast memory pool. "
        "Numerical relativity updates are stencils: every cell reads its neighbors every step. "
        "Shared fast memory is transformative."
    ),
    43: (
        "The numbers make it concrete. A data-center G P U like an H one hundred "
        "has far more parallel cores and roughly seven times the memory bandwidth of a big server C P U. "
        "For stencil codes, that bandwidth advantage matters more than raw floating-point peak. "
        "One G P U can replace a rack of C P Us."
    ),
    44: (
        "This closes the opening timeline loop. "
        "The same hardware that trains large A I models is exactly what solves Einstein's equations. "
        "Numerical relativity rides the A I hardware boom for free — cheaper FLOPs, bigger memory, faster interconnect — "
        "without funding a single chip."
    ),
    45: (
        "Adaptive mesh refinement puts fine grids only where curvature is large — "
        "near black holes and wave fronts — and keeps coarse grids far away. "
        "That cuts cost by orders of magnitude. "
        "Without A M R, realistic binary or wormhole runs are impractical."
    ),
    46: (
        "GRTeclyn, from the GRChombo ecosystem, is built for GPUs and uses A M ReX for adaptive mesh refinement, "
        "load balance, and GPU offload. "
        "This is the tool that makes exotic spacetime simulations feasible."
    ),
    47: (
        "Part five: the research payoff. "
        "A traversable wormhole is a tunnel through spacetime held open by exotic matter — "
        "hypothetical stuff with negative energy that pushes space apart. "
        "Normal matter attracts; exotic support is like anti-gravity propping the throat open. "
        "The research question: what happens when that support is removed?"
    ),
    48: (
        "In the simulation we remove much of the exotic support and give a slight squeeze. "
        "Gravity wins: the throat collapses and an apparent horizon forms. "
        "Swallowed exotic matter fights back in a phantom bounce — a violent curvature rebound — "
        "and asymmetric collapse launches gravitational waves outward at nearly the speed of light."
    ),
    49: (
        "What we found: a single exotic object can radiate a gravitational-wave signal without a collision. "
        "For the squeeze strength studied, a roughly one-thousand-solar-mass wormhole at about one megaparsec "
        "sits near Advanced LIGO sensitivity. "
        "Detection needs closer sources, larger asymmetries, or next-generation detectors. "
        "See the paper on the archive, two six zero four point zero zero zero seven one."
    ),
    50: (
        "In the rotating case, a spinning ring of exotic matter holds the throat open. "
        "Turn off the pump: rotation already breaks spherical symmetry, "
        "so collapse naturally emits a strong, coherent gravitational-wave burst — "
        "no artificial squeeze required."
    ),
    51: (
        "To leave you with four ideas. "
        "General relativity broke unaided human calculation — ten non-linear equations. "
        "A D M slicing turned four-dimensional physics into a three-dimensional movie. "
        "Two thousand five, with B S S N, C C Z four, and gauge choices, stabilized that movie. "
        "GPUs and adaptive mesh refinement gave the power for exotic spacetimes. "
        "We heard black holes merge in two thousand fifteen. Tomorrow, we might catch a wormhole collapsing."
    ),
    52: (
        "Thank you. I am happy to take questions."
    ),
}


def main() -> None:
    data = json.loads(NOTES_PATH.read_text(encoding="utf-8"))
    slides = data["slides"]
    missing = [s["id"] for s in slides if s["id"] not in VOICEOVERS]
    if missing:
        raise SystemExit(f"Missing voiceovers for slide ids: {missing}")

    lecture = {
        "lecture": data.get("lecture", "Slicing Spacetime"),
        "voice": "Alnilam",
        "description": (
            "Continuous spoken lecture narration for TTS. "
            "Symbols spelled for speech; no UI drag cues; light bridges between slides."
        ),
        "slides": [],
    }

    for s in slides:
        vo = " ".join(VOICEOVERS[s["id"]].split())
        if len(vo) > 1000:
            raise SystemExit(f"Slide {s['id']} voiceover too long: {len(vo)} chars")
        s["voiceover"] = vo
        lecture["slides"].append(
            {
                "id": s["id"],
                "title": s.get("title"),
                "part": s.get("part"),
                "anim": s.get("anim"),
                "voiceover": vo,
                "chars": len(vo),
            }
        )

    NOTES_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    OUT_PATH.write_text(json.dumps(lecture, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    total = sum(x["chars"] for x in lecture["slides"])
    print(f"Wrote {len(lecture['slides'])} voiceovers")
    print(f"Updated {NOTES_PATH}")
    print(f"Wrote {OUT_PATH}")
    print(f"Total chars: {total} (~{total/14:.0f} spoken seconds rough)")
    longish = [x for x in lecture["slides"] if x["chars"] > 850]
    if longish:
        print("Near TTS limit:")
        for x in longish:
            print(f"  {x['id']:02d} {x['chars']} {x['title']}")


if __name__ == "__main__":
    main()
