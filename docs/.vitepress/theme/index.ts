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
import ConvertWordComponent from './tool/ConvertWordComponent.vue'
import AudioLyricPlayer from './tool/AudioLyricPlayer.vue'
import SelectWordComponent from './tool/SelectWordComponent.vue'
import RubikCube from './custom/RubikCube.vue'
import Breadcrumb from './custom/Breadcrumb.vue'

import giscusTalk from 'vitepress-plugin-comment-with-giscus';


export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
      // 在所有doc类型md文件前加载该组件
      'doc-before': () => h(Breadcrumb),
      // 'aside-top': () => h(Update)
      'home-hero-image': () => h(RubikCube)
    })
  },

  // enhanceApp
  // 这是在 Vue 3 中用于增强应用的一个钩子函数。
  // 它通常在应用初始化时被调用，可以用来注册全局组件、插件或修改 Vue 实例。
  // 通过 enhanceApp，开发者可以在应用启动前执行一些配置或初始化操作。
  enhanceApp({ app, router, siteData}) {
    // 注册全局组件
    app.component('category', Category);
    app.component('convertWordComponent', ConvertWordComponent);
    app.component('audioLyricPlayer', AudioLyricPlayer);
    app.component('SelectWordComponent', SelectWordComponent);


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

    // 侧边栏状态持久化
    const STORAGE_KEY_PREFIX = 'vitepress:sidebar:state:';

    const getSidebarKey = () => {
      // 获取当前路径的第一级目录作为 key
      const pathParts = route.path.split('/').filter(p => p);
      const basePath = pathParts[0] || 'home';
      return STORAGE_KEY_PREFIX + basePath;
    };

    const saveSidebarState = () => {
      const state = {};
      const groups = document.querySelectorAll('.VPSidebarItem.level-1.collapsible');
      console.log('[Sidebar] Saving state, found groups:', groups.length);

      // 如果没有找到可折叠的侧边栏项，不保存状态，避免覆盖有效状态
      if (groups.length === 0) {
        console.log('[Sidebar] No collapsible groups found, skipping save');
        return;
      }

      groups.forEach((group) => {
        const title = group.querySelector('h3.text');
        const text = title?.textContent?.trim();

        if (text) {
          // collapsed 类表示折叠，没有这个类表示展开
          const isOpen = !group.classList.contains('collapsed');
          state[text] = isOpen;
          console.log('[Sidebar] Saving:', text, '=', isOpen);
        }
      });

      const key = getSidebarKey();
      localStorage.setItem(key, JSON.stringify(state));
      console.log('[Sidebar] Saved to localStorage with key:', key, state);
    };

    const restoreSidebarState = () => {
      const key = getSidebarKey();
      const savedState = localStorage.getItem(key);
      console.log('[Sidebar] Restoring state from key:', key, savedState);
      if (!savedState) return;

      try {
        const state = JSON.parse(savedState);
        let restored = false;

        // 尝试恢复侧边栏状态
        const attemptRestore = () => {
          if (restored) return true;

          const groups = document.querySelectorAll('.VPSidebarItem.level-1.collapsible');
          console.log('[Sidebar] Restoring, found groups:', groups.length);

          if (groups.length === 0) return false;

          const sidebar = document.querySelector('.VPSidebar') as HTMLElement;

          groups.forEach((group) => {
            const title = group.querySelector('h3.text');
            const text = title?.textContent?.trim();

            if (text && state.hasOwnProperty(text)) {
              const shouldBeOpen = state[text];
              const isCurrentlyOpen = !group.classList.contains('collapsed');

              console.log('[Sidebar] Restoring:', text, 'should be:', shouldBeOpen, 'currently:', isCurrentlyOpen);

              // 直接操作 CSS 类，不触发点击动画
              if (shouldBeOpen && !isCurrentlyOpen) {
                group.classList.remove('collapsed');
                console.log('[Sidebar] Expanded:', text);
              } else if (!shouldBeOpen && isCurrentlyOpen) {
                group.classList.add('collapsed');
                console.log('[Sidebar] Collapsed:', text);
              }
            }
          });

          // 显示侧边栏并恢复过渡动画
          if (sidebar) {
            sidebar.style.opacity = '1';
            setTimeout(() => {
              sidebar.classList.remove('no-transition');
            }, 50);
          }

          if (groups.length > 0) {
            restored = true;
            console.log('[Sidebar] Restore completed');
          }

          return restored;
        };

        // 立即隐藏侧边栏，防止闪烁
        const sidebar = document.querySelector('.VPSidebar') as HTMLElement;
        if (sidebar) {
          sidebar.style.opacity = '0';
          sidebar.classList.add('no-transition');
        }

        // 使用 MutationObserver 监听侧边栏渲染
        if (sidebar) {
          const observer = new MutationObserver(() => {
            if (attemptRestore()) {
              observer.disconnect();
            }
          });

          observer.observe(sidebar, {
            childList: true,
            subtree: true
          });

          // 设置超时自动断开，并确保显示侧边栏
          setTimeout(() => {
            observer.disconnect();
            if (!restored && sidebar) {
              sidebar.style.opacity = '1';
              sidebar.classList.remove('no-transition');
            }
          }, 1000);
        }

        // 极早期尝试（在下一个微任务中）
        Promise.resolve().then(attemptRestore);
        // 多次尝试恢复（兜底机制）
        setTimeout(attemptRestore, 0);
        setTimeout(attemptRestore, 50);
        setTimeout(attemptRestore, 150);
      } catch (e) {
        console.error('Failed to restore sidebar state:', e);
        // 出错时确保侧边栏可见
        const sidebar = document.querySelector('.VPSidebar') as HTMLElement;
        if (sidebar) {
          sidebar.style.opacity = '1';
          sidebar.classList.remove('no-transition');
        }
      }
    };

    const setupSidebarListener = () => {
      // 使用事件委托监听所有点击
      const handleClick = (e: Event) => {
        const target = e.target as HTMLElement;

        // 检查是否点击了侧边栏的可折叠项
        const caretElement = target.closest('.caret');
        const itemElement = target.closest('.VPSidebarItem.level-1.collapsible .item');

        if (caretElement || itemElement) {
          console.log('[Sidebar] Sidebar item clicked');
          // 延迟保存，等待 DOM 更新
          setTimeout(saveSidebarState, 100);
        }
      };

      document.addEventListener('click', handleClick, true); // 使用捕获阶段
      console.log('[Sidebar] Listener setup complete');
    };

    onMounted(() => { // 即时触发
      toggleAsideVisibility();
      addUpdateTimeDiv();
      initZoom();
      recordView(route.path); // 记录当前页面的访问量
      setupSidebarListener();
      restoreSidebarState();
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
            restoreSidebarState();
          });
        }
    );


    // giscus配置（评论系统）  https://giscus.app/zh-CN
    giscusTalk({
          repo: 'xrz-baizer/vitepress-blog-baizer', //仓库
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
