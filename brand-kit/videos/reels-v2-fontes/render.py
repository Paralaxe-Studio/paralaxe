import sys, subprocess, asyncio, os
from playwright.async_api import async_playwright
scene, out, wav = sys.argv[1], sys.argv[2], sys.argv[3]
FPS = 30
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--no-sandbox"])
        pg = await b.new_page(viewport={"width": 1080, "height": 1920})
        await pg.goto("file://" + os.path.abspath(scene)); await pg.evaluate("document.fonts.ready"); await pg.wait_for_timeout(400)
        dur = await pg.evaluate("window.DUR")
        ff = subprocess.Popen(["ffmpeg","-y","-loglevel","error","-f","image2pipe","-framerate",str(FPS),"-c:v","mjpeg","-i","-","-i",wav,
            "-map","0:v","-map","1:a","-shortest","-c:v","libx264","-preset","medium","-crf","17","-pix_fmt","yuv420p","-r","30",
            "-c:a","aac","-b:a","192k","-movflags","+faststart", out], stdin=subprocess.PIPE)
        for i in range(int(dur * FPS)):
            await pg.evaluate(f"setT({i/FPS})")
            ff.stdin.write(await pg.screenshot(type="jpeg", quality=93))
        ff.stdin.close(); ff.wait(); await b.close()
asyncio.run(main())
