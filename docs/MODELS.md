# A.I. Duet Web — Neural Model Documentation

This document explains the neural network architecture and inference pipeline running inside the browser in **A.I. Duet Web**.

---

## 1. Overview

A.I. Duet Web runs Google Magenta's **Basic Melody RNN** (`basic_rnn.onnx`) directly in the user's browser tab using **ONNX Runtime Web (WebAssembly)**.

| Metric | Specification |
| :--- | :--- |
| **Model Format** | Standalone ONNX (`basic_rnn.onnx`) |
| **Model Size** | $\approx 13.0\text{ MB}$ (Single self-contained file) |
| **Architecture** | 2 stacked LSTM recurrent layers ($512$ hidden units each) |
| **Vocabulary Size** | $38$ classes ($2$ special events + $36$ MIDI pitch classes) |
| **Quantization Grid** | 16th-note grid ($4\text{ steps per quarter note}$) |
| **Inference Runtime** | Single-threaded WebAssembly via `onnxruntime-web` |
| **Average Latency** | $<15\text{ ms}$ on modern laptops, tablets, and phones |

---

## 2. Event Representation (MelodyOneHotEncoding)

The neural network consumes one-hot vectors of length $38$ representing:

| Class Index | Event Value | Musical Meaning |
| :--- | :--- | :--- |
| **$0$** | `MELODY_NO_EVENT` ($-2$) | **Sustain / Hold:** Continue sounding previous pitch |
| **$1$** | `MELODY_NOTE_OFF` ($-1$) | **Rest / Silence:** Note release or silence |
| **$2 \dots 37$** | Pitch $48 \dots 83$ | **Note-On:** MIDI pitch in $[48, 84)$ (C3 to B5) |

---

## 3. Sampling Mathematics

At each recurrent generation step $t$, the LSTM produces unnormalized logits $z \in \mathbb{R}^{38}$.

### 3.1 Temperature Scaling
$$z_i' = \frac{z_i}{T}, \quad T \in [0.1, 1.5]$$
Lower temperature ($T \approx 0.3$) produces structured, predictable motifs. Higher temperature ($T \approx 0.8$) introduces expressive variety.

### 3.2 Step-0 Attack Guard
At step $0$ of the generated response, class $0$ (`MELODY_NO_EVENT`) is masked out to $-\infty$. This guarantees that the AI begins with an audible note attack or clean musical rest, preventing silent phantom holds.

### 3.3 Nucleus (Top-$p$) Sampling
Softmax probabilities are calculated over valid classes:
$$P(i) = \frac{e^{z_i'}}{\sum_j e^{z_j'}}$$
Probabilities are sorted descending and accumulated until $\sum P(i) \ge 0.90$. Classes outside this top-$90\%$ nucleus are discarded, and the remaining probabilities are normalized. This prevents machine-gun note bursts while maintaining natural phrasing.
