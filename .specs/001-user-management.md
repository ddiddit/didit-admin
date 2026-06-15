# 스펙: 유저 관리

> 기반 요구사항: requirements-user-management.md

## 목표

어드민에서 유저 목록 조회·검색·필터링, 유저 상세(활동 타임라인 포함), 강제 탈퇴를 할 수 있는 화면과 API를 구현하고, 누락된 감사 로그 5종을 함께 보완한다.

## 인수 기준

- AC-1: 유저 목록이 마지막 로그인 내림차순으로 20개씩 페이지네이션되어 표시된다.
- AC-2: 이메일 또는 닉네임 키워드로 검색하면 부분 일치 결과만 표시된다.
- AC-3: 직무(DEVELOPER/PLANNER/DESIGNER) 또는 상태(활성/탈퇴) 필터를 적용하면 해당 조건의 유저만 표시된다.
- AC-4: 목록 각 행에 이메일, 닉네임, 직무, 나이, 연차, 가입일, 마지막 로그인, 온보딩 완료 여부, 상태가 표시된다.
- AC-5: 마지막 로그인이 없는 유저는 "-"로 표시된다.
- AC-6: 유저 행 클릭 시 상세 페이지로 이동하고 프로필 전체 정보가 표시된다.
- AC-7: 상세 페이지에 최근 활동 타임라인 20건이 시간순으로 표시된다. RETROSPECTIVE_SAVED는 회고 제목도 함께 표시된다.
- AC-8: SUPER_ADMIN만 강제 탈퇴 버튼이 보인다.
- AC-9: 강제 탈퇴 확인 다이얼로그 → 확인 클릭 시 탈퇴 처리되고, audit_logs에 USER_FORCE_WITHDREW로 기록된다.
- AC-10: 이미 탈퇴한 유저는 강제 탈퇴 버튼이 비활성화된다.
- AC-11: PROJECT_CREATED/UPDATED/DELETED, APP_CONFIG_UPDATED, USER_MARKETING_CONSENT_UPDATED가 audit_logs에 쌓인다.

## 기술 결정

- **목록 쿼리**: `UserRepository`에 `@Query` + `Pageable` 추가. 마지막 로그인은 `audit_logs` 서브쿼리로 도출.
- **감사 로그 조회**: `AuditLogRepository`에 `findTopByActorIdAndActionOrderByCreatedAtDesc`, `findTop20ByActorIdAndActionInOrderByCreatedAtDesc` 쿼리 추가.
- **강제 탈퇴**: 기존 `User.withdraw()` 재사용. 호출자를 `AuthService`가 아닌 새 `AdminUserManagementService`에서 수행하고 `USER_FORCE_WITHDREW`로 기록.
- **권한**: `@RequireAdmin` / `@RequireSuperAdmin` 기존 어노테이션 재사용.
- **프론트엔드 라우트**: `/users` (목록), `/users/:id` (상세).

## 태스크 분해

### [백엔드]

#### T1: AuditAction 확장 (예상: 15분)
- `AuditAction.kt`에 추가:
  `PROJECT_CREATED`, `PROJECT_UPDATED`, `PROJECT_DELETED`,
  `APP_CONFIG_UPDATED`, `USER_FORCE_WITHDREW`, `ADMIN_NOTIFICATION_SENT`, `USER_MARKETING_CONSENT_UPDATED`
- 검증: enum 컴파일 확인
- 의존: 없음

#### T2: 누락 감사 로그 보완 (예상: 30분)
- `ProjectRegisterService.create()` → `auditLogger.log(PROJECT_CREATED, targetId=project.id, targetType="PROJECT")`
- `ProjectModifierService.updateName()` → `auditLogger.log(PROJECT_UPDATED, targetId=projectId, targetType="PROJECT")`
- `ProjectModifierService.deleteProject()` → `auditLogger.log(PROJECT_DELETED, targetId=projectId, targetType="PROJECT")`
- `AppConfigService.updateAppConfig()` → `auditLogger.log(APP_CONFIG_UPDATED, actorType=ADMIN, payload=config 내용)`
- `UserRegisterService.updateMarketingConsent()` → `auditLogger.log(USER_MARKETING_CONSENT_UPDATED, payload=mapOf("agreed" to agreed))`
- 검증: 각 서비스 호출 후 audit_logs 레코드 생성 확인
- 의존: T1

