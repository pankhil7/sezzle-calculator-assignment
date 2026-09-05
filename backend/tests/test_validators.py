import pytest
import math
from util.validators import validate_numbers, validate_result, round_result


def test_validate_numbers_passes_for_valid_inputs():
    validate_numbers(1.0, 2.0)  # should not raise


def test_validate_numbers_raises_for_nan():
    with pytest.raises(ValueError, match="Invalid number"):
        validate_numbers(float('nan'))


def test_validate_numbers_raises_for_inf():
    with pytest.raises(ValueError, match="Invalid number"):
        validate_numbers(float('inf'))


def test_validate_numbers_raises_for_negative_inf():
    with pytest.raises(ValueError, match="Invalid number"):
        validate_numbers(float('-inf'))


def test_validate_result_passes_for_valid():
    validate_result(42.0)  # should not raise


def test_validate_result_raises_for_nan():
    with pytest.raises(ValueError, match="out of computable range"):
        validate_result(float('nan'))


def test_validate_result_raises_for_inf():
    with pytest.raises(ValueError, match="out of computable range"):
        validate_result(float('inf'))


def test_round_result_default_precision():
    assert round_result(0.1 + 0.2) == 0.3


def test_round_result_custom_precision():
    assert round_result(1.23456789, 4) == 1.2346
