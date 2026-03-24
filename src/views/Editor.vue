<template>
  <div class="editor-page">
    <div class="editor-header">
      <div class="container">
        <div class="header-top">
          <input
            v-model="article.title"
            type="text"
            placeholder="请输入文章标题..."
            class="title-input"
          />
        </div>
        <div class="header-bottom">
          <!-- 主图区域 -->
          <div class="cover-section">
            <span class="cover-label">主图：</span>
            <div class="cover-input-wrapper">
              <input
                v-model="article.coverImage"
                type="text"
                placeholder="输入图片链接或点击上传..."
                class="cover-input"
              />
              <label class="cover-upload-btn">
                <input type="file" accept="image/*" @change="handleCoverUpload" hidden />
                上传
              </label>
            </div>
            <div class="cover-preview" v-if="article.coverImage">
              <img :src="article.coverImage" alt="封面预览" />
            </div>
          </div>

          <div class="tags-section">
            <div class="tags-selected">
              <span class="tags-label">标签：</span>
              <div class="tags-list">
                <span v-for="(tag, index) in article.tags" :key="index" class="tag">
                  {{ tag }}
                  <span class="tag-remove" @click="removeTag(index)">×</span>
                </span>
                <input
                  v-model="tagInput"
                  type="text"
                  placeholder="自定义标签..."
                  class="tag-input"
                  @keydown.enter="addCustomTag"
                  @keydown.comma.prevent="addCustomTag"
                />
              </div>
            </div>
            <div class="tags-preset">
              <span class="preset-label">常用标签：</span>
              <div class="preset-tags">
                <span
                  v-for="tag in presetTags"
                  :key="tag"
                  :class="['preset-tag', { active: article.tags.includes(tag) }]"
                  @click="toggleTag(tag)"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="editor-container">
      <div class="editor-pane">
        <div class="pane-header">
          <span>编辑</span>
        </div>
        <textarea
          v-model="article.content"
          placeholder="在这里开始写文章...

支持 Markdown 语法：
# 标题
## 二级标题
**加粗** *斜体*
> 引用
- 列表项
1. 有序列表
[链接](url)
![图片](url)
```代码块```
"
          class="editor-textarea"
        ></textarea>
      </div>

      <div class="preview-pane">
        <div class="pane-header">
          <span>预览</span>
        </div>
        <div class="preview-content" v-html="previewHtml"></div>
      </div>
    </div>

    <!-- 底部工具栏 -->
    <div class="editor-footer">
      <div class="container">
        <div class="actions">
          <button class="btn btn-secondary" @click="saveDraft">保存草稿</button>
          <button class="btn btn-outline" @click="exportMarkdown">导出 MD</button>
          <button class="btn btn-primary" @click="publishArticle">发布文章</button>
        </div>
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

const article = ref({
  id: null,
  title: '',
  content: '',
  tags: [],
  coverImage: '',
  status: 'draft'
})
const tagInput = ref('')
const isEditing = ref(false)

// 预设标签列表
const presetTags = [
  '前端', '后端', 'JavaScript', 'TypeScript', 'Vue', 'React',
  'Node.js', 'Python', 'Go', 'Java', '算法', '数据结构',
  '数据库', 'Redis', 'Git', 'Docker', 'Linux', '设计模式',
  '性能优化', '面试', '职场', '个人成长', '读书笔记', '生活'
]

// 处理封面上传
const handleCoverUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    article.value.coverImage = e.target.result
    message.success('封面上传成功')
  }
  reader.onerror = () => {
    message.error('封面上传失败')
  }
  reader.readAsDataURL(file)
}

// 切换预设标签
const toggleTag = (tag) => {
  if (article.value.tags.includes(tag)) {
    article.value.tags = article.value.tags.filter(t => t !== tag)
  } else {
    article.value.tags.push(tag)
  }
}

// 添加自定义标签
const addCustomTag = () => {
  const tags = tagInput.value.split(',').map(t => t.trim()).filter(t => t)
  tags.forEach(tag => {
    if (!article.value.tags.includes(tag)) {
      article.value.tags.push(tag)
    }
  })
  tagInput.value = ''
}

// 移除标签
const removeTag = (index) => {
  article.value.tags.splice(index, 1)
}

// 配置 marked
marked.setOptions({
  breaks: true,
  gfm: true
})

const previewHtml = computed(() => {
  if (!article.value.content) return '<div class="placeholder">预览内容...</div>'
  return marked.parse(article.value.content)
})

