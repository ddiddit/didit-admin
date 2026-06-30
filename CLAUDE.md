# didit 어드민

> Claude Code가 이 프로젝트에서 작업할 때 참고하는 가이드입니다.

## 프로젝트 개요

didit(AI 기반 회고 앱)의 운영 어드민 페이지.
백엔드 API(`https://api.didit.ai.kr`)와 연동하며, 내부 운영팀만 접근한다.

- **단계**: MVP 운영 중
- **개발자**: 1인 사이드 프로젝트
- **접근 대상**: 내부 운영팀 (SUPER_ADMIN / ADMIN)
- **디자인 컨셉**: 데스크톱 우선, 실용적 관리 UI

## 현재 구현된 화면

| 경로 | 기능 | 권한 |
|------|------|------|
| `/login` | 어드민 로그인 | 전체 |
| `/admin/register` | 어드민 계정 등록 (초대 토큰) | 전체 |
| `/notices` | 공지사항 CRUD + 발행/임시저장 | ADMIN 이상 |
| `/inquiries` | 문의 목록 + 답변 | ADMIN 이상 |
| `/inquiries/:id` | 문의 상세 + 답변 작성/수정/삭제 | ADMIN 이상 |
| `/notifications` | 푸시/이메일 알림 발송 | ADMIN 이상 |
| `/managers` | 매니저 초대/승인/거절/삭제 | SUPER_ADMIN |
| `/settings` | 앱 점검 모드, 최소 버전 관리 | SUPER_ADMIN |

## 비목표 (NOT to build)

- 사용자 대상 기능 (회고, 뱃지 획득 등 — 프론트엔드 도메인)
- 결제 / 정산
- 다국어
- 모바일 최적화 (데스크톱 전용)
- 실시간 채팅 지원

## 기술 스택

- **Vue 3** + **Vite** + **TypeScript** (strict 모드)
- **Vue Router 4** — 파일 기반 X, 수동 라우터 (`src/router/index.ts`)
- **Tailwind CSS** — 데스크톱 우선
- **axios** — HTTP 클라이언트 (`src/api/client.ts`, JWT 인터셉터 포함)
- **vue-sonner** — 토스트 알림
- **lucide-vue-next** — 아이콘

## 권한 구조

```
AdminRole: 'SUPER_ADMIN' | 'ADMIN'
AdminPosition: 'PLANNER' | 'DESIGNER' | 'DEVELOPER'
AdminStatus: 'PENDING' | 'ACTIVE' | 'REJECTED'
```

- 라우터 가드: `meta.requiresAuth`, `meta.requiresSuperAdmin`
- 토큰 유틸: `src/utils/token.ts` (`getAccessToken`, `isSuperAdmin`)

## 코딩 규칙

### 언어 / 스타일

- 주석은 한국어
- 변수·함수명은 영어 camelCase
- 컴포넌트명은 PascalCase
- 파일명은 PascalCase (컴포넌트) / camelCase (유틸, API)
- `any` 타입 금지

### Vue

- `<script setup lang="ts">` 만 사용
- 페이지 컴포넌트는 `src/views/{도메인}/{기능}Page.vue`
- 공통 컴포넌트는 `src/components/common/`
- 도메인별 컴포넌트는 `src/components/{도메인}/`

### API 통신

- 인증 필요 요청: `src/api/client.ts` (JWT 자동 첨부 + 401 → refresh → retry)
- 인증 불필요 요청: `src/api/publicClient.ts`
- API 파일 위치: `src/api/{도메인}.api.ts`
- 타입 정의: `src/types/{도메인}.ts`

## 작업 흐름 (SDD)

1. 새 기능 전 `.specs/requirements-{slug}.md` 작성 (`/discover` 커맨드)
2. 요구사항 → `.specs/{번호}-{slug}.md` 구현 스펙 변환 (`/plan` 커맨드)
3. 스펙 승인 후 구현
4. 구현 후 코드 리뷰 (`/review` 커맨드)

## 절대 금지 사항

- `.env` 파일 git 커밋
- `main` 브랜치에 직접 커밋 (반드시 `develop` 머지를 통해서만 갱신)
- 비목표 기능 임의 추가
- 영어 주석 / 영어 커밋 메시지

## 브랜치 흐름

- 작업: `feat/*` · `fix/*` 등 피처 브랜치에서 진행
- 통합: 피처 브랜치 → `develop` 머지
- 릴리스: `develop` → `main` 머지 (직접 커밋이 아닌 머지로만 갱신, 승인 시 진행)

## 디렉터리 구조

```
didit-admin/
├── CLAUDE.md
├── .specs/
├── .claude/commands/
├── index.html
├── vite.config.ts
└── src/
    ├── api/
    │   ├── client.ts         # 인증 포함 axios 인스턴스
    │   ├── publicClient.ts   # 인증 없는 axios 인스턴스
    │   ├── admin.api.ts
    │   ├── auth.api.ts
    │   ├── inquiries.api.ts
    │   ├── notices.api.ts
    │   └── settings.api.ts
    ├── components/
    │   ├── common/           # BaseButton, BaseSpinner, ConfirmDialog
    │   └── managers/         # InviteModal 등
    ├── layouts/
    │   └── DashboardLayout.vue
    ├── router/
    │   └── index.ts
    ├── types/
    │   ├── api.ts            # ApiResponse, ProblemDetail
    │   ├── admin.ts
    │   ├── auth.ts
    │   ├── inquiry.ts
    │   └── notice.ts
    ├── utils/
    │   └── token.ts
    └── views/
        ├── auth/
        ├── inquiries/
        ├── managers/
        ├── notices/
        ├── notifications/
        ├── register/
        └── settings/
```

## 환경 변수

```
VITE_API_BASE_URL=https://api.didit.ai.kr
```

## 자주 쓰는 명령어

```bash
npm run dev     # 개발 서버 (http://localhost:5173)
npm run build   # 프로덕션 빌드
```

## 커밋 컨벤션

- Conventional Commits + 한국어
- 예: `feat(users): 유저 목록 페이지 추가`
- 예: `fix(inquiries): 답변 삭제 후 목록 갱신 안 되는 버그 수정`
