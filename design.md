# didit 디자인 시스템 (앱 기준)

> didit **앱(`didit-frontend`)** 의 디자인 토큰·컴포넌트·패턴을 정리한 단일 참조 문서입니다.
> 사람과 AI 에이전트(Claude Code 등)가 새 화면·컴포넌트를 만들 때 **이 문서의 토큰과 패턴만 사용**합니다.
> 임의의 색상값(`#hex`)·폰트 크기·라운드 값을 새로 만들지 마세요.

## 개요

- **기준 surface**: 앱(사용자용 프론트엔드) — `didit-frontend`
- **컨셉**: **모바일 우선**, 미니멀. 컨텐츠 최대폭 390px의 모바일 화면.
- **스택**: Nuxt 4 (Vue 3) + Tailwind CSS v3(config) + `@nuxt/icon`
- **토큰 원본 (Source of truth)**:
  - 색상 — `app/utils/colors.ts` (피그마 토큰 단일 소스) → `tailwind.config.ts`에서 매핑
  - 타이포·유틸 — `app/assets/css/main.css`
- 같은 피그마 토큰을 어드민(`didit-admin`, 데스크톱)도 공유합니다. 적용이 다른 부분은 각 절 끝의 **〔어드민 차이〕** 로 표기.

---

## 1. 색상 (Color)

피그마 토큰이 원본. `colors.ts`의 `primary/neutral/tag/system` 스케일을 Tailwind에서 `green-*`/`grey-*`/`tag-*`로 매핑합니다.

### Primary — 디딧 그린 (피그마 Primary)

| 토큰 | HEX | 피그마 | 용도 |
|------|-----|--------|------|
| `primary` / `green` | `#3DDB99` | 50 | 브랜드 포인트, 기본 버튼·활성·포커스 |
| `green-light` | `#ECFBF5` | 10 | 활성 배경, 칩/배지 배경 |
| `green-light-hover` | `#E2FAF0` | 20 | |
| `green-light-active` | `#C3F4DF` | 30 | |
| `green-hover` | `#37C58A` | 55 | hover |
| `green-active` | `#31AF7A` | 60 | **버튼 active** (앱 primary 버튼이 사용) |
| `green-dark` | `#2EA473` | 70 | 그린 텍스트·아이콘 |
| `green-dark-hover` | `#25835C` | 80 | |
| `green-dark-active` | `#1B6345` | 90 | |
| `green-darker` | `#154D36` | 95 | |

### Grey — 뉴트럴 (피그마 Neutral, 1=밝음 → 13=어두움)

| 토큰 | HEX | 대표 용도 |
|------|-----|----------|
| `grey-1` | `#FFFFFF` | surface / 흰 배경 |
| `grey-2` | `#FDFDFD` | |
| `grey-3` | `#F6F6F6` | 인풋·secondary 버튼 배경, 보조 면 |
| `grey-4` | `#F1F1F1` | 보조 배경, divider |
| `grey-5` | `#E6E6E6` | **기본 보더 색**, disabled 배경 |
| `grey-6` | `#C6C6C6` | 비활성 텍스트/아이콘 (disabled 라벨, muted 칩) |
| `grey-7` | `#989898` | 플레이스홀더, 캡션, 보조 텍스트 |
| `grey-8` | `#6A6A6A` | 라벨·본문 보조 |
| `grey-9` | `#575757` | 강조 보조 |
| `grey-10` | `#3C3C3C` | |
| `grey-11` | `#353535` | |
| `grey-12` | `#2B2B2B` | |
| `grey-13` | `#191919` | **기본 본문/제목 텍스트**, primary 버튼 글자 |

### System

| 토큰 | HEX | 용도 |
|------|-----|------|
| `danger` / `error` | `#F73838` | 삭제·위험·에러 |
| `danger-50` | `#FF5C5C` | danger 보조 |
| `accent` | `#FF6E58` | 강조 포인트 (제한적) |

### Tag 팔레트 (피그마 Tag Color)

회고 **프로젝트·태그 분류**용. 각 색은 진한색(텍스트)/라이트(배경) 쌍. 사용: `bg-tag-{color}-light` + `text-tag-{color}`.

| color | 진한색(text) | 라이트(bg) |
|-------|--------------|------------|
| `red` | `#F06C6C` | `#FDECEC` |
| `orange` | `#F08A5D` | `#FDEDE7` |
| `yellow` | `#DEAD3A` | `#FAF3E1` |
| `leaf-green` | `#77C767` | `#EBF7E8` |
| `green` | `#37C58A` | `#E2FAF0` |
| `sky-blue` | `#65ABE0` | `#E8F2FA` |
| `blue` | `#5A8DEE` | `#E6EEFC` |
| `purple` | `#8C7CF0` | `#EEEBFD` |
| `pink` | `#E079E0` | `#FAEBFA` |
| `brown` | `#C78B5C` | `#F7EEE7` |

