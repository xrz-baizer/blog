// https://vitepress.dev/guide/custom-theme
import { h,onMounted, watch, nextTick } from 'vue'
import type { Theme } from 'vitepress'
import {useData, useRoute} from 'vitepress';
import mediumZoom from 'medium-zoom';
import DefaultTheme from 'vitepress/theme'
import './style.css'
import './custom/custom.css'
import Category from './custom/Category.vue'
import Update from './custom/Update.vue'
// import MyLayout from './MyLayout.vue'


export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
      // 在所有doc类型md文件前加载该组件
      'doc-before': () => h(Update),
      // 'aside-top': () => h(Update)
    })
  },
  enhanceApp({ app, router, siteData }) {
    // 注册全局组件
    app.component('category', Category);

    router.onAfterRouteChanged = () => {
      let data = router.route.data;

      // data.frontmatter.sidebar = false;

      // route.data.frontmatter = false
      // sidebar: false
      // console.log(route.data.frontmatter)
      // if (route.path.startsWith('/')) {
      //   // 假设所有 doc 页面路径以 "/" 开头
      //   route.meta.sidebar = true;
      // }
    };
  },
  setup() {
    const route = useRoute();
    const frontmatter = useData();

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

      const sidebarElement = document.querySelector('.VPSidebar');

      elements.forEach(element => {
        if (element) {
          element.classList[isIndexPage ? 'add' : 'remove']('has-sidebar');
        }
      });

      if (sidebarElement) {
        sidebarElement.style.display = isIndexPage ? '' : 'none';
      }
    };

    // 判断是否是 index.md 页面
    const isIndexPage = () => {
      return route.path === '/00-TechnicalFile/' || route.path === '/02-English/';
    };

    // 在客户端环境中使用 MutationObserver ，避免构建失败
    if (typeof window !== 'undefined') {

      // 解决滚动正文时has-sidebar类移除失败的问题
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes') {
            const element = mutation.target as HTMLElement;
            if (!isIndexPage() && element.classList.contains('VPNavBar') && element.classList.contains('has-sidebar')) {
              element.classList.remove('has-sidebar');
            }
          }
        });
      });

      observer.observe(document.body, {
        attributes: true, // 监听属性变化
        subtree: true, // 监听所有子元素
      });
    }



    onMounted(() => {
      toggleSidebar(isIndexPage());
      initZoom();
    });
    watch(
        () => route.path,
        () => {
          nextTick(() => {
            initZoom();
            toggleSidebar(isIndexPage());
          });
        }
    );
  },
}
