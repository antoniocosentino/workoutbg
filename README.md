# WorkoutBG

A browser-only photo framing tool. No build, backend, dependencies, or external services.

- PNG and JPG input, including transparent PNGs.
- Photos fit proportionally within a centered 1800 × 1800 px area. Square photos have a 300 px margin on every side; rectangular photos have extra space on two sides. Nothing is cropped or stretched.
- Original PNG transparency is composited over `base-bg.png`.
- Export is always a 2400 × 2400 PNG.
- Responsive mobile interface, plus native file sharing on supported browsers (including iOS Safari). On iPhone, use **Share / Save to Photos** and select **Save Image** or **Save to Files**. Download PNG is also available.
- Files stay on the device. Large source photos require more device memory; if a browser cannot decode one, try a smaller source.

## Run locally

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. Native sharing requires HTTPS or localhost and is feature-detected. See [Web Share documentation](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share).

## GitHub Pages

Push to `main` in `antoniocosentino/workoutbg`. In repository **Settings → Pages → Build and deployment**, select **GitHub Actions**. The included workflow deploys the four static app files on pushes to `main` or manual runs.

Expected URL: https://antoniocosentino.github.io/workoutbg/

All asset paths are relative, so hosting under the repository subpath works without changes.