// 检查是否是编辑模式
onMounted(async () => {
  window.scrollTo(0, 0)

  // 检查用户是否登录
  if (!userStore.isLoggedIn) {
    message.warning('请先登录')
    router.push({ name: 'Login' })
    return
  }

  const articleId = route.params.id

  // 编辑模式
  if (articleId) {
    const data = await articleStore.getArticleById(parseInt(articleId))
    if (data) {
      // 检查权限
      if (!userStore.isAdmin && data.authorId !== userStore.currentUser?.id) {
        message.error('无权编辑此文章')
        router.push('/')
        return
      }

      article.value = {
        id: data.id,
        title: data.title || '',
        content: data.content || '',
        tags: data.tags || [],
        coverImage: data.coverImage || '',
        status: data.status || 'draft'
      }
      isEditing.value = true
    } else {
      message.error('文章不存在')
      router.push('/editor')
    }
    return
  }

  // 从 localStorage 恢复草稿
  const draft = localStorage.getItem('article_draft')
  if (draft) {
    try {
      article.value = JSON.parse(draft)
    } catch (e) {
      console.error('加载草稿失败', e)
    }
  }
})

// 保存草稿
const saveDraft = async () => {
  if (!article.value.title) {
    message.warning('请先输入文章标题')
    return
  }

  try {
    // 保存到 localStorage
    localStorage.setItem('article_draft', JSON.stringify(article.value))

    if (isEditing.value && article.value.id) {
      await articleStore.updateArticle(article.value.id, {
        ...article.value,
        status: 'draft'
      })
      message.success('草稿已更新')
    } else {
      const result = await articleStore.createArticle({
        ...article.value,
        status: 'draft'
      })
      article.value.id = result.id
      isEditing.value = true
      message.success('草稿已保存')
    }

    // 清除当前编辑器内容
    setTimeout(() => {
      router.push('/drafts')
    }, 1000)
  } catch (error) {
    message.error(error.message || '保存失败')
  }
}