### Semantic 별칭
`surface` = `#FFFFFF`, `background` = `#F6F6F6`.
※ 앱 `body` 배경은 **흰색(`#FFFFFF`)** — 모바일 풀스크린 컨셉(`main.css`).

**기본 규칙**: 본문 `text-grey-13`, 보조 `text-grey-7~9`, 보더 `border-grey-5`, 포인트는 `primary` 계열.

---

## 2. 타이포그래피 (Typography)

**폰트**: `Pretendard` (CDN dynamic-subset), fallback `system-ui, sans-serif`. 전 스케일 `letter-spacing: -0.02em`.
정의 위치: `app/assets/css/main.css` (`@layer utilities`).

| 클래스 | size | line-height | 용도 |
|--------|------|-------------|------|
| `text-title1` | 28px | 1.38 | 최상위 타이틀 |
| `text-title2` | 24px | 1.40 | |
| `text-title3` | 22px | 1.40 | |
| `text-heading1` | 20px | 1.40 | 섹션 헤딩 |
| `text-heading2` | 18px | 1.40 | 화면 제목 |
| `text-body1` | 17px | 1.50 | 본문 |
| `text-body2` | 16px | 1.50 | lg 버튼 |
| `text-body3` | 15px | 1.50 | md 버튼 |
| `text-label1` | 14px | 1.40 | 라벨·인풋 기본 |
| `text-label2` | 13px | 1.40 | |
| `text-caption1` | 12px | 1.36 | 캡션, 보조 |
| `text-caption2` | 11px | 1.30 | 최소 보조 (Tag 텍스트 등) |

**Reading 변형** — 긴 회고 텍스트 가독성용으로 `line-height`만 늘린 변형:
`text-body1-reading`/`body2-reading`/`body3-reading`/`label1-reading`(1.50→1.60), `text-label2-reading`(1.50).
회고 답변·요약 등 **읽기 위주 텍스트엔 reading 변형 사용**.

`text-headline1`(18px): 하위 호환 별칭 — 신규 사용 금지, `text-heading2` 사용.

**굵기**: `font-normal`(400) / `font-medium`(500) / `font-semibold`(600) / `font-bold`(700).

---

## 3. 모양 & 레이아웃 (Shape & Layout)

### Radius
| 클래스 | 값 | 용도 |
|--------|-----|------|
| `rounded-[6px]` | 6px | Tag 칩 |
| `rounded-xl` | 12px | **기본** — 버튼, 인풋, 칩 |
| `rounded-2xl` | 16px | 카드 |
| `rounded-3xl` | 24px | 큰 시트·팝업(바텀시트) |
| `rounded-full` | 9999px | 토글, 원형 요소 |

### Shadow
| 토큰 | 값 | 용도 |
|------|-----|------|
| `shadow-card` | `0 2px 12px rgba(0,0,0,0.06)` | 카드/팝업 |
| `shadow-bottom` | `0 -2px 12px rgba(0,0,0,0.06)` | 하단 탭바·고정 CTA |

### Breakpoints & 폭 (모바일 우선)
- 커스텀: `xs`(375px), `sm`(390px), `desktop`(980px)
- 컨텐츠 최대폭 `max-w-mobile`(390px) — `.mobile-container`(`mx-auto w-full max-w-mobile`)로 가운데 정렬
- `desktop` 이상에서도 모바일 폭 유지(중앙 정렬), 데스크톱 전용 레이아웃 없음

### 모바일 전용 유틸 (`main.css`)
- `.safe-top` / `.safe-bottom` — iOS safe-area(`env(safe-area-inset-*)`). `safe-bottom`은 기본 50px + safe-area.
- `.mobile-container` — 모바일 폭 중앙 정렬
- `.scrollbar-hide` — 스크롤바 숨김(기능 유지)
- `* { -webkit-tap-highlight-color: transparent }` — 탭 하이라이트 제거

### Transition
기본 `transition-colors duration-150`.
※ `chip` 등 **font-weight가 바뀌는 토글은 `transition-none`** (굵기는 트랜지션이 안 먹어 깜빡임 방지).

---

## 4. 컴포넌트 (Components)

공통 UI는 `app/components/ui/` 의 `Ui*` 접두 컴포넌트, 레이아웃은 `app/components/layout/`.

### 4.1 Button — `UiButton.vue`
공통: `flex items-center gap-2 rounded-xl transition-colors duration-150`, `justify` prop(`center`|`start`).

