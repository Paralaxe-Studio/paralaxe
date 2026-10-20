def dots(n, k, total=6): return '<div class="dots">' + ''.join(f'<i class="{"on" if i==k else ""}"></i>' for i in range(total)) + '</div>'
def foot(k, dark=False):
    img = '<img src="../img/paralaxe-simbolo-P.png" style="height:34px"><img src="../img/paralaxe-nome.png" style="height:22px;margin-left:14px">'
    cls = '' if dark else 'class="blk"'
    img = img.replace('<img ', f'<img {cls} ') if not dark else img
    return f'<div class="foot" style="color:{"#fed301" if dark else "#0a0a0a"}"><div style="display:flex;align-items:center">{img}</div>{dots(6,k)}</div>'
SC = '<svg width="86" height="86" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="1.8" stroke-linecap="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12"/></svg>'
BB = '<svg width="86" height="86" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="4" width="18" height="6" rx="1.5"/><path d="M5 10v9M8 10v7M11 10v9M14 10v7M17 10v9M20 10v7"/></svg>'
SP = '<svg width="86" height="86" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="1.8" stroke-linejoin="round"><path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z"/><path d="M19 17l.8 2.2L22 20l-2.2.8L19 23l-.8-2.2L16 20l2.2-.8z"/></svg>'
ramos = [("Salão de beleza", SC, 3, "80", "960", "por atendimento"), ("Barbearia", BB, 4, "45", "720", "por corte"), ("Clínica de estética", SP, 2, "150", "1.200", "por sessão")]
css = '''
.y{background:#fed301;color:#0a0a0a}
.rc{position:absolute;left:150px;top:300px;width:780px;background:#fffdf5;padding:56px 60px 70px;box-shadow:0 40px 80px rgba(80,60,0,.25);transform:rotate(-2deg)}
.rc:after{content:"";position:absolute;left:0;right:0;bottom:-28px;height:30px;background:linear-gradient(-45deg,transparent 16px,#fffdf5 0) 0 0/32px 30px,linear-gradient(45deg,transparent 16px,#fffdf5 0) 0 0/32px 30px}
.rc .hd{display:flex;align-items:center;gap:26px;padding-bottom:34px;border-bottom:4px dashed #d8d2bd}
.rc .hd b{font-family:SG;font-weight:700;font-size:62px;letter-spacing:-.02em}
.ln{display:flex;justify-content:space-between;align-items:baseline;font-family:IN;font-weight:600;font-size:46px;margin-top:34px;color:#2a2a2a}
.ln span{font-weight:500;font-size:34px;color:#7a7568}
.tot{margin-top:40px;padding-top:34px;border-top:6px solid #0a0a0a;display:flex;justify-content:space-between;align-items:flex-end}
.tot .v{font-family:IN;font-weight:900;font-size:108px;letter-spacing:-.04em;line-height:1}
.tot .l{font-family:SG;font-weight:700;font-size:40px;margin-bottom:14px}
.note{position:absolute;left:72px;right:72px;bottom:150px;font-family:IN;font-weight:500;font-size:30px;color:#4a4330}
'''
slides = []
slides.append(f'''<section class="sl y">
 <div class="abs" style="left:72px;top:90px;font-family:SG;font-weight:500;font-size:30px;letter-spacing:.22em">FAZ A CONTA</div>
 <div class="abs sg" style="left:66px;top:200px;font-size:176px">Quanto<br>custa uma<br>falta?</div>
 <div class="abs" style="left:72px;top:780px;font-family:IN;font-weight:900;font-size:300px;letter-spacing:-.06em;line-height:1;color:transparent;-webkit-text-stroke:6px #0a0a0a">R$ ?</div>
 <div class="abs" style="left:72px;top:1120px;display:flex;gap:16px;align-items:center;background:#0a0a0a;color:#fed301;border-radius:40px;padding:18px 34px;font-family:SG;font-weight:700;font-size:40px">Arraste para ver
 <svg width="40" height="40" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="#fed301" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
 {foot(0).replace('class="foot"','class="foot" style="bottom:60px;left:auto;right:72px"').replace('<div style="display:flex;align-items:center">','<div style="display:none">')}
 <div class="grain"></div></section>''')
