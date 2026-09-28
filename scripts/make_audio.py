#!/usr/bin/env python3
import os
import math
import wave
import numpy as np

SR = 22050
OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'audio')
PEAK = 0.78


def write_wav(name, sig, sr=SR, peak=PEAK):
    sig = np.asarray(sig, dtype=np.float64)
    p = np.max(np.abs(sig))
    if p > 0:
        sig = sig / p * peak
    pcm = (sig * 32767).astype('<i2')
    path = os.path.join(OUT_DIR, name + '.wav')
    with wave.open(path, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(pcm.tobytes())
    size = os.path.getsize(path)
    print('%-14s %.2fs  %5.1f KB' % (name, len(sig) / sr, size / 1024))


def n(dur, sr=SR):
    return int(round(dur * sr))


def adsr_env(m, a=0.003, d=0.05, s=0.0, r=0.03):
    if m <= 0:
        return np.zeros(0)
    env = np.ones(m)
    na = min(int(a * SR), m)
    nr = min(int(r * SR), max(0, m - na))
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
    phase = 2 * math.pi * (freq * t + (f_end - freq) * t * t / (2 * max(dur, 1e-6)))
    sig = np.zeros(m)
    for mul, amp in harmonics:
        sig += amp * np.sin(phase * mul)
    return sig * adsr_env(len(sig))


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
    dur = 0.34
    carrier = tone(400, dur, f_end=1600) * 0.22
    ratchet = np.zeros(n(dur))
    for k in range(6):
        at = 0.015 + k * 0.043
        append_at(ratchet, tone(2400 + k * 260, 0.012, ((1.0, 1.0), (2.3, 0.4))) * 0.5, at)
    fizz = noise_burst(dur, decay=7.0, seed=3) * 0.28
    click = tone(1800, 0.008) * 0.6
    pop = tone(190, 0.05, ((1.0, 1.0), (2.0, 0.4)), f_end=95) * 0.9
    pop_noise = noise_burst(0.05, decay=90.0, seed=21) * 0.5
    sig = np.zeros(n(dur))
    append_at(sig, click, 0.0)
    append_at(sig, pop + pop_noise, dur - 0.06)
    sig += carrier + ratchet + fizz
    return sig * adsr_env(len(sig), a=0.002, d=0.04, s=0.5, r=0.08)


def sfx_slot_in():
    sig = tone(620, 0.12, ((1.0, 1.0), (0.5, 0.5)), f_end=240)
    click = noise_burst(0.012, decay=120.0, seed=11) * 0.8
    out = np.zeros(n(0.12))
    append_at(out, click, 0.0)
    out += sig
    return out * adsr_env(len(out), a=0.001, d=0.03, s=0.2, r=0.05)


def sfx_match(base=1245.0):
    out = np.zeros(n(0.42))
    ding1 = tone(base, 0.18, ((1.0, 1.0), (2.01, 0.45), (3.9, 0.18)))
    ding2 = tone(base * 1.335, 0.2, ((1.0, 1.0), (2.01, 0.45), (3.9, 0.18)))
    append_at(out, ding1 * 0.9, 0.0)
    append_at(out, ding2 * 0.9, 0.13)
    return out * adsr_env(len(out), a=0.002, d=0.05, s=0.6, r=0.1)


def sfx_collapse():
    dur = 0.66
    whoosh = noise_burst(0.26, decay=2.5, seed=15) * 0.35
    whoosh = whoosh * np.linspace(0.15, 1.0, len(whoosh)) ** 2
    thump = tone(110, 0.35, ((1.0, 1.0), (0.5, 0.35)), f_end=42)
    impact = noise_burst(0.09, decay=32.0, seed=5)
    body = noise_burst(0.3, decay=12.0, seed=9) * 0.5
    out = np.zeros(n(dur))
    append_at(out, whoosh, 0.0)
    append_at(out, impact * 0.9, 0.26)
    append_at(out, thump * 0.95, 0.268)
    append_at(out, body, 0.29)
    out = lowpass(out, 900)
    return out * adsr_env(len(out), a=0.002, d=0.08, s=0.35, r=0.18)


def sfx_warn():
    beep = np.sign(np.sin(2 * math.pi * 311 * np.arange(n(0.09)) / SR)) * 0.5
    beep = beep * adsr_env(len(beep), a=0.004, d=0.02, s=0.7, r=0.02)
    beep = lowpass(beep, 1800)
    out = np.zeros(n(0.5))
    append_at(out, beep, 0.02)
    append_at(out, beep * 0.95, 0.18)
    return out


def sfx_win():
    notes = [523.25, 659.25, 783.99, 1046.5]
    sparkles = [1568.0, 2093.0]
    out = np.zeros(n(1.4))
    for i, f in enumerate(notes):
        pluck = tone(f, 0.34, ((1.0, 1.0), (2.0, 0.35), (3.0, 0.12)))
        pluck *= np.exp(-np.arange(len(pluck)) / SR * 3.2)
        append_at(out, pluck * 0.85, i * 0.16)
    for i, f in enumerate(sparkles):
        sp = tone(f, 0.3, ((1.0, 1.0),)) * 0.35
        sp *= np.exp(-np.arange(len(sp)) / SR * 6.0)
        append_at(out, sp, 0.62 + i * 0.09)
    chord = tone(523.25, 0.6, ((1.0, 0.4),)) + tone(659.25, 0.6, ((1.0, 0.4),)) + tone(783.99, 0.6, ((1.0, 0.4),))
    chord *= np.exp(-np.arange(len(chord)) / SR * 2.4)
    append_at(out, chord * 0.5, 0.72)
    return out * adsr_env(len(out), a=0.004, d=0.05, s=0.8, r=0.25)


def sfx_lose():
    notes = [523.25, 466.16, 392.0, 311.13]
    out = np.zeros(n(1.0))
    for i, f in enumerate(notes):
        pluck = tone(f, 0.3, ((1.0, 1.0), (2.0, 0.25)))
        pluck *= np.exp(-np.arange(len(pluck)) / SR * 4.0)
        append_at(out, pluck * 0.8, i * 0.18)
    return out * adsr_env(len(out), a=0.004, d=0.05, s=0.8, r=0.25)


def fft_lowpass(sig, cutoff, sr):
    spec = np.fft.rfft(sig)
    freqs = np.fft.rfftfreq(len(sig), 1.0 / sr)
    spec *= 1.0 / (1.0 + (freqs / cutoff) ** 2)
    return np.fft.irfft(spec, n=len(sig))


def bgm_lofi():
    sr = 22050
    bpm = 75.0
    beat = 60.0 / bpm
    bar = beat * 4
    bars = 5
    m = int(bars * bar * sr)
    out = np.zeros(m)

    def seg(sec):
        return int(sec * sr)

    def place(sig, t0):
        st = int(t0 * sr)
        end = min(st + len(sig), m)
        if st < m:
            out[st:end] += sig[:end - st]

    def rhodes(notes, dur, amp=0.11):
        s = np.zeros(seg(dur) + seg(0.5))
        tt = np.arange(len(s)) / sr
        env = np.minimum(1.0, tt / 0.08) * np.exp(-tt * 1.1)
        for f in notes:
            osc = (np.sin(2 * np.pi * f * tt)
                   + 0.35 * np.sin(2 * np.pi * 2 * f * tt)
                   + 0.12 * np.sin(2 * np.pi * f * 1.006 * tt))
            s += amp * osc * env
        return s

    def bassnote(f, dur, amp=0.40):
        s = np.zeros(seg(dur))
        tt = np.arange(len(s)) / sr
        env = np.minimum(1.0, tt / 0.012) * np.exp(-tt * 2.3)
        return amp * (np.sin(2 * np.pi * f * tt)
                      + 0.28 * np.sin(2 * np.pi * 2 * f * tt)) * env

    def kick(amp=0.30):
        s = np.zeros(seg(0.30))
        tt = np.arange(len(s)) / sr
        f = 44 + 42 * np.exp(-tt * 26)
        phase = 2 * np.pi * np.cumsum(f) / sr
        return lowpass(amp * np.sin(phase) * np.exp(-tt * 11), 220)

    def brush(rng, dur=0.16, amp=0.09):
        s = np.zeros(seg(dur))
        nz = rng.uniform(-1, 1, len(s))
        tt = np.arange(len(s)) / sr
        body = lowpass(nz, 3200) - lowpass(nz, 650)
        return amp * body * np.exp(-tt * 20)

    def hat(rng, amp=0.045, dur=0.045):
        s = np.zeros(seg(dur))
        nz = rng.uniform(-1, 1, len(s))
        tt = np.arange(len(s)) / sr
        hp = nz - lowpass(nz, 5200)
        return amp * hp * np.exp(-tt * 130)

    def bell(f, amp=0.08, dur=1.2):
        s = np.zeros(seg(dur))
        tt = np.arange(len(s)) / sr
        return amp * (np.sin(2 * np.pi * f * tt) * np.exp(-tt * 2.6)
                      + 0.30 * np.sin(2 * np.pi * 2.003 * f * tt) * np.exp(-tt * 5.5))

    chords = [
        (87.31, [174.61, 220.00, 261.63, 329.63]),
        (82.41, [164.81, 196.00, 246.94, 293.66]),
        (73.42, [146.83, 174.61, 220.00, 261.63]),
        (65.41, [130.81, 164.81, 196.00, 246.94])
    ]

    drum_rng = np.random.RandomState(9)
    for b in range(bars):
        root, notes = chords[b % 4]
        t0 = b * bar
        place(rhodes(notes, bar), t0)
        place(bassnote(root, beat * 0.9), t0)
        place(bassnote(root * 1.498, beat * 0.7), t0 + 2.5 * beat)
        place(kick(), t0)
        place(kick(0.22), t0 + 2 * beat)
        place(brush(drum_rng), t0 + beat)
        place(brush(drum_rng, 0.14, 0.06), t0 + 3 * beat)
        for k in range(8):
            off = k * beat / 2 + (beat / 6 if k % 2 else 0)
            place(hat(drum_rng, 0.05 if k % 2 == 0 else 0.032), t0 + off)

    melody = [
        (0, 2.5, 659.26, 0.085),
        (1, 0.5, 587.33, 0.070),
        (1, 3.0, 493.88, 0.075),
        (2, 1.5, 440.00, 0.070),
        (3, 2.0, 392.00, 0.070),
        (3, 3.5, 523.25, 0.080)
    ]
    for bpos, beatpos, f, amp in melody:
        place(bell(f, amp), bpos * bar + beatpos * beat)

    rng = np.random.RandomState(42)
    hiss = fft_lowpass(rng.uniform(-1, 1, m), 7000, sr) * 0.0035
    pops = np.zeros(m)
    idx = rng.choice(m, size=int(bars * bar * 3), replace=False)
    pops[idx] = rng.uniform(-1, 1, len(idx)) * 0.025
    pops = fft_lowpass(pops, 3000, sr)
    out += hiss + pops

    L = seg(4 * bar)
    xf = seg(1.0)
    u = np.linspace(0, 1, xf)
    out[:xf] = out[:xf] * u + out[L:L + xf] * (1 - u)
    return out[:L], sr


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    write_wav('sfx_screw_out', sfx_screw_out())
    write_wav('sfx_slot_in', sfx_slot_in())
    write_wav('sfx_match', sfx_match(1245.0))
    write_wav('sfx_match2', sfx_match(1480.0))
    write_wav('sfx_match3', sfx_match(1760.0))
    write_wav('sfx_collapse', sfx_collapse())
    write_wav('sfx_warn', sfx_warn())
    write_wav('sfx_win', sfx_win())
    write_wav('sfx_lose', sfx_lose())
    sig, sr = bgm_lofi()
    write_wav('bgm_main', sig, sr=sr, peak=0.55)


if __name__ == '__main__':
    main()
