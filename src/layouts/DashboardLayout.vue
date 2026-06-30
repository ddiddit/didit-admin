<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  PenSquare, Palette, Code2, User, Menu, X,
  Bell, FileText, MessageSquare, Users, Settings, LayoutDashboard, Award, SlidersHorizontal,
  BarChart2, BarChart3, ClipboardList, LineChart,
} from 'lucide-vue-next'
import { authApi } from '@/api/auth.api'
import { tokenStorage } from '@/utils/token'

const router = useRouter()

const isSidebarOpen = ref(false)
const isDesktop = ref(window.innerWidth >= 1024)

const onResize = () => {
  isDesktop.value = window.innerWidth >= 1024
  if (isDesktop.value) isSidebarOpen.value = false
}

onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))

const isSuperAdmin = computed(() => tokenStorage.isSuperAdmin())
const role = computed(() => tokenStorage.getRole() === 'SUPER_ADMIN' ? '슈퍼어드민' : '어드민')

const positionLabel = computed(() => {
  const map: Record<string, string> = {
    PLANNER: '기획자',
    DESIGNER: '디자이너',
    DEVELOPER: '개발자',
  }
  return map[tokenStorage.getPosition() ?? ''] ?? '어드민'
})

const positionIcon = computed(() => {
  const map: Record<string, unknown> = {
    PLANNER: PenSquare,
    DESIGNER: Palette,
    DEVELOPER: Code2,
  }
  return map[tokenStorage.getPosition() ?? ''] ?? User
})

const handleLogout = async () => {
  try {
    await authApi.logout()
  } finally {
    tokenStorage.clearTokens()
    await router.push('/login')
  }
}

const closeSidebar = () => { isSidebarOpen.value = false }

const NAV_LINK = 'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-label1 text-grey-8 hover:bg-grey-3 transition'
const NAV_ACTIVE = 'bg-green-light text-green-dark font-semibold'
</script>

