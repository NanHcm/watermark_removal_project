from fastapi import APIRouter, UploadFile, File
import os
import uuid
import shutil
from backend.watermark_detector import detect_watermark
from backend.image_inpainter import remove_watermark_image
from backend.video_inpainter import remove_watermark_video
from config import UPLOAD_DIR, RESULT_DIR
from PIL import Image, ImageDraw
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/api")


def generate_simple_mask(image_path, box, mask_path):
    """根据一个bbox生成简单mask（白底黑区域）"""
    image = Image.open(image_path).convert("RGB")
    mask = Image.new("L", image.size, 0)
    draw = ImageDraw.Draw(mask)
    x1, y1, x2, y2 = map(int, box)
    draw.rectangle([x1, y1, x2, y2], fill=255)
    mask.save(mask_path)


@router.post("/remove_watermark_image")
async def remove_image_watermark(file: UploadFile = File(...)):
    file_id = str(uuid.uuid4())
    image_path = os.path.join(UPLOAD_DIR, "images", file_id + ".png")
    result_path = os.path.join(RESULT_DIR, "images", file_id + "_result.png")
    mask_path = os.path.join(UPLOAD_DIR, "images", file_id + "_mask.png")

    # 保存原图
    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 自动检测水印
    boxes = detect_watermark(image_path)
    if boxes:
        generate_simple_mask(image_path, boxes[0], mask_path)
    else:
        return {"error": "未检测到水印"}

    # 去除水印
    result_image = remove_watermark_image(image_path, mask_path)
    result_image.save(result_path)

    return {"result_url": f"/static/results/images/{file_id}_result.png"}


@router.post("/remove_watermark_video")
async def remove_video_watermark(file: UploadFile = File(...)):
    file_id = str(uuid.uuid4())
    video_path = os.path.join(UPLOAD_DIR, "videos", file_id + ".mp4")
    result_path = os.path.join(RESULT_DIR, "videos", file_id + "_result.mp4")

    with open(video_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # TODO: 视频的mask可以后续加上自动检测，目前先用测试用mask或空mask路径
    mask_path = "static/default_video_mask.png"  # 请准备一个mask

    remove_watermark_video(video_path, mask_path, result_path)

    return {"result_url": f"/static/results/videos/{file_id}_result.mp4"}

@router.post("/detect_watermark_image")
async def detect_watermark_api(file: UploadFile = File(...)):
    file_id = str(uuid.uuid4())
    image_path = os.path.join(UPLOAD_DIR, "images", file_id + ".png")

    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    boxes = detect_watermark(image_path)
    if not boxes:
        return JSONResponse(content={"success": False, "message": "未检测到水印"})

    return {
        "success": True,
        "boxes": boxes,
        "image_url": f"/static/uploads/images/{file_id}.png"
    }
