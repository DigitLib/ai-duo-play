# A.I. Duet Web — Architecture Documentation

This document describes the **100% In-Browser client architecture** of the standalone A.I. Duet static web application.

---

## 1. System Architecture

```
+-----------------------------------------------------------------------------------+
|                                 BROWSER CLIENT                                    |
|                                                                                   |
|   +-------------------+    +----------------------+    +----------------------+   |
|   |   Input Sources   |    |      Web Audio       |    |     3D Piano Roll    |   |
|   | - USB Web MIDI    |--->| - Salamander Grand   |    | - Three.js Particles |   |
|   | - Computer Keys   |    | - String Ensemble    |    | - Note Trails        |   |
|   | - On-screen Touch |    | - Web Audio Clock    |    | - Responsive Camera  |   |
|   +---------+---------+    +----------^-----------+    +----------^-----------+   |
|             |                         |                           |               |
|             v                         |                           |               |
|   +-----------------------------------+---------------------------+-----------+   |
|   |                         AI Orchestrator (AI.js)                           |   |
|   |  - Live Phrase Segmentation & Time-Windowing                              |   |
|   |  - Anti-Collision Accompaniment Guard (_aiPlayingUntil)                   |   |
|   |  - Turn-Based vs Play Together Live Jamming                               |   |
|   +-----------------------------------+---------------------------------------+   |
|                                       |                                           |
|                                       v (Direct Function Call)                    |
|   +---------------------------------------------------------------------------+   |
|   |               Local Generator Core (LocalGenerator.js)                    |   |
|   |  - Pure JavaScript IOI Tempo Estimator (60–160 BPM)                       |   |
|   |  - 16th-Note Grid Quantization (Pitches, Sustains, Rests)                 |   |
|   |  - Whole-Phrase Symmetrical Octave Transposition ($12 \times k$)          |   |
|   |  - Step-0 Clean Attack Guard (Disallows Phantom Holds)                    |   |
|   |  - Nucleus Top-p Sampling ($p=0.90$) with Temperature Scaling             |   |
|   +-----------------------------------+---------------------------------------+   |
|                                       |                                           |
|                                       v (Local WebAssembly Execution)             |
|   +---------------------------------------------------------------------------+   |
|   |                     ONNX Runtime Web (WASM Engine)                        |   |
|   |  - `models/basic_rnn.onnx` (13 MB standalone model)                       |   |
|   |  - Single-Threaded WASM (Zero SharedArrayBuffer / COOP headers needed)    |   |
|   |  - Sub-15 ms Inference Time                                               |   |
|   +---------------------------------------------------------------------------+   |
+-----------------------------------------------------------------------------------+
```

---

## 2. In-Browser Audio & Synthesis Pipeline

### 2.1 Multi-Modal Input
- **Web MIDI API (`Midi.js`):** Listens for USB hardware keyboards with note numbers (21–108) and velocity.
- **Computer Keyboard (`Keyboard.js`):** Maps home row keys (`A`–`K`) and sharps/flats (`W`, `E`, `T`, `Y`, `U`) with octave shifting (`Z`/`X`).
- **Interactive Piano Roll (`Element.js`):** Responsive touch/mouse piano keys with hover glide.

### 2.2 Dual-Voice Synthesis
- **Acoustic Grand Piano:** Multi-sampled Yamaha C5 Grand Piano soundfont across all 88 keys.
- **Ambient String Backing Layer:** Mixed at $-8\text{ dB}$, triggered alongside the AI's notes to create an orchestral duet feel.

---

## 3. Client-Side Neural Generation Pipeline

1. **Tempo Estimation (IOI):**
   $$\text{QPM} = \begin{cases} \dfrac{30.0}{\text{median}(\Delta t)}, & \text{if eighth-note groove } (\Delta t < 0.38\text{s}) \\[8pt] \dfrac{60.0}{\text{median}(\Delta t)}, & \text{if quarter-note phrasing } (\Delta t \ge 0.38\text{s}) \end{cases}$$
2. **Quantization:**
   Maps notes onto a 16th-note monophonic melody grid (`-2` = sustain, `-1` = rest, `48..83` = pitch).
3. **Register Alignment:**
   Shifts the phrase into the model's range $[48, 84)$ by integer octaves:
   $$\text{shift} = 12 \times \text{round}\left(\frac{66 - \text{median\_pitch}}{12}\right)$$
4. **ONNX Recurrent Stepping:**
   Feeds one-hot vector representations into `basic_rnn.onnx` and iterates for 16 or 32 steps.
5. **Nucleus (Top-$p = 0.90$) Sampling:**
   Filters out tail noise while preserving musical holds and rests.
6. **Symmetrical Transposition:**
   Restores notes back to the player's acoustic octave register ($-\text{shift}$).

---

## 4. Zero-Server Hosting Architecture

Unlike traditional web applications that require Python, Node.js, or Docker backends:
- **Zero HTTP API calls:** Does not request `/predict` or open `/ws` WebSockets.
- **Single-Threaded WASM:** Runs on standard static hosting (GitHub Pages, Netlify, Vercel, S3) without requiring `Cross-Origin-Embedder-Policy` (COEP) headers.
- **Relative Path Resolution:** Configured with `base: './'`, allowing hosting in subfolders (e.g., `https://digitlib.github.io/ai-duo-play/`) without 404 errors.
