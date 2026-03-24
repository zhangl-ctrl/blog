<template>
  <div class="archive-page">
    <div class="container">
      <header class="page-header">
        <h1 class="page-title">归档</h1>
        <p class="page-desc">共 {{ totalCount }} 篇文章</p>
      </header>

      <div class="archive-list" v-if="archiveData.length > 0">
        <div
          v-for="yearData in archiveData"
          :key="yearData.year"
          class="year-section"
        >
          <h2 class="year-title">{{ yearData.year }} 年</h2>
          <div class="month-list">
            <div
              v-for="monthData in yearData.months"
              :key="monthData.month"
              class="month-section"
            >
              <h3 class="month-title">{{ monthData.month }} 月 ({{ monthData.posts.length }} 篇)</h3>
              <div class="post-list">
                <router-link
                  v-for="post in monthData.posts"
                  :key="post.id"
                  :to="`/post/${post.id}`"
                  class="post-item"
                >
                  <span class="post-date">{{ getDay(post.createdAt) }}日</span>
                  <span class="post-title">{{ post.title }}</span>
                  <div class="post-tags" v-if="post.tags && post.tags.length > 0">
                    <span v-for="tag in post.tags.slice(0, 2)" :key="tag" class="post-tag">{{ tag }}</span>
                  </div>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="empty-state" v-else>
        <p>暂无文章</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useArticleStore } from '../stores'

const articleStore = useArticleStore()

const posts = computed(() =>
  articleStore.articles.filter(a => a.status === 'published')
)

const totalCount = computed(() => posts.value.length)

const getDay = (dateStr) => {
  if (!dateStr) return '01'
  return dateStr.substring(8, 10)
}

const archiveData = computed(() => {
  const grouped = {}

  posts.value.forEach(post => {
    if (!post.createdAt) return

    const year = post.createdAt.substring(0, 4)
    const month = parseInt(post.createdAt.substring(5, 7))

    if (!grouped[year]) {
      grouped[year] = {}
    }
    if (!grouped[year][month]) {
      grouped[year][month] = []
    }
    grouped[year][month].push(post)
  })

  // 转换为数组格式
  const result = Object.keys(grouped)
    .sort((a, b) => b - a)
    .map(year => ({
      year: parseInt(year),
      months: Object.keys(grouped[year])
        .sort((a, b) => b - a)
        .map(month => ({
          month: parseInt(month),
          posts: grouped[year][month].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        }))
    }))

  return result
})

onMounted(async () => {
  await articleStore.loadArticles()
})
</script>

<style scoped>
.archive-page {
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

.archive-list {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.year-section {
  border-left: 2px solid var(--color-border);
  padding-left: 2rem;
  margin-left: 1rem;
}

.year-title {
  font-family: var(--font-serif);
  font-size: 1.75rem;
  color: #1a1a1a;
  margin-bottom: 1.5rem;
  position: relative;
}

.year-title::before {
  content: '';
  position: absolute;
  left: -2.4rem;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  background: var(--color-accent);
  border-radius: 50%;
}

.month-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.month-title {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 1rem;
  font-weight: 500;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.post-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: #fff;
  border: 1px solid var(--color-border);
  text-decoration: none;
  transition: all 0.3s ease;
}

.post-item:hover {
  border-color: var(--color-accent);
  transform: translateX(4px);
}

.post-date {
  font-size: 0.85rem;
  color: #999;
  min-width: 40px;
}

.post-title {
  flex: 1;
  color: #333;
  font-size: 0.95rem;
}

.post-tags {
  display: flex;
  gap: 0.5rem;
}

.post-tag {
  font-size: 0.7rem;
  padding: 0.15rem 0.4rem;
  background: #f5f5f5;
  color: #666;
  border-radius: 2px;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #999;
}
</style>
