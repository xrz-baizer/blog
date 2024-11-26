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
            <p class="describe" v-html="article.filePath"></p>
            <span class="category-app">{{ article.lastUpdatedFormat }}</span>
        </div>

        <!-- 统一的分页控件 -->
        <div class="pagination">
            <button
                :disabled="currentPage === 1"
                @click="changePage(currentPage - 1)"
            >
                上一页
            </button>

            <span class="current-page-info">{{ currentPage }} / {{ totalPages }}</span>

            <button
                :disabled="currentPage === totalPages"
                @click="changePage(currentPage + 1)"
            >
                下一页
            </button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {PageData} from 'vitepress'
import {useSidebar} from 'vitepress/theme'
import {getRecentArticles,Article} from './function.ts'

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
    const start = (currentPage.value - 1) * pageSize;
    return articles.slice(start, start + pageSize);
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
    justify-content: space-between;
    align-items: center;
    width: 100%;
    max-width: 300px;
    margin: 20px auto;
    gap: 10px;
}

button {
    padding: 5px 10px;
    border: 1px solid #ccc;
    background-color: white;
    cursor: pointer;
}

button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

.current-page-info {
    font-weight: bold;
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
}

.describe {
    /*text-align: right;*/
    font-size: 0.9375rem;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
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
        /*display: -webkit-box;*/
        display: none;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        overflow: hidden;
        margin: 0.5rem 0 1rem;
    }
    .category-app{
        font-size: 12px;
        display: block;
        color: var(--vp-c-text-2);
    }
    .category-pc{
        display: none;
    }
}
</style>
