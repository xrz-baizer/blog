<template>
  <div class="breadcrumb-wrapper" v-if="shouldShowBreadcrumb && breadcrumbs.length > 1">
    <nav class="breadcrumb-nav">
      <span v-for="(crumb, index) in breadcrumbs" :key="index" class="breadcrumb-item">
        <!-- 不是最后一个元素 -->
        <template v-if="index < breadcrumbs.length - 1">
          <!-- 如果有实际页面，显示为链接 -->
          <a v-if="crumb.hasPage" :href="crumb.link" class="breadcrumb-link">
            {{ crumb.text }}
          </a>
          <!-- 如果没有实际页面，显示为置灰文本 -->
          <span v-else class="breadcrumb-disabled">{{ crumb.text }}</span>
        </template>
        <!-- 最后一个元素（当前页面） -->
        <span v-else class="breadcrumb-current">{{ crumb.text }}</span>
        <span v-if="index < breadcrumbs.length - 1" class="breadcrumb-separator">/</span>
      </span>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useData } from 'vitepress'

const route = useRoute()
const { theme, frontmatter, page } = useData()

// 判断是否应该显示面包屑
const shouldShowBreadcrumb = computed(() => {
  // 如果是 index.md 页面（分类页面），不显示面包屑
  if (route.path.endsWith('/') || route.path.endsWith('/index.html')) {
    return false
  }
  // 如果 frontmatter 中明确设置了 breadcrumb: false，不显示
  if (frontmatter.value.breadcrumb === false) {
    return false
  }
  return true
})

// 检查路径是否存在对应的页面
const checkPageExists = (path: string): boolean => {
  // Home 页面一定存在
  if (path === '/') return true

  // 检查是否是导航项（导航项的页面一定存在）
  const navItems = theme.value.nav || []
  if (navItems.some(item => item.link === path)) return true

  // 对于中间路径，尝试在浏览器中检查是否存在 index.html
  // 这里我们采用简单的策略：如果路径段数小于当前页面的段数，假设可能不存在
  // 实际上我们通过尝试访问来判断（但在构建时无法准确判断）
  // 更安全的做法是：非导航项的中间路径默认标记为不可点击
  return false
}

// 生成面包屑导航数据
const breadcrumbs = computed(() => {
  const path = route.path
  const segments = path.split('/').filter(Boolean)

  const crumbs = [
    { text: 'Home', link: '/', hasPage: true }
  ]

  // 获取导航配置
  const navItems = theme.value.nav || []

  let currentPath = ''
  segments.forEach((segment, index) => {
    currentPath += '/' + segment

    // 解码 URL 编码的字符（如中文）
    let decodedSegment = decodeURIComponent(segment)

    // 移除文件扩展名（如果是最后一个片段）
    if (index === segments.length - 1 && decodedSegment.endsWith('.html')) {
      decodedSegment = decodedSegment.replace('.html', '')
    }

    // 格式化显示名称
    let displayName = decodedSegment

    // 移除数字前缀（如 123-）
    if (/^[0-9]{1,3}-/.test(displayName)) {
      displayName = displayName.replace(/^[0-9]{1,3}-/, '')
    }

    // 移除 0- 前缀但保留原始名称
    if (displayName.startsWith('0-')) {
      displayName = displayName.substring(2)
    }

    // 只对英文文件名进行连字符替换和首字母大写
    // 判断是否包含中文字符
    const hasChinese = /[\u4e00-\u9fa5]/.test(displayName)
    if (!hasChinese && displayName.includes('-')) {
      displayName = displayName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }

    // 检查是否是导航项，使用导航项的名称
    const linkPath = currentPath + '/'
    const navItem = navItems.find(item => item.link === linkPath)
    if (navItem) {
      displayName = navItem.text
    }

    // 判断该路径是否有对应的页面
    // 导航项一定有页面，最后一个片段（当前页）一定有页面，其他中间路径需要检查
    const isLastSegment = index === segments.length - 1
    const isNavItem = !!navItem
    const hasPage = isLastSegment || isNavItem

    crumbs.push({
      text: displayName,
      link: linkPath,
      hasPage: hasPage
    })
  })

  return crumbs
})
</script>

<style scoped>
.breadcrumb-wrapper {
  padding: 8px 0;
  //margin-bottom: 26px;
  //border-bottom: 1px solid var(--vp-c-divider);
}

.breadcrumb-nav {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}

.breadcrumb-item {
  display: inline-flex;
  align-items: center;
}

.breadcrumb-link {
  color: var(--vp-c-text-2);
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-link:hover {
  color: var(--custom-a-1);
  text-decoration: underline;
}

.breadcrumb-disabled {
  color: var(--vp-c-text-3);
  opacity: 0.6;
  cursor: not-allowed;
}

.breadcrumb-current {
  color: var(--vp-c-text-1);
  font-weight: 500;
}

.breadcrumb-separator {
  margin: 0 8px;
  color: var(--vp-c-text-3);
}

/* 只在PC端显示 */
@media (max-width: 960px) {
  .breadcrumb-wrapper {
    display: none;
  }
}
</style>
