<template>
    <div v-for="(article, index) in links" :key="index" class="post-list">
        <div class="post-header">
            <div class="post-title">
                <a :href="article.link"> {{ article.link }}</a>
            </div>
        </div>
        <p class="describe" v-html="article.text"></p>
<!--        <div class='post-info'>-->
<!--            {{ article.frontMatter.date }} <span v-for="item in article.frontMatter.tags"><a :href="withBase(`/pages/tags.html?tag=${item}`)"> {{ item }}</a></span>-->
<!--        </div>-->
    </div>
</template>

<script lang="ts" setup>

import {useData} from 'vitepress'
import {useSidebar} from 'vitepress/theme'
import {extractLinks,formatTimestamp} from './function.ts'

// 获取当前侧边栏数据
const { sidebar } = useSidebar();
const links = extractLinks(sidebar.value);

links.forEach(item => {
    const {page}  = useData(item.link)
    var update = formatTimestamp(page.value.lastUpdated)
    console.log(update + "\t" + item.link)
})


</script>

<style scoped>
.post-list {
    border-bottom: 1px dashed var(--vp-c-divider-light);
    padding: 14px 0 14px 0;
}
.post-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.post-title {
    font-size: 1.125rem;
    font-weight: 500;
    margin: 0.1rem 0;
}

.describe {
    font-size: 0.9375rem;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
    color: var(--vp-c-text-2);
    margin: 10px 0;
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
