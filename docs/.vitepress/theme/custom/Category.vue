<template>
    <div class="article-container" ref="containerRef">
        <!-- 使用transition-group添加文章列表动画 -->
        <transition-group name="article-fade" tag="div">
            <a v-for="(article, index) in displayedArticles" 
               :key="article.link" 
               :href="article.link"
               class="post-list">
                <div class="post-header">
                    <div class="post-title">
                        <span class="title-text">{{ article.text }}
                            <Badge type="tip" v-if="article.pinned">Pinned</Badge>
                        </span>
                    </div>
                    <span class="category-view">{{ article.view }}</span>
                    <span class="category-pc">{{ article.lastUpdatedFormat }}</span>
                </div>
                <p class="describe" v-html="article.summary"></p>
            </a>
        </transition-group>

        <!-- 使用transition组件包装加载动画 -->
        <transition name="fade">
            <div v-if="loading" class="loading-wrapper">
                <div class="loading-spinner"></div>
                <span>Loading more articles...</span>
            </div>
        </transition>

        <!-- 使用transition组件包装结束提示 -->
        <transition name="fade">
            <div v-if="isAllLoaded" class="end-message">
                No more articles
            </div>
        </transition>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, watch, ref, computed, onUnmounted } from 'vue';
import { useSidebar } from 'vitepress/theme';
import { getRecentArticles, Article, fetchViews } from './function.ts';
import { articlesMap } from '../../../public/articles.js';

const containerRef = ref(null);
const loading = ref(false);
const pageSize = 8; // 每页显示数量
const currentIndex = ref(0);
const displayedArticles = ref<Article[]>([]);
const viewsMap = ref(new Map());
let isLoading = false;

function getArticleSummary(path) {
    return articlesMap[path] || 'Summary not found.';
}

const { sidebar } = useSidebar();
const articles: Article[] = getRecentArticles(sidebar.value, -1);

const isAllLoaded = computed(() => {
    return displayedArticles.value.length >= articles.length;
});

// 添加设备检测
const isMobile = ref(false);

// 检查是否为移动设备
const checkDevice = () => {
    isMobile.value = window.innerWidth <= 768;
};

// 修改视图加载函数
const loadViews = async (newArticles: Article[]) => {
    // 如果是移动设备，直接返回，不加载浏览量
    if (isMobile.value) return;

    const promises = newArticles.map(async (article) => {
        if (!viewsMap.value.has(article.link)) {
            try {
                const views = await fetchViews(article.link);
                viewsMap.value.set(article.link, views);
                
                const existingArticle = displayedArticles.value.find(a => a.link === article.link);
                if (existingArticle) {
                    existingArticle.view = views;
                }
            } catch (error) {
                console.error('Error fetching views:', error);
                viewsMap.value.set(article.link, '999');
            }
        }
    });

    await Promise.all(promises);
};

// 简化的加载函数
const loadMoreArticles = async () => {
    if (isLoading || isAllLoaded.value) return;

    isLoading = true;
    loading.value = true;

    try {
        const newArticles = articles.slice(
            currentIndex.value,
            currentIndex.value + pageSize
        ).map(article => ({
            ...article,
            summary: getArticleSummary(article.filePath),
            view: viewsMap.value.get(article.link) || '...'
        }));

        displayedArticles.value.push(...newArticles);
        currentIndex.value += pageSize;

        // 异步加载浏览量
        loadViews(newArticles);
    } finally {
        loading.value = false;
        isLoading = false;
    }
};

// 优化的滚动检查函数
const shouldLoadMore = () => {
    if (!containerRef.value || isAllLoaded.value) return false;
    
    const container = containerRef.value;
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // 当滚动到页面中间位置时触发加载
    const middleThreshold = documentHeight - (windowHeight * 1.5);
    return scrollPosition > middleThreshold;
};

// 使用 RAF 优化滚动处理
let scrollTimeout: any = null;
const handleScroll = () => {
    if (scrollTimeout) return;
    
    scrollTimeout = requestAnimationFrame(async () => {
        if (shouldLoadMore()) {
            await loadMoreArticles();
        }
        scrollTimeout = null;
    });
};

// 修改初始化加载
onMounted(async () => {
    checkDevice(); // 检查设备类型
    window.addEventListener('resize', checkDevice); // 监听窗口大小变化
    await loadMoreArticles();
    window.addEventListener('scroll', handleScroll, { passive: true });
});

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('resize', checkDevice);
    if (scrollTimeout) {
        cancelAnimationFrame(scrollTimeout);
    }
});
</script>

