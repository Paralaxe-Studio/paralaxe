from mix import *
import synthlib as S
DUR = 18.4; setdur(DUR)
DR, BA, PD, PL, SF = Bus(), Bus(), Bus(), Bus(), Bus(); kicks = []
def stab(notes, sec=.18, g=.09):
    t = T(sec + .1); x = np.zeros(len(t))
    for m in notes:
        for d in (-.08, .08): x += saw(mf(m) * 2 ** (d / 12), t)
    env = np.minimum(1, t / .005) * np.exp(-t * 9)
    return lp(x * env, 3200) * g
def buzzer():
    t = T(.5); x = np.sign(np.sin(2*np.pi*110*t)) + np.sign(np.sin(2*np.pi*116*t))
    return lp(x * np.minimum(1, t/.01) * np.exp(-t*3), 1800) * .16
CHS = {'Em': [52, 55, 59], 'C': [48, 52, 55], 'D': [50, 54, 57], 'Bm': [47, 50, 54]}
R0 = {'Em': 28, 'C': 36, 'D': 38, 'Bm': 35}
# hook stabs on slams
for t0, c in [(0, 'Em'), (.45, 'C'), (.75, 'D')]:
    PD.add(stab([m + 12 for m in CHS[c]], .25, .1), t0, 1.0); DR.add(kick(1.3), t0, 1.0); kicks.append(t0)
PD.add(stab([64, 67, 71, 76], .5, .1), 1.05, 1.0)
# groove 100bpm from 1.9 to 14.1, funky bass, lighter during timers
B = .6
cyc = ['Em', 'C', 'D', 'Bm']
t = 1.9; k = 0
while t < 14.1:
    DR.add(kick(), t, .85); kicks.append(t)
    DR.add(hat(), t + B / 2, .6, pan=.2); DR.add(hat(), t + B * .75, .25, pan=-.2)
    if k % 2 == 1: DR.add(snare(), t, .5)
    c = cyc[(k // 2) % 4]
    BA.add(bass(R0[c], .16), t, 1.0); BA.add(bass(R0[c] + 12, .12), t + B * .5, .7); BA.add(bass(R0[c] + 10, .1), t + B * .75, .5)
    if k % 2 == 0: PD.add(pad([m + 12 for m in CHS[c]], B * 2, att=.05, rel=.2, cut=1500), t, .7)
    t += B; k += 1
EV = [(-.0, 'pop2', 0), (1.05, 'pop', 0), (1.65, 'whoosh', .35), (1.9, 'whoosh', .4), (1.9, 'pop', 0)]
for c0 in (1.9, 6.0, 10.1):
    fl = c0 + 2.1
    for i in range(int((fl - c0 - .3) / .25)): SF.add(blip(2200 if i % 2 == 0 else 1700, 2100, .025, .1 + .05 * i / 7), c0 + .3 + i * .25, 1.0)
    roll = []; tt = fl - .55; st = .09
    while tt < fl: roll.append(tt); tt += st; st = max(.03, st * .82)
    for i, r in enumerate(roll): DR.add(snare(), r, .2 + .5 * i / len(roll))
    EV += [(fl, 'whoosh', .4), (fl + .35, 'stamp', 0), (fl + .35, 'impact', 0)]
    if c0 < 10: SF.add(buzzer(), fl + .38, 1.0)
    else: EV += [(fl + .38, 'success', 0), (fl + .45, 'shimmer', 0)]
    if c0 > 2: EV += [(c0, 'whoosh_big', 0)]
EV += [(14.2, 'slam', 0), (14.45, 'slam', 0), (14.7, 'slam', 0), (15.05, 'pop', 0), (15.3, 'pop2', 0), (16.05, 'whoosh', .35), (16.3, 'whoosh_big', 0), (16.6, 'shimmer', 0)]
PD.add(pad([52, 59, 64, 67, 71], 3.4, att=.05, rel=1.0, cut=2500), 16.3, 1.3); BA.add(np.sin(2*np.pi*41.2*T(2.4))*np.exp(-T(2.4)*1.3)*.5, 16.3, 1.0)
for t0 in (14.2, 14.45, 14.7): PD.add(stab([64, 67, 71], .2, .08), t0, 1.0)
add_sfx(SF, DR, kicks, EV)
duck = duckcurve(kicks, .5)
ir = reverb(2.0)
music = DR.b + (BA.b + PD.b) * duck[:, None] + apply_rev(PL.b, ir, .4)
music = apply_rev(music, ir, .1)
tt = np.arange(S.N) / SR
quiet = np.ones(S.N)
for c0 in (1.9, 6.0, 10.1):
    quiet = np.minimum(quiet, np.where((tt > c0 + .3) & (tt < c0 + 2.1), .55, 1.0))
music *= quiet[:, None]
sfx = apply_rev(SF.b, reverb(3.0, 3000), .15)
wavfile.write('out/mito_full.wav', SR, master(music * .8 + sfx, DUR))
wavfile.write('out/mito_sfx.wav', SR, master(sfx, DUR))
print('ok')
