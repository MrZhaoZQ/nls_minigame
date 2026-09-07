#!/usr/bin/env python3
import os
import math
import wave
import numpy as np

SR = 22050
OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'audio')
PEAK = 0.78


def write_wav(name, sig):
    sig = np.asarray(sig, dtype=np.float64)
    peak = np.max(np.abs(sig))
    if peak > 0:
        sig = sig / peak * PEAK
    pcm = (sig * 32767).astype('<i2')
    path = os.path.join(OUT_DIR, name + '.wav')
    with wave.open(path, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    size = os.path.getsize(path)
    print('%-14s %.2fs  %5.1f KB' % (name, len(sig) / SR, size / 1024))
    assert size < 100 * 1024, name + ' exceeds 100KB'


def n(dur):
    return int(round(dur * SR))


def silence(dur):
    return np.zeros(n(dur))


def adsr_env(length, a=0.003, d=0.05, s=0.0, r=0.03):
    m = len(length) if isinstance(length, np.ndarray) else length
    if m <= 0:
        return np.zeros(0)
    env = np.ones(m)
    na = min(int(a * SR), m)
    nr = min(int(r * SR), m - na)
    if na > 0:
        env[:na] = np.linspace(0, 1, na)
    if nr > 0:
        env[m - nr:] *= np.linspace(1, 0, nr)
    mid_start = na
    mid_end = m - nr
    if mid_end > mid_start:
        nd = min(int(d * SR), mid_end - mid_start)
        if nd > 0:
            env[mid_start:mid_start + nd] *= np.linspace(1, max(s, 0.001), nd)
        if mid_start + nd < mid_end:
            env[mid_start + nd:mid_end] *= max(s, 0.001)
    return env


def tone(freq, dur, harmonics=((1.0, 1.0),), f_end=None):
    m = n(dur)
    t = np.arange(m) / SR
    if f_end is None:
        f_end = freq
    phase = 2 * math.pi * (freq * t + (f_end - freq) * t * t / (2 * dur))
    sig = np.zeros(m)
    for mul, amp in harmonics:
        sig += amp * np.sin(phase * mul)
    return sig * adsr_env(sig)


def noise_burst(dur, decay=25.0, seed=7):
    rng = np.random.RandomState(seed)
    m = n(dur)
    t = np.arange(m) / SR
    return rng.uniform(-1, 1, m) * np.exp(-decay * t)


def lowpass(sig, cutoff):
    rc = 1.0 / (2 * math.pi * cutoff)
    dt = 1.0 / SR
    alpha = dt / (rc + dt)
    out = np.zeros_like(sig)
    acc = 0.0
    for i in range(len(sig)):
        acc += alpha * (sig[i] - acc)
        out[i] = acc
    return out


def append_at(base, clip, at):
    start = int(at * SR)
    end = min(start + len(clip), len(base))
    if start < len(base):
        base[start:end] += clip[:end - start]
    return base


def sfx_screw_out():
    dur = 0.3
    carrier = tone(400, dur, f_end=1600) * 0.25
    ratchet = np.zeros(n(dur))
    for k in range(6):
        at = 0.015 + k * 0.045
        append_at(ratchet, tone(2400 + k * 260, 0.012, ((1.0, 1.0), (2.3, 0.4))) * 0.5, at)
    fizz = noise_burst(dur, decay=7.0, seed=3) * 0.30
    click = tone(1800, 0.008, ((1.0, 1.0),)) * 0.6
    sig = np.zeros(n(dur))
    append_at(sig, click, 0.0)
    sig += carrier + ratchet + fizz
    return sig * adsr_env(sig, a=0.002, d=0.04, s=0.5, r=0.08)


def sfx_slot_in():
    sig = tone(620, 0.12, ((1.0, 1.0), (0.5, 0.5)), f_end=240)
    click = noise_burst(0.012, decay=120.0, seed=11) * 0.8
    out = np.zeros(n(0.12))
    append_at(out, click, 0.0)
    out += sig
    return out * adsr_env(out, a=0.001, d=0.03, s=0.2, r=0.05)


def sfx_match():
    out = np.zeros(n(0.4))
    ding1 = tone(1245, 0.18, ((1.0, 1.0), (2.01, 0.45), (3.9, 0.18)))
    ding2 = tone(1661, 0.2, ((1.0, 1.0), (2.01, 0.45), (3.9, 0.18)))
    append_at(out, ding1 * 0.9, 0.0)
    append_at(out, ding2 * 0.9, 0.13)
    return out * adsr_env(out, a=0.002, d=0.05, s=0.6, r=0.1)


def sfx_collapse():
    dur = 0.6
    thump = tone(110, 0.35, ((1.0, 1.0), (0.5, 0.35)), f_end=42)
    impact = noise_burst(0.09, decay=32.0, seed=5)
    body = noise_burst(0.3, decay=12.0, seed=9) * 0.5
    out = np.zeros(n(dur))
    append_at(out, impact * 0.9, 0.0)
    append_at(out, thump * 0.95, 0.008)
    append_at(out, body, 0.02)
    out = lowpass(out, 900)
    return out * adsr_env(out, a=0.002, d=0.08, s=0.35, r=0.18)


def sfx_warn():
    beep = np.sign(np.sin(2 * math.pi * 311 * np.arange(n(0.09)) / SR)) * 0.5
    beep = beep * adsr_env(beep, a=0.004, d=0.02, s=0.7, r=0.02)
    beep = lowpass(beep, 1800)
    out = np.zeros(n(0.5))
    append_at(out, beep, 0.02)
    append_at(out, beep * 0.95, 0.18)
    return out


def sfx_win():
    notes = [523.25, 659.25, 783.99, 1046.5]
    out = np.zeros(n(1.0))
    for i, f in enumerate(notes):
        pluck = tone(f, 0.34, ((1.0, 1.0), (2.0, 0.35), (3.0, 0.12)))
        pluck *= np.exp(-np.arange(len(pluck)) / SR * 3.2)
        append_at(out, pluck * 0.85, i * 0.16)
    return out * adsr_env(out, a=0.004, d=0.05, s=0.8, r=0.25)


def sfx_lose():
    notes = [523.25, 466.16, 392.0, 311.13]
    out = np.zeros(n(1.0))
    for i, f in enumerate(notes):
        pluck = tone(f, 0.3, ((1.0, 1.0), (2.0, 0.25)))
        pluck *= np.exp(-np.arange(len(pluck)) / SR * 4.0)
        append_at(out, pluck * 0.8, i * 0.18)
    return out * adsr_env(out, a=0.004, d=0.05, s=0.8, r=0.25)


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    write_wav('sfx_screw_out', sfx_screw_out())
    write_wav('sfx_slot_in', sfx_slot_in())
    write_wav('sfx_match', sfx_match())
    write_wav('sfx_collapse', sfx_collapse())
    write_wav('sfx_warn', sfx_warn())
    write_wav('sfx_win', sfx_win())
    write_wav('sfx_lose', sfx_lose())


if __name__ == '__main__':
    main()
