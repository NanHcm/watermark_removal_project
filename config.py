import torch

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

MODEL_PATHS = {
    'lama': './models/lama_big.pth',
    'sttn': './models/sttn.pth',
    'yolo': './models/watermark_yolov8.pt',
    'esrgan': './models/RealESRGAN_x2plus.pth'
}

UPLOAD_DIR = './static/uploads/'
RESULT_DIR = './static/results/'
