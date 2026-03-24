<template>
  <div class="home">
    <div class="container">
      <section class="hero">
        <h1 class="hero-title">墨迹</h1>
        <p class="hero-subtitle">用文字记录思考，用思考沉淀智慧</p>
      </section>

      <!-- 搜索和筛选 -->
      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索文章..."
          class="search-input"
          @input="handleSearch"
        />
        <div class="tags-filter" v-if="allTags.length > 0">
          <span
            v-for="tag in allTags"
            :key="tag"
            :class="['filter-tag', { active: selectedTag === tag }]"
            @click="toggleTag(tag)"
          >
            {{ tag }}
          </span>
          <span
            v-if="selectedTag"
            class="clear-tag"
            @click="selectedTag = ''; applyFilters()"
          >
            清除
          </span>
        </div>
      </div>

      <div class="posts" v-if="filteredPosts.length > 0">
        <article
          v-for="(post, index) in filteredPosts"
          :key="post.id"
          class="post-card"
          :style="{ animationDelay: `${index * 0.1}s` }"
          @click="goToPost(post.id)"
        >
          <div class="post-card-top">
            <span class="post-date">{{ formatDate(post.createdAt) }}</span>
            <div class="post-tags">
              <span v-for="tag in post.tags" :key="tag" class="post-tag">{{ tag }}</span>
            </div>
          </div>
          <div class="post-card-bottom">
            <div class="post-card-content">
              <h2 class="post-title">{{ post.title }}</h2>
              <p class="post-excerpt">{{ getExcerpt(post.content) }}</p>
              <span class="read-more">阅读全文 →</span>
            </div>
            <div class="post-card-cover" v-if="post.coverImage">
              <img :src="post.coverImage" alt="封面" />
            </div>
          </div>
        </article>
      </div>

      <div class="no-results" v-else>
        <p>没有找到匹配的文章</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useArticleStore } from '../stores'

const router = useRouter()
const articleStore = useArticleStore()

const searchQuery = ref('')
const selectedTag = ref('')
const allArticles = ref([])

// 获取所有标签
const allTags = computed(() => {
  const tags = new Set()
  allArticles.value.forEach(post => {
    if (post.tags && post.tags.length > 0) {
      post.tags.forEach(tag => tags.add(tag))
    }
  })
  return Array.from(tags).sort()
})

// 筛选后的文章
const filteredPosts = computed(() => {
  let result = allArticles.value

  // 过滤掉草稿
  result = result.filter(post => post.status === 'published')

  // 按标签筛选
  if (selectedTag.value) {
    result = result.filter(post =>
      post.tags && post.tags.includes(selectedTag.value)
    )
  }

  return result
})

function applyFilters() {
  let result = articleStore.articles

  // 过滤掉草稿
  result = result.filter(post => post.status === 'published')

  // 按标签筛选
  if (selectedTag.value) {
    result = result.filter(post =>
      post.tags && post.tags.includes(selectedTag.value)
    )
  }

  // 按搜索词筛选
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(post =>
      post.title?.toLowerCase().includes(query) ||
      post.content?.toLowerCase().includes(query) ||
      (post.tags && post.tags.some(tag => tag.toLowerCase().includes(query)))
    )
  }

  allArticles.value = result
}

function handleSearch() {
  applyFilters()
}

// 切换标签筛选
const toggleTag = (tag) => {
  if (selectedTag.value === tag) {
    selectedTag.value = ''
  } else {
    selectedTag.value = tag
  }
  applyFilters()
}

const getExcerpt = (content) => {
  if (!content) return ''
  // 移除 markdown 标记
  const text = content.replace(/[#*`\[\]]/g, '')
  return text.length > 150 ? text.substring(0, 150) + '...' : text
}

onMounted(async () => {
  await articleStore.loadArticles()
  await articleStore.loadTags()
  allArticles.value = articleStore.articles
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
}

const goToPost = (id) => {
  router.push(`/post/${id}`)
}
</script>

<style scoped>
.home {
  padding: 0 0 4rem;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 2rem;
}

.hero {
  text-align: center;
  padding: 4rem 0 5rem;
}

.hero-title {
  font-family: var(--font-serif);
  font-size: 5rem;
  font-weight: 400;
  color: #1a1a1a;
  letter-spacing: 0.3em;
  margin-bottom: 1rem;
  animation: fadeInUp 0.8s ease-out;
}

.hero-subtitle {
  font-size: 1.1rem;
  color: #888;
  font-weight: 300;
  letter-spacing: 0.15em;
  animation: fadeInUp 0.8s ease-out 0.2s backwards;
}

.search-bar {
  margin-bottom: 3rem;
}

.search-input {
  width: 100%;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  border: 1px solid var(--color-border);
  background: #fff;
  outline: none;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  border-color: var(--color-accent);
}

.tags-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
  align-items: center;
}

.filter-tag {
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  color: #666;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-tag:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.filter-tag.active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #fff;
}

.clear-tag {
  font-size: 0.85rem;
  color: #999;
  cursor: pointer;
  padding: 0.4rem 0.8rem;
}

.clear-tag:hover {
  color: #666;
}

.posts {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.post-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
  background: #fff;
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeInUp 0.6s ease-out backwards;
  position: relative;
  overflow: hidden;
}

.post-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.post-card-bottom {
  display: flex;
  gap: 2rem;
}

.post-card-content {
  flex: 1;
  min-width: 0;
}

.post-card-cover {
  width: 200px;
  height: 140px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
}

.post-card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 768px) {
  .post-card-bottom {
    flex-direction: column;
  }

  .post-card-cover {
    width: 100%;
    height: 180px;
  }
}

.post-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: var(--color-accent);
  transform: scaleY(0);
  transition: transform 0.4s ease;
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.06);
}

.post-card:hover::before {
  transform: scaleY(1);
}

.post-meta {
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.post-tags {
  display: flex;
  gap: 0.5rem;
}

.post-tag {
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  background: #f5f5f5;
  color: #666;
  border-radius: 3px;
}

.post-date {
  font-size: 0.85rem;
  color: #999;
  letter-spacing: 0.1em;
}

.post-title {
  font-family: var(--font-serif);
  font-size: 1.75rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.post-excerpt {
  color: #666;
  line-height: 1.8;
  margin-bottom: 1.5rem;
}

.read-more {
  font-size: 0.9rem;
  color: var(--color-accent);
  letter-spacing: 0.05em;
  transition: all 0.3s ease;
}

.post-card:hover .read-more {
  letter-spacing: 0.1em;
}

.no-results {
  text-align: center;
  padding: 4rem 2rem;
  color: #999;
}

@keyframes fadeInUp {
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
