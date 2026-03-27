<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { PenSquare, Palette, Code2, User, Menu, X } from 'lucide-vue-next'
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
  const map: Record<string, any> = {
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

const closeSidebar = () => {
  isSidebarOpen.value = false
}
</script>

<template>
  <div class="flex min-h-screen bg-neutral-50">

    <!-- 모바일 오버레이 -->
    <Transition name="fade">
      <div
          v-if="isSidebarOpen && !isDesktop"
          class="fixed inset-0 z-20 bg-black/30"
          @click="closeSidebar"
      />
    </Transition>

    <!-- 데스크탑 사이드바 -->
    <aside
        v-if="isDesktop"
        class="w-64 flex-shrink-0 flex flex-col border-r border-neutral-200 bg-white"
    >
      <div class="px-4 border-b border-neutral-200 flex items-center h-16">
        <img src="@/assets/logo.png" alt="didit" class="h-7" />
      </div>

      <nav class="flex-1 px-3 py-4 space-y-4">
        <div>
          <p class="mb-2 px-3 text-sm font-semibold text-neutral-500">고객지원</p>
          <div class="space-y-1 pl-3">
            <RouterLink to="/notices" class="block rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 transition" active-class="bg-primary/10 text-primary font-medium">
              공지사항
            </RouterLink>
            <RouterLink to="/inquiries" class="block rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 transition" active-class="bg-primary/10 text-primary font-medium">
              문의사항
            </RouterLink>
            <RouterLink to="/notifications" class="block rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 transition" active-class="bg-primary/10 text-primary font-medium">
              알림 발송
            </RouterLink>
          </div>
        </div>

        <div v-if="isSuperAdmin">
          <p class="mb-2 px-3 text-sm font-semibold text-neutral-500">관리</p>
          <div class="space-y-1 pl-3">
            <RouterLink to="/managers" class="block rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 transition" active-class="bg-primary/10 text-primary font-medium">
              관리자 관리
            </RouterLink>
            <RouterLink to="/settings" class="block rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 transition" active-class="bg-primary/10 text-primary font-medium">
              앱 설정
            </RouterLink>
          </div>
        </div>
      </nav>

      <div class="px-4 py-4 border-t border-neutral-200 space-y-3">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <component :is="positionIcon" class="w-4 h-4 text-primary" />
          </div>
          <div>
            <p class="text-sm font-medium text-neutral-800">{{ positionLabel }}</p>
            <p class="text-xs text-neutral-400">{{ role }}</p>
          </div>
        </div>
        <button @click="handleLogout" class="w-full flex items-center justify-center rounded-xl py-2 text-sm text-neutral-500 hover:bg-red-50 hover:text-red-500 transition border border-neutral-200 cursor-pointer">
          로그아웃
        </button>
      </div>
    </aside>

    <!-- 메인 -->
    <div class="flex-1 flex flex-col min-w-0">

      <!-- 모바일 헤더 -->
      <header v-if="!isDesktop" class="h-14 border-b border-neutral-200 bg-white px-4 flex items-center justify-between">
        <img src="@/assets/logo.png" alt="didit" class="h-7" />
        <button class="text-neutral-500 hover:text-neutral-700 cursor-pointer" @click="isSidebarOpen = true">
          <Menu class="w-5 h-5" />
        </button>
      </header>

      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>

    <!-- 모바일 사이드바 -->
    <aside
        v-if="!isDesktop"
        :class="[
          'fixed inset-y-0 right-0 z-30 w-64 flex flex-col border-l border-neutral-200 bg-white transition-transform duration-300',
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        ]"
    >
      <div class="px-5 border-b border-neutral-200 flex items-center justify-between h-16">
        <img src="@/assets/logo.png" alt="didit" class="h-7" />
        <button class="text-neutral-400 hover:text-neutral-600 cursor-pointer" @click="closeSidebar">
          <X class="w-5 h-5" />
        </button>
      </div>

      <nav class="flex-1 px-3 py-4 space-y-4">
        <div>
          <p class="mb-2 px-3 text-sm font-semibold text-neutral-500">고객지원</p>
          <div class="space-y-1 pl-3">
            <RouterLink to="/notices" class="block rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 transition" active-class="bg-primary/10 text-primary font-medium" @click="closeSidebar">
              공지사항
            </RouterLink>
            <RouterLink to="/inquiries" class="block rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 transition" active-class="bg-primary/10 text-primary font-medium" @click="closeSidebar">
              문의사항
            </RouterLink>
            <RouterLink to="/notifications" class="block rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 transition" active-class="bg-primary/10 text-primary font-medium" @click="closeSidebar">
              알림 발송
            </RouterLink>
          </div>
        </div>

        <div v-if="isSuperAdmin">
          <p class="mb-2 px-3 text-sm font-semibold text-neutral-500">관리</p>
          <div class="space-y-1 pl-3">
            <RouterLink to="/managers" class="block rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 transition" active-class="bg-primary/10 text-primary font-medium" @click="closeSidebar">
              관리자 관리
            </RouterLink>
            <RouterLink to="/settings" class="block rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 transition" active-class="bg-primary/10 text-primary font-medium" @click="closeSidebar">
              앱 설정
            </RouterLink>
          </div>
        </div>
      </nav>

      <div class="px-4 py-4 border-t border-neutral-200 space-y-3">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <component :is="positionIcon" class="w-4 h-4 text-primary" />
          </div>
          <div>
            <p class="text-sm font-medium text-neutral-800">{{ positionLabel }}</p>
            <p class="text-xs text-neutral-400">{{ role }}</p>
          </div>
        </div>
        <button @click="handleLogout" class="w-full flex items-center justify-center rounded-xl py-2 text-sm text-neutral-500 hover:bg-red-50 hover:text-red-500 transition border border-neutral-200 cursor-pointer">
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