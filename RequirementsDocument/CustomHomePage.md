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
- 魔方的样式主题选择：theme-5
- think harder

## 测试

- 可以执行 yarn dev 启动项目。
- 用 chrome-devtools-mcp 访问 http://localhost:5173/ 调试查看主页的实现是否满足需求。

## 实现方案

### 技术方案选择

采用**Vue组件直接加载方案**，在Vue组件中动态加载原RubikCube的JavaScript库，并初始化魔方实例。

### 实现步骤

#### 1. 修复原始魔方代码

文件路径：`docs/public/RubikCube/js/rubik-fixed.js`

修复内容：
- **修复鼠标控制bug**：添加 `mousedown` 和 `touchstart` 事件监听，启用拖拽层级旋转功能
- **移除背景色**：注释掉背景色设置，使用透明背景融入主页

关键修改：
```javascript
// 添加拖拽事件支持
OZ.Event.add(this._node, "mousedown touchstart", this._dragStart.bind(this));

// 移除背景色设置，使用透明背景
// OZ.CSS3.set(this._node, "background-color", "gray");
```

#### 2. 创建Vue魔方组件

文件路径：`docs/.vitepress/theme/custom/RubikCube.vue`

组件功能：
- **动态加载脚本**：按顺序加载oz.js, css3.oz.js, quaternion.js, rubik-fixed.js
- **动态加载样式**：加载魔方的CSS样式文件
- **初始化魔方**：创建Rubik实例并将其挂载到组件容器中
- **响应式缩放**：
  - 桌面端：70%缩放
  - 平板（≤768px）：55%缩放
  - 手机（≤480px）：45%缩放
- **主题应用**：应用theme-5玻璃效果主题

关键代码：
```vue
<template>
  <div class="rubik-cube-wrapper">
    <div id="rubik-container" ref="containerRef"></div>
  </div>
</template>

<script setup lang="ts">
// 动态加载脚本和样式
await loadScript('/RubikCube/js/oz.js')
await loadScript('/RubikCube/js/css3.oz.js')
await loadScript('/RubikCube/js/quaternion.js')
await loadScript('/RubikCube/js/rubik-fixed.js')
await loadStyle('/RubikCube/css/style.css')

// 初始化魔方
rubikInstance = new Rubik()
</script>

<style scoped>
/* 调整魔方大小 - 缩小到70% */
.rubik-cube-wrapper :deep(> div) {
  transform: scale(0.7) !important;
}
</style>
```

#### 3. 配置VitePress主题

文件路径：`docs/.vitepress/theme/index.ts`

修改内容：
- 导入RubikCube组件
- 使用VitePress的Layout Slot机制，将魔方组件注入到 `home-hero-image` 插槽中
- 替换默认主页的hero图片区域

关键代码：
```typescript
import RubikCube from './custom/RubikCube.vue'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      'home-hero-image': () => h(RubikCube)
    })
  },
  // ...
}
```

### 技术要点

1. **VitePress Layout Slots**：使用官方提供的 `home-hero-image` 插槽来替换hero区域的图片
2. **动态脚本加载**：使用Promise按顺序加载依赖库，确保加载顺序正确
3. **脚本去重**：检查脚本是否已加载，避免重复加载
4. **响应式设计**：使用CSS transform scale进行缩放适配
5. **主题选择**：使用theme-5（标准系列20%玻璃效果），颜色为半透明
6. **背景透明**：移除原始代码中的灰色背景，使用主页渐变背景

### 优势

- ✅ 直接在Vue组件中实现，无需iframe隔离
- ✅ 修复了原始代码的鼠标控制bug
- ✅ 魔方尺寸可调节，视觉效果更协调
- ✅ 完全复用VitePress默认主页布局
- ✅ 支持桌面端和移动端响应式显示
- ✅ 魔方可正常交互（鼠标悬停停止、拖拽整体旋转、拖拽层级旋转）
- ✅ 背景透明融入主页设计

## 测试结果

### 桌面端测试 ✅
- 魔方正常显示在主页hero区域
- 尺寸缩小到70%，视觉效果更协调
- 3D旋转动画流畅
- 主题theme-5玻璃效果正常（20%透明度）
- 背景透明，完美融入主页渐变背景
- 鼠标悬停可停止自动旋转
- **鼠标拖拽整体旋转**：可以旋转整个魔方视角
- **鼠标拖拽层级旋转**：可以旋转魔方的某个层（bug已修复）

### 移动端测试 ✅
- iPhone尺寸(375×667)显示正常
- 魔方尺寸自适应缩小到45%
- 3D自动旋转正常
- 触摸交互正常
- 背景透明融入主页

## 实现进度

- [x] 分析现有主页和RubikCube结构
- [x] 查阅VitePress自定义主题文档
- [x] 创建魔方嵌入HTML页面
- [x] 创建RubikCube Vue组件
- [x] 配置VitePress主题使用自定义组件
- [x] 移动端样式适配
- [x] 桌面端功能测试
- [x] 移动端功能测试
- [x] 文档记录

## 相关文件

### 新增文件
- `docs/public/RubikCube/js/rubik-fixed.js` - 修复版魔方脚本（修复鼠标控制bug，移除背景色）
- `docs/.vitepress/theme/custom/RubikCube.vue` - 魔方Vue组件（动态加载脚本并初始化）
- `docs/public/RubikCube/embed.html` - 魔方嵌入页面（备份方案，当前未使用）

### 修改文件
- `docs/.vitepress/theme/index.ts` - 主题配置，注入魔方组件到home-hero-image插槽

### 保持不变
- `docs/public/RubikCube/js/` 目录下的原有文件（oz.js, css3.oz.js, quaternion.js, rubik.js）
- `docs/public/RubikCube/css/style.css` - 魔方样式文件
- `docs/index.md` - 主页markdown配置

### 关键改动说明

1. **rubik-fixed.js**：从rubik.js复制并修复
   - 添加 `mousedown touchstart` 事件绑定
   - 注释掉背景色设置

2. **RubikCube.vue**：完整的Vue组件实现
   - 动态加载所有依赖脚本
   - 初始化魔方实例
   - 响应式缩放设置
   - theme-5主题样式