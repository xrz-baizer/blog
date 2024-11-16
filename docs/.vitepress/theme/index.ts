// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './style.css'
import './custom/custom.css'
import Category from './custom/Category.vue'
// import MyLayout from './MyLayout.vue'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
      // 'doc-before': () => h(Layout)
    })
  },
  enhanceApp({ app, router, siteData }) {
    app.component('category', Category)
    // app.component('layout', Layout)
  },
}
