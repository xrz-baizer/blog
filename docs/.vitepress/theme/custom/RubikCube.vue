<template>
  <div class="rubik-cube-wrapper">
    <div id="rubik-container" ref="containerRef"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const containerRef = ref<HTMLElement | null>(null)
let rubikInstance: any = null
let scriptsLoaded = false

// 动态加载脚本
const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 检查是否已经加载过
    const existingScript = document.querySelector(`script[src="${src}"]`)
    if (existingScript) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
    document.head.appendChild(script)
  })
}

// 加载样式
const loadStyle = (href: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const existingLink = document.querySelector(`link[href="${href}"]`)
    if (existingLink) {
      resolve()
      return
    }

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.onload = () => resolve()
    link.onerror = () => reject(new Error(`Failed to load style: ${href}`))
    document.head.appendChild(link)
  })
}

onMounted(async () => {
  if (scriptsLoaded) {
    initRubik()
    return
  }

  try {
    // 按顺序加载脚本
    await loadScript('/RubikCube/js/oz.js')
    await loadScript('/RubikCube/js/css3.oz.js')
    await loadScript('/RubikCube/js/quaternion.js')
    await loadScript('/RubikCube/js/rubik-fixed.js')  // 使用修复版本
    await loadStyle('/RubikCube/css/style.css')

    scriptsLoaded = true

    // 等待一下确保脚本完全初始化
    setTimeout(() => {
      initRubik()
    }, 100)
  } catch (error) {
    console.error('Failed to load Rubik Cube scripts:', error)
  }
})

const initRubik = () => {
  // @ts-ignore
  if (typeof Rubik === 'undefined' || typeof OZ === 'undefined') {
    console.error('Rubik or OZ is not defined')
    return
  }

  const container = containerRef.value
  if (!container) return

  container.classList.add('theme-4')

  // 创建魔方实例（会自动添加到body）
  // @ts-ignore
  rubikInstance = new Rubik()

  // 等待DOM更新后获取新添加的魔方节点
  setTimeout(() => {
    // 魔方节点应该是body的最后一个子节点
    const cubeNode = document.body.children[document.body.children.length - 1]

    // 验证这是魔方节点（检查是否有position:absolute样式）
    // @ts-ignore
    if (cubeNode && cubeNode.style && cubeNode.style.position === 'absolute') {
      // 将魔方节点移动到我们的容器中
      container.appendChild(cubeNode)

      // 重置魔方节点的定位，使其在容器内居中
      // @ts-ignore
      cubeNode.style.position = 'absolute'
      // @ts-ignore
      cubeNode.style.left = '50%'
      // @ts-ignore
      cubeNode.style.top = '50%'
    }
  }, 50)
}

onBeforeUnmount(() => {
  // 清理魔方实例
  if (rubikInstance && containerRef.value) {
    const cubeNode = containerRef.value.querySelector('div[style*="position"]')
    if (cubeNode) {
      cubeNode.remove()
    }
  }

  // 移除主题类
  if (containerRef.value) {
    containerRef.value.classList.remove('theme-9')
  }
})
</script>

<style scoped>
.rubik-cube-wrapper {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  perspective: 460px;
}

#rubik-container {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

/* 魔方本身需要可交互和保持3D效果 */
.rubik-cube-wrapper :deep(> div) {
  pointer-events: auto;
  transform-style: preserve-3d !important;
}

/* PC端：调整魔方大小 */
.rubik-cube-wrapper :deep(> div) {
  transform: scale(0.75) !important;
  transform-origin: center center !important;
  transform-style: preserve-3d !important;
}

/* 确保魔方内部的cube也保持3D */
.rubik-cube-wrapper :deep(.cube) {
  transform-style: preserve-3d !important;
}

/* Tablet responsive */
@media (max-width: 960px) {
  .rubik-cube-wrapper {
    height: 350px;
  }

  .rubik-cube-wrapper :deep(> div) {
    transform: scale(0.7) !important;
  }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .rubik-cube-wrapper {
    height: 280px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  #rubik-container {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .rubik-cube-wrapper :deep(> div) {
    transform: scale(0.42) !important;
    position: relative !important;
    left: 0 !important;
    top: 0 !important;
  }
}

@media (max-width: 480px) {
  .rubik-cube-wrapper {
    height: 240px;
  }

  .rubik-cube-wrapper :deep(> div) {
    transform: scale(0.35) !important;
  }
}
</style>

