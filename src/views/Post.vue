<template>
  <div class="post-page">
    <div class="container">
      <article class="post" v-if="article">
        <router-link to="/" class="back-link-top">← 返回首页</router-link>

        <header class="post-header">
          <h1 class="post-title">{{ article.title }}</h1>
          <div class="post-meta" v-if="article.tags && article.tags.length > 0">
            <span v-for="tag in article.tags" :key="tag" class="post-tag">{{ tag }}</span>
          </div>
          <div class="post-author">
            <span>作者: {{ article.authorName }}</span>
            <span class="post-date">{{ formatDate(article.createdAt) }}</span>
          </div>
        </header>

        <div class="post-content" v-html="postHtml"></div>

        <div class="post-footer" v-if="canEdit">
          <div class="footer-links">
            <router-link :to="{ name: 'EditArticle', params: { id: article.id } }" class="edit-link">编辑文章</router-link>
            <a href="javascript:void(0)" class="delete-link" @click="handleDelete">删除文章</a>
          </div>
        </div>
      </article>

      <div v-else class="loading">
        <p>加载中...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { marked } from 'marked'
import { useArticleStore, useUserStore } from '../stores'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const articleStore = useArticleStore()
const userStore = useUserStore()

const article = ref(null)

// 检查当前用户是否有权限编辑
const canEdit = computed(() => {
  if (!userStore.isLoggedIn) return false
  // 管理员可以编辑所有文章
  if (userStore.isAdmin) return true
  // 作者可以编辑自己的文章
  if (article.value?.authorId === userStore.currentUser?.id) return true
  return false
})

const postHtml = computed(() => {
  if (!article.value) return ''
  return marked.parse(article.value.content || '')
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

async function loadArticle() {
  const id = parseInt(route.params.id)
  const data = await articleStore.getArticleById(id)

  if (!data) {
    message.error('文章不存在')
    router.push('/')
    return
  }

  // 如果是草稿且用户没有权限，跳转
  if (data.status === 'draft' && !canEdit.value) {
    message.error('无权访问')
    router.push('/')
    return
  }

  article.value = data
}

async function handleDelete() {
  if (!confirm('确定要删除这篇文章吗？此操作不可恢复。')) return

  try {
    await articleStore.deleteArticle(article.value.id)
    message.success('删除成功')
    router.push('/')
  } catch (error) {
    message.error(error.message)
  }
}

onMounted(async () => {
  window.scrollTo(0, 0)
  await loadArticle()
})
</script>

<style scoped>
.post-page {
  padding: 0 0 4rem;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 2rem;
}

.back-link-top {
  display: inline-block;
  color: #999;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
  margin-bottom: 1rem;
}

.back-link-top:hover {
  color: var(--color-accent);
}

.post {
  animation: fadeIn 0.6s ease-out;
}

.post-header {
  text-align: center;
  padding: 3rem 0;
}

.post-title {
  font-family: var(--font-serif);
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.post-meta {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.post-tag {
  font-size: 0.75rem;
  padding: 0.25rem 0.6rem;
  background: #f5f5f5;
  color: #666;
  border-radius: 3px;
}

.post-author {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  color: #999;
  font-size: 0.9rem;
}

.post-date {
  letter-spacing: 0.15em;
}

.post-content {
  font-size: 1.1rem;
  line-height: 1.9;
  color: #333;
}

.post-content :deep(h1) {
  font-family: var(--font-serif);
  font-size: 2rem;
  margin: 2.5rem 0 1.5rem;
  color: #1a1a1a;
}

.post-content :deep(h2) {
  font-family: var(--font-serif);
  font-size: 1.5rem;
  margin: 2rem 0 1rem;
  color: #1a1a1a;
}

.post-content :deep(h3) {
  font-size: 1.2rem;
  margin: 1.5rem 0 0.75rem;
  color: #333;
}

.post-content :deep(p) {
  margin-bottom: 1.5rem;
}

.post-content :deep(blockquote) {
  border-left: 3px solid var(--color-accent);
  padding-left: 1.5rem;
  margin: 2rem 0;
  font-style: italic;
  color: #666;
}

.post-content :deep(ul),
.post-content :deep(ol) {
  margin: 1rem 0 1.5rem 1.5rem;
}

.post-content :deep(li) {
  margin-bottom: 0.5rem;
}

.post-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1.5rem 0;
}

.post-content :deep(code) {
  background: #f5f5f5;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: 'SF Mono', 'Monaco', 'Menlo', monospace;
  font-size: 0.9em;
}

.post-content :deep(pre) {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  margin: 1.5rem 0;
}

.post-content :deep(pre code) {
  background: none;
  padding: 0;
}

.post-footer {
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-border);
}

.footer-links {
  display: flex;
  gap: 1.5rem;
}

.edit-link {
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.edit-link:hover {
  color: var(--color-accent);
}

.delete-link {
  color: #999;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
  cursor: pointer;
}

.delete-link:hover {
  color: #dc3545;
}

.loading {
  text-align: center;
  padding: 4rem;
  color: #999;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
