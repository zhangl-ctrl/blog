/**
 * 用户 Store
 * 管理用户登录、注册、权限等状态
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userDB, initPresetData } from '../database'

export const useUserStore = defineStore('user', () => {
  // 状态
  const currentUser = ref(null)
  const users = ref([])
  const loading = ref(false)

  // 计算属性
  const isLoggedIn = computed(() => !!currentUser.value)
  const isAdmin = computed(() => currentUser.value?.role === 'admin' || currentUser.value?.role === 'super_admin')
  const isSuperAdmin = computed(() => currentUser.value?.role === 'super_admin')
  const isEditor = computed(() => ['editor', 'admin', 'super_admin'].includes(currentUser.value?.role))

  // 初始化
  async function init() {
    await initPresetData()
    await loadUsers()

    // 从 localStorage 恢复登录状态
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      currentUser.value = JSON.parse(savedUser)
    }
  }

  // 加载所有用户
  async function loadUsers() {
    loading.value = true
    try {
      users.value = await userDB.getAll()
    } finally {
      loading.value = false
    }
  }

  // 注册
  async function register(username, password) {
    loading.value = true
    try {
      // 检查用户名是否已存在
      const existingUser = await userDB.getByUsername(username)
      if (existingUser) {
        throw new Error('用户名已存在')
      }

      // 创建新用户
      const user = {
        username,
        password,
        role: 'user',
        status: 'active',
        createdAt: new Date().toISOString()
      }

      const id = await userDB.create(user)
      return { id, ...user }
    } finally {
      loading.value = false
    }
  }

  // 登录
  async function login(username, password) {
    loading.value = true
    try {
      const user = await userDB.getByUsername(username)
      if (!user) {
        throw new Error('用户不存在')
      }
      if (user.password !== password) {
        throw new Error('密码错误')
      }
      if (user.status === 'disabled') {
        throw new Error('账号已被禁用')
      }

      currentUser.value = user
      localStorage.setItem('currentUser', JSON.stringify(user))
      return user
    } finally {
      loading.value = false
    }
  }

  // 登出
  function logout() {
    currentUser.value = null
    localStorage.removeItem('currentUser')
  }

  // 修改用户角色
  async function updateUserRole(userId, role) {
    loading.value = true
    try {
      const user = await userDB.getById(userId)
      if (!user) {
        throw new Error('用户不存在')
      }

      // 超级管理员不能被修改
      if (user.role === 'super_admin') {
        throw new Error('不能修改超级管理员角色')
      }

      await userDB.update(userId, { ...user, role })
      await loadUsers()
    } finally {
      loading.value = false
    }
  }

  // 启用/禁用用户
  async function toggleUserStatus(userId) {
    loading.value = true
    try {
      const user = await userDB.getById(userId)
      if (!user) {
        throw new Error('用户不存在')
      }

      // 超级管理员不能被禁用
      if (user.role === 'super_admin') {
        throw new Error('不能禁用超级管理员')
      }

      const newStatus = user.status === 'active' ? 'disabled' : 'active'
      await userDB.update(userId, { ...user, status: newStatus })
      await loadUsers()
    } finally {
      loading.value = false
    }
  }

  // 检查权限
  function hasPermission(requiredRoles) {
    if (!currentUser.value) return false
    return requiredRoles.includes(currentUser.value.role)
  }

  return {
    currentUser,
    users,
    loading,
    isLoggedIn,
    isAdmin,
    isSuperAdmin,
    isEditor,
    init,
    loadUsers,
    register,
    login,
    logout,
    updateUserRole,
    toggleUserStatus,
    hasPermission
  }
})
