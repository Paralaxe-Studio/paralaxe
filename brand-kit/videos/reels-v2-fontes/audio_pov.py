from mix import *
import synthlib as S
DUR = 17.8; setdur(DUR)
DR, BA, PD, PL, SF = Bus(), Bus(), Bus(), Bus(), Bus(); kicks = []
def rhodes(m, sec=.9, g=.12):
    t = T(sec); f = mf(m)
    x = np.sin(2*np.pi*f*t + .8*np.sin(2*np.pi*f*t)*np.exp(-t*4)) * np.exp(-t*2.2)
    return lp(x*g*np.minimum(1,t/.004), 2600)
def chord(notes, t0, sec, g=.1):
    for i, m in enumerate(notes): PL.add(rhodes(m, sec, g), t0 + i * .012, 1.0, pan=(i - 1.5) * .2)
# night lo-fi 0-4.55, 88 bpm swung
B = 60 / 88
lofi = [('Fmaj7', [53, 57, 60, 64]), ('Em7', [52, 55, 59, 62]), ('Dm7', [50, 53, 57, 60]), ('Cmaj7', [48, 52, 55, 59])]
t = 0.0; k = 0
while t < 4.5:
    DR.add(kick(.8), t, .7); kicks.append(t)
    DR.add(hat(), t + B * .66, .35, pan=.25)
    if k % 2 == 1: DR.add(snare(), t, .35)
    if k % 2 == 0:
        nm, ns = lofi[(k // 2) % 4]; chord(ns, t, B * 2, .09); BA.add(bass(ns[0] - 24, B * 1.6) * .8, t, 1.0)
    t += B; k += 1
# tension rises with notifications 3-4.5
PD.add(riser(1.5) * .6, 3.0, 1.0)
# scratch + silence 4.55
def scratch():
    sec = .45; n = noise(sec); u = np.linspace(0, 1, len(n))
    curve = np.abs(np.sin(u * np.pi * 2.5))
    x = svf_sweep(n, 300, 4000, 4.0, curve) * np.exp(-u * 1.5)
    return x / (np.abs(x).max() + 1e-9) * .6
SF.add(scratch(), 4.55, 1.0)
# day groove 6.45-11.4 bouncy 112bpm
B2 = 60 / 112; t = 6.45; k = 0
CH = {'C': [60, 64, 67], 'G': [59, 62, 67], 'Am': [57, 60, 64], 'F': [57, 60, 65]}
ROOT = {'C': 36, 'G': 31, 'Am': 33, 'F': 29}
progd = ['C', 'G', 'Am', 'F']
while t < 11.4:
    DR.add(kick(), t, .95); kicks.append(t)
    DR.add(hat(), t + B2 / 2, .7, pan=.2)
    if k % 2 == 1: DR.add(clap(), t, .85)
    c = progd[(k // 2) % 4]
    if k % 2 == 0: PD.add(pad(CH[c], B2 * 2, att=.05, rel=.3, cut=2400), t, .9)
    BA.add(bass(ROOT[c], B2 * .45), t, 1.0); BA.add(bass(ROOT[c] + 12, B2 * .3), t + B2 * .5, .8)
    mel = CH[c] + [CH[c][0] + 12]
    for j in range(2): PL.add(pluck(mel[(k * 2 + j) % 4] + 12, .22), t + j * B2 / 2, .6, pan=(-.3 if j else .3))
    t += B2; k += 1
# night again lo-fi 11.5-13.7
t = 11.5; k = 0
while t < 13.7:
    DR.add(kick(.8), t, .6); kicks.append(t); DR.add(hat(), t + B * .66, .3)
    if k % 2 == 0: nm, ns = lofi[(k // 2) % 4]; chord(ns, t, B * 2, .085); BA.add(bass(ns[0] - 24, B * 1.6) * .7, t, 1.0)
    t += B; k += 1
# final punch
PD.add(pad([48, 60, 64, 67, 71], 3.5, att=.05, rel=1.0, cut=2600), 13.9, 1.3)
BA.add(np.sin(2*np.pi*65.4*T(2.5))*np.exp(-T(2.5)*1.3)*.5, 13.9, 1.0)
EV = [(a, 'notif', 0) for a in []]
NT = []; tt0, g = .3, .5
for i in range(18): NT.append(tt0); tt0 += g; g = max(.1, g * .82)
for i, a in enumerate(NT): SF.add(blip(1320, 1320, .07, .1) if i % 2 else blip(1760, 1760, .06, .09), a, 1.0, pan=(-.3 if i % 2 else .3)); SF.add(np.sin(2*np.pi*170*T(.16))*np.exp(-T(.16)*18)*.12*np.sign(np.sin(2*np.pi*40*T(.16))), a, 1.0)
EV = [(4.55, 'hit', 0), (5.05, 'whoosh', .35), (5.15, 'riser', .35), (5.5, 'slam', 0), (5.75, 'slam', 0), (6.0, 'impact', 0),
      (6.45, 'whoosh_big', 0), (6.75, 'pop', 0), (7.3, 'tap', 0), (7.65, 'swipe', 0), (8.2, 'pop', 0), (8.4, 'tap', 0), (8.95, 'tap', 0), (9.1, 'pop2', 0),
      (9.95, 'tap', 0), (10.1, 'swipe', 0), (10.3, 'success', 0), (10.35, 'shimmer', 0), (10.15, 'pop', 0), (11.45, 'whoosh_big', 0),
      (11.95, 'swipe', 0), (12.1, 'pop', 0), (12.4, 'notif', 0), (12.95, 'pop', 0), (13.6, 'whoosh', .4),
      (13.9, 'slam', 0), (14.15, 'slam', 0), (14.5, 'impact', 0), (15.3, 'whoosh', .35), (15.45, 'whoosh_big', 0), (15.75, 'shimmer', 0)]
EV += [(.0, 'pop', 0), (2.2, 'pop', 0), (4.6, 'pop', 0)]
add_sfx(SF, DR, kicks, EV)
duck = duckcurve(kicks, .45)
ir = reverb(2.2)
music = DR.b + (BA.b + PD.b) * duck[:, None] + apply_rev(PL.b * duck[:, None], ir, .45)
music = apply_rev(music, ir, .1)
tt = np.arange(S.N) / SR
music *= np.where((tt > 4.58) & (tt < 6.4), np.where(tt < 5.15, 0.0, .5), 1.0)[:, None]
music *= np.where((tt < 4.58) | ((tt > 11.5) & (tt < 13.8)), 1.7, 1.0)[:, None]
sfx = apply_rev(SF.b, reverb(3.0, 3000), .15)
SFb = SF.b.copy(); sfx = sfx * np.where(tt < 4.58, 1.25, 1.0)[:, None]
wavfile.write('out/pov_full.wav', SR, master(music * .8 + sfx, DUR))
wavfile.write('out/pov_sfx.wav', SR, master(sfx, DUR))
print('ok')
