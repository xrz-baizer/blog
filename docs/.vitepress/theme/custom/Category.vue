<template>
    <div>
        <!-- 遍历当前页的文章 -->
        <div v-for="(article, index) in paginatedArticles" :key="index" class="post-list">
            <div class="post-header">
                <div class="post-title">
                    <a :href="article.link"> {{ article.text }}</a>
                </div>
                <span class="category-pc">{{ article.lastUpdatedFormat }}</span>
            </div>
            <p class="describe" v-html="article.summary"></p>
<!--            <span class="category-app">{{ article.lastUpdatedFormat }}</span>-->
        </div>

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
import {PageData} from 'vitepress'
import {useSidebar} from 'vitepress/theme'
import {getRecentArticles, Article} from './function.ts'
import { articlesMap } from '../../../public/articles.js';

function getArticleSummary(path) {
    return articlesMap[path] || 'Summary not found.';
}

// 获取当前侧边栏数据
const { sidebar } = useSidebar();
// 提取侧边栏所有文章
const articles: Article[] = getRecentArticles(sidebar.value,-1);


// 分页状态
import { ref, computed } from 'vue';
const currentPage = ref(1); // 当前页码
const pageSize = 9; // 每页文章数

// 计算总页数
const totalPages = computed(() => Math.ceil(articles.length / pageSize));

// 当前页显示的文章
const paginatedArticles = computed(() => {
    let start = (currentPage.value - 1) * pageSize;
    let currentArticles = articles.slice(start, start + pageSize);

    // 填充文章概述
    currentArticles.forEach(article => {
        // 获取build时生成的文章概述
        article.summary = getArticleSummary(article.filePath);;
    })
    return currentArticles;
});

// 切换页码
function changePage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
}

</script>

<style scoped>

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin: 20px auto;
    gap: 10px;
}

button {
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

button:disabled {
    cursor: not-allowed;
    opacity: 0.4;
}

.current-page-info {
    color: var(--vp-c-text-2);
    font-weight: bold;
    margin: 0 1rem;
}



span{
    font-weight: 500;
    color: var(--vp-c-text-1);
}

.category-app{
    text-align: right;
    display: none;
}

.post-list {
    border-bottom: 1px dashed #eee;
    padding: 5px 0;
    margin: 7px 0;
}
.post-list p{
    margin: 0px !important;
}
.post-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.post-title {
    font-size: 1.225rem;
    font-weight: 500;
    margin: 0.1rem 0;

    /*!* 超出换行，并以省略号显示 *!*/
    /*white-space: nowrap;*/
    /*overflow: hidden !important;*/
    /*text-overflow: ellipsis;*/
    /*width: 100%;*/
}
.post-title a{
    /* 超出换行，并以省略号显示 */
    white-space: nowrap;
    overflow: hidden !important;
    text-overflow: ellipsis;
    width: 100%;
    display: block;
}

.describe {
    /*text-align: right;*/
    font-size: 0.9375rem;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    /* 当 p 标签内的内容超过两行时，超出的部分会被隐藏，并显示省略号 ...。 */
    -webkit-line-clamp: 1;
    overflow: hidden;
    color: var(--vp-c-text-2);
    margin-bottom: 10px;
    line-height: 1.5rem;
}

@media screen and (max-width: 768px) {
    .post-list {
        padding: 5px 0 5px 0;
    }
    .post-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .post-title {
        font-size: 1rem;
        font-weight: 400;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        /*width: 17rem;*/
    }
    .describe {
        font-size: 0.9375rem;
        display: -webkit-box;
        /*display: none;*/
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        margin: 0.5rem 0 1rem;
    }
    .category-app{
        font-size: 12px;
        display: block;
        color: var(--vp-c-text-2);
        display: none;
    }
    .category-pc{
        display: none;
    }
}
</style>