<style>
/*
  魔方主题样式 - 使用 theme-9 (光泽科技蓝玻璃20%透明度)
*/

/* Theme 1: Standard Solid - 标准实色 */
.rubik-cube-wrapper.theme-1 :deep(.face) {
  border: 2px solid black !important;
}
.rubik-cube-wrapper.theme-1 :deep(.face-color-red) { background-color: red !important; background-image: none !important; }
.rubik-cube-wrapper.theme-1 :deep(.face-color-blue) { background-color: blue !important; background-image: none !important; }
.rubik-cube-wrapper.theme-1 :deep(.face-color-green) { background-color: green !important; background-image: none !important; }
.rubik-cube-wrapper.theme-1 :deep(.face-color-yellow) { background-color: yellow !important; background-image: none !important; }
.rubik-cube-wrapper.theme-1 :deep(.face-color-white) { background-color: white !important; background-image: none !important; }
.rubik-cube-wrapper.theme-1 :deep(.face-color-orange) { background-color: orange !important; background-image: none !important; }
.rubik-cube-wrapper.theme-1 :deep(.face-color-inner) { background-color: #333 !important; background-image: none !important; }

/* Theme 2: Tech Solid - 科技蓝实色 */
.rubik-cube-wrapper.theme-2 :deep(.face) {
  border: 2px solid black !important;
}
.rubik-cube-wrapper.theme-2 :deep(.face-color-red) { background-color: #00BFFF !important; background-image: none !important; }
.rubik-cube-wrapper.theme-2 :deep(.face-color-blue) { background-color: #1E90FF !important; background-image: none !important; }
.rubik-cube-wrapper.theme-2 :deep(.face-color-green) { background-color: #00FFFF !important; background-image: none !important; }
.rubik-cube-wrapper.theme-2 :deep(.face-color-yellow) { background-color: #7FFFD4 !important; background-image: none !important; }
.rubik-cube-wrapper.theme-2 :deep(.face-color-white) { background-color: #4682B4 !important; background-image: none !important; }
.rubik-cube-wrapper.theme-2 :deep(.face-color-orange) { background-color: #5F9EA0 !important; background-image: none !important; }
.rubik-cube-wrapper.theme-2 :deep(.face-color-inner) { background-color: #333 !important; background-image: none !important; }

/* Theme 3: Glossy Tech Solid - 光泽科技蓝实色 */
.rubik-cube-wrapper.theme-3 :deep(.face) {
  border: 2px solid black !important;
}
.rubik-cube-wrapper.theme-3 :deep(.face-color-red) { background-image: radial-gradient(circle at 20px 20px, rgba(255,255,255,0.5), transparent 40%), linear-gradient(to bottom right, #00BFFF, #008FFF) !important; }
.rubik-cube-wrapper.theme-3 :deep(.face-color-blue) { background-image: radial-gradient(circle at 20px 20px, rgba(255,255,255,0.5), transparent 40%), linear-gradient(to bottom right, #1E90FF, #1070CF) !important; }
.rubik-cube-wrapper.theme-3 :deep(.face-color-green) { background-image: radial-gradient(circle at 20px 20px, rgba(255,255,255,0.5), transparent 40%), linear-gradient(to bottom right, #00FFFF, #00CFCF) !important; }
.rubik-cube-wrapper.theme-3 :deep(.face-color-yellow) { background-image: radial-gradient(circle at 20px 20px, rgba(255,255,255,0.5), transparent 40%), linear-gradient(to bottom right, #7FFFD4, #6FDFB4) !important; }
.rubik-cube-wrapper.theme-3 :deep(.face-color-white) { background-image: radial-gradient(circle at 20px 20px, rgba(255,255,255,0.5), transparent 40%), linear-gradient(to bottom right, #4682B4, #3672A4) !important; }
.rubik-cube-wrapper.theme-3 :deep(.face-color-orange) { background-image: radial-gradient(circle at 20px 20px, rgba(255,255,255,0.5), transparent 40%), linear-gradient(to bottom right, #5F9EA0, #4F8E90) !important; }
.rubik-cube-wrapper.theme-3 :deep(.face-color-inner) { background-color: #333 !important; background-image: none !important; }

/* Glass Theme Base - 玻璃主题基础样式 */
.rubik-cube-wrapper.theme-4 :deep(.face), .rubik-cube-wrapper.theme-5 :deep(.face), .rubik-cube-wrapper.theme-6 :deep(.face), .rubik-cube-wrapper.theme-7 :deep(.face), .rubik-cube-wrapper.theme-8 :deep(.face), .rubik-cube-wrapper.theme-9 :deep(.face) {
  border: 1px solid rgba(0,0,0,0.2) !important;
  background-color: transparent !important;
}

/* Theme 4: Standard Glass 10% - 标准玻璃10%透明度 */
.rubik-cube-wrapper.theme-4 :deep(.face-color-red) { background-color: rgba(255, 0, 0, 0.1) !important; background-image: none !important; }
.rubik-cube-wrapper.theme-4 :deep(.face-color-blue) { background-color: rgba(0, 0, 255, 0.1) !important; background-image: none !important; }
.rubik-cube-wrapper.theme-4 :deep(.face-color-green) { background-color: rgba(0, 255, 0, 0.1) !important; background-image: none !important; }
.rubik-cube-wrapper.theme-4 :deep(.face-color-yellow) { background-color: rgba(255, 255, 0, 0.1) !important; background-image: none !important; }
.rubik-cube-wrapper.theme-4 :deep(.face-color-white) { background-color: rgba(255, 255, 255, 0.1) !important; background-image: none !important; }
.rubik-cube-wrapper.theme-4 :deep(.face-color-orange) { background-color: rgba(255, 165, 0, 0.1) !important; background-image: none !important; }
.rubik-cube-wrapper.theme-4 :deep(.face-color-inner) { background-color: rgba(128, 128, 128, 0.1) !important; background-image: none !important; }

/* Theme 5: Standard Glass 20% - 标准玻璃20%透明度 */
.rubik-cube-wrapper.theme-5 :deep(.face-color-red) { background-color: rgba(255, 0, 0, 0.2) !important; background-image: none !important; }
.rubik-cube-wrapper.theme-5 :deep(.face-color-blue) { background-color: rgba(0, 0, 255, 0.2) !important; background-image: none !important; }
.rubik-cube-wrapper.theme-5 :deep(.face-color-green) { background-color: rgba(0, 255, 0, 0.2) !important; background-image: none !important; }
.rubik-cube-wrapper.theme-5 :deep(.face-color-yellow) { background-color: rgba(255, 255, 0, 0.2) !important; background-image: none !important; }
.rubik-cube-wrapper.theme-5 :deep(.face-color-white) { background-color: rgba(255, 255, 255, 0.2) !important; background-image: none !important; }
.rubik-cube-wrapper.theme-5 :deep(.face-color-orange) { background-color: rgba(255, 165, 0, 0.2) !important; background-image: none !important; }
.rubik-cube-wrapper.theme-5 :deep(.face-color-inner) { background-color: rgba(128, 128, 128, 0.1) !important; background-image: none !important; }

/* Theme 6: Tech Glass 10% - 科技蓝玻璃10%透明度 */
.rubik-cube-wrapper.theme-6 :deep(.face-color-red) { background-color: rgba(0, 191, 255, 0.1) !important; background-image: none !important; }
.rubik-cube-wrapper.theme-6 :deep(.face-color-blue) { background-color: rgba(30, 144, 255, 0.1) !important; background-image: none !important; }
.rubik-cube-wrapper.theme-6 :deep(.face-color-green) { background-color: rgba(0, 255, 255, 0.1) !important; background-image: none !important; }
.rubik-cube-wrapper.theme-6 :deep(.face-color-yellow) { background-color: rgba(127, 255, 212, 0.1) !important; background-image: none !important; }
.rubik-cube-wrapper.theme-6 :deep(.face-color-white) { background-color: rgba(70, 130, 180, 0.1) !important; background-image: none !important; }
.rubik-cube-wrapper.theme-6 :deep(.face-color-orange) { background-color: rgba(95, 158, 160, 0.1) !important; background-image: none !important; }
.rubik-cube-wrapper.theme-6 :deep(.face-color-inner) { background-color: rgba(128, 128, 128, 0.1) !important; background-image: none !important; }

/* Theme 7: Tech Glass 20% - 科技蓝玻璃20%透明度 */
.rubik-cube-wrapper.theme-7 :deep(.face-color-red) { background-color: rgba(0, 191, 255, 0.2) !important; background-image: none !important; }
.rubik-cube-wrapper.theme-7 :deep(.face-color-blue) { background-color: rgba(30, 144, 255, 0.2) !important; background-image: none !important; }
.rubik-cube-wrapper.theme-7 :deep(.face-color-green) { background-color: rgba(0, 255, 255, 0.2) !important; background-image: none !important; }
.rubik-cube-wrapper.theme-7 :deep(.face-color-yellow) { background-color: rgba(127, 255, 212, 0.2) !important; background-image: none !important; }
.rubik-cube-wrapper.theme-7 :deep(.face-color-white) { background-color: rgba(70, 130, 180, 0.2) !important; background-image: none !important; }
.rubik-cube-wrapper.theme-7 :deep(.face-color-orange) { background-color: rgba(95, 158, 160, 0.2) !important; background-image: none !important; }
.rubik-cube-wrapper.theme-7 :deep(.face-color-inner) { background-color: rgba(128, 128, 128, 0.1) !important; background-image: none !important; }

/* Theme 8: Glossy Tech Glass 10% - 光泽科技蓝玻璃10%透明度 */
.rubik-cube-wrapper.theme-8 :deep(.face-color-red) { background-color: rgba(0, 191, 255, 0.1) !important; background-image: radial-gradient(circle at 20px 20px, rgba(255,255,255,0.2), transparent 40%) !important; }
.rubik-cube-wrapper.theme-8 :deep(.face-color-blue) { background-color: rgba(30, 144, 255, 0.1) !important; background-image: radial-gradient(circle at 20px 20px, rgba(255,255,255,0.2), transparent 40%) !important; }
.rubik-cube-wrapper.theme-8 :deep(.face-color-green) { background-color: rgba(0, 255, 255, 0.1) !important; background-image: radial-gradient(circle at 20px 20px, rgba(255,255,255,0.2), transparent 40%) !important; }
.rubik-cube-wrapper.theme-8 :deep(.face-color-yellow) { background-color: rgba(127, 255, 212, 0.1) !important; background-image: radial-gradient(circle at 20px 20px, rgba(255,255,255,0.2), transparent 40%) !important; }
.rubik-cube-wrapper.theme-8 :deep(.face-color-white) { background-color: rgba(70, 130, 180, 0.1) !important; background-image: radial-gradient(circle at 20px 20px, rgba(255,255,255,0.2), transparent 40%) !important; }
.rubik-cube-wrapper.theme-8 :deep(.face-color-orange) { background-color: rgba(95, 158, 160, 0.1) !important; background-image: radial-gradient(circle at 20px 20px, rgba(255,255,255,0.2), transparent 40%) !important; }
.rubik-cube-wrapper.theme-8 :deep(.face-color-inner) { background-color: rgba(128, 128, 128, 0.1) !important; background-image: none !important; }

/* Theme 9: Glossy Tech Glass 20% - 光泽科技蓝玻璃20%透明度 */
.rubik-cube-wrapper.theme-9 :deep(.face-color-red) { background-color: rgba(0, 191, 255, 0.2) !important; background-image: radial-gradient(circle at 20px 20px, rgba(255,255,255,0.2), transparent 40%) !important; }
.rubik-cube-wrapper.theme-9 :deep(.face-color-blue) { background-color: rgba(30, 144, 255, 0.2) !important; background-image: radial-gradient(circle at 20px 20px, rgba(255,255,255,0.2), transparent 40%) !important; }
.rubik-cube-wrapper.theme-9 :deep(.face-color-green) { background-color: rgba(0, 255, 255, 0.2) !important; background-image: radial-gradient(circle at 20px 20px, rgba(255,255,255,0.2), transparent 40%) !important; }
.rubik-cube-wrapper.theme-9 :deep(.face-color-yellow) { background-color: rgba(127, 255, 212, 0.2) !important; background-image: radial-gradient(circle at 20px 20px, rgba(255,255,255,0.2), transparent 40%) !important; }
.rubik-cube-wrapper.theme-9 :deep(.face-color-white) { background-color: rgba(70, 130, 180, 0.2) !important; background-image: radial-gradient(circle at 20px 20px, rgba(255,255,255,0.2), transparent 40%) !important; }
.rubik-cube-wrapper.theme-9 :deep(.face-color-orange) { background-color: rgba(95, 158, 160, 0.2) !important; background-image: radial-gradient(circle at 20px 20px, rgba(255,255,255,0.2), transparent 40%) !important; }
.rubik-cube-wrapper.theme-9 :deep(.face-color-inner) { background-color: rgba(128, 128, 128, 0.1) !important; background-image: none !important; }
</style>
