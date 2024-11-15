import { defineConfig } from 'vitepress'
import AutoSidebar from 'vite-plugin-vitepress-auto-sidebar'


// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "花有重开日",
  titleTemplate: ':title | Baizer', //:title 为md文件一级标题
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  // head: [['link', { rel: "icon", type: "image/png", sizes: "72x72", href: "/xrz.png"}]],

  themeConfig: {

    // logo: '/xrz.png',
    logo: '/lotus.svg',

    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'English Leaning', link: '/02-English/' },
      { text: 'Technical Article', link: '/00-TechnicalFile/' },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ],

    outline:{
      level: [1,4],  //配置所有文章目录显示的深度
    },
    search: {
      provider: 'local' //开启本地搜索
    },
    lastUpdated: {  //设置最后更新时间样式
      text: 'Updated at',
      formatOptions: {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }
    },
    footer: { // 页脚版权信息
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2019-present Evan You'
    }

  },
  lastUpdated: true,  //显示最后更新时间
  markdown: {
    lineNumbers: true // 代码块启用行号
  },
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
