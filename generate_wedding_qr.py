#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate Wedding PhotoBooth Standee & QR Code Card
Theme: Warm Ivory, Champagne Gold, Mocha & Blush Pink
Matching the Wedding of Taii & Toey (19.12.2026)
"""

import os
import qrcode
import cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def draw_diamond(draw, cx, cy, size, fill):
    draw.polygon([
        (cx, cy - size),
        (cx + size, cy),
        (cx, cy + size),
        (cx - size, cy)
    ], fill=fill)

def create_wedding_standee(
    output_path='public/Wedding_PhotoBooth_QRCode.png',
    target_url='https://wedding-webcard-e495.vercel.app/photobooth',
    width=1500,
    height=2100
):
    W, H = width, height
    card = Image.new('RGBA', (W, H), (255, 255, 255, 255))
    draw = ImageDraw.Draw(card)

    # 1. Background Gradient (Soft warm ivory down to gentle rose-cream)
    for y in range(H):
        ratio = y / H
        r = int(253 - ratio * 3)
        g = int(251 - ratio * 8)
        b = int(247 - ratio * 8)
        draw.line([(0, y), (W, y)], fill=(r, g, b, 255))

    # 2. Ornate Double Borders
    gold = (197, 165, 122, 255)        # #c5a57a
    blush = (232, 190, 195, 255)       # #e8bec3
    mocha_dark = (74, 48, 56, 255)     # #4a3038
    mocha_med = (122, 89, 72, 255)     # #7a5948
    mocha_light = (153, 115, 101, 255) # #997365

    # Outer border
    draw.rounded_rectangle([(45, 45), (W - 45, H - 45)], radius=36, outline=gold, width=4)
    # Inner border
    draw.rounded_rectangle([(65, 65), (W - 65, H - 65)], radius=24, outline=blush, width=2)

    # Corner decorative diamonds
    corner_inset = 90
    for cx in [corner_inset, W - corner_inset]:
        for cy in [corner_inset, H - corner_inset]:
            draw_diamond(draw, cx, cy, 7, gold)

    # Load Fonts
    font_serif_large = ImageFont.truetype('/System/Library/Fonts/Supplemental/Georgia.ttf', 76)
    font_serif_med = ImageFont.truetype('/System/Library/Fonts/Supplemental/Georgia.ttf', 42)
    font_serif_italic = ImageFont.truetype('/System/Library/Fonts/Supplemental/Georgia Italic.ttf', 32)
    font_serif_small = ImageFont.truetype('/System/Library/Fonts/Supplemental/Georgia.ttf', 26)
    font_serif_badge = ImageFont.truetype('/System/Library/Fonts/Supplemental/Georgia.ttf', 34)

    font_thai_title = ImageFont.truetype('/System/Library/Fonts/Supplemental/SukhumvitSet.ttc', 42, index=5)
    font_thai_bold = ImageFont.truetype('/System/Library/Fonts/Supplemental/SukhumvitSet.ttc', 36, index=5)
    font_thai_med = ImageFont.truetype('/System/Library/Fonts/Supplemental/SukhumvitSet.ttc', 30, index=3)
    font_thai_small = ImageFont.truetype('/System/Library/Fonts/Supplemental/SukhumvitSet.ttc', 25, index=2)

    curr_y = 135

    # 3. Top Crest (Matching Romantic Arch Filter Style: Circle T&T + ALWAYS & FOREVER pill)
    crest_r = 56
    crest_cx = W // 2
    crest_cy = curr_y + crest_r
    draw.ellipse(
        [(crest_cx - crest_r, crest_cy - crest_r), (crest_cx + crest_r, crest_cy + crest_r)],
        fill=(251, 244, 232, 255),
        outline=gold,
        width=3
    )
    tt_text = "T&T"
    bbox = draw.textbbox((0, 0), tt_text, font=font_serif_badge)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text((crest_cx - tw / 2, crest_cy - th / 2 - 4), tt_text, fill=mocha_med, font=font_serif_badge)

    curr_y = crest_cy + crest_r + 22

    # ALWAYS & FOREVER pill
    pill_w, pill_h = 460, 46
    pill_x = (W - pill_w) // 2
    draw.rounded_rectangle(
        [(pill_x, curr_y), (pill_x + pill_w, curr_y + pill_h)],
        radius=23,
        fill=(146, 117, 103, 255)
    )
    af_text = "A L W A Y S   &   F O R E V E R"
    bbox = draw.textbbox((0, 0), af_text, font=font_serif_small)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(((W - tw) / 2, curr_y + (pill_h - th) / 2 - 3), af_text, fill=(255, 255, 255, 255), font=font_serif_small)

    curr_y += pill_h + 45

    # 4. Couple Names & Date
    t_names = "TAII  &  TOEY"
    bbox = draw.textbbox((0, 0), t_names, font=font_serif_med)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) / 2, curr_y), t_names, fill=mocha_med, font=font_serif_med)
    curr_y += 58

    t_date = "19  •  DECEMBER  •  2026"
    bbox = draw.textbbox((0, 0), t_date, font=font_serif_small)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) / 2, curr_y), t_date, fill=gold, font=font_serif_small)
    curr_y += 50

    # Divider line with vector diamond
    div_w = 420
    div_x = (W - div_w) // 2
    draw.line([(div_x, curr_y), (div_x + 180, curr_y)], fill=gold, width=2)
    draw_diamond(draw, W // 2, curr_y, 7, gold)
    draw.line([(div_x + 240, curr_y), (div_x + div_w, curr_y)], fill=gold, width=2)
    curr_y += 45

    # PHOTO BOOTH Title
    t_pb = "PHOTO BOOTH"
    bbox = draw.textbbox((0, 0), t_pb, font=font_serif_large)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) / 2, curr_y), t_pb, fill=mocha_dark, font=font_serif_large)
    curr_y += 95

    # Thai Subtitle
    t_sub = "ร่วมบันทึกภาพความทรงจำ & คำอวยพร"
    bbox = draw.textbbox((0, 0), t_sub, font=font_thai_title)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) / 2, curr_y), t_sub, fill=mocha_med, font=font_thai_title)
    curr_y += 75

    # 5. QR Code Card Container
    qr_card_w = 720
    qr_card_h = 740
    qr_card_x = (W - qr_card_w) // 2
    qr_card_y = curr_y

    # Soft shadow behind QR card
    shadow = Image.new('RGBA', (qr_card_w + 40, qr_card_h + 40), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    sdraw.rounded_rectangle([(20, 20), (qr_card_w + 20, qr_card_h + 20)], radius=38, fill=(122, 89, 72, 38))
    shadow = shadow.filter(ImageFilter.GaussianBlur(16))
    card.paste(shadow, (qr_card_x - 20, qr_card_y - 12), shadow)

    # QR Card background
    draw.rounded_rectangle([(qr_card_x, qr_card_y), (qr_card_x + qr_card_w, qr_card_y + qr_card_h)], radius=34, fill=(255, 255, 255, 255), outline=gold, width=3)
    draw.rounded_rectangle([(qr_card_x + 12, qr_card_y + 12), (qr_card_x + qr_card_w - 12, qr_card_y + qr_card_h - 12)], radius=24, outline=blush, width=1)

    # Generate QR Code
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=14,
        border=1,
    )
    qr.add_data(target_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color='#4a3038', back_color='white').convert('RGBA')
    qr_size = 530
    qr_img = qr_img.resize((qr_size, qr_size), Image.Resampling.LANCZOS)

    # Center Monogram Badge on QR
    badge_size = 100
    bx = (qr_size - badge_size) // 2
    by = (qr_size - badge_size) // 2
    badge = Image.new('RGBA', (badge_size, badge_size), (0, 0, 0, 0))
    bdraw = ImageDraw.Draw(badge)
    bdraw.rounded_rectangle([(0, 0), (badge_size, badge_size)], radius=22, fill=(255, 255, 255, 255), outline=gold, width=3)
    b_bbox = bdraw.textbbox((0, 0), 'T&T', font=font_serif_badge)
    btw, bth = b_bbox[2] - b_bbox[0], b_bbox[3] - b_bbox[1]
    bdraw.text(((badge_size - btw)/2, (badge_size - bth)/2 - 3), 'T&T', fill=mocha_med, font=font_serif_badge)
    qr_img.paste(badge, (bx, by), badge)

    # Paste QR inside Card
    qr_paste_x = qr_card_x + (qr_card_w - qr_size) // 2
    qr_paste_y = qr_card_y + 42
    card.paste(qr_img, (qr_paste_x, qr_paste_y), qr_img)

    # Text under QR in card
    scan_t1 = "สแกนด้วยกล้องมือถือ เพื่อถ่ายภาพ"
    bbox = draw.textbbox((0, 0), scan_t1, font=font_thai_bold)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) / 2, qr_paste_y + qr_size + 26), scan_t1, fill=mocha_dark, font=font_thai_bold)

    scan_t2 = "• มีกรอบรูปงานแต่งให้เลือก 2 สไตล์ •"
    bbox = draw.textbbox((0, 0), scan_t2, font=font_thai_med)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) / 2, qr_paste_y + qr_size + 76), scan_t2, fill=mocha_light, font=font_thai_med)

    curr_y = qr_card_y + qr_card_h + 55

    # 6. Step-by-Step Instructions (3 Pills)
    step_w = 400
    step_h = 115
    steps = [
        ("ขั้นตอนที่ 1", "สแกน QR Code เปิดกล้อง"),
        ("ขั้นตอนที่ 2", "เลือกกรอบ & โพสท่าถ่ายรูป"),
        ("ขั้นตอนที่ 3", "แชร์ภาพลง IG / LINE")
    ]
    
    total_steps_w = len(steps) * step_w + (len(steps) - 1) * 24
    start_step_x = (W - total_steps_w) // 2

    for i, (title, desc) in enumerate(steps):
        sx = start_step_x + i * (step_w + 24)
        # pill background
        draw.rounded_rectangle([(sx, curr_y), (sx + step_w, curr_y + step_h)], radius=22, fill=(255, 255, 255, 235), outline=blush, width=2)
        # step title
        t_box = draw.textbbox((0, 0), title, font=font_thai_bold)
        tw = t_box[2] - t_box[0]
        draw.text((sx + (step_w - tw)/2, curr_y + 18), title, fill=mocha_med, font=font_thai_bold)
        # step desc
        d_box = draw.textbbox((0, 0), desc, font=font_thai_small)
        dw = d_box[2] - d_box[0]
        draw.text((sx + (step_w - dw)/2, curr_y + 62), desc, fill=mocha_light, font=font_thai_small)

    curr_y += step_h + 60

    # 7. Footer Section
    tag = "#TAIITOEYWEDDING"
    bbox = draw.textbbox((0, 0), tag, font=font_serif_med)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) / 2, curr_y), tag, fill=gold, font=font_serif_med)
    curr_y += 54

    ft = "Thank you for celebrating our special day with us"
    bbox = draw.textbbox((0, 0), ft, font=font_serif_italic)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) / 2, curr_y), ft, fill=mocha_light, font=font_serif_italic)

    # Save high-res RGBA image
    card_rgb = card.convert('RGB')
    card_rgb.save(output_path, quality=98)
    print(f"Standee created successfully at: {output_path}")

    # Also save in JPEG
    jpg_path = output_path.replace('.png', '.jpg')
    card_rgb.save(jpg_path, quality=95)
    print(f"JPEG Standee created at: {jpg_path}")

    # Verify scannability
    cv_img = cv2.imread(output_path)
    det = cv2.QRCodeDetector()
    val, pts, st = det.detectAndDecode(cv_img)
    print("Verification Scan:", val)
    if val == target_url:
        print("✅ QR Code scannability verified 100%!")
    else:
        print("⚠️ Warning: QR Code detector could not auto-verify, check image contrast.")

if __name__ == '__main__':
    # 1. Save in public/
    create_wedding_standee('public/Wedding_PhotoBooth_QRCode.png')
    # 2. Save in IG_Filter_แต่งงาน/
    create_wedding_standee('IG_Filter_แต่งงาน/Wedding_PhotoBooth_QRCode.png')
