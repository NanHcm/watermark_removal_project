// ✅ 全局缓存上传文件
window.lastUploadedFile = null;

// ✅ 上传并检测水印框
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
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';

        const img = new Image();
        img.src = data.image_url || URL.createObjectURL(file);
        img.id = "previewImage";
        img.style.display = 'block';

        img.onload = () => {
            wrapper.appendChild(img);
            previewContainer.appendChild(wrapper);

            // 添加检测到的框
            if (data.success && data.boxes) {
                data.boxes.forEach((box, index) => {
                    const [x1, y1, x2, y2] = box;
                    const boxDiv = createDraggableBox(x1, y1, x2 - x1, y2 - y1);
                    wrapper.appendChild(boxDiv);
                    makeDraggable(boxDiv);
                });
            }
        };

        if (!data.success) {
            alert(data.message || "未检测到水印，可手动添加");
        }
    })
    .catch(err => {
        console.error("检测失败：", err);
        alert("检测失败，请检查控制台");
    });
};

// ✅ 添加手动框
window.addManualBox = function () {
    const wrapper = document.querySelector('#previewContainer > div');
    if (!wrapper) {
        alert("请先上传图片");
        return;
    }

    const box = createDraggableBox(50, 50, 100, 50);
    wrapper.appendChild(box);
    makeDraggable(box);
};

// ✅ 去除水印（发送框信息 + 文件）
window.removeWatermark = function () {
    const file = window.lastUploadedFile;
    if (!file) {
        alert("请先上传文件并完成检测！");
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    // 提取所有框位置
    const boxes = [];
    document.querySelectorAll('.draggable-box').forEach(div => {
        const rect = div.getBoundingClientRect();
        const imgRect = document.getElementById('previewImage').getBoundingClientRect();

        const x1 = rect.left - imgRect.left;
        const y1 = rect.top - imgRect.top;
        const x2 = x1 + rect.width;
        const y2 = y1 + rect.height;
        boxes.push([x1, y1, x2, y2]);
    });

    formData.append('boxes', JSON.stringify(boxes));

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
        alert('处理出错，请检查控制台日志');
    });
};

// ✅ 创建一个可拖动红框
function createDraggableBox(x, y, w, h) {
    const boxDiv = document.createElement('div');
    boxDiv.className = 'draggable-box';
    boxDiv.style.left = x + 'px';
    boxDiv.style.top = y + 'px';
    boxDiv.style.width = w + 'px';
    boxDiv.style.height = h + 'px';

    const closeBtn = document.createElement('div');
    closeBtn.innerHTML = '×';
    closeBtn.className = 'delete-btn';
    closeBtn.onclick = () => boxDiv.remove();

    boxDiv.appendChild(closeBtn);
    return boxDiv;
}

// ✅ 拖动实现逻辑
function makeDraggable(element) {
    let isDragging = false;
    let offsetX = 0, offsetY = 0;

    element.onmousedown = (e) => {
        if (e.target.classList.contains('delete-btn')) return;
        isDragging = true;
        offsetX = e.offsetX;
        offsetY = e.offsetY;
        document.body.style.userSelect = 'none';
    };

    document.onmousemove = (e) => {
        if (!isDragging) return;
        const rect = element.parentElement.getBoundingClientRect();
        element.style.left = (e.clientX - rect.left - offsetX) + 'px';
        element.style.top = (e.clientY - rect.top - offsetY) + 'px';
    };

    document.onmouseup = () => {
        isDragging = false;
        document.body.style.userSelect = '';
    };
}
