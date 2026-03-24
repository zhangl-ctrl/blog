<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-dialog-provider>
        <div class="app">
          <header class="header">
            <div class="container">
              <router-link to="/" class="logo">墨迹</router-link>
              <nav class="nav">
                <router-link to="/">首页</router-link>
                <router-link to="/archive">归档</router-link>
                <template v-if="userStore.isLoggedIn">
                  <router-link to="/drafts">草稿箱</router-link>
                  <router-link to="/editor">写文章</router-link>
                </template>
                <router-link to="/about">关于</router-link>
              </nav>
              <div class="user-area">
                <template v-if="userStore.isLoggedIn">
                  <n-dropdown :options="userMenuOptions" @select="handleUserMenuSelect">
                    <n-button text>
                      <span class="username">{{ userStore.currentUser.username }}</span>
                      <n-icon :component="DownArrow" />
                    </n-button>
                  </n-dropdown>
                </template>
                <template v-else>
                  <router-link to="/login" class="login-link">登录</router-link>
                  <router-link to="/register" class="register-link">注册</router-link>
                </template>
              </div>
            </div>
          </header>
          <main class="main">
            <router-view v-slot="{ Component }">
              <transition name="fade" mode="out-in">
                <component :is="Component" />
              </transition>
            </router-view>
          </main>
          <footer class="footer">
            <div class="container">
              <p>&copy; 2026 墨迹博客 · 用文字记录思考</p>
            </div>
          </footer>
        </div>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import { h, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NDropdown, NIcon, NConfigProvider, NMessageProvider, NDialogProvider } from 'naive-ui'
import { useUserStore } from './stores'
import { initPresetData } from './database'

const router = useRouter()
const userStore = useUserStore()

// 图标组件
const DownArrow = {
  render() {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 24 24',
      fill: 'currentColor',
      style: { width: '12px', height: '12px', marginLeft: '4px' }
    }, [
      h('path', { d: 'M7 10l5 5 5-5z' })
    ])
  }
}

// 用户菜单选项
const userMenuOptions = computed(() => {
  const options = []

  // 草稿箱
  options.push({
    label: '草稿箱',
    key: 'drafts'
  })

  // 写文章
  options.push({
    label: '写文章',
    key: 'editor'
  })

  // 管理员菜单
  if (userStore.isAdmin) {
    options.push({
      type: 'divider',
      key: 'd1'
    })

    // 文章管理（管理员）
    if (userStore.isAdmin) {
      options.push({
        label: '文章管理',
        key: 'articles'
      })
    }

    // 用户管理（仅超级管理员）
    if (userStore.isSuperAdmin) {
      options.push({
        label: '用户管理',
        key: 'users'
      })
    }
  }

  options.push({
    type: 'divider',
    key: 'd2'
  })

  // 登出
  options.push({
    label: '退出登录',
    key: 'logout'
  })

  return options
})

// 处理用户菜单选择
function handleUserMenuSelect(key) {
  switch (key) {
    case 'drafts':
      router.push({ name: 'Drafts' })
      break
    case 'editor':
      router.push({ name: 'Editor' })
      break
    case 'articles':
      router.push({ name: 'ArticleManage' })
      break
    case 'users':
      router.push({ name: 'UserManage' })
      break
    case 'logout':
      userStore.logout()
      router.push('/')
      break
  }
}

// 主题配置
const themeOverrides = {
  common: {
    primaryColor: '#a08040',
    primaryColorHover: '#b08d4a',
    primaryColorPressed: '#8a7048'
  }
}

// 初始化
onMounted(async () => {
  await initPresetData()
  await userStore.init()
})
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 2rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-family: 'Noto Serif SC', serif;
  font-size: 1.75rem;
  font-weight: 600;
  color: #1a1a1a;
  text-decoration: none;
  letter-spacing: 0.1em;
}

.nav {
  display: flex;
  gap: 2rem;
}

.nav a {
  color: #666;
  text-decoration: none;
  font-size: 0.95rem;
  position: relative;
  transition: color 0.3s ease;
}

.nav a::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 1px;
  background: #1a1a1a;
  transition: width 0.3s ease;
}

.nav a:hover {
  color: #1a1a1a;
}

.nav a:hover::after {
  width: 100%;
}

.nav a.router-link-active {
  color: #1a1a1a;
}

.user-area {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.username {
  font-size: 0.95rem;
  color: #666;
}

.login-link,
.register-link {
  color: #666;
  text-decoration: none;
  font-size: 0.95rem;
  padding: 0.5rem 1rem;
  transition: color 0.3s ease;
}

.login-link:hover,
.register-link:hover {
  color: #1a1a1a;
}

.register-link {
  background: #1a1a1a;
  color: #fff;
  border-radius: 4px;
}

.register-link:hover {
  background: #333;
  color: #fff;
}

.main {
  flex: 1;
  padding: 3rem 0;
}

.footer {
  padding: 2rem 0;
  text-align: center;
  color: #999;
  font-size: 0.85rem;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .nav {
    gap: 1rem;
  }

  .container {
    flex-wrap: wrap;
  }

  .logo {
    font-size: 1.5rem;
  }

  .user-area {
    gap: 0.5rem;
  }
}
</style>
