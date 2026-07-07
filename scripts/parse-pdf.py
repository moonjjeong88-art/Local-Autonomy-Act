"""Parse 지방자치법 quiz PDF extracted text into structured JSON."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INPUT = ROOT / "extracted_full.txt"
OUTPUT_JSON = ROOT / "data" / "questions.json"
OUTPUT_TXT = ROOT / "지방자치법_완벽독파_객관식_100문제_정리.txt"

CIRCLE_TO_INDEX = {"①": 0, "②": 1, "③": 2, "④": 3}
NOISE_PATTERNS = [
    re.compile(r"^② ③ ④$"),
    re.compile(r"^①$"),
    re.compile(r"^지방자치법 100제 마스터 가이드$"),
    re.compile(r"^\d{1,2}$"),
    re.compile(r"^제\d+장"),
]

WRAP_CONTINUATION = re.compile(
    r"(필|거|붙|하여|하|되|있|없|관|설|처|되|이|으|에서|에게|으로|이며|하고|하며)$"
)


def is_noise(line: str) -> bool:
    stripped = line.strip()
    if not stripped:
        return True
    return any(p.match(stripped) for p in NOISE_PATTERNS)


def join_vertical_only(lines: list[str]) -> list[str]:
    paragraphs: list[str] = []
    vertical_buf: list[str] = []

    def flush() -> None:
        nonlocal vertical_buf
        if vertical_buf:
            paragraphs.append("".join(vertical_buf))
            vertical_buf = []

    for raw in lines:
        line = raw.strip()
        if not line:
            continue
        if len(line) == 1:
            vertical_buf.append(line)
            continue
        flush()
        paragraphs.append(line)
    flush()
    return paragraphs


def merge_wrapped_lines(paragraphs: list[str]) -> list[str]:
    if not paragraphs:
        return paragraphs
    merged = [paragraphs[0]]
    for para in paragraphs[1:]:
        prev = merged[-1]
        continuation = (
            "야 ",
            "요한",
            "요 ",
            "일수",
            "어 ",
            "아 ",
            "은 ",
            "는 ",
            "을 ",
            "를 ",
            "이 ",
            "가 ",
        )
        if (
            len(prev) <= 15
            and len(para) <= 15
            and not any(para.startswith(prefix) for prefix in continuation)
        ):
            merged.append(para)
        elif (
            not re.search(r"[.!?다요임음)]$", prev.rstrip())
            and (
                WRAP_CONTINUATION.search(prev.rstrip())
                or any(para.startswith(prefix) for prefix in continuation)
            )
        ):
            merged[-1] = prev + para
        else:
            merged.append(para)
    return merged


def merge_orphan_fragments(paragraphs: list[str]) -> list[str]:
    if len(paragraphs) < 2:
        return paragraphs
    result: list[str] = []
    orphan_pattern = re.compile(r"^(다\.|수 있다\.|한다\.|야 한다\.|부쳐야 한다\.|정한다\.)$")
    for para in paragraphs:
        if result and orphan_pattern.match(para.strip()):
            result[-1] = result[-1] + para
        else:
            result.append(para)
    return result


def split_choices(paragraphs: list[str]) -> list[str]:
    paragraphs = merge_wrapped_lines(paragraphs)
    paragraphs = merge_orphan_fragments(paragraphs)
    if len(paragraphs) == 4:
        return paragraphs
    if len(paragraphs) > 4:
        first = "".join(paragraphs[: len(paragraphs) - 3])
        return [first, *paragraphs[-3:]]
    if len(paragraphs) == 3:
        raise ValueError(f"expected 4 choices, got 3: {paragraphs}")
    raise ValueError(f"expected 4 choices, got {len(paragraphs)}: {paragraphs}")


def clean_explanation(text: str) -> str:
    text = re.sub(r"\s*지방자치법 100제 마스터 가이드\s*\d+\s*", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def parse_questions(text: str) -> list[dict]:
    text = re.sub(r"지방자치법 완벽 독파[\s\S]*?제1장 총강\n", "", text, count=1)
    blocks = re.split(r"Q\s*(\d+)\.\s*", text)[1:]
    questions: list[dict] = []

    for i in range(0, len(blocks), 2):
        num = int(blocks[i])
        body = blocks[i + 1]

        answer_match = re.search(r"정답:\s*([①②③④])", body)
        if not answer_match:
            raise ValueError(f"Q{num}: missing answer")
        answer_index = CIRCLE_TO_INDEX[answer_match.group(1)]

        expl_match = re.search(r"해설:\s*(.+?)(?=\nQ\s*\d+\.|$)", body, re.S)
        if not expl_match:
            raise ValueError(f"Q{num}: missing explanation")
        explanation = clean_explanation(expl_match.group(1))

        before_answer = body[: answer_match.start()]
        lines = before_answer.splitlines()
        question_line = lines[0].strip()
        choice_lines = [ln for ln in lines[1:] if not is_noise(ln)]
        paragraphs = join_vertical_only(choice_lines)
        choices = split_choices(paragraphs)

        questions.append(
            {
                "id": f"Q{num:03d}",
                "number": num,
                "question": question_line,
                "choices": choices,
                "answerIndex": answer_index,
                "explanation": explanation,
            }
        )

    return questions


def format_text(questions: list[dict]) -> str:
    lines = [
        "지방자치법 완벽독파 객관식 100문제 (정리본)",
        "=" * 60,
        "",
    ]
    for q in questions:
        lines.append(f"{q['number']}번. {q['question']}")
        lines.append("")
        for idx, choice in enumerate(q["choices"], start=1):
            lines.append(f"  {idx}. {choice}")
        lines.append("")
        lines.append(f"  ▶ 정답: {q['answerIndex'] + 1}번")
        lines.append(f"  ▶ 해설: {q['explanation']}")
        lines.append("")
        lines.append("-" * 60)
    return "\n".join(lines)


def main() -> None:
    text = INPUT.read_text(encoding="utf-8")
    questions = parse_questions(text)
    if len(questions) != 100:
        raise SystemExit(f"Expected 100 questions, got {len(questions)}")

    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_JSON.write_text(
        json.dumps(questions, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    OUTPUT_TXT.write_text(format_text(questions), encoding="utf-8")
    print(f"Parsed {len(questions)} questions")


if __name__ == "__main__":
    main()
