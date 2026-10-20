import sys, asyncio, os
from playwright.async_api import async_playwright
html, outdir = sys.argv[1], sys.argv[2]; names = sys.argv[3].split(',')
async def m():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1080,"height":1350}, device_scale_factor=1)
        await pg.goto("file://"+os.path.abspath(html)); await pg.evaluate("document.fonts.ready"); await pg.wait_for_timeout(300)
        os.makedirs(outdir, exist_ok=True)
        for i,n in enumerate(names):
            await pg.screenshot(path=f"{outdir}/{n}.png", clip={"x":0,"y":i*1350,"width":1080,"height":1350}, full_page=True)
        await b.close()
asyncio.run(m())
