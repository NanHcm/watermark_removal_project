import os
from PIL import Image
from backend.image_inpainter import remove_watermark_image
from backend.utils import video_to_frames, frames_to_video

def remove_watermark_video(video_path, mask_path, output_path, fps=25):
    frames = video_to_frames(video_path)
    mask = Image.open(mask_path).convert("L")
    result_frames = []

    for frame in frames:
        frame_pil = Image.fromarray(frame)
        result_frame = remove_watermark_image(frame_pil, mask)
        result_frames.append(np.array(result_frame))

    frames_to_video(result_frames, output_path, fps=fps)
    return output_path