for k, (nm, ic, f, v, tot, por) in enumerate(ramos):
    slides.append(f'''<section class="sl y">
 <div class="abs" style="left:72px;top:110px;font-family:SG;font-weight:500;font-size:30px;letter-spacing:.22em">EXEMPLO {k+1} DE 3</div>
 <div class="rc"><div class="hd">{ic}<b>{nm}</b></div>
  <div class="ln">{f} faltas<span>por semana</span></div>
  <div class="ln">× R$ {v}<span>{por}</span></div>
  <div class="ln">× 4<span>semanas</span></div>
  <div class="tot"><div class="v">R$ {tot}</div><div class="l">por mês</div></div>
 </div>
 <div class="note">Valores ilustrativos. Troque pelos números do seu negócio.</div>
 {foot(k+1)}<div class="grain"></div></section>''')
steps = [("Lembrete automático", "no WhatsApp, um dia antes do horário."), ("Confirma com um toque", "ou remarca, sem precisar te ligar."), ("A vaga volta para a agenda", "e outro cliente pode marcar.")]
st = ''.join(f'''<div style="display:flex;gap:34px;margin-top:56px"><div style="flex:none;width:96px;height:96px;border-radius:50%;background:#fed301;color:#0a0a0a;display:flex;align-items:center;justify-content:center;font-family:SG;font-weight:700;font-size:50px">{i+1}</div>
<div><div class="sg" style="font-size:58px;color:#f4f4f2">{a}</div><div style="font-family:IN;font-weight:500;font-size:38px;color:#a9a69c;margin-top:12px">{b}</div></div></div>''' for i, (a, b) in enumerate(steps))
slides.append(f'''<section class="sl" style="background:#0a0a0a">
 <div class="abs" style="inset:0;background:radial-gradient(800px 600px at 90% 0%,rgba(254,211,1,.18),rgba(0,0,0,0) 70%)"></div>
 <div class="abs" style="left:72px;top:110px;font-family:SG;font-weight:500;font-size:30px;letter-spacing:.22em;color:#fed301">DÁ PARA DIMINUIR</div>
 <div class="abs sg" style="left:72px;top:190px;font-size:104px;color:#f4f4f2">Menos falta,<br><span style="color:#fed301">sem correr atrás.</span></div>
 <div class="abs" style="left:72px;right:72px;top:470px">{st}</div>
 {foot(4, True)}</section>''')
box = 'display:inline-block;width:150px;height:96px;border:5px solid #0a0a0a;border-radius:18px;background:#fffdf5;vertical-align:middle;margin:0 10px'
slides.append(f'''<section class="sl y">
 <div class="abs" style="left:72px;top:110px;font-family:SG;font-weight:500;font-size:30px;letter-spacing:.22em">AGORA É COM VOCÊ</div>
 <div class="abs sg" style="left:72px;top:190px;font-size:120px">Faz a conta<br>do seu.</div>
 <div class="abs" style="left:72px;right:60px;top:560px;font-family:SG;font-weight:700;font-size:54px;line-height:2.2">
  <span style="{box}"></span> faltas por semana<br>× R$ <span style="{box};width:220px"></span> × 4<br>= R$ <span style="{box};width:340px;background:#0a0a0a"></span> por mês</div>
 <div class="abs" style="left:72px;right:72px;top:1010px;font-family:IN;font-weight:600;font-size:40px;line-height:1.35">Manda o resultado no direct que a gente mostra como reduzir.</div>
 {foot(5)}<div class="grain"></div></section>''')
html = f'<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="base.css"><style>{css}</style></head><body>{"".join(slides)}</body></html>'
open('s2.html', 'w').write(html)
