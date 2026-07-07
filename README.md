# 지방자치법 문제풀이 앱

지방자치법(법률 제21447호) 기반 4지선다 객관식 100문항 퀴즈 웹앱입니다.

## 기능

- 전체 랜덤 풀기 (100문항)
- 장별 학습 (제1장~제12장)
- 오답노트 (localStorage)
- 정답 확인 및 해설·조문 근거 링크

## 로컬 실행

```bash
npm install
npm run dev
```

## 배포

`main` 브랜치에 push하면 GitHub Actions가 자동으로 GitHub Pages에 배포합니다.

- 사이트: https://moonjjeong88-art.github.io/Local-Autonomy-Act/

## 스크립트

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm run validate` | 문항 데이터 검증 |
| `npm run build:questions` | PDF 텍스트에서 문항 JSON 재생성 |
