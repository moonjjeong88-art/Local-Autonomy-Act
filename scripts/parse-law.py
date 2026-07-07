"""Extract 지방자치법 articles from law PDF into structured JSON."""
from __future__ import annotations

import json
import re
from pathlib import Path

import fitz

ROOT = Path(__file__).resolve().parent.parent
LAW_PDF = ROOT / "지방자치법(법률)(제21447호)(20260701).pdf"
OUTPUT = ROOT / "data" / "law-articles.json"

CHAPTER_TITLES = {
    1: "총강",
    2: "주민",
    3: "조례와 규칙",
    4: "선거",
    5: "지방의회",
    6: "집행기관",
    7: "재무",
    8: "지방자치단체 상호 간의 관계",
    9: "국가와 지방자치단체 간의 관계",
    10: "국제교류·협력",
    11: "행정특례",
    12: "특별지방자치단체",
}


def load_law_text() -> str:
    doc = fitz.open(LAW_PDF)
    return "\n".join(page.get_text() for page in doc)


def find_chapters(text: str) -> list[tuple[int, str, int]]:
    positions: list[tuple[int, str, int]] = []
    for match in re.finditer(r"(?:^|\n)\s*제(\d+)장\s*([^\n]+)", text):
        num = int(match.group(1))
        if num not in {c[0] for c in positions}:
            positions.append((num, match.group(2).strip(), match.start()))
    return sorted(positions, key=lambda x: x[2])


def get_chapter_at(pos: int, chapters: list[tuple[int, str, int]]) -> int:
    chapter = 1
    for num, _, start in chapters:
        if pos >= start:
            chapter = num
    return chapter


def parse_articles(text: str) -> list[dict]:
    chapters = find_chapters(text)
    articles: list[dict] = []
    pattern = re.compile(
        r"제(\d+)조(?:의(\d+))?\(([^)]+)\)\s*"
        r"((?:.(?!제\d+조(?:의\d+)?\())*)",
        re.S,
    )
    for match in pattern.finditer(text):
        main = match.group(1)
        sub = match.group(2)
        title = match.group(3).strip()
        body = re.sub(r"\s+", " ", match.group(4)).strip()
        article_id = f"제{main}조" + (f"의{sub}" if sub else "")
        chapter = get_chapter_at(match.start(), chapters)
        articles.append(
            {
                "id": article_id,
                "chapter": chapter,
                "chapterTitle": CHAPTER_TITLES.get(chapter, ""),
                "title": title,
                "body": body[:2000],
            }
        )
    return articles


def main() -> None:
    text = load_law_text()
    articles = parse_articles(text)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(articles, ensure_ascii=False, indent=2), encoding="utf-8")
    by_chapter: dict[int, int] = {}
    for a in articles:
        by_chapter[a["chapter"]] = by_chapter.get(a["chapter"], 0) + 1
    print(f"Extracted {len(articles)} articles -> {OUTPUT}")
    for ch in sorted(by_chapter):
        print(f"  제{ch}장: {by_chapter[ch]}조")


if __name__ == "__main__":
    main()
