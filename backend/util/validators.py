import math


def validate_numbers(*args: float) -> None:
    for val in args:
        if not isinstance(val, (int, float)) or math.isnan(val) or math.isinf(val):
            raise ValueError(f"Invalid number: {val}")


def validate_result(result: float) -> None:
    if math.isnan(result) or math.isinf(result):
        raise ValueError("Result is out of computable range")


def round_result(result: float, precision: int = 10) -> float:
    return round(result, precision)
