import { defineConfig } from 'vitepress'
import AutoSidebar from 'vite-plugin-vitepress-auto-sidebar'
import taskLists from 'markdown-it-task-lists';
import markdownItMark from 'markdown-it-mark';
import { generateArticlesSummaryJSON } from './theme/custom/generateSummary';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Baizer",
  titleTemplate: ':title - Baizer', //:title 为md文件一级标题
  head: [
      ['link', { rel: 'icon', href: '/favicon.ico' }],
  ],
  // head: [['link', { rel: "icon", type: "image/png", sizes: "72x72", href: "/xrz.png"}]],
  appearance: false,  // 放弃暗黑模式
  themeConfig: {

    // logo: '/xrz.png',
    // logo: '/魔方.svg',
    logo: '/lotus.svg',

    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Essay', link: '/01-Essay/' },
      { text: 'TechnicalArticles', link: '/00-TechnicalFile/' },
      { text: 'Other', link: '/02-Other/' },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/xrz-baizer/blog' }
    ],

    outline:{
      level: [2,4],  //配置所有文章目录显示的深度
      // label: '',  // On this page
    },
    search: {
      provider: 'local' //开启本地搜索
    },
    // lastUpdated: {  //设置最后更新时间样式
    //   // text: 'Updated at',
    //   formatOptions: {
    //     year: 'numeric',
    //     month: '2-digit',
    //     day: '2-digit',
    //     hour: '2-digit',
    //     minute: '2-digit',
    //     second: '2-digit',
    //     timeZone: "Asia/Shanghai",
    //     hour12: false,
    //   }
    // },

    footer: { // 页脚版权信息（仅需在首页下展示即可）（域名必须备案 https://cloud.tencent.com/document/product/243/61412）
      message: 'Copyright © 2025 Baizer | All Rights Reserved',
      copyright: '<a href="https://beian.miit.gov.cn/" target="_blank">粤ICP备2024352756号</a> ' +
          ' <img src="/public-security.png"> <a href="https://beian.mps.gov.cn/#/query/webSearch?code=44030002005542" target="_blank" >粤公网安备44030002005542号</a>'
    }
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
    // 当 Vite 构建项目时，会自动加载并执行这些插件
    plugins: [
      AutoSidebar({ // 自动生成侧边栏 https://github.com/QC2168/vite-plugin-vitepress-auto-sidebar
        ignoreIndexItem: true,  //忽略index文件
        collapsed: true,        //收起所有侧边栏
        // 侧边栏排序（文件夹排在前面）
        beforeCreateSideBarItems: (data) => {
          function getOrder(item: string): number {
            // 如果项没有扩展名，则认为它是文件夹
            if (!/\.[^/.]+$/.test(item)) {
              return -1; // 文件夹排在前面
            }
            return 0; // 其他文件排在后面
          }
          data.sort((a, b) => {
            return getOrder(a) - getOrder(b);
          });
          return data;
        },
      }),
      {
        name: 'generate-articles-json',
        buildStart() {
          generateArticlesSummaryJSON();
        },
      },
    ],

    build: {
      chunkSizeWarningLimit: 2000 * 1024, // 打包警告： Allow up to 2000 kB
      // rollupOptions: {
      //   output: {
      //     manualChunks(id) {
      //       if (id.includes('assets')) {
      //         return 'assets-chunk';
      //       }
      //     }
      //   }
      // }
    }
  },
  sitemap: {
    // 生成网站地图，提供搜索引擎（Google、Bing）使用
    hostname: 'https://baizer.info'
  },
  // https://vitepress.dev/zh/reference/site-config#transformpagedata
  // transformPageData 是一个钩子，用于转换每个页面的 pageData。 可以直接改变 pageData 或返回将合并到 PageData 中的更改值。
  transformPageData(pageData) {

    // 在此处变更所有页面的frontmatter属性。
    if(! pageData.relativePath.endsWith('index.md')){
      pageData.frontmatter.sidebar = false; // 优化使用动态css时，页面打开时侧边栏有延迟的问题
    }

  }
})
