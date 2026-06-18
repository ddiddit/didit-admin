# didit 서비스 / 도메인 이해

> didit 서비스가 **무엇이고, 사용자가 어떤 경험을 하며, 백엔드 도메인이 어떻게 구성되는지** 정리한 문서입니다.
> 앱(`didit-frontend`)·어드민(`didit-admin`)·백엔드(`didit-backend`)를 함께 분석해 작성했습니다.
> 디자인 토큰·컴포넌트는 [`design.md`](./design.md) 참고.

## 한 줄 요약

didit은 **AI 기반 회고(retrospective) 앱**입니다. 사용자가 하루/프로젝트를 돌아보면, AI가 질문을 던지고 답변을 심화시키며, 회고를 요약·정리해 줍니다. 꾸준함은 **스트릭·뱃지**로 보상합니다.

- **단계**: 웹 MVP (앱은 추후 Capacitor로 iOS/AOS 패키징 예정)
- **개발**: 1인 사이드 프로젝트
- **언어**: 한국어 전용
- **타깃**: 기획·개발·디자인 직군 (회고를 습관화하려는 사람)

## 시스템 구성

```
사용자 ──▶ 앱 (didit-frontend, Nuxt, 모바일 우선)
                 │
운영팀 ──▶ 어드민 (didit-admin, Vue, 데스크톱)
                 │
                 ▼
         백엔드 API  https://api.didit.ai.kr
         (didit-backend, Kotlin + Spring, 헥사고날 아키텍처)
                 │
         MySQL · Flyway 마이그레이션 · LLM 연동
```

- 백엔드 패키지: `adapter`(webapi/persistence/security/integration) · `application`(유즈케이스) · `domain`(엔티티/규칙) 3계층.
- 인증: 소셜 로그인(카카오·구글·애플) → JWT(access/refresh), 401 → refresh → retry 인터셉터.

---

## 1. 핵심: 회고 플로우 (Retrospect)

서비스의 심장. 백엔드 `domain/retrospect`, 앱 `pages/retrospects`.

### 상태 (`RetroStatus`)
`PENDING` (생성됨) → `IN_PROGRESS` (진행 중) → `COMPLETED` (완료, 제목 확정)
- soft delete: `deletedAt`로 처리(물리 삭제 X).

### 대화 구조 (`ChatMessage`)
회고는 AI↔사용자 **채팅** 형태로 진행됩니다.
- `sender`: `USER` | `AI`
- `inputType`: `TEXT` | `STT`(음성→텍스트)
- 답변 건너뛰기(`isSkipped`) 가능

### 질문 흐름 (`QuestionType`)
```
Q1 → Q2 → Q3   (기본 3문항)
        └─▶ Q4_DEEP   (Q1~Q3을 모두 답하면 AI가 1회 심화질문 추가)
```
- `canAddDeepQuestion()`: Q1·Q2·Q3 모두 답변 완료 + 아직 심화질문 없음 → 심화질문 생성 가능.
- 즉 **기본 3문항 + AI 심화질문 1개**가 한 회고의 골격.

### 완료 & 산출물
- `complete(title)`: 제목 확정(공백 불가, **25자 이내**) + `status=COMPLETED` + `completedAt` 기록.
- `RetrospectiveSummary`: AI가 생성한 회고 요약(임베디드 값).
- `inputTokens`/`outputTokens`: LLM 토큰 사용량 누적(비용/사용량 추적).
- `projectId`: 회고를 프로젝트에 연결/해제 가능.

### 부가 기능
- 검색 기록 `SearchHistory`, 회고 목록/캘린더/검색, 회고 상세(앱 화면).

---

## 2. 보상: 스트릭 & 뱃지 (Achievement)

백엔드 `domain/achievement`, 앱 `pages/badges`. 꾸준한 회고를 유도하는 게이미피케이션.

### 스트릭 (`Streak`)
- 사용자별 `currentStreak` / `longestStreak` / `lastRetroDate`.
- 규칙: 같은 날 중복 회고는 무시 → 어제+1일이면 연속(증가) → 아니면 리셋.

### 뱃지 (`Badge` + `BadgeConditionType`)
회고 완료 등 이벤트(`RetrospectiveCompletedEvent`) 발생 시 조건을 평가해 `UserBadge` 부여.

