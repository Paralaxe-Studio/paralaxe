import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile
SR = 48000
rng = np.random.default_rng(7)
N = 0
def setdur(d):
    global N; N = int(SR * (d + 0.1)); return N
def T(sec): return np.arange(int(SR * sec)) / SR
def mf(m): return 440 * 2 ** ((m - 69) / 12)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'bandpass', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'highpass', fs=SR, output='sos'), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'lowpass', fs=SR, output='sos'), x)
def noise(sec): return rng.standard_normal(int(SR * sec))

class Bus:
    def __init__(s): s.b = np.zeros((N, 2))
    def add(s, x, t, g=1.0, pan=0.0):
        i = int(t * SR)
        if i >= N or len(x) == 0: return
        if x.ndim == 1:
            l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
            x = np.stack([x * l * 1.414, x * r * 1.414], 1)
        j = min(N, i + len(x)); s.b[i:j] += x[:j - i] * g

def svf_sweep(x, f0, f1, q=2.0, curve=None):
    """time-varying state-variable bandpass (per-sample loop, short sounds only)"""
    n = len(x); out = np.zeros(n); lo = bd = 0.0
    fs = f0 * (f1 / f0) ** (np.linspace(0, 1, n) if curve is None else curve)
    for i in range(n):
        f = 2 * np.sin(np.pi * min(fs[i], SR / 6) / SR)
        hi = x[i] - lo - bd / q; bd += f * hi; lo += f * bd; out[i] = bd
    return out

def reverb(sec=1.8, damp=4000):
    t = T(sec); ir = rng.standard_normal((len(t), 2)) * np.exp(-t * 6.9 / sec)[:, None]
    ir[:, 0] = lp(ir[:, 0], damp); ir[:, 1] = lp(ir[:, 1], damp); ir[:int(.01 * SR)] *= np.linspace(0, 1, int(.01 * SR))[:, None]
    return ir / np.sqrt((ir ** 2).sum(0))[None, :] * 0.5

def apply_rev(stereo, ir, wet):
    out = np.zeros_like(stereo)
    for c in range(2): out[:, c] = fftconvolve(stereo[:, c], ir[:, c])[:len(stereo)]
    return stereo + out * wet

# ---------------- instruments ----------------
def kick(big=1.0):
    t = T(.5); f = 46 + 120 * np.exp(-t * 30); ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * np.exp(-t * (6.5 / big)); c = hp(noise(.004), 3000) * .5
    x[:len(c)] += c; return np.tanh(x * 1.6) * .9

def clap():
    t = T(.25); n = bp(noise(.25), 900, 3200)
    env = np.exp(-t * 20) * .6
    for k in (0, .011, .022): env += np.where(t >= k, np.exp(-(t - k) * 260), 0)
    return n * env * .55

def hat(open_=False):
    t = T(.25 if open_ else .07); return hp(noise(len(t) / SR), 7500, 4) * np.exp(-t * (14 if open_ else 70)) * .35

def snare():
    t = T(.18); return (bp(noise(.18), 1200, 6000) * np.exp(-t * 26) * .5 + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * .3)

def saw(f, t): return 2 * ((f * t) % 1.0) - 1

def pad(notes, sec, att=.3, rel=.6, cut=1600):
    t = T(sec + rel); x = np.zeros(len(t))
    for m in notes:
        for d in (-0.07, 0, 0.07): x += saw(mf(m) * 2 ** (d / 12), t + rng.random())
    env = np.minimum(1, t / att) * np.where(t < sec, 1, np.exp(-(t - sec) * 6))
    return hp(lp(x * env, cut, 4), 150) * .055

def pluck(m, sec=.35):
    t = T(sec); f = mf(m); x = sum(np.sin(2 * np.pi * f * k * t) / k for k in (1, 3, 5, 7))
    return lp(x * np.exp(-t * 11), 3500) * .16

def bass(m, sec=.24):
    t = T(sec); f = mf(m); x = np.sin(2 * np.pi * f * t) + .25 * np.sin(4 * np.pi * f * t)
    env = np.minimum(1, t / .006) * np.exp(-t * 5); return np.tanh(x * env * 1.4) * .36

def bell(m, sec=.8, g=.2):
    t = T(sec); f = mf(m)
    x = np.sin(2 * np.pi * f * t) + .35 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 6) + .2 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 12)
    return x * np.exp(-t * 5) * np.minimum(1, t / .002) * g

# ---------------- sfx ----------------
def click():
    a = bp(noise(.006), 1800, 7000) * np.exp(-T(.006) * 900); s = np.sin(2 * np.pi * 3600 * T(.01)) * np.exp(-T(.01) * 700) * .25
    x = np.zeros(int(.09 * SR)); x[:len(a)] += a; x[:len(s)] += s
    r = a * .45; k = int(.068 * SR); x[k:k + len(r)] += r; return x * 1.0

def key():
    l = .016; a = bp(noise(l), 1200 + rng.random() * 800, 5000) * np.exp(-T(l) * (380 + rng.random() * 150))
    th = np.sin(2 * np.pi * (160 + rng.random() * 50) * T(l)) * np.exp(-T(l) * 300) * .5
    return (a + th) * (.55 + rng.random() * .2)

def blip(f0, f1, sec=.09, g=.18):
    t = T(sec); f = f0 * (f1 / f0) ** (t / sec); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 38) * np.minimum(1, t / .003) * g

def whoosh(sec, lo=250, hi=3200, g=.5):
    n = noise(sec); u = np.linspace(0, 1, len(n))
    curve = np.sin(np.pi * np.clip(u * 1.15, 0, 1))
    x = svf_sweep(n, lo, hi, 1.6, curve) ; env = np.sin(np.pi * u) ** 1.6
    x = x * env; x /= np.abs(x).max() + 1e-9
    pan = np.linspace(-.6, .6, len(x))
    return np.stack([x * np.cos((pan + 1) * np.pi / 4), x * np.sin((pan + 1) * np.pi / 4)], 1) * 1.414 * g

def riser(sec):
    n = noise(sec); u = np.linspace(0, 1, len(n))
    x = svf_sweep(n, 350, 7000, 3.0) * (u ** 1.4) * .9
    t = T(sec); f = 180 * (4.5 ** u); x += np.sin(2 * np.pi * np.cumsum(f) / SR) * (u ** 2) * .18
    return x / (np.abs(x).max() + 1e-9) * .45

def impact(big=False):
    sec = 2.2 if big else 1.2; t = T(sec); f = 32 + 70 * np.exp(-t * 7); ph = 2 * np.pi * np.cumsum(f) / SR
    boom = np.sin(ph) * np.exp(-t * (1.6 if big else 3)) * .9
    cr = lp(noise(sec), 2200) * np.exp(-t * 9) * .35
    return np.tanh((boom + cr) * 1.3) * (.95 if big else .8)

