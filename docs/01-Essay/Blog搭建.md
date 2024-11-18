# Blog搭建

## 前言

打造个人博客，建立个人知识库，用于记录成体系的知识、随笔等。

最终效果：

1. 推送本地项目至Github

2. Github触发合并事件，执行自定义脚本

   - 重新构建Vitepress生成静态html文件

   - 推送静态文件至Nginx服务器

## 安装

Vitepress快速开始：https://vitepress.dev/zh/guide/getting-started

根据文件目录自动生成侧边栏插件：https://github.com/QC2168/vite-plugin-vitepress-auto-sidebar

样式美化参考：https://vitepress.yiov.top/style.html

## 部署

### Github Action 自动部署

Github Action官网：https://docs.github.com/zh/actions

如果选择部署到Github Pages可以使用Github Action。当检测到分支合并，自动执行脚本进行部署。

Vitepress官方部署参考：https://vitepress.dev/zh/guide/deploy#github-pages

### 服务器部署

Github Pages部署没有自定义的域名，而且网络不好。

而且自己有服务器，逐选择Nginx部署。

#### 1、本地编写sh

-  本地构建，静态文件，推送nginx服务器



参考：https://www.it235.com/guide/notes/vuepress.html#%E4%BA%91%E6%9C%8D%E5%8A%A1ecs%E9%85%8D%E7%BD%AE%E7%8E%AF%E5%A2%83



https://docs.github.com/en/webhooks/about-webhooks
