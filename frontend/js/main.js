// ✅ 全局缓存上传文件
window.lastUploadedFile = null;

// ✅ 上传文件并自动检测水印位置、绘制红框
window.uploadFile = function () {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) {
        alert("请先选择文件");
        return;
    }

    window.lastUploadedFile = file;

    const previewContainer = document.getElementById('previewContainer');
    previewContainer.innerHTML = '';

    const formData = new FormData();
    formData.append('file', file);

    fetch('/api/detect_watermark_image', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            alert(data.message || "未检测到水印");
            return;
        }

        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';

        const img = new Image();
        img.src = data.image_url;
        img.id = "previewImage";
        img.style.display = 'block';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            canvas.style.position = 'absolute';
            canvas.style.left = '0';
            canvas.style.top = '0';
            canvas.style.pointerEvents = 'none'; // ✅ 不阻挡点击

            const ctx = canvas.getContext('2d');
            ctx.lineWidth = 3;
            ctx.strokeStyle = 'red';

            data.boxes.forEach(box => {
                const [x1, y1, x2, y2] = box;
                ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
            });

            wrapper.appendChild(img);
            wrapper.appendChild(canvas);
            previewContainer.appendChild(wrapper);
        };
    })
    .catch(err => {
        console.error("检测失败：", err);
        alert("检测失败，请检查控制台");
    });
};

// ✅ 调用后端进行水印去除处理
window.removeWatermark = function () {
    const file = window.lastUploadedFile;

    if (!file) {
        alert("请先上传文件并完成检测！");
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    let apiUrl = '';
    if (file.type.startsWith('image/')) {
        apiUrl = '/api/remove_watermark_image';
    } else if (file.type.startsWith('video/')) {
        apiUrl = '/api/remove_watermark_video';
    } else {
        alert("不支持的文件类型！");
        return;
    }

    fetch(apiUrl, {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.result_url) {
            alert('处理完成，点击打开结果');
            window.open(data.result_url, '_blank');
        } else if (data.error) {
            alert('处理失败：' + data.error);
        } else {
            alert('处理失败：未知错误');
        }
    })
    .catch(err => {
        console.error(err);
        alert('上传或处理出错，请检查控制台日志');
    });
};
