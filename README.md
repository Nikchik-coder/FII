# FII — First Interstellar Institute

Website for the First Interstellar Institute, featuring video lectures, an interactive presentation on numerical relativity, research articles, and crypto donation support.

Live at **https://www.firstinterstellarinstitute.com**

## Tech Stack

- **Framework**: Vite + React 19 + TypeScript
- **Styling**: Tailwind CSS (chalkboard/minimalistic theme matching the lecture)
- **Fonts**: Orbitron (headings), Inter (body)
- **Interactive lecture**: Vanilla JS + Three.js + KaTeX (served as static files)
- **Deployment**: Nginx on VPS, static build

## Local Development

```bash
cd first-interstellar-institute
npm install
npm run dev          # http://localhost:5173
```

The lecture page is at `http://localhost:5173/lectures/nrlecture/presentation.html`.

## Build

```bash
cd first-interstellar-institute
npm run build        # outputs to dist/
npm run preview      # serve the production build locally
```

## Deployment

### VPS Access

```bash
ssh preprint         # root@89.124.96.222
```

### Redeploy Process

From the local machine:

```bash
# 1. Commit and push changes
cd /home/nik/Desktop/github/FII
git add -A
git commit -m "your commit message"
git push origin main

# 2. SSH to VPS, pull, and rebuild
ssh preprint
cd /var/www/firstinterstellarinstitute.com
git pull origin main
cd first-interstellar-institute
npm run build

# 3. Nginx serves the dist/ folder — no reload needed
#    (files are replaced in-place)
```

**Critical**: Nginx serves from `dist/`, not `public/`. Vite copies `public/` to `dist/` during `npm run build`. If you change lecture files in `public/lectures/` but don't rebuild, the old files in `dist/lectures/` will still be served. To force a clean copy:

```bash
ssh preprint "cd /var/www/firstinterstellarinstitute.com/first-interstellar-institute && rm -rf dist/lectures && npm run build"
```

**Cache busting**: The lecture `presentation.html` uses `?v=N` query strings on `<script>` and `<link>` tags. When updating animation JS or CSS files, bump the version numbers in `presentation.html` so browsers fetch fresh copies instead of serving cached versions.

### Nginx Config

The static website is served from:

```
/etc/nginx/sites-available/www.firstinterstellarinstitute.com
```

Enabled via symlink:

```
/etc/nginx/sites-enabled/www.firstinterstellarinstitute.com
```

Config summary:

- **Domain**: `www.firstinterstellarinstitute.com`
- **Root**: `/var/www/firstinterstellarinstitute.com/first-interstellar-institute/dist`
- **SSL**: Let's Encrypt (cert covers both `firstinterstellarinstitute.com` and `www.firstinterstellarinstitute.com`)
- **SPA fallback**: `try_files $uri $uri/ /index.html`
- **Lecture files**: served from `dist/lectures/` via alias

After changing nginx config:

```bash
nginx -t                # test config
systemctl reload nginx  # apply
```

### SSL Certificate

The certificate is managed by Certbot and covers both the apex and www domains:

```bash
# View expiry
openssl x509 -in /etc/letsencrypt/live/firstinterstellarinstitute.com/cert.pem -noout -dates

# Renew (automatic, but can be triggered manually)
certbot renew
```

## Domain Architecture & Magic Book Coexistence

### Background

The domain `firstinterstellarinstitute.com` was originally used as the API endpoint for the **Magic Book** app (a separate project at `/home/nik/Desktop/github/storylens`). The Magic Book backend runs on port 8000 on the same VPS, and the apex domain proxied all traffic to it. This included:

- Mobile app API calls (`/api/v1/`)
- Supabase OAuth callback redirects
- YooKassa payment webhooks

Deploying the FII website naively on the same domain would have broken all of these.

### The Problem (Resolved)

When we first deployed the FII website on `firstinterstellarinstitute.com`, it replaced the API proxy, which broke the Magic Book app's OAuth flow and API access. This was immediately reverted.

### The Solution

The domain was split:

| Domain | Serves | Nginx Config |
|--------|--------|--------------|
| `firstinterstellarinstitute.com` (apex) | Magic Book backend API proxy (port 8000) — **untouched** | `api.firstinterstellarinstitute.com` |
| `www.firstinterstellarinstitute.com` | FII static website | `www.firstinterstellarinstitute.com` |

The apex domain config was modified only to remove `www.firstinterstellarinstitute.com` from its `server_name` directive. Everything else — the API proxy, OAuth redirects, payment webhooks — remains exactly as before.

**Status: Resolved.** Both the FII website and Magic Book run independently on the same VPS with zero interference.

### What Was NOT Changed

- Magic Book backend process (port 8000)
- `magicbook.ink` nginx config (frontend + `/api/` proxy)
- Supabase configuration (Site URL, redirect URLs)
- YooKassa webhook configuration
- Mobile app's API URL (`EXPO_PUBLIC_API_URL`)
- Backend CORS settings

### Security

The FII website is a pure static site with no connection to the Magic Book backend:

- No API proxy to port 8000
- No shared environment variables or secrets
- No shared database
- `.git` directory and source code are outside the web root (`dist/` only is served)
- No CORS headers exposed
- Directory listing disabled

### DNS Configuration (Cloudflare)

The domain uses Cloudflare nameservers (`dexter.ns.cloudflare.com`, `nucum.ns.cloudflare.com`). DNS records are managed in the Cloudflare dashboard, not Namecheap.

