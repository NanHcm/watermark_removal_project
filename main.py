from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from api.routes import router
import uvicorn

app = FastAPI(title="Watermark Removal System", version="1.0.0")

app.include_router(router)

# 静态文件路由
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
