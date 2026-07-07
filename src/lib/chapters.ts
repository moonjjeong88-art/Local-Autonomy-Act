export const CHAPTER_TITLES: Record<number, string> = {
  1: '제1장 총강',
  2: '제2장 주민',
  3: '제3장 조례와 규칙',
  4: '제4장 선거',
  5: '제5장 지방의회',
  6: '제6장 집행기관',
  7: '제7장 재무',
  8: '제8장 상호 간 관계',
  9: '제9장 국가와의 관계',
  10: '제10장 국제교류·협력',
  11: '제11장 행정특례',
  12: '제12장 특별지방자치단체',
}

export const CHAPTER_QUESTION_COUNTS: Record<number, number> = {
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

export function getChapterTitle(chapter: number): string {
  return CHAPTER_TITLES[chapter] ?? `제${chapter}장`
}

export function getLawRefUrl(lawRef: string): string {
  const article = lawRef.match(/제(\d+)조(?:의(\d+))?/)
  if (article) {
    const main = article[1]
    const sub = article[2]
    const query = sub ? `제${main}조의${sub}` : `제${main}조`
    return `https://www.law.go.kr/법령/지방자치법/${query}`
  }
  return 'https://www.law.go.kr/법령/지방자치법'
}
