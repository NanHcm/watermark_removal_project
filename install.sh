#!/bin/bash
echo "🚀 Setting up Watermark Removal Project..."

sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y python3 python3-venv python3-pip git ffmpeg libgl1

echo "🐍 Creating virtual environment..."
python3 -m venv ~/watermark_env
source ~/watermark_env/bin/activate

echo "📂 Cloning Project (replace with your repo)..."
git clone https://github.com/NanHcm/watermark_removal_project.git ~/watermark_removal_project
cd ~/watermark_removal_project

echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

echo "📥 Downloading models..."
mkdir -p models && cd models
wget -q --show-progress -O lama_big.pth https://huggingface.co/akhaliq/Lama/resolve/main/big-lama.pt
wget -q --show-progress -O sttn.pth [Replace_STTN_Direct_URL]
wget -q --show-progress -O watermark_yolov8.pt https://huggingface.co/mnemic/watermarks_yolov8/resolve/main/best.pt
wget -q --show-progress -O RealESRGAN_x2plus.pth https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.0/RealESRGAN_x2plus.pth
cd ..

echo "📁 Creating static directories..."
mkdir -p static/uploads/images static/uploads/videos static/results/images static/results/videos

echo "✅ Installation complete! Starting server..."
uvicorn main:app --host 0.0.0.0 --port 8000
