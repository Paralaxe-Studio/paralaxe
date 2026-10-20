import sys, asyncio, os
from playwright.async_api import async_playwright
from PIL import Image
scene, out = sys.argv[1], sys.argv[2]; ts=[float(x) for x in sys.argv[3].split(',')]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--no-sandbox"])
        pg = await b.new_page(viewport={"width":1080,"height":1920})
        msgs=[]; pg.on("console", lambda m: msgs.append(m.text)); pg.on("pageerror", lambda e: msgs.append("ERR "+str(e)))
        await pg.goto("file://"+os.path.abspath(scene)); await pg.evaluate("document.fonts.ready"); await pg.wait_for_timeout(300)
        ims=[]
        for t in ts:
            await pg.evaluate(f"setT({t})"); await pg.screenshot(path="/tmp/_s.png")
            ims.append(Image.open("/tmp/_s.png").convert("RGB").resize((270,480)))
        cols=min(6,len(ims)); rows=(len(ims)+cols-1)//cols
        sh=Image.new("RGB",(cols*270,rows*480),(40,40,40))
        for i,im in enumerate(ims): sh.paste(im,((i%cols)*270,(i//cols)*480))
        sh.save(out); print(msgs[:5]); await b.close()
asyncio.run(main())
