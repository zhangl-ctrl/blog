/**
 * IndexedDB 数据库封装
 * 提供用户、文章等数据的存储和查询
 */
import { openDB } from 'idb'

const DB_NAME = 'blog-system'
const DB_VERSION = 1

// 初始化数据库
const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    // 用户表
    if (!db.objectStoreNames.contains('users')) {
      const userStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true })
      userStore.createIndex('username', 'username', { unique: true })
    }

    // 文章表
    if (!db.objectStoreNames.contains('articles')) {
      const articleStore = db.createObjectStore('articles', { keyPath: 'id', autoIncrement: true })
      articleStore.createIndex('title', 'title')
      articleStore.createIndex('authorId', 'authorId')
      articleStore.createIndex('tags', 'tags', { multiEntry: true })
      articleStore.createIndex('createdAt', 'createdAt')
      articleStore.createIndex('status', 'status')
    }

    // 标签表
    if (!db.objectStoreNames.contains('tags')) {
      const tagStore = db.createObjectStore('tags', { keyPath: 'id', autoIncrement: true })
      tagStore.createIndex('name', 'name', { unique: true })
    }
  }
})

// 用户操作
export const userDB = {
  // 获取所有用户
  async getAll() {
    const db = await dbPromise
    return db.getAll('users')
  },

  // 根据 ID 获取用户
  async getById(id) {
    const db = await dbPromise
    return db.get('users', id)
  },

  // 根据用户名获取用户
  async getByUsername(username) {
    const db = await dbPromise
    const index = db.transaction('users').store.index('username')
    return index.get(username)
  },

  // 创建用户
  async create(user) {
    const db = await dbPromise
    return db.add('users', user)
  },

  // 更新用户
  async update(id, user) {
    const db = await dbPromise
    return db.put('users', { ...user, id })
  },

  // 删除用户
  async delete(id) {
    const db = await dbPromise
    return db.delete('users', id)
  }
}

// 文章操作
export const articleDB = {
  // 获取所有文章
  async getAll() {
    const db = await dbPromise
    return db.getAll('articles')
  },

  // 根据 ID 获取文章
  async getById(id) {
    const db = await dbPromise
    return db.get('articles', id)
  },

  // 根据作者 ID 获取文章
  async getByAuthorId(authorId) {
    const db = await dbPromise
    const index = db.transaction('articles').store.index('authorId')
    return index.getAll(authorId)
  },

  // 根据状态获取文章
  async getByStatus(status) {
    const db = await dbPromise
    const index = db.transaction('articles').store.index('status')
    return index.getAll(status)
  },

  // 搜索文章
  async search(keyword) {
    const db = await dbPromise
    const allArticles = await db.getAll('articles')
    const lowerKeyword = keyword.toLowerCase()

    return allArticles.filter(article => {
      const titleMatch = article.title?.toLowerCase().includes(lowerKeyword)
      const contentMatch = article.content?.toLowerCase().includes(lowerKeyword)
      const tagMatch = article.tags?.some(tag => tag.toLowerCase().includes(lowerKeyword))
      return titleMatch || contentMatch || tagMatch
    })
  },

  // 创建文章
  async create(article) {
    const db = await dbPromise
    return db.add('articles', article)
  },

  // 更新文章
  async update(id, article) {
    const db = await dbPromise
    return db.put('articles', { ...article, id })
  },

  // 删除文章
  async delete(id) {
    const db = await dbPromise
    return db.delete('articles', id)
  }
}

// 标签操作
export const tagDB = {
  // 获取所有标签
  async getAll() {
    const db = await dbPromise
    return db.getAll('tags')
  },

  // 根据名称获取标签
  async getByName(name) {
    const db = await dbPromise
    const index = db.transaction('tags').store.index('name')
    return index.get(name)
  },

  // 创建标签
  async create(tag) {
    const db = await dbPromise
    return db.add('tags', tag)
  },

  // 删除标签
  async delete(id) {
    const db = await dbPromise
    return db.delete('tags', id)
  }
}

// 初始化预设数据
export async function initPresetData() {
  const db = await dbPromise

  // 检查是否已有用户
  const existingUsers = await db.getAll('users')
  if (existingUsers.length > 0) {
    return
  }

  // 创建超级管理员
  await db.add('users', {
    username: 'admin',
    password: '123456',
    role: 'super_admin',
    status: 'active',
    createdAt: new Date().toISOString()
  })

  console.log('Preset data initialized: admin user created')
}
