<template>
  <div class="register-container">
    <n-card class="register-card" title="注册">
      <n-form ref="formRef" :model="formData" :rules="rules">
        <n-form-item path="username" label="用户名">
          <n-input v-model:value="formData.username" placeholder="请输入用户名" />
        </n-form-item>
        <n-form-item path="password" label="密码">
          <n-input v-model:value="formData.password" type="password" placeholder="请输入密码" />
        </n-form-item>
        <n-form-item path="confirmPassword" label="确认密码">
          <n-input v-model:value="formData.confirmPassword" type="password" placeholder="请确认密码" />
        </n-form-item>
        <n-form-item>
          <n-button type="primary" block :loading="loading" @click="handleRegister">
            注册
          </n-button>
        </n-form-item>
      </n-form>
      <div class="register-footer">
        <n-text>已有账号？</n-text>
        <n-button text type="primary" @click="goToLogin">立即登录</n-button>
      </div>
    </n-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useUserStore } from '../stores'

const router = useRouter()
const message = useMessage()
const userStore = useUserStore()

const formRef = ref(null)
const loading = ref(false)
const formData = ref({
  username: '',
  password: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value) => {
  if (value !== formData.value.password) {
    return new Error('两次输入的密码不一致')
  }
  return true
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3-20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

async function handleRegister() {
  try {
    await formRef.value?.validate()
    loading.value = true

    await userStore.register(formData.value.username, formData.value.password)
    message.success('注册成功，请登录')

    router.push({ name: 'Login' })
  } catch (error) {
    message.error(error.message || '注册失败')
  } finally {
    loading.value = false
  }
}

function goToLogin() {
  router.push({ name: 'Login' })
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.register-card {
  width: 400px;
}

.register-footer {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}
</style>