#### T3: AuditLogRepository 쿼리 추가 (예상: 20분)
- `findTopByActorIdAndActionOrderByCreatedAtDesc(actorId: UUID, action: AuditAction): AuditLog?`
  → 마지막 로그인 단건 조회용
- `findTop20ByActorIdAndActionInOrderByCreatedAtDesc(actorId: UUID, actions: List<AuditAction>): List<AuditLog>`
  → 유저 상세 타임라인용
- `findLastLoginByUserIds(userIds: List<UUID>): List<LastLoginProjection>`
  → 목록 조회 시 N+1 방지용 @Query (actorId IN :ids AND action = 'USER_LOGGED_IN' GROUP BY actorId, MAX createdAt)
- 검증: JPA 쿼리 컴파일 + 실행 확인
- 의존: 없음

#### T4: UserRepository 목록 조회 쿼리 추가 (예상: 30분)
- `findUsersForAdmin(keyword, job, isDeleted, pageable): Page<User>`
  ```kotlin
  @Query("""
    SELECT u FROM User u
    WHERE (:keyword IS NULL OR u.email LIKE %:keyword% OR u.nickname LIKE %:keyword%)
    AND (:job IS NULL OR u.job = :job)
    AND (:isDeleted IS NULL OR (:isDeleted = true AND u.deletedAt IS NOT NULL) OR (:isDeleted = false AND u.deletedAt IS NULL))
    ORDER BY (SELECT MAX(a.createdAt) FROM AuditLog a WHERE a.actorId = u.id AND a.action = 'USER_LOGGED_IN') DESC NULLS LAST
  """)
  ```
- 검증: 검색/필터/정렬 조합 쿼리 실행 확인
- 의존: 없음

#### T5: AdminUserFinder 포트 + AdminUserQueryService (예상: 40분)
- `application/admin/provided/AdminUserFinder.kt`:
  ```kotlin
  interface AdminUserFinder {
      fun findUsers(keyword: String?, job: Job?, isDeleted: Boolean?, page: Int): UserListResult
      fun findUserDetail(userId: UUID): UserDetailResult
  }
  ```
- `UserListResult`: Page 메타 + List<UserSummary(유저 + 마지막 로그인)>
- `UserDetailResult`: User + 마지막 로그인 + 타임라인 20건
- `AdminUserQueryService`: UserRepository + AuditLogRepository 조합으로 구현
- 검증: 각 메서드 정상 결과 반환 확인
- 의존: T3, T4

#### T6: AdminUserManager 포트 + AdminUserManagementService (예상: 30분)
- `application/admin/provided/AdminUserManager.kt`:
  ```kotlin
  interface AdminUserManager {
      fun forceWithdraw(adminId: UUID, userId: UUID)
  }
  ```
- `AdminUserManagementService`:
  - `userFinder.findByIdOrThrow(userId)`
  - `user.withdraw()`
  - `userRepository.save(user)`
  - `deviceTokenRepository.deleteByUserId(userId)`
  - `refreshTokenRepository.deleteByUserId(userId)`
  - `auditLogger.log(USER_FORCE_WITHDREW, actorId=adminId, actorType=ADMIN, targetId=userId, targetType="USER")`
- 검증: 강제 탈퇴 후 user.deletedAt 설정, audit_log USER_FORCE_WITHDREW 생성 확인
- 의존: T1, T5

#### T7: UserManagementApi 컨트롤러 + DTO (예상: 40분)
- `adapter/webapi/admin/UserManagementApi.kt`:
  ```
  GET  /api/v1/admin/users          @RequireAdmin   → 목록
  GET  /api/v1/admin/users/{userId} @RequireAdmin   → 상세
  POST /api/v1/admin/users/{userId}/force-withdraw  @RequireSuperAdmin → 강제 탈퇴
  ```
- DTO:
  - `UserListResponse(id, email, nickname, job, age, experience, provider, createdAt, lastLoginAt, onboardingCompleted, deleted)`
  - `UserDetailResponse(프로필 전체 + timeline: List<ActivityLog(action, payload, createdAt)>)`
  - `UserPageResponse(content, page, size, totalElements, totalPages)`
- 검증: API 호출 후 응답 스펙 확인
- 의존: T5, T6

### [프론트엔드]

