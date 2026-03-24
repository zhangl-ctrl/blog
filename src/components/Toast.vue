<template>
  <Teleport to="body">
    <!-- Toast 提示 -->
    <Transition name="toast">
      <div v-if="visible" :class="['toast', `toast-${type}`]">
        <span class="toast-icon">{{ icon }}</span>
        <span class="toast-message">{{ message }}</span>
      </div>
    </Transition>

    <!-- 确认对话框 -->
    <Transition name="modal">
      <div v-if="confirmVisible" class="confirm-overlay" @click.self="handleCancel">
        <div class="confirm-dialog">
          <div class="confirm-header">
            <span class="confirm-icon">?</span>
            <span class="confirm-title">{{ confirmTitle }}</span>
          </div>
          <p class="confirm-message">{{ confirmMessage }}</p>
          <div class="confirm-actions">
            <button class="confirm-btn confirm-btn-cancel" @click="handleCancel">取消</button>
            <button class="confirm-btn confirm-btn-confirm" @click="handleConfirm">确定</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const visible = ref(false)
const message = ref('')
const type = ref('success') // success, error, warning, info

const iconMap = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ'
}

const icon = ref('')

// 确认对话框相关
const confirmVisible = ref(false)
const confirmTitle = ref('确认')
const confirmMessage = ref('')
let confirmResolve = null

let timer = null

const show = (msg, msgType = 'success', duration = 3000) => {
  if (timer) clearTimeout(timer)

  message.value = msg
  type.value = msgType
  icon.value = iconMap[msgType]
  visible.value = true

  timer = setTimeout(() => {
    visible.value = false
  }, duration)
}

const confirm = (message, title = '确认') => {
  confirmMessage.value = message
  confirmTitle.value = title
  confirmVisible.value = true

  return new Promise((resolve) => {
    confirmResolve = resolve
  })
}

const handleConfirm = () => {
  confirmVisible.value = false
  if (confirmResolve) confirmResolve(true)
}

const handleCancel = () => {
  confirmVisible.value = false
  if (confirmResolve) confirmResolve(false)
}

defineExpose({ show, confirm })
</script>

<style scoped>
.toast {
  position: fixed;
  top: 2rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 1rem 1.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  backdrop-filter: blur(10px);
}

.toast-success {
  background: rgba(34, 139, 34, 0.95);
  color: #fff;
}

.toast-error {
  background: rgba(220, 53, 69, 0.95);
  color: #fff;
}

.toast-warning {
  background: rgba(255, 193, 7, 0.95);
  color: #333;
}

.toast-info {
  background: rgba(13, 110, 253, 0.95);
  color: #fff;
}

.toast-icon {
  font-size: 1.1rem;
  font-weight: 600;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

/* 确认对话框样式 */
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.confirm-dialog {
  background: #fff;
  padding: 2rem;
  min-width: 320px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.confirm-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.confirm-icon {
  width: 32px;
  height: 32px;
  background: #1a1a1a;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 600;
}

.confirm-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
}

.confirm-message {
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.confirm-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.confirm-btn {
  padding: 0.6rem 1.25rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.confirm-btn-cancel {
  background: #fff;
  color: #666;
  border: 1px solid #ddd;
}

.confirm-btn-cancel:hover {
  border-color: #999;
}

.confirm-btn-confirm {
  background: #1a1a1a;
  color: #fff;
}

.confirm-btn-confirm:hover {
  background: #333;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .confirm-dialog,
.modal-leave-to .confirm-dialog {
  transform: scale(0.9);
}
</style>
