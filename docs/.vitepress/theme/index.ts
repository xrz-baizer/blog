// https://vitepress.dev/guide/custom-theme
import { h,onMounted, watch, nextTick } from 'vue'
import type { Theme } from 'vitepress'
import {useData, useRoute} from 'vitepress';
import mediumZoom from 'medium-zoom';
import DefaultTheme from 'vitepress/theme'
import './style.css'
import './custom/custom.css'
import { formatTimestamp } from './custom/function.js'
import Category from './custom/Category.vue'


// import Update from './custom/Update.vue'
// import MyLayout from './MyLayout.vue'


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
  enhanceApp({ app, router, siteData }) {
    // 注册全局组件
    app.component('category', Category);

    router.onAfterRouteChanged = () => {

      // // 当前页面数据
      // let pageData = router.route.data;
      // // 等待 DOM 渲染完成后操作
      // setTimeout(() => {
      //   // td
      // }, 0);
    };
  },

  // setup 是 Vue 3 引入的一个组合式 API 函数。
  // 它在组件实例创建之前被调用，可以用来定义组件的响应式数据、计算属性、方法等。
  // setup 函数返回的对象中的属性和方法将自动暴露给模板使用。
  // 使用 setup 可以更灵活地管理组件的逻辑，支持更好的代码组织和复用。
  setup() {
    const route = useRoute();
    const {page,theme} = useData();

    // 动态获取主题中的配置 '/00-TechnicalFile/', '/01-Essay/', '/02-English/'
    const indexPagePaths = theme.value.nav.map(item => item.link);

    // 判断是否是 index.md 页面
    const isIndexPage = () => {
      return indexPagePaths.includes(route.path);
    };

    // 为每个H1标签下生成Git提交时间
    const addUpdateTimeDiv = () => {
      const h1Element = document.querySelector('.vp-doc h1');
      if (h1Element && !document.querySelector('.LastUpdated') && page.value.lastUpdated) {
        const updateTimeDiv = document.createElement('div');
        updateTimeDiv.textContent = ` Last Updated: ` + formatTimestamp(page.value.lastUpdated);
        updateTimeDiv.className = 'LastUpdated';
        h1Element.insertAdjacentElement('afterend', updateTimeDiv);
      }
    }


    const initZoom = () => {
      mediumZoom('.main img', { background: 'var(--vp-c-bg)' }); // 不显式添加{data-zoomable}的情况下为所有图像启用此功能
    };
    const toggleSidebar = (isIndexPage: boolean) => {
      const elements = [
        document.querySelector('#VPContent'),
        document.querySelector('.VPLocalNav'),
        document.querySelector('.VPNavBar'),
        document.querySelector('.VPDoc'),
        document.querySelector('.VPNavBarTitle')
      ];

      const sidebarElement:HTMLElement = document.querySelector('.VPSidebar');

      elements.forEach(element => {
        if (element) {
          element.classList[isIndexPage ? 'add' : 'remove']('has-sidebar');
        }
      });

      // if (sidebarElement) {
      //   sidebarElement.style.display = isIndexPage ? '' : 'none';
      // }
      if (sidebarElement) {
        // 检查页面宽度是否大于960px
        if (window.innerWidth > 960) {
          sidebarElement.style.display = isIndexPage ? '' : 'none';
        } else {
          // 如果页面宽度小于或等于960px，不隐藏侧边栏（兼容app端）
          sidebarElement.style.display = '';
        }
      }
    };

    // 当只有一级标题时 隐藏目录
    const toggleAsideVisibility = () => {
      // 查找页面中是否有 h2 标签
      const hasH2Tag = document.querySelectorAll('h2').length > 0;
      // 获取目标元素
      const asideElement:HTMLElement = document.querySelector('.VPDoc .aside');
      // const contentContainerElement = document.querySelector('.VPDoc.has-aside .content-container');
      // const contentElement = document.querySelector('#VPContent .content');

      if (asideElement) {
        if (hasH2Tag) {
          asideElement.style.display = '';
        } else {
          asideElement.style.display = 'none';
          // contentContainerElement.style.maxWidth = '100%';
          // contentElement.style.maxWidth = '1260px !important';
        }
      }
    };

    // 在客户端环境中使用 MutationObserver ，避免构建失败
    if (typeof window !== 'undefined') {

      const observer = new MutationObserver((mutations) => {
      // 解决滚动正文时has-sidebar类移除失败的问题
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes') {
            const element = mutation.target as HTMLElement;
            if (!isIndexPage() && element.classList.contains('VPNavBar') && element.classList.contains('has-sidebar')) {
              element.classList.remove('has-sidebar');
            }
          }
        });

        toggleAsideVisibility();
      });

      observer.observe(document.body, {
        attributes: true, // 监听属性变化
        subtree: true, // 监听所有子元素
      });
    };


    onMounted(() => {
      // 在页面加载完成后执行
      document.addEventListener('DOMContentLoaded', () => {
        toggleAsideVisibility();
      });
      addUpdateTimeDiv();
      toggleSidebar(isIndexPage());
      initZoom();
    });
    watch(
        () => route.path,
        () => {
          nextTick(() => {
            initZoom();
            toggleSidebar(isIndexPage());
            addUpdateTimeDiv();
          });
        }
    );
  },
}