| variant | 스타일 |
|---------|--------|
| `primary` | `bg-primary text-grey-13 font-semibold active:bg-green-active` (밝은 그린 위 **어두운 글자**) |
| `secondary` | active: `bg-green-light border border-primary text-grey-13 font-bold` / 기본: `bg-grey-3 border-transparent font-normal` |
| `chip` | active: `bg-green-light border-primary font-bold` / `muted`: `bg-white text-grey-6 border-grey-5` / 기본: `bg-white text-grey-13 border-grey-5` (모두 `transition-none`) |
| `ghost` | `bg-transparent text-primary underline font-medium` |
| disabled/loading | `bg-grey-5 text-grey-6 font-semibold cursor-not-allowed` |

| size | 스타일 |
|------|--------|
| `lg` (기본) | `w-full h-14 px-4 text-body2` (H56) |
| `md` | `w-full h-[50px] px-4 text-body3` |
| `sm` | `px-4 h-8 text-[14px]` |

`chip`은 직군·나이대·연차 등 **선택 칩**, `secondary`는 전체동의 등 토글 버튼에 사용.

### 4.2 Text Input — `UiTextInput.vue`
인풋 기본형: `rounded-xl border border-grey-5 bg-grey-3 px-4 py-3 text-label1 text-grey-13 placeholder:text-grey-7 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20`.

### 4.3 Tag — `UiTag.vue`
`inline-flex items-center gap-1 rounded-[6px] text-[11px] font-semibold` + `color` prop으로 Tag 팔레트 적용(`bg-tag-{c}-light` + `text-tag-{c}`). 패딩 `4px 6px`. 회고 프로젝트·분류 표시.

### 4.4 Toggle / Checkbox — `UiToggle.vue`, `UiCheckbox.vue`
토글: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors`, on `bg-primary` / off `bg-grey-5`, 노브 `h-4 w-4 rounded-full bg-white shadow` (`translate-x-6`/`translate-x-1`).

### 4.5 Progress — `UiProgressBar.vue`
회고 진행률 바(질문 단계 표시).

### 4.6 Popup / Sheet — `UiPopup.vue`
모바일 바텀시트/팝업. 상단 `rounded-3xl` + `shadow-bottom`.

### 4.7 Toast — `UiToast.vue`
하단 토스트 알림.

### 4.8 Badge 획득 연출 — `UiBadgeAcquiredPopup.vue`
뱃지 획득 시 축하 팝업.

### 4.9 Scroll Picker — `UiScrollPicker.vue`
나이대·연차 등 휠 선택 UI(온보딩).

### 4.10 하단 탭바 — `layout/BottomTabBar.vue`
하단 고정 내비게이션. `shadow-bottom` + `safe-bottom`(노치 대응).

---

## 5. 아이콘 (Icon)
- 라이브러리: **`@nuxt/icon`**
- 색: 보조 `text-grey-7`, 포인트 `text-green-dark`, 위험 `text-danger`.

---

## 6. 작성 규칙 (Conventions)
- 색·크기·라운드는 **반드시 위 토큰/클래스 사용**. 임의 `#hex`·px 금지(예외: 토큰에 없는 1회성 색만 `[...]`).
- 주석 한국어, `<script setup lang="ts">` 만, `any` 금지.
- 컴포넌트명 PascalCase, 파일명 kebab-case, 공통 UI는 `Ui*` 접두.
- 페이지: `app/pages/` 파일 기반 라우팅, 레이아웃 `app/layouts/`.
- 읽기 위주 텍스트는 `-reading` 타이포, 하단 고정 요소는 `safe-bottom`.

---

## 부록: 어드민(`didit-admin`) 디자인 시스템

앱과 같은 피그마 토큰을 공유하지만 **데스크톱 운영 UI**라 적용·구성이 다릅니다.
원본(Source of truth): `didit-admin/src/style.css` (`@theme` 직접 정의, config 파일 없음, 타이포는 `@utility` 등록).

### A. 기본 차이

- **primary 버튼 글자색이 흰색** (`bg-primary text-white hover:bg-green-hover active:bg-green-active`). 앱은 `text-grey-13`.
- 데스크톱 레이아웃: 사이드바 `w-64`, `lg`(1024px) 기준 분기, 테이블 중심 UI.
- 아이콘 `lucide-vue-next`, 토스트 `vue-sonner`.
- Tag 팔레트·모바일 유틸(safe-area 등)·reading 타이포는 **앱 전용**(어드민 미사용).

### B. 어드민 전용 토큰 (앱 토큰에 추가)

System·차트 색을 토큰화해 비토큰 색(`blue-500` 등) 사용을 금지합니다.

