# A.I. Duet Web — Development Guide

This guide explains how to develop, test, and build the **100% In-Browser static edition** of A.I. Duet.

---

## 1. Quick Start

### Option A: Direct Static Serving (Zero npm install)
You can test the pre-compiled app immediately using Python:
```bash
python3 -m http.server 8080
```
Open `http://localhost:8080` in your web browser.

### Option B: Local Development with Vite (With Live HMR)
```bash
# 1. Install dependencies
npm install

# 2. Run Vite development server
npm run dev
```
Open `http://127.0.0.1:5173`. Any changes to `src/` or `style/` will immediately update in your browser without reloading.

---

## 2. Rebuilding the Production Bundle

When you make changes to the source code (`src/` or `style/`), compile the production bundle:

```bash
npm run build
```

This runs:
1. `vite build` to bundle JavaScript and SCSS into `dist/`.
2. Copies the compiled assets into `./assets/` and `./index.html`.
3. Ensures `.nojekyll` is preserved for GitHub Pages.

---

## 3. Project Structure

- **`index.html`**: Entrypoint for both production and Vite dev server.
- **`src/Main.js`**: Main initialization routine.
- **`src/ai/LocalGenerator.js`**: WebAssembly neural melody generator using `onnxruntime-web`.
- **`src/ai/AI.js`**: Pure client-side duet coordination (Call & Response and Play Together modes).
- **`src/sound/Sound.js`**: Web Audio sampler for acoustic piano and synth voices.
- **`models/basic_rnn.onnx`**: 13 MB ONNX model weights.
- **`audio/`**: Multi-sampled Salamander piano and synth soundfonts.

---

## 4. Deploying to GitHub Pages

1. Push all files in this repository to your `main` branch.
2. In GitHub, navigate to **Settings** → **Pages**.
3. Set Source to **Deploy from a branch** → Branch **`main`** / Folder **`/ (root)`**.
4. Click **Save**.

Your app is live and playable by anyone worldwide!
