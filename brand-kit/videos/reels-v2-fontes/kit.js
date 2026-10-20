// deterministic animation helpers: every frame is computed from t only
const $ = id => document.getElementById(id);
const C = x => Math.max(0, Math.min(1, x));
const L = (a, b, p) => a + (b - a) * p;
const P = (t, a, d) => C((t - a) / d);
const eo = p => 1 - Math.pow(1 - p, 3);
const eo5 = p => 1 - Math.pow(1 - p, 5);
const ei = p => p * p * p;
const eio = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
const back = p => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
const op = (e, v) => { e.style.opacity = v; e.style.visibility = v <= 0.001 ? 'hidden' : 'visible'; };
const tf = (e, s) => { e.style.transform = s; };
const win = (t, a, b) => t >= a && t < b;
// in/out envelope: fade in over di at a, out over do at b
const env = (t, a, b, di = .15, dO = .15) => P(t, a, di) * (1 - P(t, b - dO, dO));
// screen shake from list of [time, amp]
function shake(t, list) {
  let x = 0, y = 0, r = 0;
  list.forEach(([h, a]) => { const d = t - h; if (d >= 0 && d < .45) { const k = a * Math.exp(-d * 11); x += Math.sin(d * 95) * k; y += Math.cos(d * 81) * k * .8; r += Math.sin(d * 60) * k * .02; } });
  return `translate(${x}px,${y}px) rotate(${r}deg)`;
}
// slam: scale from big to 1 with quick fade
function slam(e, t, a, from = 1.7, d = .16, extra = '') {
  const p = P(t, a, d); op(e, t < a ? 0 : C(p * 3)); tf(e, `${extra} scale(${L(from, 1, eo5(p))})`);
}
// rise: masked line slides up
function rise(e, t, a, d = .3, dist = 120, out = 1e9, dOut = .2) {
  const pi = eo5(P(t, a, d)), po = eo5(P(t, out, dOut));
  tf(e, `translateY(${(1 - pi) * dist - po * dist}px)`); op(e, t < a ? 0 : 1);
}
const fmt = n => Math.round(n).toLocaleString('pt-BR');
function grain(t) { const g = $('grain'); if (!g) return; const f = Math.floor(t * 24); g.style.backgroundPosition = `${(f * 137) % 512}px ${(f * 251) % 512}px`; }
