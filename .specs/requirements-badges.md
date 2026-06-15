# 요구사항: 배지 관리

## 개요
배지 목록 확인 및 획득 현황 조회. 배지 시스템은 v1.2.0에서 런칭 예정이며
백엔드에 `Badge`, `UserBadge` 엔티티와 `BadgeConditionType` enum이 이미 구현되어 있다.

## 현재 백엔드 상태
- `Badge` 엔티티: id, name, description, conditionType, createdAt
- `UserBadge` 엔티티: id, userId, badgeId, acquiredAt, isNotified
- `BadgeConditionType` enum: FIRST_RETRO, STREAK_3_DAYS, TOTAL_30, DEEP_QUESTION_1/5/10, WEEKLY_3_FIRST, WEEKLY_3_THREE_WEEKS
- 기존 API: `GET /api/v1/badges` (유저용, 인증 필요) → **어드민용 API 별도 추가 필요**

## 사용자 목표
- 전체 배지 목록과 각 배지 달성 조건 확인
- 배지별 획득 유저 수 파악 (어떤 배지가 잘 획득되는지)
- 운영 이슈 발생 시 특정 유저에게 배지 수동 부여

## 기능 요구사항

### 배지 목록 (`/badges`)
- 전체 배지 목록 테이블
  - 배지명, 설명, 조건 타입(한글 표시), 획득 유저 수, 등록일
- 조건 타입 한글 매핑:
  | conditionType | 한글 |
  |---|---|
  | FIRST_RETRO | 첫 회고 작성 |
  | STREAK_3_DAYS | 3일 연속 접속 |
  | TOTAL_30 | 누적 회고 30회 |
  | DEEP_QUESTION_1 | 심화 질문 1회 |
  | DEEP_QUESTION_5 | 심화 질문 5회 |
  | DEEP_QUESTION_10 | 심화 질문 10회 |
  | WEEKLY_3_FIRST | 주 3회 첫 달성 |
  | WEEKLY_3_THREE_WEEKS | 주 3회 3주 연속 |

### 배지별 획득자 조회 (드로어/모달)
- 배지 행 클릭 시 → 해당 배지 획득한 유저 목록 표시
  - 유저 이메일, 닉네임, 획득일

### 배지 수동 부여 (SUPER_ADMIN만)
- "배지 부여" 버튼 → 유저 ID 또는 이메일 입력 + 배지 선택 → 부여 확인
- 이미 보유한 배지는 중복 부여 불가

## 비기능 요구사항
- 목록: 페이지네이션 없이 전체 표시 (배지는 최대 10~20개)
- 권한: ADMIN 이상 조회, SUPER_ADMIN만 수동 부여

## 필요한 백엔드 작업
- `GET /api/v1/admin/badges` — 배지 목록 + 획득 유저 수
- `GET /api/v1/admin/badges/:badgeId/users` — 배지 획득자 목록
- `POST /api/v1/admin/badges/:badgeId/users/:userId` — 배지 수동 부여 (SUPER_ADMIN)
