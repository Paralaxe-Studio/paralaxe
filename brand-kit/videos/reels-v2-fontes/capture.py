import sys, subprocess, asyncio, os
from playwright.async_api import async_playwright
scene, out = sys.argv[1], sys.argv[2]
still = float(sys.argv[3]) if len(sys.argv) > 3 and sys.argv[3] != "-" else None
FPS = 30
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--no-sandbox"])
        pg = await b.new_page(viewport={"width": 1080, "height": 1920})
        await pg.goto("file://" + os.path.abspath(scene))
        await pg.evaluate("document.fonts.ready")
        await pg.wait_for_timeout(400)
        dur = await pg.evaluate("window.DUR")
        if still is not None:
            await pg.evaluate(f"setT({still})")
            await pg.screenshot(path=out, type="png")
            await b.close(); return
        ff = subprocess.Popen(["ffmpeg","-y","-loglevel","error","-f","image2pipe","-framerate",str(FPS),"-c:v","mjpeg","-i","-",
            "-f","lavfi","-i","anullsrc=r=44100:cl=stereo","-shortest","-c:v","libx264","-preset","medium","-crf","17","-pix_fmt","yuv420p",
            "-c:a","aac","-b:a","96k","-movflags","+faststart", out], stdin=subprocess.PIPE)
        n = int(dur * FPS)
        for i in range(n):
            await pg.evaluate(f"setT({i/FPS})")
            buf = await pg.screenshot(type="jpeg", quality=92)
            ff.stdin.write(buf)
        ff.stdin.close(); ff.wait()
        await b.close()
asyncio.run(main())