Required A records:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `@` | `89.124.96.222` | DNS only (grey cloud) |
| A | `www` | `89.124.96.222` | DNS only (grey cloud) |

**Important**: Use "DNS only" (grey cloud), not "Proxied" (orange cloud). Cloudflare's proxy interferes with Let's Encrypt certificate validation.

### Potential Issues & Troubleshooting

**FII website not updating after deploy:**
- Verify `git pull` succeeded on the VPS
- Verify `npm run build` completed without errors
- Check that `dist/` contains the new files: `ls /var/www/firstinterstellarinstitute.com/first-interstellar-institute/dist/`

**Lecture page not loading:**
- Check `dist/lectures/nrlecture/presentation.html` exists
- Check nginx alias for `/lectures/` is correct
- Verify JS/CSS files in `dist/lectures/nrlecture/js/` and `dist/lectures/nrlecture/css/`

**SSL certificate issues:**
- Check expiry: `openssl x509 -in /etc/letsencrypt/live/firstinterstellarinstitute.com/cert.pem -noout -dates`
- Renew: `certbot renew`
- The cert must cover both `firstinterstellarinstitute.com` and `www.firstinterstellarinstitute.com`

**Magic Book app broken:**
- This should not happen — the FII website only serves `www.firstinterstellarinstitute.com`
- If it does, check that the apex domain config (`api.firstinterstellarinstitute.com`) is still enabled and proxies to port 8000
- Verify the backend is running: `curl http://127.0.0.1:8000/health`
- Check that `www` was removed from the apex config's `server_name`

**Other websites on the VPS affected:**
- The VPS hosts multiple sites: `preprint.academy`, `magicbook.ink`, `ultralingo.ink`
- Each has its own nginx config in `/etc/nginx/sites-enabled/`
- FII deployment only touches `www.firstinterstellarinstitute.com` — other configs are untouched

## Interactive Lecture

The lecture at `/lectures/nrlecture/presentation.html` is a self-contained vanilla JS presentation on numerical relativity. It uses:

- **KaTeX** for math rendering
- **Three.js** for 3D geodesic visualization
- **Canvas 2D** for all other animations
- **No build step** — lecture files are served as-is from `public/lectures/`

### Animation Architecture

Each animation is a self-contained IIFE that exposes `window.initAnim_<name>`. Slides trigger animations via a `data-anim="<name>"` attribute on the slide `<div>`. The deck framework calls the matching `initAnim_` function when the slide becomes active.

Animations follow this pattern:
```javascript
(function () {
    let canvas, ctx, W, H, running = false;
    let animFrame;

    function init() {
        canvas = document.getElementById('<name>Canvas');
        if (!canvas) return;
        // ... setup
        running = true;
        animate();
    }

    window.initAnim_<name> = function () {
        running = false;
        if (animFrame) cancelAnimationFrame(animFrame);
        setTimeout(init, 150);
    };
})();
```

### Historical Era Timeline

A fixed bar at the top of the screen shows 6 dots representing key eras (1915 Einstein, 1959 ADM, 1995 BSSN, 2005 Breakthrough, 2015 LIGO, 2026 GPU+NR). The `updateEraTimeline()` function in `deck.js` maps slide part-labels to active eras and highlights the corresponding dots. Year labels are siblings of the dots, positioned absolutely within the timeline container.

## Project Structure

```
FII/
├── first-interstellar-institute/     # Vite + React app
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── headerimage.jpg
│   │   └── lectures/
│   │       └── nrlecture/            # Interactive lecture (static HTML/JS)
│   │           ├── presentation.html
│   │           ├── css/style.css
│   │           └── js/
│   │               ├── core/deck.js       # Slide navigation, notes, timeline
│   │               ├── slides/content.js  # All slide HTML content
│   │               └── animations/        # Canvas-based physics animations
│   │                   ├── gravity-speed.js       # GW speed vs light
│   │                   ├── gw-motivation.js       # GW motivation
│   │                   ├── shatter.js             # Spacetime shatter
│   │                   ├── ds-metric.js           # Interactive metric tensor
│   │                   ├── geodesics.js           # 3D geodesic particle sim
│   │                   ├── slicer.js              # ADM bread slicer
│   │                   ├── ligo.js                # LIGO interferometer
│   │                   ├── gpu.js                 # CPU vs GPU comparison
│   │                   ├── bounce.js              # Wormhole phantom bounce
│   │                   ├── timeline.js            # Era timeline helper
│   │                   ├── parallel-transport.js  # Parallel transport on sphere
│   │                   ├── geodesic-deviation.js  # Geodesic convergence
│   │                   ├── lapse-shift.js         # Interactive ADM lapse/shift
│   │                   ├── adm-vs-bssn.js         # Stability comparison
│   │                   ├── finite-diff.js         # Resolution slider demo
│   │                   ├── convergence.js         # Richardson Q-factor
│   │                   ├── gw-polarization.js     # h+ and h× ring deformation
│   │                   ├── light-cones.js         # Light cone tilting at BH
│   │                   ├── binary-bh.js           # Inspiral→merger→ringdown
│   │                   └── amr.js                 # Adaptive mesh refinement
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   └── components/
│   │       ├── Navbar.tsx            # Nav with lectures dropdown
│   │       ├── Hero.tsx
│   │       ├── About.tsx
│   │       ├── Lectures.tsx          # Video lectures + interactive lecture card
│   │       ├── Articles.tsx
│   │       ├── Support.tsx           # Crypto donation modal
│   │       └── Footer.tsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── tsconfig.json
└── README.md                          # This file
```
