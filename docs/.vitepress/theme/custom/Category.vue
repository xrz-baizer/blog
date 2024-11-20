<template>
    <div v-for="(article, index) in recentArticles" :key="index" class="post-list">
        <div class="post-header">
            <div class="post-title">
                <a :href="article.link"> {{ article.text }}</a>
            </div>
            <span>{{ article.lastUpdatedFormat }}</span>
<!--            <span>{{ article.filePath }}</span>-->
        </div>
        <p class="describe" v-html="article.filePath"></p>
    </div>
</template>

<script lang="ts" setup>
import {PageData} from 'vitepress'
import {useSidebar} from 'vitepress/theme'
import {getRecentArticles,Article} from './function.ts'

// 获取当前侧边栏数据
const { sidebar } = useSidebar();
// 提取最近 14篇文章
const recentArticles: Article[] = getRecentArticles(sidebar.value,14);


</script>

<style scoped>

span{
    color: var(--vp-c-text-1);
}
/*!* 针对 VitePress 默认侧边栏 *!*/
/*.VPSidebar {*/
/*    display: block;*/
/*}*/

/*:root{*/
/*    --vp-sidebar-width:275px !important;*/
/*}*/


.post-list {
    border-bottom: 1px dashed var(--vp-c-divider-light);
    padding: 5px 0;
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
    text-align: right;
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
        padding: 14px 0 14px 0;
    }
    .post-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .post-title {
        font-size: 1.0625rem;
        font-weight: 400;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        width: 17rem;
    }
    .describe {
        font-size: 0.9375rem;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        overflow: hidden;
        margin: 0.5rem 0 1rem;
    }
}
</style>
