from synthlib import *
import synthlib as S
def add_sfx(SF, DR, kicks, evs):
    for t, ty, v in evs:
        if ty == 'click': SF.add(click(), t - .004, 1.0, pan=.1)
        elif ty == 'pop': SF.add(blip(520, 980), t, 1.0)
        elif ty == 'pop2': SF.add(blip(700, 1150, .07, .13), t, 1.0)
        elif ty == 'tick': SF.add(blip(1800, 1700, .03, .12), t, 1.0)
        elif ty == 'tock': SF.add(blip(1200, 1150, .04, .14), t, 1.0)
        elif ty == 'notif': SF.add(bell(88, .7, .12), t, 1.0, pan=.2); SF.add(bell(95, .9, .1), t + .09, 1.0, pan=.2)
        elif ty == 'success':
            for i, m in enumerate((81, 85, 88)): SF.add(bell(m, .7, .11), t + i * .06, 1.0, pan=.15)
        elif ty == 'count': SF.add(blip(3000, 2900, .012, .05), t, 1.0)
        elif ty == 'whoosh': SF.add(whoosh(max(.25, v), g=.42 if v < .6 else .5), t - v * .45, 1.0)
        elif ty == 'whoosh_big': SF.add(whoosh(.5, 120, 2500, .7), t - .25, 1.0)
        elif ty == 'riser': SF.add(riser(v), t, 1.0)
        elif ty == 'impact': SF.add(impact(), t, 1.0); DR.add(kick(1.6), t, 1.0); kicks.append(t)
        elif ty == 'impact_big': SF.add(impact(True), t, 1.0); kicks.append(t)
        elif ty == 'hit': SF.add(lp(noise(.25), 900) * np.exp(-T(.25) * 16) * .35, t, 1.0)
        elif ty == 'stamp': SF.add(lp(noise(.18), 1400) * np.exp(-T(.18) * 22) * .5, t, 1.0); SF.add(np.sin(2*np.pi*90*T(.2))*np.exp(-T(.2)*18)*.5, t, 1.0)
        elif ty == 'swipe': SF.add(whoosh(.22, 1500, 6000, .28), t - .05, 1.0)
        elif ty == 'shimmer':
            for i, m in enumerate((88, 93, 100)): SF.add(bell(m, 1.2, .05), t + i * .08, 1.0, pan=(-.3, 0, .3)[i])
        elif ty == 'flip': SF.add(bp(noise(.03), 2000, 6000) * np.exp(-T(.03) * 160) * .5, t, 1.0); SF.add(bp(noise(.03), 1500, 5000) * np.exp(-T(.03) * 160) * .35, t + .05, 1.0)
        elif ty == 'slam': DR.add(kick(1.3), t, 1.0); DR.add(clap(), t, .8); SF.add(lp(noise(.3), 600) * np.exp(-T(.3) * 12) * .4, t, 1.0); kicks.append(t)
        elif ty == 'tap': SF.add(click(), t, 1.2)
def duckcurve(kicks, depth=.55):
    d = np.ones(S.N)
    for k in kicks:
        i = int(k * SR); seg = T(.35); j = min(S.N, i + len(seg))
        if i < S.N: d[i:j] = np.minimum(d[i:j], 1 - depth * np.exp(-seg * 9)[:j - i])
    return d
def master(x, dur):
    tt = np.arange(S.N) / SR; fade = np.clip((dur + .05 - tt) / 1.0, 0, 1)[:, None]
    x = x * fade; x = np.tanh(x * 1.15) / 1.15
    return (x / (np.abs(x).max() + 1e-9) * .89).astype(np.float32)
