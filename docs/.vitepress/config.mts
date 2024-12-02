import { defineConfig } from 'vitepress'
import AutoSidebar from 'vite-plugin-vitepress-auto-sidebar'
import taskLists from 'markdown-it-task-lists';
import markdownItMark from 'markdown-it-mark';
import fs from 'fs';
import path from 'path';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Baizer",
  titleTemplate: ':title | Baizer', //:title 为md文件一级标题
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
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
      { text: 'EnglishLeaning', link: '/02-English/' },
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
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 Baizer | <a href="https://beian.miit.gov.cn/" target="_blank">京ICP备12345678号</a>'
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
    plugins: [
      // 自动生成侧边栏 https://github.com/QC2168/vite-plugin-vitepress-auto-sidebar
      AutoSidebar({
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
          const articlesDir = path.resolve(__dirname, '../../docs'); // Markdown 文件所在目录
          const outputPath = path.resolve(__dirname, '../../docs/public/articles.js'); // 输出 JSON 文件路径

          const markdownFiles = getMarkdownFiles(articlesDir);
          const articlesMap = {};

          markdownFiles.forEach(filePath => {
            // 读取 Markdown 文件
            const content = fs.readFileSync(filePath, 'utf-8');
            // 清理无用内容
            const cleanText = cleanContent(content);
            // 提取前 200 个字符作为摘要
            const summary = cleanText.slice(0, 200).replace(/[\r\n]/g, ' ');
            // 使用相对路径作为键
            const relativePath = path.relative(articlesDir, filePath);
            // 记录
            articlesMap[relativePath] = summary;
          });

          // 将数据导出为 JavaScript 模块
          const fileContent = `export const articlesMap = ${JSON.stringify(articlesMap, null, 2)}`;

          fs.writeFileSync(outputPath, fileContent);


          function cleanContent(content) {
            // 跳过 YAML Front Matter
            content = content.replace(/^---[\s\S]*?---/, '').trim();
            // 移除标题（例如 # 一级标题）
            content = content.replace(/^#\s*[^#\n]*\n/gm, '');
            // 替换 <img> 标签
            content = content.replace(/<img[^>]*>/gi, '');
            // 移除 Markdown 图片引用 ![](url)
            content = content.replace(/!\[[^\]]*\]\([^\)]+\)/g, '');
            // 处理 http:// 和 https:// 开头的 URL，保留前 15 个字符并在后面加上省略号
            content = content.replace(/(https?:\/\/[^\s]+)(?=\s|$)/gi, (match) => match.slice(0, 15) + '...');
            // 移除加粗文本（**加粗文本**）
            content = content.replace(/\*\*[^*]*\*\*/g, '');
            // 移除所有 == 高亮文本
            content = content.replace(/==[^=]*==/g, '');
            return content;
          }

          function getMarkdownFiles(dir) {
            const results = [];
            fs.readdirSync(dir).forEach(file => {
              const filePath = path.join(dir, file);
              const stats = fs.statSync(filePath);

              if (stats.isDirectory()) {
                // 递归扫描子文件夹
                results.push(...getMarkdownFiles(filePath));
              } else if (stats.isFile() && file.endsWith('.md')) {
                results.push(filePath);
              }
            });
            return results;
          }
        },
      },
    ],
  },
})
