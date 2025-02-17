// https://vitepress.dev/guide/custom-theme
import { h,onMounted, watch, nextTick } from 'vue'
import type { Theme } from 'vitepress'
import {useData, useRoute} from 'vitepress';
import mediumZoom from 'medium-zoom';
import DefaultTheme from 'vitepress/theme'
import { useSidebar } from 'vitepress/theme'
import './style.css'
import './custom/custom.css'
import { formatTimestamp,recordView,fetchViews } from './custom/function.js'
import Category from './custom/Category.vue'

import giscusTalk from 'vitepress-plugin-comment-with-giscus';


export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
      // 在所有doc类型md文件前加载该组件
      // 'doc-before': () => h(Update),
      // 'aside-top': () => h(Update)
    })
  },

  // enhanceApp
  // 这是在 Vue 3 中用于增强应用的一个钩子函数。
  // 它通常在应用初始化时被调用，可以用来注册全局组件、插件或修改 Vue 实例。
  // 通过 enhanceApp，开发者可以在应用启动前执行一些配置或初始化操作。
  enhanceApp({ app, router, siteData}) {
    // 注册全局组件
    app.component('category', Category);


  },

  // setup 是 Vue 3 引入的一个组合式 API 函数。
  // 它在组件实例创建之前被调用，可以用来定义组件的响应式数据、计算属性、方法等。
  // setup 函数返回的对象中的属性和方法将自动暴露给模板使用。
  // 使用 setup 可以更灵活地管理组件的逻辑，支持更好的代码组织和复用。
  setup() {
    const route = useRoute();
    const sidebar = useSidebar();
    const {page,theme,frontmatter} = useData();

    // // 动态获取主题中的配置 '/00-TechnicalFile/', '/01-Essay/', '/02-Other/'
    // const indexPagePaths = theme.value.nav.map(item => item.link);
    //
    // // 判断是否是 index.md 页面
    // const isIndexPage = () => {
    //   return indexPagePaths.includes(route.path);
    // };


    // 为每个H1标签下生成Git提交时间
    const addUpdateTimeDiv = () => {
      const h1Element = document.querySelector('.vp-doc h1')
      // 检查是否已存在 LastUpdated div，避免重复添加
      if (h1Element && !document.querySelector('.LastUpdated')) {
        const updateTimeDiv = document.createElement('div')
        updateTimeDiv.className = 'LastUpdated'

        if (page.value.lastUpdated) {
          updateTimeDiv.textContent = `Last Updated: ${formatTimestamp(page.value.lastUpdated)}`
        }

        h1Element.insertAdjacentElement('afterend', updateTimeDiv)

        //加载浏览量
        const view = fetchViews(route.path);

        view.then(value => {
          if (updateTimeDiv && !document.querySelector('.views')) {
            // 创建 views 元素
            const viewSpan = document.createElement('span');
            viewSpan.className = 'views';
            viewSpan.textContent = `${value}`;


            // updateTimeDiv.insertAdjacentElement('afterbegin', viewSpan);
            updateTimeDiv.insertAdjacentElement('beforeend', viewSpan);
          }
        })

      }
    }

    const initZoom = () => {
      mediumZoom('.main img', { background: 'var(--vp-c-bg)' }); // 不显式添加{data-zoomable}的情况下为所有图像启用此功能
    };

    // 当只有一级标题时 隐藏目录
    const toggleAsideVisibility = () => {
      // 查找页面中是否有 h2 标签
      const hasH2Tag = document.querySelectorAll('h2').length > 0;
      // 获取目标元素
      const asideElement:HTMLElement = document.querySelector('.VPDoc .aside');
      if (asideElement) {
        if (hasH2Tag) {
          asideElement.style.display = '';
        } else {
          asideElement.style.display = 'none';
        }
      }
    };

    onMounted(() => { // 即时触发
      toggleAsideVisibility();
      addUpdateTimeDiv();
      initZoom();
      recordView(route.path); // 记录当前页面的访问量
      // updateSidebarVisibility();
      // window.addEventListener('resize', updateSidebarVisibility);
    });
    watch(
        () => route.path,
        (newPath) => {
          nextTick(() => { // 页面路由时触发
            initZoom();
            addUpdateTimeDiv();
            toggleAsideVisibility();
            recordView(route.path);
          });
        }
    );


    // giscus配置（评论系统）  https://giscus.app/zh-CN
    giscusTalk({
          repo: 'xrz-baizer/blog', //仓库
          repoId: 'R_kgDONPwC5A', //仓库ID
          category: 'Announcements', // 讨论分类
          categoryId: 'DIC_kwDONPwC5M4Ck7mC', //讨论分类ID
          mapping: 'title',
          inputPosition: 'bottom',  // 将评论框放在评论下面
          reactionsEnabled: '0', //禁用点赞
          lang: 'en',
          // lang: 'zh-CN',
        },
        {frontmatter, route},
        true //是否启用，默认为true。也可以在frontmatter中单独配置“comment:true”
    );
  },
}
