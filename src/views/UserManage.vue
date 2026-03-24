<template>
  <div class="user-manage">
    <n-card title="用户管理">
      <n-space vertical>
        <n-space justify="space-between">
          <n-text>共 {{ users.length }} 个用户</n-text>
          <n-button @click="loadUsers">
            刷新
          </n-button>
        </n-space>

        <n-data-table
          :columns="columns"
          :data="users"
          :loading="loading"
          :pagination="pagination"
        />
      </n-space>
    </n-card>

    <!-- 角色编辑弹窗 -->
    <n-modal v-model:show="showRoleModal" preset="dialog" title="修改用户角色">
      <n-form-item label="选择角色">
        <n-select v-model:value="selectedRole" :options="roleOptions" />
      </n-form-item>
      <template #action>
        <n-button @click="showRoleModal = false">取消</n-button>
        <n-button type="primary" :loading="submitLoading" @click="handleUpdateRole">确定</n-button>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, h, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { useUserStore } from '../stores'

const message = useMessage()
const userStore = useUserStore()

const loading = computed(() => userStore.loading)
const users = computed(() => userStore.users)

const showRoleModal = ref(false)
const selectedRole = ref('')
const editingUserId = ref(null)
const submitLoading = ref(false)

const roleOptions = [
  { label: '普通用户', value: 'user' },
  { label: '编辑', value: 'editor' },
  { label: '管理员', value: 'admin' },
  { label: '超级管理员', value: 'super_admin' }
]

const pagination = {
  pageSize: 10
}

const columns = [
  {
    title: 'ID',
    key: 'id',
    width: 60
  },
  {
    title: '用户名',
    key: 'username'
  },
  {
    title: '角色',
    key: 'role',
    render(row) {
      const roleMap = {
        user: '普通用户',
        editor: '编辑',
        admin: '管理员',
        super_admin: '超级管理员'
      }
      return roleMap[row.role] || row.role
    }
  },
  {
    title: '状态',
    key: 'status',
    render(row) {
      return h('span', { style: { color: row.status === 'active' ? '#18a058' : '#d03050' } },
        row.status === 'active' ? '正常' : '禁用'
      )
    }
  },
  {
    title: '创建时间',
    key: 'createdAt',
    render(row) {
      return new Date(row.createdAt).toLocaleString('zh-CN')
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    render(row) {
      return h('div', { class: 'action-buttons' }, [
        !row.isSuperAdmin && h('n-button', {
          size: 'small',
          onClick: () => openRoleModal(row)
        }, { default: () => '修改角色' }),
        !row.isSuperAdmin && h('n-button', {
          size: 'small',
          type: row.status === 'active' ? 'error' : 'success',
          onClick: () => handleToggleStatus(row)
        }, { default: () => row.status === 'active' ? '禁用' : '启用' })
      ])
    }
  }
]

// 扩展用户数据，标记超级管理员
const enhancedUsers = computed(() => {
  return users.value.map(u => ({
    ...u,
    isSuperAdmin: u.role === 'super_admin'
  }))
})

function loadUsers() {
  userStore.loadUsers()
}

function openRoleModal(user) {
  editingUserId.value = user.id
  selectedRole.value = user.role
  showRoleModal.value = true
}

async function handleUpdateRole() {
  if (!selectedRole.value) {
    message.warning('请选择角色')
    return
  }

  submitLoading.value = true
  try {
    await userStore.updateUserRole(editingUserId.value, selectedRole.value)
    message.success('角色更新成功')
    showRoleModal.value = false
  } catch (error) {
    message.error(error.message)
  } finally {
    submitLoading.value = false
  }
}

async function handleToggleStatus(user) {
  try {
    await userStore.toggleUserStatus(user.id)
    message.success(user.status === 'active' ? '已禁用' : '已启用')
  } catch (error) {
    message.error(error.message)
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.user-manage {
  padding: 20px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}
</style>
