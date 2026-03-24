<template>
  <div class="about">
    <div class="container" v-if="!isEditing">
      <!-- 显示模式 -->
      <section class="about-hero">
        <div class="avatar">
          <div class="avatar-inner">{{ data.avatar }}</div>
        </div>
        <h1 class="name">{{ data.name }}</h1>
        <p class="tagline">{{ data.tagline }}</p>
      </section>

      <section class="content">
        <p v-for="(paragraph, index) in data.intro" :key="index">{{ paragraph }}</p>

        <!-- 基本信息 -->
        <div class="info-grid" v-if="data.phone || data.birthday || data.location">
          <div class="info-item" v-if="data.phone">
            <span class="info-label">📱</span>
            <span>{{ data.phone }}</span>
          </div>
          <div class="info-item" v-if="data.birthday">
            <span class="info-label">🎂</span>
            <span>{{ data.birthday }}</span>
          </div>
          <div class="info-item" v-if="data.location">
            <span class="info-label">📍</span>
            <span>{{ data.location }}</span>
          </div>
        </div>

        <!-- 教育经历 -->
        <div v-if="data.education && data.education.length > 0">
          <h2>{{ data.educationTitle }}</h2>
          <div class="timeline">
            <div v-for="(edu, index) in data.education" :key="index" class="timeline-item">
              <div class="timeline-year">{{ edu.year }}</div>
              <div class="timeline-content">
                <div class="timeline-title">{{ edu.school }}</div>
                <div class="timeline-desc">{{ edu.degree }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 个人技能 -->
        <div v-if="data.skills && data.skills.length > 0">
          <h2>{{ data.skillsTitle }}</h2>
          <div class="skills-list">
            <div v-for="(skill, index) in data.skills" :key="index" class="skill-item">
              <span class="skill-name">{{ skill.name }}</span>
              <div class="skill-bar">
                <div class="skill-progress" :style="{ width: skill.level + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 工作经历 -->
        <div v-if="data.work && data.work.length > 0">
          <h2>{{ data.workTitle }}</h2>
          <div class="timeline">
            <div v-for="(job, index) in data.work" :key="index" class="timeline-item">
              <div class="timeline-year">{{ formatPeriodRange(job.periodRange) }}</div>
              <div class="timeline-content">
                <div class="timeline-title">
                  <span class="company-name">{{ job.company }}</span>
                  <span class="position-name">{{ job.position }}</span>
                </div>
                <div class="timeline-desc" v-html="job.description"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 个人荣誉 -->
        <div v-if="data.honors && data.honors.length > 0">
          <h2>{{ data.honorsTitle }}</h2>
          <ul class="honors-list">
            <li v-for="(honor, index) in data.honors" :key="index">
              <span class="honor-icon">🏆</span>
              <span class="honor-title">{{ honor.title }}</span>
              <span class="honor-year">{{ honor.year }}</span>
            </li>
          </ul>
        </div>

        <h2>{{ data.interestsTitle }}</h2>
        <ul class="interests">
          <li v-for="(interest, index) in data.interests" :key="index">
            <span class="icon">{{ interest.icon }}</span>
            <span>{{ interest.text }}</span>
          </li>
        </ul>

        <h2>{{ data.contactTitle }}</h2>
        <p>{{ data.contactText }}</p>

        <div class="quote">
          <blockquote>{{ data.quote }}</blockquote>
        </div>

        <div class="edit-btn-wrapper">
          <button @click="startEditing" class="edit-button">
            <span class="edit-icon">✏️</span>
            编辑个人信息
          </button>
        </div>
      </section>
    </div>

    <!-- 编辑模式 -->
    <div class="container" v-else>
      <section class="edit-section">
        <h3>基本信息</h3>
        <div class="form-group">
          <label>头像文字：</label>
          <input v-model="editData.avatar" type="text" maxlength="2" />
        </div>
        <div class="form-group">
          <label>名称：</label>
          <input v-model="editData.name" type="text" />
        </div>
        <div class="form-group">
          <label>座右铭：</label>
          <input v-model="editData.tagline" type="text" />
        </div>

        <h3>个人简介</h3>
        <div class="form-group">
          <label>段落1：</label>
          <textarea v-model="editData.intro[0]"></textarea>
        </div>
        <div class="form-group">
          <label>段落2：</label>
          <textarea v-model="editData.intro[1]"></textarea>
        </div>

        <h3>基本信息</h3>
        <div class="form-group">
          <label>手机号码：</label>
          <input v-model="editData.phone" type="text" placeholder="138****8888" />
        </div>
        <div class="form-group">
          <label>生日：</label>
          <input v-model="editData.birthday" type="text" placeholder="1995年1月1日" />
        </div>
        <div class="form-group">
          <label>所在地：</label>
          <input v-model="editData.location" type="text" placeholder="北京" />
        </div>

        <h3>教育经历</h3>
        <div class="form-group">
          <label>标题：</label>
          <input v-model="editData.educationTitle" type="text" />
        </div>
        <div class="interests-edit">
          <div v-for="(edu, index) in editData.education" :key="index" class="interest-item">
            <input v-model="edu.school" type="text" placeholder="学校" />
            <input v-model="edu.degree" type="text" placeholder="学位" style="width: 120px;" />
            <input v-model="edu.year" type="text" placeholder="年份" style="width: 100px;" />
            <button @click="removeEducation(index)" class="remove-btn">删除</button>
          </div>
          <button @click="addEducation" class="add-btn">添加教育经历</button>
        </div>

        <h3>个人技能</h3>
        <div class="form-group">
          <label>标题：</label>
          <input v-model="editData.skillsTitle" type="text" />
        </div>
        <div class="interests-edit">
          <div v-for="(skill, index) in editData.skills" :key="index" class="interest-item">
            <input v-model="skill.name" type="text" placeholder="技能名称" />
            <input v-model="skill.level" type="number" min="0" max="100" placeholder="熟练度" style="width: 80px;" />
            <button @click="removeSkill(index)" class="remove-btn">删除</button>
          </div>
          <button @click="addSkill" class="add-btn">添加技能</button>
        </div>

        <h3>工作经历</h3>
        <div class="form-group">
          <label>标题：</label>
          <input v-model="editData.workTitle" type="text" />
        </div>
        <div class="work-list">
          <div v-for="(job, index) in editData.work" :key="index" class="work-item">
            <div class="work-header">
              <input v-model="job.company" type="text" placeholder="公司" class="work-input" />
              <input v-model="job.position" type="text" placeholder="职位" class="work-input" />
              <VueDatePicker
                v-model="job.periodRange"
                month-picker
                range
                placeholder="选择时间范围"
                format="yyyy-MM"
                auto-apply
                class="date-picker-input"
                :clearable="false"
              />
              <button @click="removeWork(index)" class="remove-btn">删除</button>
            </div>
            <div class="work-desc">
              <QuillEditor
                v-model:content="job.description"
                contentType="html"
                theme="snow"
                toolbar="minimal"
                placeholder="描述（支持富文本）"
              />
            </div>
          </div>
          <button @click="addWork" class="add-btn">添加工作经历</button>
        </div>

        <h3>个人荣誉</h3>
        <div class="form-group">
          <label>标题：</label>
          <input v-model="editData.honorsTitle" type="text" />
        </div>
        <div class="interests-edit">
          <div v-for="(honor, index) in editData.honors" :key="index" class="interest-item">
            <input v-model="honor.title" type="text" placeholder="荣誉" />
            <input v-model="honor.year" type="text" placeholder="年份" style="width: 100px;" />
            <button @click="removeHonor(index)" class="remove-btn">删除</button>
          </div>
          <button @click="addHonor" class="add-btn">添加荣誉</button>
        </div>

        <h3>兴趣列表</h3>
        <div class="form-group">
          <label>兴趣标题：</label>
          <input v-model="editData.interestsTitle" type="text" />
        </div>
        <div class="interests-edit">
          <div v-for="(interest, index) in editData.interests" :key="index" class="interest-item">
            <input v-model="interest.icon" type="text" placeholder="图标" class="icon-input" />
            <input v-model="interest.text" type="text" placeholder="描述" />
            <button @click="removeInterest(index)" class="remove-btn">删除</button>
          </div>
          <button @click="addInterest" class="add-btn">添加兴趣</button>
        </div>

        <h3>联系方式</h3>
        <div class="form-group">
          <label>标题：</label>
          <input v-model="editData.contactTitle" type="text" />
        </div>
        <div class="form-group">
          <label>内容：</label>
          <textarea v-model="editData.contactText"></textarea>
        </div>

        <h3>引用语</h3>
        <div class="form-group">
          <label>座右铭：</label>
          <textarea v-model="editData.quote"></textarea>
        </div>

        <div class="edit-actions">
          <button @click="cancelEditing" class="cancel-btn">取消</button>
          <button @click="saveData" class="save-btn">保存</button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import '@vuepic/vue-datepicker/dist/main.css'

const defaultData = {
  avatar: '墨',
  name: '关于我',
  tagline: '一名热爱探索的开发者',
  intro: [
    '你好，我是这个博客的作者。这是一个安静的地方，用来记录我的思考和成长。',
    '我热爱技术，热爱写作，热爱生活中一切美好的事物。这个博客就是我将这些热爱付诸实践的结果。'
  ],
  // 基本信息
  phone: '',
  birthday: '',
  location: '',
  // 教育经历
  educationTitle: '教育经历',
  education: [
    { school: '大学名称', degree: '学位', year: '2015-2019' }
  ],
  // 个人技能
  skillsTitle: '个人技能',
  skills: [
    { name: '前端开发', level: 90 },
    { name: '后端开发', level: 75 },
    { name: '项目管理', level: 60 }
  ],
  // 工作经历
  workTitle: '工作经历',
  work: [
    { company: '公司名称', position: '职位', periodRange: null, description: '' }
  ],
  // 个人荣誉
  honorsTitle: '个人荣誉',
  honors: [
    { title: '荣誉奖项', year: '2023' }
  ],
  // 兴趣
  interestsTitle: '我的兴趣',
  interests: [
    { icon: '💻', text: '编程与技术创新' },
    { icon: '📚', text: '阅读与写作' },
    { icon: '🌱', text: '探索与成长' },
    { icon: '☕', text: '咖啡与思考' }
  ],
  contactTitle: '联系我',
  contactText: '如果你有任何想法或建议，欢迎通过博客留言与我交流。',
  quote: '「写作是把时间凝固的艺术。」'
}

const data = ref({ ...defaultData })
const isEditing = ref(false)
const editData = ref({})

// 格式化工作经历时间范围
const formatPeriodRange = (range) => {
  if (!range || !range[0] || !range[1]) return '至今'

  const formatMonth = (item) => {
    if (typeof item === 'string') {
      return item.replace('-', '年') + '月'
    }
    // month-picker 返回对象格式: { year: 2020, month: 0 }
    const month = (item.month + 1).toString().padStart(2, '0')
    return `${item.year}年${month}月`
  }

  const start = formatMonth(range[0])
  const end = formatMonth(range[1])
  return `${start} - ${end}`
}

// 加载数据
onMounted(() => {
  const saved = localStorage.getItem('about_data')
  if (saved) {
    data.value = JSON.parse(saved)
  }
})

// 开始编辑
const startEditing = () => {
  // 滚动到页面顶部
  window.scrollTo(0, 0)

  editData.value = JSON.parse(JSON.stringify(data.value))
  // 确保数组存在
  if (!editData.value.intro) editData.value.intro = [...defaultData.intro]
  if (!editData.value.education) editData.value.education = [...defaultData.education]
  if (!editData.value.skills) editData.value.skills = [...defaultData.skills]
  if (!editData.value.work) editData.value.work = [...defaultData.work]
  if (!editData.value.honors) editData.value.honors = [...defaultData.honors]
  if (!editData.value.interests) editData.value.interests = [...defaultData.interests]
  isEditing.value = true
}

// 取消编辑
const cancelEditing = () => {
  isEditing.value = false
}

// 教育经历
const addEducation = () => {
  editData.value.education.push({ school: '学校名称', degree: '学位', year: '年份' })
}
const removeEducation = (index) => {
  editData.value.education.splice(index, 1)
}

// 个人技能
const addSkill = () => {
  editData.value.skills.push({ name: '技能名称', level: 50 })
}
const removeSkill = (index) => {
  editData.value.skills.splice(index, 1)
}

// 工作经历
const addWork = () => {
  editData.value.work.push({ company: '公司名称', position: '职位', periodRange: null, description: '' })
}
const removeWork = (index) => {
  editData.value.work.splice(index, 1)
}

// 个人荣誉
const addHonor = () => {
  editData.value.honors.push({ title: '荣誉奖项', year: '年份' })
}
const removeHonor = (index) => {
  editData.value.honors.splice(index, 1)
}

// 添加兴趣
const addInterest = () => {
  editData.value.interests.push({ icon: '✨', text: '新兴趣' })
}

// 删除兴趣
const removeInterest = (index) => {
  editData.value.interests.splice(index, 1)
}

// 保存数据
const saveData = () => {
  data.value = JSON.parse(JSON.stringify(editData.value))
  localStorage.setItem('about_data', JSON.stringify(data.value))
  isEditing.value = false
}
</script>

<style scoped>
.about {
  padding: 0 0 4rem;
}

.edit-btn-wrapper {
  margin-top: 3rem;
  text-align: center;
}

.about {
  padding: 0 0 4rem;
  position: relative;
}

.edit-btn button {
  padding: 0.5rem 1rem;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.edit-btn button:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.container {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
}

.about-hero {
  text-align: center;
  padding: 4rem 0 3rem;
}

.avatar {
  width: 120px;
  height: 120px;
  margin: 0 auto 2rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.avatar-inner {
  font-family: var(--font-serif);
  font-size: 3rem;
  color: #333;
}

.name {
  font-family: var(--font-serif);
  font-size: 2.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.tagline {
  font-size: 1.1rem;
  color: #888;
  font-weight: 300;
}

.content {
  font-size: 1.1rem;
  line-height: 1.9;
  color: #444;
}

.content p {
  margin-bottom: 1.5rem;
}

/* 基本信息 */
.info-grid {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
}

.info-label {
  font-size: 1.1rem;
}

/* 时间线 */
.timeline {
  margin: 1.5rem 0;
}

.timeline-item {
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-border);
}

.timeline-item:last-child {
  border-bottom: none;
}

.timeline-year {
  color: #999;
  font-size: 0.9rem;
  min-width: 80px;
}

.timeline-content {
  flex: 1;
}

.timeline-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  font-weight: 600;
  color: #1a1a1a;
}

.company-name {
  color: #1a1a1a;
}

.position-name {
  color: #666;
  font-weight: 400;
  font-size: 0.95rem;
}

.position-name::before {
  content: '|';
  color: #ddd;
  margin-right: 0.5rem;
}

.timeline-company {
  color: #666;
  font-size: 0.95rem;
}

.timeline-desc {
  color: #888;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

/* 技能 */
.skills-list {
  margin: 1.5rem 0;
}

.skill-item {
  margin-bottom: 1rem;
}

.skill-name {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
}

.skill-bar {
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
}

.skill-progress {
  height: 100%;
  background: var(--color-accent);
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* 荣誉 */
.honors-list {
  list-style: none;
  padding: 0;
  margin: 1.5rem 0;
}

.honors-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-border);
}

.honors-list li:last-child {
  border-bottom: none;
}

.honor-icon {
  font-size: 1.2rem;
}

.honor-title {
  flex: 1;
  color: #333;
}

.honor-year {
  color: #999;
  font-size: 0.9rem;
}

.content h2 {
  font-family: var(--font-serif);
  font-size: 1.5rem;
  color: #1a1a1a;
  margin: 2.5rem 0 1rem;
}

.interests {
  list-style: none;
  padding: 0;
  margin: 1.5rem 0;
}

.interests li {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: #fff;
  border: 1px solid var(--color-border);
  margin-bottom: 0.75rem;
  transition: all 0.3s ease;
}

.interests li:hover {
  transform: translateX(8px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.interests .icon {
  font-size: 1.5rem;
}

.quote {
  margin-top: 3rem;
  padding: 2rem;
  background: linear-gradient(135deg, #faf9f7 0%, #f5f5f5 100%);
  border-left: 3px solid var(--color-accent);
}

.quote blockquote {
  font-family: var(--font-serif);
  font-size: 1.25rem;
  font-style: italic;
  color: #666;
  margin: 0;
}

.edit-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.95rem;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-button:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.edit-icon {
  font-size: 1rem;
}

/* 编辑模式样式 */
.edit-section {
  padding: 2rem 0;
}

.edit-section h3 {
  font-size: 1.1rem;
  color: #333;
  margin: 1.5rem 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border);
}

.edit-section h3:first-child {
  margin-top: 0;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus,
.interests-edit input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
}

.interests-edit {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Quill 编辑器样式 */
/* 工作经历列表样式 */
.work-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.work-item {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem;
  background: #faf9f7;
}

.work-header {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.work-input {
  flex: 1;
  min-width: 120px;
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 0.95rem;
}

.work-input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.date-picker-input {
  flex: 1;
  min-width: 180px;
}

.date-picker-input :deep(.dp__input) {
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 0.95rem;
  background: #fff;
}

.date-picker-input :deep(.dp__input_icon) {
  display: none;
}

.date-picker-input :deep(.dp__input:hover) {
  border-color: var(--color-accent);
}

.date-picker-input :deep(.dp__input_focus) {
  border-color: var(--color-accent);
}

.work-desc {
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
}

.work-desc :deep(.ql-container) {
  min-height: 100px;
  font-size: 14px;
  border: none !important;
}

.work-desc :deep(.ql-toolbar) {
  border: none !important;
  border-bottom: 1px solid #eee !important;
  background: transparent;
  padding: 8px 0 !important;
}

.work-desc :deep(.ql-toolbar .ql-stroke) {
  stroke: #999;
}

.work-desc :deep(.ql-toolbar .ql-fill) {
  fill: #999;
}

.work-desc :deep(.ql-toolbar .ql-picker) {
  color: #999;
}

.work-desc :deep(.ql-toolbar button:hover .ql-stroke) {
  stroke: var(--color-accent);
}

.work-desc :deep(.ql-toolbar button:hover .ql-fill) {
  fill: var(--color-accent);
}

.work-desc :deep(.ql-editor) {
  min-height: 100px;
  padding: 12px 16px !important;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}

.work-desc :deep(.ql-editor.ql-blank::before) {
  color: #bbb;
  font-style: normal;
}

.work-desc :deep(.ql-editor p) {
  margin-bottom: 0.5em;
}

.work-desc :deep(.ql-editor ul),
.work-desc :deep(.ql-editor ol) {
  padding-left: 1.5em;
  margin-bottom: 0.5em;
}

.work-desc :deep(.ql-editor blockquote) {
  border-left: 3px solid var(--color-accent);
  padding-left: 1em;
  color: #666;
}

.interest-item {
  display: flex;
  gap: 0.5rem;
}

.interest-item input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
}

.interest-item input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.icon-input {
  width: 60px !important;
  flex: none !important;
}

.remove-btn {
  padding: 0.5rem 1rem;
  background: #fff;
  border: 1px solid #dc3545;
  color: #dc3545;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}

.remove-btn:hover {
  background: #dc3545;
  color: #fff;
}

.add-btn {
  padding: 0.5rem 1rem;
  background: #fff;
  border: 1px solid var(--color-accent);
  color: var(--color-accent);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  align-self: flex-start;
}

.add-btn:hover {
  background: var(--color-accent);
  color: #fff;
}

.edit-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.cancel-btn {
  padding: 0.5rem 1rem;
  background: #fff;
  border: none;
  cursor: pointer;
  font-size: 0.95rem;
}

.cancel-btn:hover {
  border-color: #999;
}

.save-btn {
  padding: 0.5rem 1rem;
  background: var(--color-accent);
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 0.95rem;
}

.save-btn:hover {
  background: #b08d4a;
}
</style>
