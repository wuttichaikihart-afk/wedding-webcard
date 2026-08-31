import os
import glob
import subprocess

TARGET_DIR = "/Users/warapornluanrit/Library/CloudStorage/OneDrive-ไลบรารีที่แชร์-onedrive/webcard/src/assets"
SRC_DIR = "/Users/warapornluanrit/Library/CloudStorage/OneDrive-ไลบรารีที่แชร์-onedrive/งานแต่ง/ใช้ในเว็บ"

print("Removing old pictures...")
for f in glob.glob(os.path.join(TARGET_DIR, "pic*.jpg")):
    os.remove(f)

img_files = sorted(glob.glob(os.path.join(SRC_DIR, "IMG_*.JPG")))
no_files = sorted(glob.glob(os.path.join(SRC_DIR, "NO *.jpg")))

counter = 1
for f in img_files + no_files:
    target = os.path.join(TARGET_DIR, f"pic{counter}.jpg")
    print(f"Processing {f} -> pic{counter}.jpg")
    subprocess.run(["sips", "-Z", "1920", f, "--out", target], stdout=subprocess.DEVNULL)
    counter += 1

print("Done!")
