<template>
  <div class="login-container">
    <n-card class="login-card" title="登录">
      <n-form ref="formRef" :model="formData" :rules="rules">
        <n-form-item path="username" label="用户名">
          <n-input v-model:value="formData.username" placeholder="请输入用户名" />
        </n-form-item>
        <n-form-item path="password" label="密码">
          <n-input v-model:value="formData.password" type="password" placeholder="请输入密码" />
        </n-form-item>
        <n-form-item>
          <n-button type="primary" block :loading="loading" @click="handleLogin">
            登录
          </n-button>
        </n-form-item>
      </n-form>
      <div class="login-footer">
        <n-text>还没有账号？</n-text>
        <n-button text type="primary" @click="goToRegister">立即注册</n-button>
      </div>
    </n-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useUserStore } from '../stores'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const userStore = useUserStore()

const formRef = ref(null)
const loading = ref(false)
const formData = ref({
  username: '',
  password: ''
})

const rules = {
  username: { required: true, message: '请输入用户名', trigger: 'blur' },
  password: { required: true, message: '请输入密码', trigger: 'blur' }
}

async function handleLogin() {
  try {
    await formRef.value?.validate()
    loading.value = true

    await userStore.login(formData.value.username, formData.value.password)
    message.success('登录成功')

    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (error) {
    message.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}

function goToRegister() {
  router.push({ name: 'Register' })
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.login-card {
  width: 400px;
}

.login-footer {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}
</style>
