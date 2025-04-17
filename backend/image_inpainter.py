from simple_lama_inpainting import SimpleLama
from PIL import Image
import numpy as np
import torch
import config

device = torch.device(config.DEVICE)
lama = SimpleLama(device=device)

def remove_watermark_image(image_path, mask_path):
    image = Image.open(image_path).convert("RGB")
    mask = Image.open(mask_path).convert("L")
    result = lama(image, mask)
    return result  # PIL Image对象
