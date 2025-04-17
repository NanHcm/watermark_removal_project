from ultralytics import YOLO

model = YOLO('yolov8n.pt')
results = model.predict('https://ultralytics.com/images/bus.jpg')
print(results)