| 조건 타입 | 의미 |
|-----------|------|
| `FIRST_RETRO` | 첫 회고 |
| `STREAK_3_DAYS` | 3일 연속 회고 |
| `TOTAL_30` | 누적 30회 회고 |
| `DEEP_QUESTION_1` / `_5` / `_10` | 심화질문 답변 1·5·10회 |
| `WEEKLY_3_FIRST` | 주 3회 회고 첫 달성 |
| `WEEKLY_3_THREE_WEEKS` | 주 3회를 3주간 |

> 앱에서는 뱃지 획득 시 `UiBadgeAcquiredPopup`으로 연출.

---

## 3. 전체 도메인 맵 (Backend)

`src/main/kotlin/com/didit/domain/*`

| 도메인 | 책임 | 관련 화면 |
|--------|------|-----------|
| `retrospect` | 회고 대화·질문·요약·토큰·프로젝트 연결 | 앱 회고 플로우 |
| `achievement` | 스트릭, 뱃지, 유저 뱃지 | 앱 뱃지 / 어드민 배지 관리 |
| `prompt` | AI 프롬프트 관리(질문·요약 생성) | 어드민 프롬프트 관리(SUPER_ADMIN) |
| `auth` | 소셜 로그인, JWT, 토큰 갱신 | 앱·어드민 로그인 |
| `organization` | 사용자/조직 정보 (직군·나이대·연차 등 프로필) | 앱 마이페이지 / 어드민 유저 관리 |
| `notification` | 푸시·이메일 알림, 발송 이력 | 어드민 알림 발송 |
| `notice` | 공지사항 (발행/임시저장) | 어드민 공지 / 앱 공지 확인 |
| `inquiry` | 1:1 문의 + 답변 | 앱 문의 / 어드민 문의 답변 |
| `app` | 앱 점검 모드·최소 지원 버전(강제 업데이트) | 어드민 앱 설정(SUPER_ADMIN) |
| `admin` | 어드민 계정·권한·초대 | 어드민 관리자 관리 |
| `audit` (application) | 감사 로그(운영 액션 기록) | 어드민 감사 로그 |
| `shared` | `BaseEntity` 등 공통 |

리소스: `resources/prompts`(LLM 프롬프트), `resources/db/migration`(Flyway), `resources/templates`(이메일).

---

## 4. 사용자(앱) 여정 요약

1. **소셜 로그인** (카카오/구글/애플) → 온보딩(직군·나이대·연차 프로필 입력)
2. **홈** — 오늘 회고 횟수, 최근 회고 목록
3. **회고 진행** — AI 질문(Q1~Q3) → 답변(텍스트/음성) → AI 심화질문(Q4) → 요약·제목 → 완료
4. **회고 관리** — 목록 / 캘린더 / 검색 / 상세, 프로젝트·태그로 분류
5. **뱃지 & 스트릭** — 꾸준함 보상, 획득 팝업
6. **알림 / 마이페이지** — 알림 히스토리·설정, 프로필, 문의, 탈퇴

## 5. 운영(어드민) 책임 요약

| 영역 | 권한 | 하는 일 |
|------|------|---------|
| 공지/문의/알림 | ADMIN+ | 공지 발행, 문의 답변, 푸시·이메일 발송 |
| 유저/배지/탈퇴통계 | ADMIN+ | 유저 조회, 배지 관리, 탈퇴 통계 분석 |
| 감사 로그 | ADMIN+ | 운영 액션 추적 |
| 프롬프트/관리자/앱 설정 | SUPER_ADMIN | AI 프롬프트 튜닝, 어드민 초대·승인, 점검 모드·강제 업데이트 |

---

## 핵심 도메인 용어 (Glossary)

- **회고(Retrospective)**: AI와의 대화로 진행하는 한 건의 돌아보기. 기본 3문항 + 심화질문.
- **심화질문(Deep Question, Q4_DEEP)**: 기본 답변을 바탕으로 AI가 더 파고드는 1회 추가 질문. didit의 차별점.
- **스트릭(Streak)**: 연속 회고 일수.
- **요약(Summary)**: 회고 완료 시 AI가 만드는 정리본.
- **프롬프트(Prompt)**: AI 질문·요약 생성에 쓰이는 템플릿. 어드민에서 운영팀이 튜닝.

> 도메인 규칙의 원본은 `didit-backend/src/main/kotlin/com/didit/domain/*` 엔티티입니다.
