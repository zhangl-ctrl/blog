/**
 * 文章 Store
 * 管理文章 CRUD、搜索等状态
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { articleDB, tagDB } from '../database'
import { useUserStore } from './user'

export const useArticleStore = defineStore('article', () => {
  // 状态
  const articles = ref([])
  const tags = ref([])
  const currentArticle = ref(null)
  const loading = ref(false)
  const searchKeyword = ref('')

  // 计算属性
  const publishedArticles = computed(() =>
    articles.value.filter(a => a.status === 'published')
  )

  const draftArticles = computed(() =>
    articles.value.filter(a => a.status === 'draft')
  )

  // 加载所有文章
  async function loadArticles() {
    loading.value = true
    try {
      articles.value = await articleDB.getAll()
      // 按创建时间倒序排列
      articles.value.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } finally {
      loading.value = false
    }
  }

  // 加载所有标签
  async function loadTags() {
    tags.value = await tagDB.getAll()
  }

  // 获取文章详情
  async function getArticleById(id) {
    loading.value = true
    try {
      currentArticle.value = await articleDB.getById(id)
      return currentArticle.value
    } finally {
      loading.value = false
    }
  }

  // 创建文章
  async function createArticle(articleData) {
    const userStore = useUserStore()
    loading.value = true
    try {
      const article = {
        ...articleData,
        authorId: userStore.currentUser.id,
        authorName: userStore.currentUser.username,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const id = await articleDB.create(article)
      await loadArticles()

      // 更新标签
      if (articleData.tags?.length) {
        await updateTags(articleData.tags)
      }

      return { id, ...article }
    } finally {
      loading.value = false
    }
  }

  // 更新文章
  async function updateArticle(id, articleData) {
    loading.value = true
    try {
      const existing = await articleDB.getById(id)
      if (!existing) {
        throw new Error('文章不存在')
      }

      const updated = {
        ...existing,
        ...articleData,
        updatedAt: new Date().toISOString()
      }

      await articleDB.update(id, updated)
      await loadArticles()

      // 更新标签
      if (articleData.tags?.length) {
        await updateTags(articleData.tags)
      }

      return updated
    } finally {
      loading.value = false
    }
  }

  // 删除文章
  async function deleteArticle(id) {
    loading.value = true
    try {
      await articleDB.delete(id)
      await loadArticles()
    } finally {
      loading.value = false
    }
  }

  // 搜索文章
  async function searchArticles(keyword) {
    loading.value = true
    try {
      searchKeyword.value = keyword
      if (!keyword.trim()) {
        return articles.value
      }
      return await articleDB.search(keyword)
    } finally {
      loading.value = false
    }
  }

  // 更新标签
  async function updateTags(articleTags) {
    for (const tagName of articleTags) {
      const existing = await tagDB.getByName(tagName)
      if (!existing) {
        await tagDB.create({
          name: tagName,
          createdAt: new Date().toISOString()
        })
      }
    }
    await loadTags()
  }

  // 获取用户创建的文章
  async function getArticlesByAuthor(authorId) {
    return await articleDB.getByAuthorId(authorId)
  }

  return {
    articles,
    tags,
    currentArticle,
    loading,
    searchKeyword,
    publishedArticles,
    draftArticles,
    loadArticles,
    loadTags,
    getArticleById,
    createArticle,
    updateArticle,
    deleteArticle,
    searchArticles,
    getArticlesByAuthor
  }
})
