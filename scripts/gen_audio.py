#!/usr/bin/env python3
"""Generate original royalty-free instrumental demo loops for Mana Music.

No samples, no copyrighted material: every note is synthesised from scratch with
the Python standard library and encoded to mono MP3 with ffmpeg. The output is a
small set of loops used by the prototype catalogue as demonstration audio.
"""

import json
import math
import os
import random
import subprocess
import wave
from array import array

SR = 32000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "public", "audio")
INDEX_PATH = os.path.join(ROOT, "src", "data", "audio-index.json")

SCALES = {
    "mohanam": [0, 2, 4, 7, 9],
    "hindolam": [0, 3, 5, 7, 10],
    "kalyani": [0, 2, 4, 6, 7, 9, 11],
    "bhairavi": [0, 1, 4, 5, 7, 8, 10],
    "desh": [0, 2, 4, 5, 7, 9, 10],
}

TRACKS = [
    {"id": "vennela", "root": 57, "scale": "mohanam", "bpm": 92, "bars": 16, "seed": 11, "drums": True, "kind": "melody"},
    {"id": "gaali", "root": 60, "scale": "desh", "bpm": 104, "bars": 16, "seed": 23, "drums": True, "kind": "melody"},
    {"id": "varṣam", "root": 55, "scale": "kalyani", "bpm": 78, "bars": 12, "seed": 37, "drums": False, "kind": "melody"},
    {"id": "jaanapada", "root": 53, "scale": "bhairavi", "bpm": 116, "bars": 18, "seed": 41, "drums": True, "kind": "melody"},
    {"id": "raatri", "root": 58, "scale": "hindolam", "bpm": 74, "bars": 12, "seed": 59, "drums": False, "kind": "melody"},
    {"id": "deepam", "root": 62, "scale": "mohanam", "bpm": 88, "bars": 16, "seed": 67, "drums": True, "kind": "melody"},
    {"id": "mass", "root": 50, "scale": "bhairavi", "bpm": 122, "bars": 20, "seed": 79, "drums": True, "kind": "melody"},
    {"id": "lullaby", "root": 56, "scale": "hindolam", "bpm": 66, "bars": 10, "seed": 83, "drums": False, "kind": "melody"},
]


def midi_to_freq(midi):
    return 440.0 * (2.0 ** ((midi - 69) / 12.0))


def synth(midi, dur, amp, kind="pluck"):
    f = midi_to_freq(midi)
    length = max(1, int(dur * SR))
    out = [0.0] * length
    ph = 0.0
    inc = 2.0 * math.pi * f / SR
    vib_ph = 0.0
    vib_inc = 2.0 * math.pi * 5.0 / SR
    for i in range(length):
        t = i / SR
        if kind == "pluck":
            env = min(1.0, t / 0.012) * math.exp(-2.4 * t)
        elif kind == "pad":
            env = min(1.0, t / 0.5) * min(1.0, max(0.0, (dur - t) / 0.7))
        else:
            env = min(1.0, t / 0.04) * math.exp(-1.2 * t)
        ph += inc * (1.0 + 0.0035 * math.sin(vib_ph))
        vib_ph += vib_inc
        out[i] = amp * env * (math.sin(ph) + 0.32 * math.sin(2.0 * ph) + 0.14 * math.sin(3.0 * ph))
    return out


def thump(dur=0.22, amp=0.30, f0=150.0, f1=64.0):
    length = int(dur * SR)
    out = [0.0] * length
    ph = 0.0
    for i in range(length):
        t = i / SR
        f = f1 + (f0 - f1) * math.exp(-20.0 * t)
        ph += 2.0 * math.pi * f / SR
        out[i] = amp * math.exp(-13.0 * t) * math.sin(ph)
    return out


def shaker(rnd, dur=0.09, amp=0.05):
    length = int(dur * SR)
    out = [0.0] * length
    prev = 0.0
    for i in range(length):
        t = i / SR
        noise = rnd.uniform(-1.0, 1.0)
        prev = prev * 0.55 + noise * 0.45
        out[i] = amp * math.exp(-42.0 * t) * prev
    return out


def render(spec):
    rnd = random.Random(spec["seed"])
    beat = 60.0 / spec["bpm"]
    bars = spec["bars"]
    total = bars * 4.0 * beat
    n = int(total * SR) + 1
    buf = [0.0] * n
    scale = SCALES[spec["scale"]]
    root = spec["root"]

    def mix(start, samples):
        s0 = int(start * SR)
        for i, v in enumerate(samples):
            j = s0 + i
            if 0 <= j < n:
                buf[j] += v

    # melody
    step = beat / 2.0
    steps = int(bars * 8)
    deg = len(scale) // 2
    for s in range(steps):
        if rnd.random() < 0.24:
            continue
        deg = max(0, min(len(scale) - 1, deg + rnd.choice([-2, -1, -1, 0, 1, 1, 2])))
        octave = 12 * rnd.choice([1, 1, 1, 2])
        midi = root + 12 + scale[deg] + octave
        dur = step * rnd.choice([1, 1, 1, 2])
        mix(s * step, synth(midi, dur * 1.7, 0.15))

    # bass, pad, percussion
    for b in range(bars):
        t0 = b * 4.0 * beat
        mix(t0, synth(root - 12, beat * 1.7, 0.28))
        mix(t0 + 2.0 * beat, synth(root - 12 + (7 if b % 2 else 0), beat * 1.5, 0.22))
        for k in (0, 2, 4):
            mix(t0, synth(root + scale[k % len(scale)] + 12, 4.0 * beat * 0.92, 0.05, "pad"))
        if spec["drums"]:
            for beat_i in range(4):
                tb = t0 + beat_i * beat
                if beat_i in (0, 2):
                    mix(tb, thump())
                mix(tb + beat * 0.5, shaker(rnd))

    peak = max(1e-6, max(abs(v) for v in buf))
    gain = 0.88 / peak
    fade_in = int(0.02 * SR)
    fade_out = int(0.7 * SR)
    data = array("h")
    for i in range(n):
        v = buf[i] * gain
        if i < fade_in:
            v *= i / fade_in
        if i > n - fade_out:
            v *= max(0.0, (n - i) / fade_out)
        data.append(int(max(-1.0, min(1.0, v)) * 32767))

    wav_path = os.path.join(OUT_DIR, spec["id"] + ".wav")
    with wave.open(wav_path, "wb") as fh:
        fh.setnchannels(1)
        fh.setsampwidth(2)
        fh.setframerate(SR)
        fh.writeframes(data.tobytes())

    mp3_path = os.path.join(OUT_DIR, spec["id"] + ".mp3")
    subprocess.run(
        [
            "ffmpeg", "-y", "-loglevel", "error", "-i", wav_path,
            "-codec:a", "libmp3lame", "-b:a", "64k", "-ac", "1", mp3_path,
        ],
        check=True,
    )
    os.remove(wav_path)
    return {"id": spec["id"], "file": "/audio/%s.mp3" % spec["id"], "durationSec": round(total, 1)}


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(INDEX_PATH), exist_ok=True)
    index = []
    for spec in TRACKS:
        entry = render(spec)
        index.append(entry)
        print("generated", entry["id"], entry["durationSec"], "s")
    with open(INDEX_PATH, "w", encoding="utf-8") as fh:
        json.dump(index, fh, ensure_ascii=False, indent=2)
    print("wrote", INDEX_PATH)


if __name__ == "__main__":
    main()
