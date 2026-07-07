"""Build questions.json from quiz PDF text with chapter mapping and answer balancing."""
from __future__ import annotations

import importlib.util
import json
import random
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INPUT = ROOT / "extracted_full.txt"
OUTPUT = ROOT / "data" / "questions.json"
OUTPUT_TXT = ROOT / "지방자치법_객관식_100문제_정리.txt"

CHAPTER_RANGES = [
    (1, 8, 1),
    (9, 18, 2),
    (19, 26, 3),
    (27, 27, 4),
    (28, 55, 5),
    (56, 70, 6),
    (71, 82, 7),
    (83, 89, 8),
    (90, 95, 9),
    (96, 96, 10),
    (97, 98, 11),
    (99, 100, 12),
]

CHAPTER_BY_QUESTION: list[int] = []
for start, end, chapter in CHAPTER_RANGES:
    CHAPTER_BY_QUESTION.extend([chapter] * (end - start + 1))

CHAPTER_TITLES = {
    1: "제1장 총강",
    2: "제2장 주민",
    3: "제3장 조례와 규칙",
    4: "제4장 선거",
    5: "제5장 지방의회",
    6: "제6장 집행기관",
    7: "제7장 재무",
    8: "제8장 지방자치단체 상호 간의 관계",
    9: "제9장 국가와 지방자치단체 간의 관계",
    10: "제10장 국제교류·협력",
    11: "제11장 행정특례",
    12: "제12장 특별지방자치단체",
}

EXPECTED_CHAPTER_COUNTS = {
    1: 8,
    2: 10,
    3: 8,
    4: 1,
    5: 28,
    6: 15,
    7: 12,
    8: 7,
    9: 6,
    10: 1,
    11: 2,
    12: 2,
}

LAW_REF_PATTERNS = [
    (r"제(\d+)조(?:의(\d+))?(?:제(\d+)항)?", lambda m: f"지방자치법 제{m.group(1)}조" + (f"의{m.group(2)}" if m.group(2) else "") + (f"제{m.group(3)}항" if m.group(3) else "")),
]


def load_parser():
    spec = importlib.util.spec_from_file_location("parse_pdf", ROOT / "scripts" / "parse-pdf.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def infer_law_ref(explanation: str, chapter: int) -> str:
    match = re.search(r"제(\d+)조(?:의(\d+))?", explanation)
    if match:
        ref = f"지방자치법 제{match.group(1)}조"
        if match.group(2):
            ref += f"의{match.group(2)}"
        return ref
    return f"지방자치법 {CHAPTER_TITLES[chapter]}"


def balance_answers(questions: list[dict], seed: int = 42) -> list[dict]:
    """Shuffle choices so answerIndex distribution is 25 each."""
    rng = random.Random(seed)
    target = [0, 1, 2, 3] * 25
    rng.shuffle(target)

    balanced = []
    for q, new_answer in zip(questions, target):
        choices = list(q["choices"])
        old_answer = q["answerIndex"]
        correct_text = choices[old_answer]
        wrong = [c for i, c in enumerate(choices) if i != old_answer]
        rng.shuffle(wrong)
        new_choices = wrong[:new_answer] + [correct_text] + wrong[new_answer:]
        balanced.append(
            {
                **q,
                "choices": new_choices,
                "answerIndex": new_answer,
            }
        )
    return balanced


def format_text(questions: list[dict]) -> str:
    lines = [
        "지방자치법 객관식 100문제 (정리본)",
        "2026년 시행 지방자치법(법률 제21447호) 기반",
        "=" * 60,
        "",
    ]
    current_chapter = None
    for q in questions:
        ch_title = CHAPTER_TITLES[q["chapter"]]
        if ch_title != current_chapter:
            current_chapter = ch_title
            lines.extend(["", f"[ {ch_title} ]", ""])
        lines.append(f"{q['number']}번. {q['question']}")
        lines.append("")
        for idx, choice in enumerate(q["choices"], start=1):
            lines.append(f"  {idx}. {choice}")
        lines.append("")
        lines.append(f"  ▶ 정답: {q['answerIndex'] + 1}번")
        lines.append(f"  ▶ 해설: {q['explanation']}")
        lines.append(f"  ▶ 근거: {q['lawRef']}")
        lines.append("")
        lines.append("-" * 60)
    return "\n".join(lines)


def main() -> None:
    parser = load_parser()
    text = INPUT.read_text(encoding="utf-8")
    raw = parser.parse_questions(text)

    questions = []
    for q in raw:
        num = q["number"]
        chapter = CHAPTER_BY_QUESTION[num - 1]
        questions.append(
            {
                "id": f"Q{num:03d}",
                "number": num,
                "chapter": chapter,
                "question": q["question"],
                "choices": q["choices"],
                "answerIndex": q["answerIndex"],
                "explanation": q["explanation"],
                "lawRef": infer_law_ref(q["explanation"], chapter),
            }
        )

    questions = balance_answers(questions)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(questions, ensure_ascii=False, indent=2), encoding="utf-8")
    OUTPUT_TXT.write_text(format_text(questions), encoding="utf-8")

    ch_counts: dict[int, int] = {}
    ans_counts = [0, 0, 0, 0]
    for q in questions:
        ch_counts[q["chapter"]] = ch_counts.get(q["chapter"], 0) + 1
        ans_counts[q["answerIndex"]] += 1

    print(f"Built {len(questions)} questions -> {OUTPUT}")
    print("Chapter counts:", dict(sorted(ch_counts.items())))
    print("Answer distribution:", {i + 1: c for i, c in enumerate(ans_counts)})


if __name__ == "__main__":
    main()
