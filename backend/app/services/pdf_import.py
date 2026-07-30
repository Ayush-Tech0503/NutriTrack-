from __future__ import annotations

import re
import zlib
from pathlib import Path


KNOWN_CATEGORY_SUFFIXES = (
    "Milk/Creamers",
    "Yogurt/Sour Cream",
    "Egg/Egg Subsititute",
    "Cheese/Butter",
    "Nuts/Seeds",
    "Beans/Legumes",
    "Meat/Poultry/Seafood",
    "Vegetables",
    "Fruits",
    "Misc.",
)


def _decode_pdf_string(data: bytes | str) -> str:
    if isinstance(data, str):
        data = data.encode("latin1", "ignore")
    out: list[str] = []
    i = 0
    while i < len(data):
        b = data[i]
        if b == 92 and i + 1 < len(data):
            n = data[i + 1]
            if n in (92, 40, 41):
                out.append(chr(n))
                i += 2
                continue
            if n == 110:
                out.append("\n")
                i += 2
                continue
            if n == 114:
                out.append("\r")
                i += 2
                continue
            if n == 116:
                out.append("\t")
                i += 2
                continue
            m = re.match(rb"\\([0-7]{1,3})", data[i:])
            if m:
                out.append(chr(int(m.group(1), 8)))
                i += 1 + len(m.group(1))
                continue
        out.append(chr(b))
        i += 1
    return "".join(out)


def extract_pdf_lines(pdf_path: str | Path) -> list[str]:
    blob = Path(pdf_path).read_bytes()
    lines: list[str] = []
    for match in re.finditer(rb"stream\r?\n", blob):
        start = match.end()
        end = blob.find(b"endstream", start)
        if end == -1:
            continue
        data = blob[start:end].strip(b"\r\n")
        try:
            decompressed = zlib.decompress(data)
        except Exception:
            continue
        text = decompressed.decode("latin1", "ignore")
        if "BT" not in text:
            continue
        for token in re.finditer(r"\[(.*?)\]TJ|\((.*?)\)Tj|\((.*?)\)", text, re.S):
            if token.group(1) is not None:
                parts = re.findall(r"\((?:\\.|[^\\)])*\)", token.group(1))
                value = "".join(_decode_pdf_string(part[1:-1]) for part in parts)
            elif token.group(2) is not None:
                value = _decode_pdf_string(token.group(2))
            else:
                value = _decode_pdf_string(token.group(3))
            value = value.replace("\x00", "").strip()
            if value:
                lines.append(value)
    return lines


def _is_number(value: str) -> bool:
    return bool(re.fullmatch(r"-?\d+(?:\.\d+)?", value.strip()))


def parse_food_rows(pdf_path: str | Path) -> list[dict]:
    if not Path(pdf_path).exists():
        return []
    lines = extract_pdf_lines(pdf_path)
    foods: list[dict] = []
    current_category: str | None = None
    pending_name: str | None = None
    pending_portion: str | None = None
    pending_numbers: list[str] = []

    def flush() -> None:
        nonlocal pending_name, pending_portion, pending_numbers
        if pending_name and pending_portion:
            calories = float(pending_numbers[0]) if len(pending_numbers) > 0 and _is_number(pending_numbers[0]) else None
            protein = float(pending_numbers[1]) if len(pending_numbers) > 1 and _is_number(pending_numbers[1]) else None
            carbs = float(pending_numbers[2]) if len(pending_numbers) > 2 and _is_number(pending_numbers[2]) else None
            foods.append(
                {
                    "category": current_category or "Uncategorized",
                    "food_name": pending_name.strip(),
                    "portion_size": pending_portion.strip(),
                    "calories": calories,
                    "protein": protein,
                    "carbohydrates": carbs,
                }
            )
        pending_name = None
        pending_portion = None
        pending_numbers = []

    skip_tokens = {"Food", "Portion Size", "Calories", "Protein (grams)", "Protein", "Carbs", "Carbohydrates", "www.CalorieKing.com"}
    for raw in lines:
        value = raw.strip()
        if not value or value in skip_tokens:
            continue
        if value in KNOWN_CATEGORY_SUFFIXES:
            flush()
            current_category = value
            continue
        if value == "General guide to help you pick and track higher protein foods.  Values are based on ":
            continue
        if value == "averages.":
            continue
        if value.startswith("===== STREAM"):
            continue
        if _is_number(value):
            pending_numbers.append(value)
            continue
        if pending_name is None:
            pending_name = value
            continue
        if pending_portion is None:
            pending_portion = value
            continue
        if len(pending_numbers) >= 3:
            flush()
            pending_name = value
            continue
        # When the PDF splits a row awkwardly, keep stacking the text into the current food name.
        pending_name = f"{pending_name} {value}".strip()

    flush()
    # Keep only rows with a food name and portion; values may be null if the source PDF omitted them.
    return [food for food in foods if food["food_name"] and food["portion_size"]]

