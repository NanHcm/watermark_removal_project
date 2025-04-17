import torch
from PIL import Image
from realesrgan import RealESRGAN
import config

device = torch.device(config.DEVICE)
model = RealESRGAN(device, scale=2)
model.load_weights(config.MODEL_PATHS['esrgan'])

def enhance_resolution(image):
    sr_image = model.predict(image)
    return sr_image
