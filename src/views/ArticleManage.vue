<template>
  <div class="article-manage">
    <n-card title="文章管理">
      <n-space vertical>
        <n-space justify="space-between">
          <n-space>
            <n-input v-model:value="searchKeyword" placeholder="搜索标题、内容、标签" clearable @keyup.enter="handleSearch" style="width: 300px" />
            <n-button @click="handleSearch">搜索</n-button>
          </n-space>
          <n-button type="primary" @click="goToEditor">新建文章</n-button>
        </n-space>

        <n-data-table
          :columns="columns"
          :data="displayArticles"
          :loading="loading"
          :pagination="pagination"
        />
      </n-space>
    </n-card>

    <!-- 删除确认弹窗 -->
    <n-modal v-model:show="showDeleteModal" preset="dialog" title="确认删除">
      <n-text>确定要删除这篇文章吗？此操作不可恢复。</n-text>
      <template #action>
        <n-button @click="showDeleteModal = false">取消</n-button>
        <n-button type="error" :loading="deleteLoading" @click="handleDelete">删除</n-button>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, h, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useArticleStore, useUserStore } from '../stores'

const router = useRouter()
const message = useMessage()
const articleStore = useArticleStore()
const userStore = useUserStore()

const searchKeyword = ref('')
const displayArticles = ref([])
const showDeleteModal = ref(false)
const deleteLoading = ref(false)
const deletingArticleId = ref(null)

const loading = computed(() => articleStore.loading)

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
    title: '标题',
    key: 'title',
    ellipsis: { tooltip: true }
  },
  {
    title: '作者',
    key: 'authorName'
  },
  {
    title: '状态',
    key: 'status',
    render(row) {
      return h('span', {
        style: { color: row.status === 'published' ? '#18a058' : '#f0a020' }
      }, row.status === 'published' ? '已发布' : '草稿')
    }
  },
  {
    title: '标签',
    key: 'tags',
    render(row) {
      if (!row.tags?.length) return '-'
      return h('n-space', { size: 4 }, () =>
        row.tags.map(tag => h('n-tag', { size: 'small' }, { default: () => tag }))
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
    width: 180,
    render(row) {
      return h('div', { class: 'action-buttons' }, [
        h('n-button', {
          size: 'small',
          onClick: () => router.push({ name: 'Post', params: { id: row.id } })
        }, { default: () => '查看' }),
        h('n-button', {
          size: 'small',
          onClick: () => router.push({ name: 'EditArticle', params: { id: row.id } })
        }, { default: () => '编辑' }),
        h('n-button', {
          size: 'small',
          type: 'error',
          onClick: () => openDeleteModal(row)
        }, { default: () => '删除' })
      ])
    }
  }
]

async function loadArticles() {
  await articleStore.loadArticles()
  displayArticles.value = articleStore.articles
}

function handleSearch() {
  if (!searchKeyword.value.trim()) {
    displayArticles.value = articleStore.articles
    return
  }
  displayArticles.value = articleStore.articles.filter(article => {
    const keyword = searchKeyword.value.toLowerCase()
    const titleMatch = article.title?.toLowerCase().includes(keyword)
    const contentMatch = article.content?.toLowerCase().includes(keyword)
    const tagMatch = article.tags?.some(tag => tag.toLowerCase().includes(keyword))
    return titleMatch || contentMatch || tagMatch
  })
}

function goToEditor() {
  router.push({ name: 'Editor' })
}

function openDeleteModal(article) {
  deletingArticleId.value = article.id
  showDeleteModal.value = true
}

async function handleDelete() {
  deleteLoading.value = true
  try {
    await articleStore.deleteArticle(deletingArticleId.value)
    message.success('删除成功')
    showDeleteModal.value = false
    loadArticles()
  } catch (error) {
    message.error(error.message)
  } finally {
    deleteLoading.value = false
  }
}

onMounted(() => {
  loadArticles()
})
</script>

<style scoped>
.article-manage {
  padding: 20px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}
</style>
