from pydantic import BaseModel


class BinaryInput(BaseModel):
    a: float
    b: float


class UnaryInput(BaseModel):
    a: float
