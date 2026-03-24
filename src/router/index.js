/**
 * 路由配置
 * 包含路由守卫和权限控制
 */
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores'

// 懒加载组件
const Home = () => import('../views/Home.vue')
const Post = () => import('../views/Post.vue')
const About = () => import('../views/About.vue')
const Editor = () => import('../views/Editor.vue')
const Drafts = () => import('../views/Drafts.vue')
const Archive = () => import('../views/Archive.vue')
const Login = () => import('../views/Login.vue')
const Register = () => import('../views/Register.vue')
const UserManage = () => import('../views/UserManage.vue')
const ArticleManage = () => import('../views/ArticleManage.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: '首页' }
  },
  {
    path: '/post/:id',
    name: 'Post',
    component: Post,
    meta: { title: '文章详情' }
  },
  {
    path: '/about',
    name: 'About',
    component: About,
    meta: { title: '关于' }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: '登录', guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { title: '注册', guest: true }
  },
  {
    path: '/editor',
    name: 'Editor',
    component: Editor,
    meta: { title: '编辑文章', requiresAuth: true, roles: ['editor', 'admin', 'super_admin'] }
  },
  {
    path: '/editor/:id',
    name: 'EditArticle',
    component: Editor,
    meta: { title: '编辑文章', requiresAuth: true, roles: ['editor', 'admin', 'super_admin'] }
  },
  {
    path: '/drafts',
    name: 'Drafts',
    component: Drafts,
    meta: { title: '草稿箱', requiresAuth: true }
  },
  {
    path: '/archive',
    name: 'Archive',
    component: Archive,
    meta: { title: '归档' }
  },
  {
    path: '/users',
    name: 'UserManage',
    component: UserManage,
    meta: { title: '用户管理', requiresAuth: true, roles: ['super_admin'] }
  },
  {
    path: '/articles',
    name: 'ArticleManage',
    component: ArticleManage,
    meta: { title: '文章管理', requiresAuth: true, roles: ['admin', 'super_admin'] }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  // 初始化用户数据
  if (!userStore.users.length) {
    await userStore.init()
  }

  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 博客系统` : '博客系统'

  // 需要登录的路由
  if (to.meta.requiresAuth) {
    if (!userStore.isLoggedIn) {
      return next({ name: 'Login', query: { redirect: to.fullPath } })
    }

    // 检查角色权限
    if (to.meta.roles && !to.meta.roles.includes(userStore.currentUser.role)) {
      return next({ name: 'Home' })
    }
  }

  // 仅限游客访问的页面（如登录、注册）
  if (to.meta.guest && userStore.isLoggedIn) {
    return next({ name: 'Home' })
  }

  next()
})

export default router
