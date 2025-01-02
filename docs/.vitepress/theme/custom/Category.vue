<template>
    <div>
        <!-- 遍历当前页的文章 -->
        <a v-for="(article, index) in paginatedArticles" 
           :key="index" 
           :href="article.link"
           class="post-list">
            <div class="post-header">
                <div class="post-title">
                    <span class="title-text">{{ article.text }}
                        <Badge type="tip" v-if="article.pinned">Pinned</Badge>
                    </span>
                </div>
                <span class="category-view" >{{ article.view }}</span>
                <span class="category-pc">{{ article.lastUpdatedFormat }}</span>
            </div>
            <p class="describe" v-html="article.summary"></p>
<!--            <span class="category-app">{{ article.lastUpdatedFormat }}</span>-->
        </a>

        <!-- 统一的分页控件 -->
        <div class="pagination">
            <button
                :disabled="currentPage === 1"
                @click="changePage(currentPage - 1)"
            >
                Previous page
            </button>

            <span class="current-page-info">{{ currentPage }} / {{ totalPages }}</span>

            <button
                :disabled="currentPage === totalPages"
                @click="changePage(currentPage + 1)"
            >
                Next page
            </button>
        </div>
    </div>
</template>

<script lang="ts" setup>

import { onMounted,watch, ref, computed } from 'vue';
import {PageData} from 'vitepress'
import {useSidebar} from 'vitepress/theme'
import {getRecentArticles, Article, fetchViews} from './function.ts'
import { articlesMap } from '../../../public/articles.js';

function getArticleSummary(path) {
    return articlesMap[path] || 'Summary not found.';
}

// 获取当前侧边栏数据
const { sidebar } = useSidebar();

// 提取侧边栏所有文章
const articles: Article[] = getRecentArticles(sidebar.value,-1);


// 分页状态
const currentPage = ref(1); // 当前页码
const pageSize = 14; // 每页文章数

// 计算总页数
const totalPages = computed(() => Math.ceil(articles.length / pageSize));

// 为视图数据创建一个独立的 reactive 对象
const viewsMap = ref(new Map());

const loadViews = async () => {
    await Promise.all(paginatedArticles.value.map(async (article) => {
        const views = await fetchViews(article.link);
        viewsMap.value.set(article.link, views);
    }));
};

// 修改计算属性以包含视图数据
const paginatedArticles = computed(() => {
    let start = (currentPage.value - 1) * pageSize;
    let currentArticles = articles.slice(start, start + pageSize);

    // 填充文章概述和视图数据
    currentArticles.forEach(article => {
        article.summary = getArticleSummary(article.filePath);
        article.view = viewsMap.value.get(article.link) ?? '...'; // 使用占位符表示加载中
    });

    return currentArticles;
});

// 确保在组件挂载和页面变化时加载视图
onMounted(async () => {
    await loadViews();
});

watch(() => currentPage.value, async () => {
    await loadViews();
});


// 切换页码
function changePage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        loadViews();
    }
}

</script>

<style scoped>


.post-list {
    position: relative;
    border: 1px solid rgba(60,60,67,.12);
    border-radius: 8px;
    padding: 14px 16px;
    margin: 12px 0;
    transition: all 0.3s ease;
    background: var(--vp-c-bg);
    box-shadow: 0 1px 2px rgba(0,0,0,0.04);
    text-decoration: none !important;
    display: block;
    cursor: pointer;
}


.post-list:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}


/* 文章标题区域 */
.post-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.post-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
    flex: 1;

    white-space: nowrap;
    overflow: hidden !important;
    text-overflow: ellipsis;
    width: 100%;
}

.title-text {
    /*color: var(--custom-a-1);*/
    color: var(--vp-c-brand-3);
    transition: all 0.2s ease;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* 更新时间样式 */
.category-pc {
    font-size: 0.85rem;
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


</style>
