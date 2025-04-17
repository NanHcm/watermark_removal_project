from ultralytics import YOLO
import torch
import config

device = torch.device(config.DEVICE)
model = YOLO(config.MODEL_PATHS['yolo']).to(device)

def detect_watermark(image_path, conf_threshold=0.5):
    results = model.predict(image_path, conf=conf_threshold, device=device)
    boxes = results[0].boxes.xyxy.cpu().numpy().tolist()
    return boxes
