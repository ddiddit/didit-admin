# 요구사항: 유저 관리

## 개요

didit 어드민에서 가입 유저를 조회·검색·필터링하고, 필요 시 강제 탈퇴 조치를 취할 수 있는 운영 화면을 제공한다. 마지막 로그인 시각은 기존 audit_logs(USER_LOGGED_IN)에서 도출하며, 누락된 감사 로그 항목도 함께 보완한다.

## 사용자 스토리

- As a 어드민, I want to 유저 목록을 보고 이메일/닉네임으로 검색할 수 있도록, So that CS 문의가 들어왔을 때 특정 유저를 빠르게 찾을 수 있다.
- As a SUPER_ADMIN, I want to 특정 유저를 강제 탈퇴시킬 수 있도록, So that 악성 사용자나 운영 문제가 생긴 계정을 즉시 처리할 수 있다.
- As a 어드민, I want to 유저의 최근 활동 타임라인을 볼 수 있도록, So that 유저 상황을 맥락 있게 파악할 수 있다.

## 기능 요구사항

### 유저 목록
- FR-1: 전체 유저 목록을 페이지네이션(20개씩)으로 조회한다. 기본 정렬은 가입일 내림차순.
- FR-2: 이메일 또는 닉네임 키워드로 검색한다 (부분 일치).
- FR-3: 직무(DEVELOPER/PLANNER/DESIGNER)로 필터링한다.
- FR-4: 계정 상태(활성/탈퇴)로 필터링한다.
- FR-5: 목록 컬럼: 이메일, 닉네임, 직무, 나이, 연차, 가입일, 마지막 로그인, 온보딩 완료 여부, 상태.
- FR-6: 마지막 로그인 시각은 `audit_logs` 테이블의 `USER_LOGGED_IN` 액션 중 해당 유저의 가장 최근 `created_at`으로 도출한다. 로그인 이력이 없으면 "-" 표시.

### 유저 상세
- FR-7: 유저 클릭 시 상세 페이지로 이동. 프로필 정보 전체(이메일, 닉네임, 직무, 나이, 연차, 소셜 로그인 제공자, 가입일, 온보딩 완료일, 마지막 로그인) 노출.
- FR-8: 최근 활동 타임라인: 해당 유저의 audit_logs 최근 20건을 시간순으로 나열. 노출 액션 종류: USER_LOGGED_IN, RETROSPECTIVE_STARTED, RETROSPECTIVE_SAVED, RETROSPECTIVE_DELETED, BADGE_ACQUIRED, USER_PROFILE_UPDATED, USER_WITHDREW.

### 강제 탈퇴
- FR-9: SUPER_ADMIN만 강제 탈퇴 버튼을 볼 수 있다.
- FR-10: 강제 탈퇴 클릭 시 확인 다이얼로그(사유 입력 없음, "강제 탈퇴하시겠습니까?" 텍스트)를 보여준 후 실행한다.
- FR-11: 강제 탈퇴는 기존 `User.withdraw()`를 재사용하지만 audit_log에 `USER_FORCE_WITHDREW` 액션으로 기록한다 (USER_WITHDREW와 구분).
- FR-12: 이미 탈퇴한 유저에게는 강제 탈퇴 버튼을 비활성화한다.

### 누락 감사 로그 보완 (함께 구현)
- FR-13: `AuditAction`에 `PROJECT_CREATED`, `PROJECT_UPDATED`, `PROJECT_DELETED`, `APP_CONFIG_UPDATED`, `USER_FORCE_WITHDREW`, `ADMIN_NOTIFICATION_SENT`, `USER_MARKETING_CONSENT_UPDATED` 추가.
- FR-14: `ProjectRegisterService.create()` → `PROJECT_CREATED` 로깅 추가.
- FR-15: `ProjectModifierService.updateName()` → `PROJECT_UPDATED` 로깅 추가.
- FR-16: `ProjectModifierService.deleteProject()` → `PROJECT_DELETED` 로깅 추가.
- FR-17: `AppConfigService.updateAppConfig()` → `APP_CONFIG_UPDATED` 로깅 추가.
- FR-18: `UserRegisterService.updateMarketingConsent()` → `USER_MARKETING_CONSENT_UPDATED` 로깅 추가.

## 비기능 요구사항

- NFR-1 (보안): 유저 목록·상세 조회는 ADMIN 이상. 강제 탈퇴는 SUPER_ADMIN만.
- NFR-2 (성능): 목록 조회는 마지막 로그인 서브쿼리 포함해도 1초 이내 응답. 인덱스 활용.
- NFR-3 (페이지네이션): 커서 기반이 아닌 오프셋 페이지네이션으로 구현 (운영 편의상 페이지 이동 필요).

## 비목표 (NOT to build)

- 계정 일시 정지 (이번 범위 아님, 추후 별도 기능)
- 유저 데이터 직접 수정 (닉네임, 직무 등 어드민이 유저 정보를 바꾸는 것)
- 유저별 회고 목록 상세 열람
- 유저 레벨/미션 현황 (미션 시스템 구현 후 별도 추가)
- 대량 일괄 처리 (다중 선택 탈퇴 등)

## 가정 (Assumptions)

- 마지막 로그인은 audit_logs에서 도출한다 (별도 컬럼 추가 없음).
- 강제 탈퇴 시 사유 입력 필드 없음 (운영 편의상).
- 유저 목록에서 탈퇴 유저는 기본적으로 포함하되, 상태 필터로 분리 가능.
- 어드민 백엔드 API는 `GET /api/v1/admin/users`, `GET /api/v1/admin/users/{userId}`, `POST /api/v1/admin/users/{userId}/force-withdraw` 3개.

## 미해결 질문 (Open Questions)

- 마지막 로그인 기준 정렬(최근 활동순)을 목록의 기본 정렬로 쓸지, 아니면 가입일순을 기본으로 할지?
- 유저 상세 타임라인에서 RETROSPECTIVE_SAVED의 payload에 회고 제목이 담겨있는데, 제목도 함께 노출할지?
