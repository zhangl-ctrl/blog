import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'fs'
import path from 'path'

// 获取 posts 目录路径
const getPostsDir = () => path.join(process.cwd(), 'public', 'posts')

// 解析 Markdown 文件的 Front Matter
const parseFrontMatter = (content) => {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) {
    return { metadata: {}, content }
  }

  const frontMatter = match[1]
  const metadata = {}

  frontMatter.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':')
    if (key && valueParts.length > 0) {
      let value = valueParts.join(':').trim()
      // 处理数组格式 tags: ["tag1", "tag2"]
      if (value.startsWith('[')) {
        try {
          metadata[key.trim()] = JSON.parse(value)
        } catch {
          metadata[key.trim()] = value.replace(/"/g, '')
        }
      } else {
        metadata[key.trim()] = value.replace(/"/g, '')
      }
    }
  })

  return {
    metadata,
    content: content.slice(match[0].length).trim()
  }
}

// 自定义插件：处理文章文件操作
const fileSavePlugin = () => ({
  name: 'file-save-plugin',

  configureServer(server) {
    // 获取所有文章列表
    server.middlewares.use('/api/posts', (req, res) => {
      if (req.method === 'GET') {
        try {
          const url = new URL(req.url, 'http://localhost')
          const filterDrafts = url.searchParams.get('drafts') === 'true'

          const postsDir = getPostsDir()
          if (!fs.existsSync(postsDir)) {
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify([]))
            return
          }

          const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'))
          const posts = files.map(filename => {
            const filePath = path.join(postsDir, filename)
            const content = fs.readFileSync(filePath, 'utf-8')
            const { metadata, content: body } = parseFrontMatter(content)

            // 生成唯一 ID
            const id = filename.replace('.md', '')

            return {
              id,
              filename,
              title: metadata.title || id,
              date: metadata.date || '',
              tags: metadata.tags || [],
              content: body,
              excerpt: body.substring(0, 100).replace(/[#*`>\[\]]/g, '').trim() + '...',
              isDraft: metadata.isDraft === true || metadata.isDraft === 'true',
              isLocal: true
            }
          })

          // 过滤草稿
          let filteredPosts = posts
          if (filterDrafts) {
            filteredPosts = posts.filter(p => p.isDraft)
          } else {
            filteredPosts = posts.filter(p => !p.isDraft)
          }

          // 按日期倒序排列
          filteredPosts.sort((a, b) => (b.date || '').localeCompare(a.date || ''))

          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify(filteredPosts))
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: err.message }))
        }
      } else {
        res.writeHead(405)
        res.end()
      }
    })

    // 获取单篇文章内容
    server.middlewares.use('/api/post', (req, res) => {
      if (req.method === 'GET') {
        const url = new URL(req.url, 'http://localhost')
        const id = url.searchParams.get('id')

        if (!id) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Missing id' }))
          return
        }

        try {
          const postsDir = getPostsDir()
          const filename = id.includes('.md') ? id : id + '.md'
          const filePath = path.join(postsDir, filename)

          if (!fs.existsSync(filePath)) {
            res.writeHead(404, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'Post not found' }))
            return
          }

          const content = fs.readFileSync(filePath, 'utf-8')
          const { metadata, content: body } = parseFrontMatter(content)

          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({
            id: id.replace('.md', ''),
            filename,
            title: metadata.title || id,
            date: metadata.date || '',
            tags: metadata.tags || [],
            content: body,
            isLocal: true
          }))
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: err.message }))
        }
      } else {
        res.writeHead(405)
        res.end()
      }
    })

    // 保存文章
    server.middlewares.use('/api/save-post', async (req, res) => {
      if (req.method === 'POST') {
        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', () => {
          try {
            const { filename, content } = JSON.parse(body)
            const filePath = path.join(process.cwd(), 'public', 'posts', filename)

            // 确保目录存在
            const dir = path.dirname(filePath)
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true })
            }

            fs.writeFileSync(filePath, content, 'utf-8')
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: true, path: `/posts/${filename}` }))
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: err.message }))
          }
        })
      } else {
        res.writeHead(405)
        res.end()
      }
    })

    // 删除文章
    server.middlewares.use('/api/delete-post', async (req, res) => {
      if (req.method === 'POST') {
        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', () => {
          try {
            const { filename } = JSON.parse(body)
            const filePath = path.join(process.cwd(), 'public', 'posts', filename)

            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath)
            }
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: true }))
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: err.message }))
          }
        })
      } else {
        res.writeHead(405)
        res.end()
      }
    })
  }
})

export default defineConfig({
  plugins: [vue(), fileSavePlugin()],
  server: {
    port: 3000,
    host: '0.0.0.0'
  }
})