| 토큰 | HEX | 용도 |
|------|-----|------|
| `info` | `#5A8DEE` | 정보 강조 아이콘(예: DAU), `badge-blue` 글자 |
| `info-light` | `#E6EEFC` | `badge-blue` 배경 |
| `warning` | `#B07D00` | `badge-yellow` 글자(대기/주의) |
| `warning-light` | `#FFF9E6` | `badge-yellow` 배경 |
| `chart-1`~`chart-6` | `#3DDB99` `#5A8DEE` `#DEAD3A` `#F08A5D` `#8C7CF0` `#C6C6C6` | 막대/분포 차트 카테고리 색 (`bg-chart-{n}`) |

### C. 배지 (전역 `@layer components` 클래스)

pill 형태. `<Badge tone="...">` 컴포넌트 또는 클래스 직접 사용. 앱의 Tag와는 별개.

| 클래스 / `tone` | 색 | 의미 |
|------|-----|------|
| `badge-green` / `green` | `bg-green-light text-green-dark` | 성공/활성/완료 |
| `badge-grey` / `grey` | `bg-grey-4 text-grey-8` | 중립/미완료 |
| `badge-yellow` / `yellow` | `bg-warning-light text-warning` | 대기/주의 |
| `badge-red` / `red` | `bg-danger/10 text-danger` | 위험/탈퇴/에러 |
| `badge-blue` / `blue` | `bg-info-light text-info` | 정보 |

### D. 공통 컴포넌트 (`src/components/common/`)

페이지는 이 컴포넌트들을 조합해 만든다. 인라인으로 같은 패턴을 재구현하지 말 것.

| 컴포넌트 | 용도 / 주요 props |
|----------|------------------|
| `PageHeader` | 페이지 제목·부제 + 우측 `#actions` 슬롯. `title`, `subtitle?` |
| `Card` | 면 래퍼(`bg-surface rounded-2xl border`). `padded`(기본 true), `rounded?` |
| `Badge` | 상태 배지. `tone: green\|grey\|yellow\|red\|blue` |
| `EmptyState` | 빈 상태(아이콘+문구). `message`, `description?`, `icon?`, `#action` 슬롯 |
| `DataTable` | 컬럼 설정 기반 테이블. `columns`(key/label/align/width/hideBelow), `rows`, `rowKey`, `minWidth`, `clickable`, `loading`, `emptyMessage`, `emptyIcon`; `#cell-{key}` 슬롯, `@row-click` |
| `Pagination` | 번호+이전/다음(윈도잉). `page`(0-based), `totalPages`, `@change` |
| `BaseModal` | 모든 모달의 공통 셸(Teleport·등장 애니메이션·헤더/바디/`#footer`). `show`, `title`, `subtitle?`, `maxWidth?`, `@close` |
| `ConfirmDialog` | `BaseModal` 기반 확인 다이얼로그. `title`, `description`, `confirmText?`, `isDanger?`, `isLoading?` |
| `BaseButton` | `variant: primary\|secondary\|chip\|ghost\|danger`, `size: lg\|md(기본)\|sm`, `block`, `loading`(스피너 내장), `disabled`, `active` |
| `BaseSpinner` | 전체 화면 로딩 오버레이. `show` |
| `SearchInput` | 좌측 아이콘 검색 인풋. `modelValue`, `placeholder?` |
| `SelectField` | 스타일드 셀렉트. `modelValue`, `options[{value,label}]` |
| `FilterChips` | 세그먼트 칩 필터(2~N개 단일 선택). `modelValue`, `options[{value,label}]` |
| `BackLink` | 상세 페이지 뒤로가기 링크. `label?`(기본 "목록으로"), `@click` |

### E. 공통 유틸 (`src/utils/`)

- `format.ts` — `formatDate`(YYYY.MM.DD) · `formatDateTime`(+HH:mm) · `formatDateTimeSec`(+ss) · `formatNumber`(천 단위). 모두 null/undefined 시 `'-'`.
- `error.ts` — `getErrorMessage(error, fallback)`: API 에러에서 `ProblemDetail.detail` 추출.

### F. 인풋 / 폼 기준 마크업

```html
<!-- 인풋·textarea 공통 -->
<input class="w-full rounded-xl border border-grey-5 bg-grey-3 px-4 py-3
  text-label1 text-grey-13 placeholder:text-grey-7 outline-none transition
  focus:border-primary focus:ring-2 focus:ring-primary/20
  disabled:opacity-40 disabled:cursor-not-allowed" />
<!-- 라벨: mb-1.5 block text-label1 font-medium text-grey-9 -->
<!-- 도움말: mt-1.5 text-caption1 text-grey-7 -->
```

상세/폼 페이지는 `mx-auto w-full max-w-2xl space-y-5 pt-2` 컨테이너 + `Card` 섹션 구성을 따른다.

---

> 토큰을 바꾸면 이 문서도 함께 갱신하세요. 서비스/도메인 흐름은 [`service.md`](./service.md) 참고.
