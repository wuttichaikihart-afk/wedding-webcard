import os
import glob
import subprocess

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TARGET_DIR = os.path.join(BASE_DIR, "src", "assets")
SRC_DIR = os.path.join(BASE_DIR, "แกลลอรี่")

if not os.path.exists(SRC_DIR):
    os.makedirs(SRC_DIR)

# หาไฟล์รูปทั้งหมดในโฟลเดอร์ แกลลอรี่
valid_exts = [".jpg", ".jpeg", ".png", ".heic", ".webp", ".JPG", ".JPEG", ".PNG", ".HEIC", ".WEBP"]
img_files = []
for f in os.listdir(SRC_DIR):
    ext = os.path.splitext(f)[1]
    if ext in valid_exts:
        img_files.append(os.path.join(SRC_DIR, f))

img_files.sort()

if not img_files:
    print(f"⚠️ ยังไม่พบรูปภาพในโฟลเดอร์: {SRC_DIR}")
    print("กรุณานำรูปมาวางในโฟลเดอร์ 'แกลลอรี่' แล้วรันคำสั่งนี้ใหม่อีกครั้ง")
else:
    print(f"พบรูปภาพทั้งหมด {len(img_files)} รูป กำลังลบรูปเดิมและประมวลผลรูปใหม่...")
    for f in glob.glob(os.path.join(TARGET_DIR, "pic*.jpg")):
        os.remove(f)

    counter = 1
    for f in img_files:
        target = os.path.join(TARGET_DIR, f"pic{counter}.jpg")
        print(f"Processing ({counter}/{len(img_files)}): {os.path.basename(f)} -> pic{counter}.jpg")
        subprocess.run(["sips", "-Z", "1920", "-s", "format", "jpeg", f, "--out", target], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        counter += 1

    print("✅ เรียบร้อย! รูปภาพทั้งหมดถูกนำเข้าแกลเลอรีแล้ว")
