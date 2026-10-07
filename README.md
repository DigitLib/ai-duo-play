# 🎹 A.I. Duet Web (GitHub Pages & Static Edition)

> An interactive piano duet that plays music with you in real time using deep learning — **running 100% inside your web browser via WebAssembly (WASM)**. Zero backend or Python server required!

[![Deploy to GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Ready%20to%20Deploy-success?logo=github&logoColor=white)](https://pages.github.com/)
[![ONNX Runtime Web](https://img.shields.io/badge/ONNX%20Runtime%20Web-WASM-005CED?logo=webassembly&logoColor=white)](https://onnxruntime.ai)
[![Vite](https://img.shields.io/badge/Vite-8.0+-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Web MIDI](https://img.shields.io/badge/Web%20MIDI-Hardware%20Ready-FF7700)](https://www.w3.org/TR/webmidi/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

Based on the open-source **A.I. Duet** experiment by **Yotam Mann & Google Creative Lab / Magenta**. Upgraded to run entirely client-side using **ONNX Runtime Web**, **Vite / ES Modules**, and modern **Web Audio**.

> 💡 **Looking for the Full-Stack Python backend version (FastAPI + Attention RNN + WebSockets)?**
> Check out the sibling **[A.I. Duet Full-Stack (ai-duo-dev)](https://github.com/DigitLib/ai-duo-dev)** repository!

---

## ✨ Features

- ⚡ **Zero Backend Required:** Google Magenta's Melody RNN model runs entirely in your browser tab via **WebAssembly (`onnxruntime-web`)** in **<15 ms**.
- 🌐 **Free GitHub Pages Hosting:** Push this repository to GitHub and enable Pages — zero server hosting costs, zero credit cards, zero Docker containers!
- 🎹 **Full 88-Key Acoustic Piano:** High-fidelity multi-sampled Yamaha C5 Grand Piano (`Salamander`) soundfont + warm string ensemble backing layer.
- 🎛️ **Dual Duet Modes:**
  - **Turn-Based (Call & Response):** You play a musical phrase, and the AI improvises a musical answer.
  - **Play Together (Live Duet):** The AI listens to your live notes and jams along with you in real time.
- 🎼 **Dynamic Tempo (IOI) Tracking:** Tracks your playing pace on-the-fly (60–160 BPM) and answers at your exact tempo.
- 🎯 **Nucleus ($p=0.90$) Sampling:** Prevents machine-gun note spam while preserving natural phrasing and musical rests.
- 🎹 **Multi-Modal Controls:** Play via computer keyboard, mouse/touch, or plug in any USB **Web MIDI keyboard controller**.
- 💾 **MIDI Session Export:** Record your duet and export a standard multi-track `.mid` file.

---

## 🚀 Instant Deployment to GitHub Pages

This repository is structured so that you can publish it directly to GitHub Pages with **zero build steps on GitHub**:

1. Create a new GitHub repository named **`ai-duo-play`** and push these files to your `main` branch:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of AI Duet Web"
   git branch -M main
   git remote add origin https://github.com/DigitLib/ai-duo-play.git
   git push -u origin main
   ```
2. On GitHub, go to your repository **Settings** → **Pages**.
3. Under **Build and deployment** → **Source**, select **Deploy from a branch**.
4. Set Branch to **`main`** and folder to **`/ (root)`**.
5. Click **Save**.
6. In ~60 seconds, your A.I. Duet will be live at:
   **`https://digitlib.github.io/ai-duo-play/`**!

---

## 🧪 Local Testing (Static Server)

To test the standalone application locally on your computer with any static file server:

```bash
# Using Python's built-in static HTTP server:
python3 -m http.server 8080

# Or using Node:
npx serve .
```

Open **`http://localhost:8080`** in your browser. All models, audio samples, and scripts will load with zero server errors!

---

## 🛠️ Local Development (Vite + Live Reload)

If you want to modify the JavaScript source code, tweak styles, or customize the 3D particle roll:

```bash
# 1. Install dependencies
npm install

# 2. Start Vite dev server with instant Hot Module Replacement (HMR)
npm run dev
```

Open **`http://127.0.0.1:5173`** in your browser.

### Rebuilding for Production
After making code changes, recompile the production bundle:
```bash
npm run build
```
This updates the root `index.html` and `assets/` directory, ready to commit and push to GitHub.

---

## 📁 Repository Structure

```
├── index.html                 # Production entrypoint (loads WebAssembly & compiled bundle)
├── .nojekyll                  # GitHub Pages bypass (prevents Jekyll from filtering assets)
├── package.json               # Development scripts and dependencies
├── vite.config.js             # Vite build configuration (base: './')
├── assets/                    # Production JS & CSS bundles
├── audio/                     # Grand Piano (Salamander) and Synth soundfonts
├── images/                    # Favicons, icons, and badges
├── models/                    # Google Magenta basic_rnn.onnx model (13 MB)
├── src/                       # Source code (ES Modules)
│   ├── Main.js                # App lifecycle and audio orchestrator
│   ├── ai/
│   │   ├── AI.js              # Pure in-browser AI duet controller (Zero WebSockets!)
│   │   ├── LocalGenerator.js  # Client-side WebAssembly ONNX inference engine
│   │   └── Tutorial.js        # Interactive tutorials and demo melodies
│   ├── sound/                 # Web Audio Sampler engine (Sound.js, Sampler.js)
│   ├── keyboard/              # Web MIDI & keyboard inputs (Midi.js, Keyboard.js)
│   ├── roll/                  # Three.js 3D piano roll particles (Roll.js)
│   └── interface/             # UI controls, modals, and badges (Controls.js, About.js)
├── style/                     # SCSS stylesheets
└── docs/                      # Architecture and developer documentation
    ├── ARCHITECTURE.md        # Client-side WebAssembly pipeline deep dive
    └── DEVELOPMENT.md         # Full developer guide
```

---

## 🧠 How the In-Browser AI Works

1. **Note Collection:** Notes played by the user are recorded with high-precision timestamps from `AudioContext.currentTime`.
2. **Tempo Estimation:** An Inter-Onset Interval (IOI) calculation estimates the tempo (60–160 BPM) from consecutive note attacks.
3. **Quantization:** The user's melody is mapped onto a 16th-note grid ($4\text{ steps per quarter note}$) with sustains (`-2`), rests (`-1`), and pitches ($48 \dots 83$).
4. **Octave Transposition:** Phrases are symmetrically shifted into the model's optimal training register ($[48, 84)$) by full octaves ($12 \times k$).
5. **WASM Inference:** `basic_rnn.onnx` steps through the primer and generates an answer (16 or 32 steps) in **<15 ms** using `onnxruntime-web`.
6. **Nucleus Sampling:** Top-$p$ ($p=0.90$) sampling ensures musical phrasing without machine-gun note bursts.
7. **Playback:** The generated answer is transposed back to the user's register and scheduled via Web Audio.

---

## 📜 Heritage & Credits

* Originally created as an **A.I. Experiment** by **Yotam Mann** with friends at **Google Creative Lab** and the **Magenta** team.
* Original 2016 experiment: [experiments.withgoogle.com/ai/ai-duet](https://experiments.withgoogle.com/ai/ai-duet)
* Original 2016 source code: [github.com/googlecreativelab/aiexperiments-ai-duet](https://github.com/googlecreativelab/aiexperiments-ai-duet)
* Neural network weights and encodings: [Magenta Project](https://magenta.tensorflow.org)

Licensed under the **Apache License, Version 2.0**.