#### T8: 타입 정의 + API 클라이언트 (예상: 20분)
- `src/types/user.ts`:
  ```typescript
  export interface UserSummary { id, email, nickname, job, age, experience, provider, createdAt, lastLoginAt, onboardingCompleted, deleted }
  export interface ActivityLog { action, payload, createdAt }
  export interface UserDetail extends UserSummary { timeline: ActivityLog[] }
  export interface UserPage { content: UserSummary[], page, size, totalElements, totalPages }
  export type UserJob = 'DEVELOPER' | 'PLANNER' | 'DESIGNER'
  ```
- `src/api/users.api.ts`:
  ```typescript
  export const usersApi = {
    list(params: { keyword?, job?, isDeleted?, page? }) → UserPage
    get(userId: string) → UserDetail
    forceWithdraw(userId: string) → void
  }
  ```
- 의존: 없음

#### T9: UsersPage.vue — 목록 (예상: 1시간 30분)
- 라우트: `/users`, `meta: { requiresAuth: true }`
- 컴포넌트:
  - 검색 인풋 (debounce 300ms)
  - 직무 필터 버튼 (전체/기획/개발/디자인)
  - 상태 필터 버튼 (전체/활성/탈퇴)
  - 유저 테이블 (컬럼: 이메일, 닉네임, 직무, 나이, 연차, 가입일, 마지막 로그인, 온보딩, 상태)
  - 페이지네이션 (이전/다음/페이지 번호)
  - 로딩 스피너, 빈 상태 메시지
- 행 클릭 시 `/users/:id` 이동
- 검증: 검색·필터·페이지 이동이 URL 쿼리 파라미터에 반영되어 새로고침 후 상태 유지
- 의존: T7, T8

#### T10: UserDetailPage.vue — 상세 (예상: 1시간)
- 라우트: `/users/:id`, `meta: { requiresAuth: true }`
- 상단: 프로필 카드 (전체 정보)
- 중단: 강제 탈퇴 버튼 (SUPER_ADMIN만 노출, 탈퇴 유저면 비활성)
- 하단: 활동 타임라인 리스트
  - 액션별 한국어 라벨 매핑
  - RETROSPECTIVE_SAVED는 payload.title 함께 표시
  - 날짜/시각 포맷: `YYYY.MM.DD HH:mm`
- 강제 탈퇴 클릭 → ConfirmDialog(기존 컴포넌트) → 확인 시 API 호출 → 성공 토스트 + 목록으로 이동
- 검증: SUPER_ADMIN 계정으로 강제 탈퇴 버튼 노출 확인, 일반 ADMIN은 미노출 확인
- 의존: T7, T8, T9

#### T11: 라우터 + 사이드바 메뉴 추가 (예상: 15분)
- `src/router/index.ts`에 `/users`, `/users/:id` 라우트 추가
- `DashboardLayout.vue` 사이드바에 "유저 관리" 메뉴 항목 추가
- 의존: 없음

## 비목표

- 계정 일시 정지
- 유저 정보 직접 수정
- 유저별 회고 목록 열람
- 대량 일괄 처리
- 유저 레벨/미션 현황

## 리스크 / 의존성

- **N+1 위험**: 목록 조회 시 마지막 로그인을 건별 조회하면 성능 저하. T4의 IN + GROUP BY 쿼리로 해결.
- **audit_logs 인덱스**: 테이블이 커지면 `(actorId, action, createdAt)` 복합 인덱스 필요. 초기엔 데이터 적으므로 인덱스 추가는 Flyway 마이그레이션으로 선택적 적용.
- **AppConfigService 로깅 actorId**: AppConfig 수정 API는 어드민 JWT 토큰에서 adminId를 뽑아야 함. SecurityContextHolder에서 추출하거나 컨트롤러에서 주입.

## 검증 시나리오

- 시나리오 1 (목록): 유저 50명 중 닉네임 "김"으로 검색 → 닉네임에 "김" 포함된 유저만 표시, 마지막 로그인 내림차순 정렬.
- 시나리오 2 (필터): 직무=DEVELOPER + 상태=탈퇴 필터 → 개발자이면서 탈퇴한 유저만 표시.
- 시나리오 3 (상세): 특정 유저 상세 진입 → 회고 제목 있는 RETROSPECTIVE_SAVED 타임라인 항목에 제목 노출.
- 시나리오 4 (강제탈퇴): SUPER_ADMIN으로 로그인 → 유저 상세 → 강제 탈퇴 → audit_logs에 USER_FORCE_WITHDREW 레코드 생성 확인.
- 시나리오 5 (감사로그): 프로젝트 생성 → audit_logs에 PROJECT_CREATED 레코드 확인.
