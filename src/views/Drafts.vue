<template>
  <div class="drafts-page">
    <div class="container">
      <header class="page-header">
        <h1 class="page-title">草稿箱</h1>
        <p class="page-desc">这里保存着你尚未发布的文章</p>
      </header>

      <div class="drafts-list" v-if="drafts.length > 0">
        <div
          v-for="draft in drafts"
          :key="draft.id"
          class="draft-card"
        >
          <div class="draft-info">
            <h3 class="draft-title">{{ draft.title || '无标题' }}</h3>
            <p class="draft-excerpt">{{ getExcerpt(draft.content) }}</p>
            <div class="draft-meta">
              <span class="draft-date">保存于 {{ formatDate(draft.updatedAt || draft.createdAt) }}</span>
              <span v-if="draft.tags && draft.tags.length > 0" class="draft-tags">
                <span v-for="tag in draft.tags" :key="tag" class="tag">{{ tag }}</span>
              </span>
            </div>
          </div>
          <div class="draft-actions">
            <button class="btn btn-primary" @click="editDraft(draft.id)">编辑</button>
            <button class="btn btn-success" @click="publishDraft(draft)">发布</button>
            <button class="btn btn-danger" @click="deleteDraft(draft.id)">删除</button>
          </div>
        </div>
      </div>

      <div class="empty-state" v-else>
        <p>草稿箱是空的</p>
        <router-link to="/editor" class="btn btn-primary">开始写文章</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useArticleStore, useUserStore } from '../stores'

const router = useRouter()
const message = useMessage()
const articleStore = useArticleStore()
const userStore = useUserStore()

const drafts = computed(() => {
  if (userStore.isAdmin) {
    return articleStore.articles.filter(a => a.status === 'draft')
  }
  return articleStore.articles.filter(
    a => a.status === 'draft' && a.authorId === userStore.currentUser?.id
  )
})

onMounted(async () => {
  if (!userStore.isLoggedIn) {
    message.warning('请先登录')
    router.push({ name: 'Login' })
    return
  }
  await articleStore.loadArticles()
})

const getExcerpt = (content) => {
  if (!content) return '暂无内容'
  return content.substring(0, 100).replace(/[#*`>\[\]]/g, '').trim() + '...'
}

const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const editDraft = (id) => {
  router.push({ name: 'EditArticle', params: { id } })
}

const publishDraft = async (draft) => {
  if (!draft.title) {
    message.warning('请先填写文章标题')
    return
  }
  if (!draft.content) {
    message.warning('请先填写文章内容')
    return
  }

  try {
    await articleStore.updateArticle(draft.id, {
      ...draft,
      status: 'published'
    })
    message.success('文章已发布')
    await articleStore.loadArticles()
  } catch (error) {
    message.error(error.message)
  }
}

const deleteDraft = async (id) => {
  if (!confirm('确定要删除这篇草稿吗？此操作不可恢复。')) return

  try {
    await articleStore.deleteArticle(id)
    message.success('草稿已删除')
  } catch (error) {
    message.error(error.message)
  }
}
</script>

<style scoped>
.drafts-page {
  padding: 0 0 4rem;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 2rem;
}

.page-header {
  text-align: center;
  padding: 3rem 0;
}

.page-title {
  font-family: var(--font-serif);
  font-size: 2.5rem;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.page-desc {
  color: #999;
  font-size: 1rem;
}

.drafts-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.draft-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: #fff;
  border: 1px solid var(--color-border);
  gap: 2rem;
}

.draft-info {
  flex: 1;
  min-width: 0;
}

.draft-title {
  font-family: var(--font-serif);
  font-size: 1.25rem;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.draft-excerpt {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 0.75rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.draft-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.draft-date {
  font-size: 0.85rem;
  color: #999;
}

.draft-tags {
  display: flex;
  gap: 0.5rem;
}

.tag {
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  background: #f5f5f5;
  color: #666;
  border-radius: 3px;
}

.draft-actions {
  display: flex;
  gap: 0.75rem;
  flex-shrink: 0;
}

.btn {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 4px;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: #1a1a1a;
  color: #fff;
}

.btn-primary:hover {
  background: #333;
}

.btn-success {
  background: #28a745;
  color: #fff;
}

.btn-success:hover {
  background: #218838;
}

.btn-danger {
  background: #fff;
  color: #dc3545;
  border: 1px solid #dc3545;
}

.btn-danger:hover {
  background: #dc3545;
  color: #fff;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #999;
}

.empty-state p {
  margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
  .draft-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .draft-actions {
    width: 100%;
    justify-content: flex-end;
    margin-top: 1rem;
  }
}
</style>
