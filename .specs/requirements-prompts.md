# 요구사항: 프롬프트 관리

## 개요
회고 챗봇의 AI 프롬프트를 어드민에서 조회하고 수정할 수 있는 관리 화면.
배포 없이 프롬프트를 즉시 수정하여 회고 품질을 빠르게 개선할 수 있다.

## 현재 백엔드 상태 (문제점)
- 프롬프트가 `src/main/resources/prompts/*.txt` 파일로 하드코딩
- 파일 목록:
  - `deep-question-developer.txt` / `deep-question-planner.txt` / `deep-question-designer.txt`
  - `summary-developer.txt` / `summary-planner.txt` / `summary-designer.txt`
- `FeedbackPrompts` 오브젝트가 `ClassPathResource`로 파일을 읽음
- → **어드민에서 편집하려면 백엔드를 DB 기반으로 전환해야 함**

## 사용자 목표
- AI 프롬프트 내용을 배포 없이 즉시 수정
- 직무별(개발/기획/디자인), 타입별(심화질문/요약) 프롬프트 버전 관리
- 변경 이력 확인

## 기능 요구사항

### 프롬프트 목록 (`/prompts`)
- 6개 프롬프트 카드 표시
  - 직무 (DEVELOPER / PLANNER / DESIGNER)
  - 타입 (심화질문 / 요약)
  - 마지막 수정일, 수정자
- 카드 클릭 → 편집 화면

### 프롬프트 편집
- 코드 에디터 스타일 텍스트 영역 (고정폭 폰트)
- `{{q1}}`, `{{q2}}` 등 변수 하이라이트 (선택)
- 저장 시 이전 버전 자동 백업
- SUPER_ADMIN만 저장 가능

### 변경 이력 (선택)
- 최근 변경 이력 10건: 수정자, 수정 시각, 변경 요약

## 필요한 백엔드 작업 (대규모)
1. `prompts` 테이블 신규 생성
   - id, jobType, promptType(DEEP_QUESTION/SUMMARY), content, version, updatedBy, updatedAt
2. 기존 `.txt` 파일 내용 → DB 마이그레이션 (Flyway)
3. `FeedbackPrompts` → DB 조회 방식으로 리팩토링
4. 어드민 API:
   - `GET /api/v1/admin/prompts` — 목록
   - `GET /api/v1/admin/prompts/:id` — 상세
   - `PUT /api/v1/admin/prompts/:id` — 수정 (SUPER_ADMIN)

## 구현 순서 권고
백엔드 DB 전환 선행 → 어드민 화면 구현
(백엔드 작업 없이는 어드민 화면 구현 불가)
