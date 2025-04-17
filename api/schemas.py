from pydantic import BaseModel

class WatermarkRequest(BaseModel):
    filename: str
    coords: list = None
