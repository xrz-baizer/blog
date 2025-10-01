## 背景

- 这是基于 Vitepress1.5 改造的个人网站。
- 可以使用 context7-mcp 获取对应的文档信息：https://vuejs.github.io/vitepress/v1/guide/custom-theme

## 需求

- 我对目前框架中的的默认主页大部分都是满意的，但是就是主页中的中心图片不行（hero-image-src），我想放一个用html实现的魔方上去。
- 我想到的方式就是自定义主题，vitepress官网也是支持的，我想让你帮我实现一下这个自定义的主页。
- 这个主页布局基本可以参考默认主页的实现，就是要把默认主页的图片替换成html魔方，你看一下怎么嵌入这个魔方。
- 注意不要改动原先的RubikCube中的文件，可以复制相关的文件，构建一个新的vue组件，然后再嵌入的自定义的主页中。
- 注意要适配移动端.
- 这是默认主页：@/Users/Work/Pagoda/this/Blog/docs/index.md
- 这是html魔方的实现： @/Users/Work/Pagoda/this/Blog/docs/public/RubikCube/index.html