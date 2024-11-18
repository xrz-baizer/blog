import { defineConfig } from 'vitepress'
import AutoSidebar from 'vite-plugin-vitepress-auto-sidebar'
import taskLists from 'markdown-it-task-lists';
import markdownItMark from 'markdown-it-mark';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Baizer白泽",
  titleTemplate: ':title | Baizer', //:title 为md文件一级标题
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  // head: [['link', { rel: "icon", type: "image/png", sizes: "72x72", href: "/xrz.png"}]],
  appearance: false,
  themeConfig: {

    // logo: '/xrz.png',
    // logo: '/lotus.svg',

    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Essay', link: '/01-Essay/' },
      { text: 'TechnicalArticles', link: '/00-TechnicalFile/' },
      { text: 'EnglishLeaning', link: '/02-English/' },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ],

    outline:{
      level: [2,4],  //配置所有文章目录显示的深度
      // label: '',  // On this page
    },
    search: {
      provider: 'local' //开启本地搜索
    },
    lastUpdated: {  //设置最后更新时间样式
      // text: 'Updated at',
      formatOptions: {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: "Asia/Shanghai",
        hour12: false,
      }
    },
    footer: { // 页脚版权信息
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2019-present Evan You'
    },
  },
  lastUpdated: true,  //显示最后更新时间
  markdown: {
    image: {
      lazyLoading: true // 开启图片懒加载
    },
    config: (md) => {
      md.use(taskLists); // 启用任务列表插件
      md.use(markdownItMark); // 启用 ==标记== 的解析
    },
    theme: { // 样式挑选： https://shiki.style/themes
      light: 'catppuccin-latte',
      dark: 'catppuccin-macchiato'
    },
    lineNumbers: true // 代码块启用行号

  },
  ignoreDeadLinks: true, // When set to true, VitePress will not fail builds due to dead links.
  vite: {
    plugins: [
      // 自动生成侧边栏 https://github.com/QC2168/vite-plugin-vitepress-auto-sidebar
      AutoSidebar({
        ignoreIndexItem: true, //忽略index文件
        collapsed: true, //收起所有侧边栏
      })
    ]
  },
})
