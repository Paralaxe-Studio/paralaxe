from mix import *
import synthlib as S
DUR = 16.6; setdur(DUR)
DR, BA, PD, PL, SF = Bus(), Bus(), Bus(), Bus(), Bus(); kicks = []
B = .5
# --- S1 tension (0-2): clock ticks, drone, heartbeat
for i in range(4): SF.add(blip(1500, 1450, .03, .14) if i % 2 == 0 else blip(1100, 1050, .035, .14), i * .5, 1.0)
PD.add(pad([50, 53, 57], 2.1, att=.4, rel=.2, cut=700), 0, 1.3)
BA.add(np.sin(2*np.pi*36.7*T(2.0))*np.minimum(1,T(2.0)/.3)*.3, 0, 1.0)
DR.add(kick(1.2), 0, .8); kicks.append(0)
# --- S2: DE NOVO hits (impact on 2.0 + echoes)
# --- S3 groove 3.0-7.0, Dm dark, 120bpm
CH = {'Dm': [50, 53, 57], 'Bb': [46, 50, 53], 'Gm': [43, 46, 50], 'A': [45, 49, 52], 'F': [41, 45, 48], 'C': [48, 52, 55], 'Am': [45, 48, 52], 'G': [43, 47, 50]}
ROOT = {'Dm': 26, 'Bb': 34, 'Gm': 31, 'A': 33, 'F': 29, 'C': 36, 'Am': 33, 'G': 31}
for k in range(8):
    t = 3.0 + k * B
    DR.add(kick(), t, 1.0); kicks.append(t)
    DR.add(hat(), t + B / 2, .8, pan=.2); DR.add(hat(), t + B * .75, .3, pan=-.2)
    if k % 2 == 1: DR.add(clap(), t, .9)
for t0, c in [(3.0, 'Dm'), (4.0, 'Bb'), (5.0, 'Gm'), (6.0, 'A')]:
    PD.add(pad([m + 12 for m in CH[c]], 1.0, att=.1, rel=.3, cut=1300), t0, 1.0)
    for k in range(4): BA.add(bass(ROOT[c] + 12 * (k % 2), .22), t0 + k * .25, 1.0)
for i in range(16): DR.add(hat(), 6.0 + i * .0625, .25 + .5 * i / 16)
# --- S4 bright groove 7.45-11.9 (F C G Am), playful pluck
T0 = 7.5
for k in range(9):
    t = T0 + k * B
    DR.add(kick(), t, .95); kicks.append(t)
    DR.add(hat(open_=(k % 4 == 3)), t + B / 2, .8, pan=.2); DR.add(hat(), t + B * .75, .3, pan=-.2)
    if k % 2 == 1: DR.add(snare(), t, .55)
prog = [(7.5, 'F'), (8.5, 'C'), (9.5, 'G'), (10.5, 'Am'), (11.5, 'F')]
for t0, c in prog:
    sec = 1.0 if t0 < 11.5 else .45
    PD.add(pad([m + 12 for m in CH[c]], sec, att=.08, rel=.4, cut=2200), t0, 1.0)
    for k in range(int(sec / .25)): BA.add(bass(ROOT[c] + 12 * (k % 2), .2), t0 + k * .25, .9)
    notes = [m + 24 for m in CH[c]] + [CH[c][0] + 36]
    for k in range(int(sec / .125)):
        PL.add(pluck(notes[[0, 2, 1, 3, 2, 1, 3, 2][k % 8]], .25), t0 + k * .125, .55, pan=(-.35 if k % 2 else .35))
# --- S5 punch 12-14
PD.add(pad([50, 57, 62, 65], 1.9, att=.05, rel=.3, cut=1800), 12.05, 1.0)
for t in (12.05, 12.35, 12.7): BA.add(bass(26, .3), t, 1.2)
# --- end 14+
PD.add(pad([41, 53, 57, 60, 64], 2.5, att=.05, rel=1.0, cut=2600), 14.0, 1.4)
BA.add(np.sin(2*np.pi*43.65*T(2.2))*np.exp(-T(2.2)*1.4)*.5, 14.0, 1.0)
EV = [(.5, 'flip', 0), (.56, 'flip', 0), (.62, 'flip', 0), (1.05, 'impact', 0), (1.05, 'stamp', 0),
      (2.0, 'impact_big', 0), (2.0, 'slam', 0), (2.3, 'hit', 0), (2.45, 'hit', 0), (2.92, 'whoosh', .35),
      (3.05, 'pop2', 0), (3.15, 'pop2', 0), (3.25, 'pop2', 0), (3.5, 'stamp', 0), (3.75, 'stamp', 0), (4.0, 'stamp', 0),
      (4.2, 'swipe', 0), (4.5, 'swipe', 0), (6.3, 'riser', .7), (7.0, 'impact', 0), (7.42, 'whoosh_big', 0),
      (8.3, 'notif', 0), (8.55, 'pop2', 0), (8.63, 'pop2', 0), (9.27, 'tap', 0), (9.5, 'pop', 0), (9.85, 'notif', 0),
      (9.95, 'whoosh', .4), (10.08, 'swipe', 0), (10.4, 'success', 0), (11.15, 'pop', 0), (11.45, 'shimmer', 0), (11.9, 'whoosh', .35),
      (12.05, 'slam', 0), (12.35, 'slam', 0), (12.7, 'slam', 0), (13.1, 'impact', 0), (13.25, 'swipe', 0), (13.88, 'whoosh', .4),
      (14.0, 'whoosh_big', 0), (14.3, 'shimmer', 0), (15.0, 'pop2', 0)]
EV += [(5.0 + i * .06, 'count', 0) for i in range(15)] + [(6.35 + i * .045, 'count', 0) for i in range(14)]
add_sfx(SF, DR, kicks, EV)
duck = duckcurve(kicks)
ir = reverb(2.0); irL = reverb(3.0, 3000)
music = DR.b + (BA.b + PD.b) * duck[:, None] + apply_rev(PL.b * duck[:, None], ir, .5)
music = apply_rev(music, ir, .1)
tt = np.arange(S.N) / SR
music *= np.where((tt > 1.98) & (tt < 2.9), .35, 1.0)[:, None]  # breathe on DE NOVO
sfx = apply_rev(SF.b, irL, .15)
wavfile.write('out/faltas_full.wav', SR, master(music * .8 + sfx, DUR))
wavfile.write('out/faltas_sfx.wav', SR, master(sfx, DUR))
print('ok')