// 导出 Markdown
const exportMarkdown = () => {
  if (!article.value.title) {
    message.warning('请先输入文章标题')
    return
  }
  if (!article.value.content) {
    message.warning('请先输入文章内容')
    return
  }

  const date = new Date().toISOString().split('T')[0]
  const mdContent = `---
title: "${article.value.title}"
date: "${date}"
tags: [${article.value.tags.map(t => `"${t}"`).join(', ')}]
---

${article.value.content}`

  const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  const filename = article.value.title
    .replace(/[<>:"/\\|?*]/g, '')
    .trim()
    .substring(0, 50) || 'article'
  link.download = `${filename}.md`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  message.success(`已导出为 ${filename}.md`)
}

// 发布文章
const publishArticle = async () => {
  if (!article.value.title) {
    message.warning('请先输入文章标题')
    return
  }
  if (!article.value.content) {
    message.warning('请先输入文章内容')
    return
  }

  try {
    if (isEditing.value && article.value.id) {
      await articleStore.updateArticle(article.value.id, {
        ...article.value,
        status: 'published'
      })
      message.success('文章已更新')
    } else {
      await articleStore.createArticle({
        ...article.value,
        status: 'published'
      })
      message.success('文章已发布')
    }

    // 清除草稿
    localStorage.removeItem('article_draft')

    setTimeout(() => {
      router.push('/')
    }, 1500)
  } catch (error) {
    message.error(error.message || '发布失败')
  }
}
</script>

<style scoped>
.editor-page {
  min-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
}

.editor-footer {
  padding: 1rem 0;
  background: #fff;
  max-width: 1400px;
  margin: 20px auto 0;
  width: 100%;
}

.editor-footer .container {
  display: flex;
  justify-content: center;
}

.editor-header {
  padding: 1.5rem 0;
  background: #fff;
  max-width: 1400px;
  margin: 0 auto;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
}

.header-top {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 0.5rem 0;
}

.header-bottom {
  padding: 0.75rem 0;
  border-top: 1px solid var(--color-border);
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cover-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.cover-label {
  color: #999;
  font-size: 0.9rem;
  white-space: nowrap;
}

.cover-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cover-input {
  width: 300px;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 0.9rem;
}

.cover-input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.cover-upload-btn {
  padding: 0.36rem 0.75rem;
  background: #f5f5f5;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  line-height: normal;
}

.cover-upload-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.cover-preview {
  width: 80px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.cover-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.title-input {
  flex: 1;
  font-family: var(--font-serif);
  font-size: 1.5rem;
  font-weight: 600;
  border: none;
  outline: none;
  background: transparent;
  color: #1a1a1a;
}

.title-input::placeholder {
  color: #ccc;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.tags-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tags-selected {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.tags-label {
  color: #999;
  font-size: 0.9rem;
  white-space: nowrap;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.6rem;
  background: var(--color-accent);
  color: #fff;
  font-size: 0.8rem;
  border-radius: 4px;
}

.tag-remove {
  cursor: pointer;
  opacity: 0.7;
  margin-left: 0.15rem;
}

.tag-remove:hover {
  opacity: 1;
}

.tag-input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.9rem;
  color: #333;
  min-width: 100px;
}

.tags-preset {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.preset-label {
  color: #bbb;
  font-size: 0.85rem;
  white-space: nowrap;
}

.preset-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.preset-tag {
  padding: 0.3rem 0.6rem;
  font-size: 0.8rem;
  color: #666;
  background: #f5f5f5;
  border: 1px solid #eee;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preset-tag:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.preset-tag.active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #fff;
}

.btn {
  padding: 0.6rem 1.5rem;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 4px;
}

.btn-secondary {
  background: #f5f5f5;
  color: #666;
}

.btn-secondary:hover {
  background: #eee;
}

.btn-outline {
  background: transparent;
  color: #666;
  border: 1px solid #ddd;
}

.btn-outline:hover {
  border-color: #999;
  color: #333;
}

.btn-primary {
  background: var(--color-accent);
  color: #fff;
}

.btn-primary:hover {
  background: #b08d4a;
}

.editor-container {
  flex: 1;
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.editor-pane,
.preview-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.editor-pane {
  border-right: 1px solid var(--color-border);
}

.pane-header {
  padding: 0.75rem 1.5rem;
  font-size: 0.85rem;
  color: #999;
  background: #faf9f7;
  border-bottom: 1px solid var(--color-border);
  font-weight: 500;
}

.editor-textarea {
  flex: 1;
  padding: 1.5rem;
  font-family: 'SF Mono', 'Monaco', 'Menlo', monospace;
  font-size: 0.95rem;
  line-height: 1.8;
  border: none;
  outline: none;
  resize: none;
  background: #fff;
  color: #333;
}

.editor-textarea::placeholder {
  color: #ccc;
}

.preview-content {
  flex: 1;
  padding: 1.5rem 2rem;
  overflow-y: auto;
  background: #fff;
  font-size: 1rem;
  line-height: 1.8;
}

.preview-content :deep(h1) {
  font-family: var(--font-serif);
  font-size: 2rem;
  margin: 2rem 0 1rem;
  color: #1a1a1a;
}

.preview-content :deep(h2) {
  font-family: var(--font-serif);
  font-size: 1.5rem;
  margin: 1.75rem 0 0.75rem;
  color: #1a1a1a;
}

.preview-content :deep(h3) {
  font-size: 1.2rem;
  margin: 1.5rem 0 0.5rem;
  color: #333;
}

.preview-content :deep(p) {
  margin-bottom: 1rem;
}

.preview-content :deep(blockquote) {
  border-left: 3px solid var(--color-accent);
  padding-left: 1rem;
  margin: 1.5rem 0;
  color: #666;
  font-style: italic;
}

.preview-content :deep(ul),
.preview-content :deep(ol) {
  margin: 1rem 0 1rem 1.5rem;
}

.preview-content :deep(li) {
  margin-bottom: 0.5rem;
}

.preview-content :deep(code) {
  background: #f5f5f5;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: 'SF Mono', monospace;
  font-size: 0.9em;
}

.preview-content :deep(pre) {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  margin: 1rem 0;
}

.preview-content :deep(pre code) {
  background: none;
  padding: 0;
}

.preview-content :deep(a) {
  color: var(--color-accent);
  text-decoration: underline;
}

.preview-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1rem 0;
  display: block;
}

.preview-content .placeholder {
  color: #ccc;
  text-align: center;
  padding-top: 3rem;
}

@media (max-width: 768px) {
  .editor-container {
    flex-direction: column;
  }

  .editor-pane {
    border-right: none;
    border-bottom: 1px solid var(--color-border);
  }

  .container {
    flex-direction: column;
    align-items: stretch;
  }

  .actions {
    justify-content: flex-end;
  }
}
</style>