<style scoped>

.post-list {
    position: relative;
    border: 1px solid rgba(60,60,67,.07);
    border-radius: 8px;
    padding: 14px 16px;
    margin: 12px 0;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    background: var(--vp-c-bg);
    box-shadow: 0 1px 2px rgba(0,0,0,0.04);
    text-decoration: none !important;
    display: block;
    cursor: pointer;
    animation: slideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.post-list:hover {
    /*transform: translateY(-0.5px);*/
    box-shadow: 0 1px 5px rgba(0,0,0,0.16);
}

.post-list:hover {
    /*transform: translateY(-0.5px);*/
    box-shadow: 0 1px 5px rgba(0,0,0,0.16);
}

.post-list:hover .title-text {
    color: var(--vp-c-brand-1); /* 更改为你想要的颜色 */
}

/* 文章标题区域 */
.post-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.post-title {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0;
    flex: 1;

    white-space: nowrap;
    overflow: hidden !important;
    text-overflow: ellipsis;
    width: 100%;
}

.title-text {
    color: var(--vp-c-text-1);
    transition: all 0.2s ease;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* 更新时间样式 */
.category-pc {
    font-size: 0.9rem;
    color: var(--vp-c-text-2);
    background: var(--vp-c-bg-soft);
    padding: 4px 12px;
    border-radius: 7px;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 8px;
}

/* 访问量样式 */
.category-view {
    font-size: 0.8rem;
    color: var(--vp-c-text-3);
    /*margin-left: .7rem;*/
    display: inline-flex; /* 使内容和背景图可以并排显示 */
    align-items: center; /* 图标和文字垂直居中 */
    background-image: url('/view.svg'); /* 指定图标路径 */
    background-repeat: no-repeat; /* 不重复显示 */
    background-size: .9rem; /* 设置图标大小 */
    background-position: left center; /* 图标居左并垂直居中 */
    padding-left: 1.5rem; /* 给文字留出空间 */
}

/* 文章描述 */
.describe {
    font-size: 0.9rem;
    line-height: 1.6;
    color: var(--vp-c-text-2);
    margin: 6px 0 0 0;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin: 20px auto;
    gap: 10px;
}

.pagination button {
    font-weight: 500;
    color: var(--vp-c-text-1);
    padding: 5px 10px;
    cursor: pointer;
    /*border: 1px solid var(--vp-c-text-3);*/
    /*background-color: white;*/

    /*border: none;*/
    border-radius: 5px;
    box-shadow: 0 1px 2px 1px rgb(0 0 0 / 8%);
    background-color: transparent;
}

.pagination button:disabled {
    cursor: not-allowed;
    opacity: 0.4;
}

.current-page-info {
    color: var(--vp-c-text-2);
    font-weight: bold;
    margin: 0 1rem;
}

/* 响应式设计优化 */
@media screen and (max-width: 768px) {

    .post-list {
        padding: 12px;
        margin: 8px 0;
        border-radius: 6px;
    }
    
    .post-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }
    
    .post-title {
        font-size: 0.9rem;
        /*width: 100%;*/
    }
    
    .category-pc, .category-view {
        display: none;
    }
    
    .describe {
        font-size: 0.8rem;
        margin-top: 4px;
        line-height: 1.5;
    }
}

/* 加载动画容器 */
.loading-wrapper {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--vp-c-bg);
    border-radius: 20px;
    padding: 8px 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 8px;
    backdrop-filter: blur(8px);
    border: 1px solid rgba(60,60,67,.12);
}

.loading-spinner {
    width: 14px;
    height: 14px;
    border: 2px solid var(--vp-c-brand-1);
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
}

/* 结束提示动画 */
.end-message {
    text-align: center;
    padding: 20px;
    color: var(--vp-c-text-3);
    font-size: 0.9rem;
    animation: fadeIn 0.5s ease;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

/* 响应式设计中的动画调整 */
@media screen and (max-width: 768px) {
    .post-list {
        animation-duration: 0.5s;
    }
    
    .loading-spinner {
        animation-duration: 0.8s;
    }
}

/* 文章列表渐入动画 */
.article-fade-enter-active {
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.article-fade-enter-from {
    opacity: 0;
    transform: translateY(15px);
}

/* 加载状态和结束提示的渐变动画 */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* 文章列表项动画 */
@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(15px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