<template>
  <div class="flex min-h-screen bg-background">

    <!-- 모바일 오버레이 -->
    <Transition name="fade">
      <div
        v-if="isSidebarOpen && !isDesktop"
        class="fixed inset-0 z-20 bg-black/30"
        @click="closeSidebar"
      />
    </Transition>

    <!-- 데스크탑 사이드바 -->
    <aside v-if="isDesktop" class="sticky top-0 h-screen w-64 flex-shrink-0 flex flex-col border-r border-grey-5 bg-surface">
      <div class="px-5 h-16 border-b border-grey-5 flex items-center">
        <img src="@/assets/logo.png" alt="didit" class="h-7" />
      </div>

      <nav class="flex-1 px-3 py-5 space-y-6 overflow-y-auto">
        <!-- 홈 -->
        <div>
          <div class="space-y-0.5">
            <RouterLink to="/dashboard" :class="NAV_LINK" :active-class="NAV_ACTIVE">
              <LayoutDashboard class="w-4 h-4 flex-shrink-0" />
              대시보드
            </RouterLink>
          </div>
        </div>

        <!-- 운영 -->
        <div>
          <p class="mb-1.5 px-3 text-caption1 font-semibold text-grey-7 uppercase tracking-wider">운영</p>
          <div class="space-y-0.5">
            <RouterLink to="/notices" :class="NAV_LINK" :active-class="NAV_ACTIVE">
              <FileText class="w-4 h-4 flex-shrink-0" />공지사항
            </RouterLink>
            <RouterLink to="/inquiries" :class="NAV_LINK" :active-class="NAV_ACTIVE">
              <MessageSquare class="w-4 h-4 flex-shrink-0" />문의사항
            </RouterLink>
            <RouterLink to="/notifications" :class="NAV_LINK" :active-class="NAV_ACTIVE">
              <Bell class="w-4 h-4 flex-shrink-0" />알림 발송
            </RouterLink>
          </div>
        </div>

        <!-- 사용자 -->
        <div>
          <p class="mb-1.5 px-3 text-caption1 font-semibold text-grey-7 uppercase tracking-wider">사용자</p>
          <div class="space-y-0.5">
            <RouterLink to="/users" :class="NAV_LINK" :active-class="NAV_ACTIVE">
              <Users class="w-4 h-4 flex-shrink-0" />유저 관리
            </RouterLink>
            <RouterLink to="/badges" :class="NAV_LINK" :active-class="NAV_ACTIVE">
              <Award class="w-4 h-4 flex-shrink-0" />배지 관리
            </RouterLink>
          </div>
        </div>

        <!-- 분석 -->
        <div>
          <p class="mb-1.5 px-3 text-caption1 font-semibold text-grey-7 uppercase tracking-wider">분석</p>
          <div class="space-y-0.5">
            <RouterLink to="/retrospective-stats" :class="NAV_LINK" :active-class="NAV_ACTIVE">
              <LineChart class="w-4 h-4 flex-shrink-0" />회고 통계
            </RouterLink>
            <RouterLink to="/stats/achievements" :class="NAV_LINK" :active-class="NAV_ACTIVE">
              <BarChart3 class="w-4 h-4 flex-shrink-0" />운영 통계
            </RouterLink>
            <RouterLink to="/withdrawal-stats" :class="NAV_LINK" :active-class="NAV_ACTIVE">
              <BarChart2 class="w-4 h-4 flex-shrink-0" />탈퇴 통계
            </RouterLink>
          </div>
        </div>

        <!-- 관리 (관리자 관리는 SUPER_ADMIN 전용) -->
        <div>
          <p class="mb-1.5 px-3 text-caption1 font-semibold text-grey-7 uppercase tracking-wider">관리</p>
          <div class="space-y-0.5">
            <RouterLink to="/prompts" :class="NAV_LINK" :active-class="NAV_ACTIVE">
              <SlidersHorizontal class="w-4 h-4 flex-shrink-0" />프롬프트 관리
            </RouterLink>
            <RouterLink to="/audit-logs" :class="NAV_LINK" :active-class="NAV_ACTIVE">
              <ClipboardList class="w-4 h-4 flex-shrink-0" />감사 로그
            </RouterLink>
            <RouterLink v-if="isSuperAdmin" to="/managers" :class="NAV_LINK" :active-class="NAV_ACTIVE">
              <User class="w-4 h-4 flex-shrink-0" />관리자 관리
            </RouterLink>
            <RouterLink to="/settings" :class="NAV_LINK" :active-class="NAV_ACTIVE">
              <Settings class="w-4 h-4 flex-shrink-0" />앱 설정
            </RouterLink>
          </div>
        </div>
      </nav>

      <!-- 프로필 + 로그아웃 -->
      <div class="px-4 py-4 border-t border-grey-5 space-y-3">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-green-light flex items-center justify-center flex-shrink-0">
            <component :is="positionIcon" class="w-4 h-4 text-green-dark" />
          </div>
          <div>
            <p class="text-label1 font-semibold text-grey-13">{{ positionLabel }}</p>
            <p class="text-caption1 text-grey-7">{{ role }}</p>
          </div>
        </div>
        <button
          @click="handleLogout"
          class="w-full flex items-center justify-center rounded-xl py-2 text-label1 text-grey-7 hover:bg-danger/10 hover:text-danger transition border border-grey-5 cursor-pointer"
        >
          로그아웃
        </button>
      </div>
    </aside>

    <!-- 메인 -->
    <div class="flex-1 flex flex-col min-w-0">

      <!-- 모바일 헤더 -->
      <header v-if="!isDesktop" class="h-14 border-b border-grey-5 bg-surface px-4 flex items-center justify-between">
        <img src="@/assets/logo.png" alt="didit" class="h-7" />
        <button class="text-grey-7 hover:text-grey-9 cursor-pointer" @click="isSidebarOpen = true">
          <Menu class="w-5 h-5" />
        </button>
      </header>

      <main class="flex-1 p-4 sm:p-6">
        <slot />
      </main>
    </div>

    <!-- 모바일 사이드바 -->
    <aside
      v-if="!isDesktop"
      :class="[
        'fixed inset-y-0 right-0 z-30 w-64 flex flex-col border-l border-grey-5 bg-surface transition-transform duration-300',
        isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
      ]"
    >
      <div class="px-5 h-16 border-b border-grey-5 flex items-center justify-between">
        <img src="@/assets/logo.png" alt="didit" class="h-7" />
        <button class="text-grey-6 hover:text-grey-9 cursor-pointer" @click="closeSidebar">
          <X class="w-5 h-5" />
        </button>
      </div>

      <nav class="flex-1 px-3 py-5 space-y-6 overflow-y-auto">
        <div>
          <div class="space-y-0.5">
            <RouterLink to="/dashboard" :class="NAV_LINK" :active-class="NAV_ACTIVE" @click="closeSidebar">
              <LayoutDashboard class="w-4 h-4 flex-shrink-0" />대시보드
            </RouterLink>
          </div>
        </div>
        <div>
          <p class="mb-1.5 px-3 text-caption1 font-semibold text-grey-7 uppercase tracking-wider">운영</p>
          <div class="space-y-0.5">
            <RouterLink to="/notices" :class="NAV_LINK" :active-class="NAV_ACTIVE" @click="closeSidebar">
              <FileText class="w-4 h-4 flex-shrink-0" />공지사항
            </RouterLink>
            <RouterLink to="/inquiries" :class="NAV_LINK" :active-class="NAV_ACTIVE" @click="closeSidebar">
              <MessageSquare class="w-4 h-4 flex-shrink-0" />문의사항
            </RouterLink>
            <RouterLink to="/notifications" :class="NAV_LINK" :active-class="NAV_ACTIVE" @click="closeSidebar">
              <Bell class="w-4 h-4 flex-shrink-0" />알림 발송
            </RouterLink>
          </div>
        </div>
        <div>
          <p class="mb-1.5 px-3 text-caption1 font-semibold text-grey-7 uppercase tracking-wider">사용자</p>
          <div class="space-y-0.5">
            <RouterLink to="/users" :class="NAV_LINK" :active-class="NAV_ACTIVE" @click="closeSidebar">
              <Users class="w-4 h-4 flex-shrink-0" />유저 관리
            </RouterLink>
            <RouterLink to="/badges" :class="NAV_LINK" :active-class="NAV_ACTIVE" @click="closeSidebar">
              <Award class="w-4 h-4 flex-shrink-0" />배지 관리
            </RouterLink>
          </div>
        </div>
        <div>
          <p class="mb-1.5 px-3 text-caption1 font-semibold text-grey-7 uppercase tracking-wider">분석</p>
          <div class="space-y-0.5">
            <RouterLink to="/retrospective-stats" :class="NAV_LINK" :active-class="NAV_ACTIVE" @click="closeSidebar">
              <LineChart class="w-4 h-4 flex-shrink-0" />회고 통계
            </RouterLink>
            <RouterLink to="/stats/achievements" :class="NAV_LINK" :active-class="NAV_ACTIVE" @click="closeSidebar">
              <BarChart3 class="w-4 h-4 flex-shrink-0" />운영 통계
            </RouterLink>
            <RouterLink to="/withdrawal-stats" :class="NAV_LINK" :active-class="NAV_ACTIVE" @click="closeSidebar">
              <BarChart2 class="w-4 h-4 flex-shrink-0" />탈퇴 통계
            </RouterLink>
          </div>
        </div>
        <div>
          <p class="mb-1.5 px-3 text-caption1 font-semibold text-grey-7 uppercase tracking-wider">관리</p>
          <div class="space-y-0.5">
            <RouterLink to="/prompts" :class="NAV_LINK" :active-class="NAV_ACTIVE" @click="closeSidebar">
              <SlidersHorizontal class="w-4 h-4 flex-shrink-0" />프롬프트 관리
            </RouterLink>
            <RouterLink to="/audit-logs" :class="NAV_LINK" :active-class="NAV_ACTIVE" @click="closeSidebar">
              <ClipboardList class="w-4 h-4 flex-shrink-0" />감사 로그
            </RouterLink>
            <RouterLink v-if="isSuperAdmin" to="/managers" :class="NAV_LINK" :active-class="NAV_ACTIVE" @click="closeSidebar">
              <User class="w-4 h-4 flex-shrink-0" />관리자 관리
            </RouterLink>
            <RouterLink to="/settings" :class="NAV_LINK" :active-class="NAV_ACTIVE" @click="closeSidebar">
              <Settings class="w-4 h-4 flex-shrink-0" />앱 설정
            </RouterLink>
          </div>
        </div>
      </nav>

      <div class="px-4 py-4 border-t border-grey-5 space-y-3">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-green-light flex items-center justify-center flex-shrink-0">
            <component :is="positionIcon" class="w-4 h-4 text-green-dark" />
          </div>
          <div>
            <p class="text-label1 font-semibold text-grey-13">{{ positionLabel }}</p>
            <p class="text-caption1 text-grey-7">{{ role }}</p>
          </div>
        </div>
        <button @click="handleLogout" class="w-full flex items-center justify-center rounded-xl py-2 text-label1 text-grey-7 hover:bg-danger/10 hover:text-danger transition border border-grey-5 cursor-pointer">
          로그아웃
        </button>
      </div>
    </aside>

  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
