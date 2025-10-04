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
    // await loadStyle('/RubikCube/css/style.css')  // 使用修复版本

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

  // 移除 body 上的 perspective,因为我们在 CSS 中已经设置了
  document.body.style.perspective = ''

  // 创建魔方实例(会自动添加到body，节点创建时已被设置为hidden)
  // @ts-ignore
  rubikInstance = new Rubik()

  // 等待DOM更新后移动节点到容器
  setTimeout(() => {
    // 获取魔方节点（应该是body的最后一个子节点）
    const cubeNode = document.body.children[document.body.children.length - 1] as HTMLElement

    // 验证这是魔方节点(检查是否有position:absolute样式)
    if (cubeNode && cubeNode.style && cubeNode.style.position === 'absolute') {
      // 创建一个wrapper来隔离scale和preserve-3d（移动端关键修复）
      const scaleWrapper = document.createElement('div')
      scaleWrapper.className = 'rubik-scale-wrapper'
      scaleWrapper.style.position = 'relative'
      scaleWrapper.style.width = '100%'
      scaleWrapper.style.height = '100%'
      scaleWrapper.style.webkitTransformStyle = 'preserve-3d'
      scaleWrapper.style.transformStyle = 'preserve-3d'
      // Safari fix: 强制GPU加速
      scaleWrapper.style.webkitBackfaceVisibility = 'hidden'
      scaleWrapper.style.backfaceVisibility = 'hidden'

      // 将wrapper添加到容器中
      container.appendChild(scaleWrapper)

      // 将魔方节点移动到wrapper中（而不是直接到container）
      scaleWrapper.appendChild(cubeNode)

      // 重置魔方节点的定位,使其在容器内居中
      cubeNode.style.position = 'absolute'
      cubeNode.style.left = '50%'
      cubeNode.style.top = '50%'

      // Safari/移动端关键修复：在移动节点后，必须重新强制设置所有3D属性
      cubeNode.style.webkitTransformStyle = 'preserve-3d'
      cubeNode.style.transformStyle = 'preserve-3d'
      cubeNode.style.webkitBackfaceVisibility = 'hidden'
      cubeNode.style.backfaceVisibility = 'hidden'

      // 获取当前transform值并重新应用（Safari/移动端必需：触发3D上下文重建）
      const currentTransform = cubeNode.style.transform || cubeNode.style.webkitTransform
      if (currentTransform) {
        // 清空transform
        cubeNode.style.webkitTransform = ''
        cubeNode.style.transform = ''
        // 强制浏览器重排
        void cubeNode.offsetHeight
        // 重新应用transform（这一步对Safari/移动端的3D效果至关重要）
        cubeNode.style.webkitTransform = currentTransform
        cubeNode.style.transform = currentTransform
      }

      // 确保所有子元素也设置3D（深度遍历所有后代）
      const allChildren = cubeNode.querySelectorAll('*')
      allChildren.forEach((child: any) => {
        child.style.webkitTransformStyle = 'preserve-3d'
        child.style.transformStyle = 'preserve-3d'
        child.style.webkitBackfaceVisibility = 'hidden'
        child.style.backfaceVisibility = 'hidden'
      })

      // 显示节点（节点在rubik-fixed.js中创建时已被设置为hidden）
      cubeNode.style.visibility = 'visible'
    }
  }, 50)
}

onBeforeUnmount(() => {
  // 清理魔方实例（清理整个scale-wrapper）
  if (rubikInstance && containerRef.value) {
    const scaleWrapper = containerRef.value.querySelector('.rubik-scale-wrapper')
    if (scaleWrapper) {
      scaleWrapper.remove()
    }
  }

  // 移除主题类
  if (containerRef.value) {
    containerRef.value.classList.remove('theme-4')
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
  -webkit-perspective: 460px;
  perspective: 460px;
  overflow: visible; /* Safari fix: prevent flattening */
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
}

#rubik-container {
  position: relative;
  width: 100%;
  height: 100%;
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  will-change: transform; /* Safari fix: force GPU acceleration */
  overflow: visible; /* Safari fix: prevent flattening */
}

/* scale wrapper - PC端缩放 */
.rubik-cube-wrapper :deep(.rubik-scale-wrapper) {
  pointer-events: auto;
  -webkit-transform: scale(0.85);
  transform: scale(0.85);
  -webkit-transform-origin: center center;
  transform-origin: center center;
}

/* 确保魔方内部的所有元素也保持3D */
.rubik-cube-wrapper :deep(.cube),
.rubik-cube-wrapper :deep(div),
.rubik-cube-wrapper :deep(*) {
  -webkit-transform-style: preserve-3d !important;
  transform-style: preserve-3d !important;
  -webkit-backface-visibility: hidden !important;
  backface-visibility: hidden !important;
  will-change: transform !important; /* Safari fix */
}

/* Tablet responsive */
@media (max-width: 960px) {
  .rubik-cube-wrapper {
    height: 350px;
  }

  .rubik-cube-wrapper :deep(.rubik-scale-wrapper) {
    -webkit-transform: scale(0.7);
    transform: scale(0.7);
  }
}

/* Mobile responsive - 上下排列显示,使用scale-wrapper隔离3D上下文 */
@media (max-width: 768px) {
  .rubik-cube-wrapper {
    position: relative !important;
    height: 200px;
    margin-top: 20px;
  }

  .rubik-cube-wrapper :deep(.rubik-scale-wrapper) {
    -webkit-transform: scale(0.35);
    transform: scale(0.35);
  }
}

@media (max-width: 480px) {
  .rubik-cube-wrapper {
    height: 80px;
  }

  .rubik-cube-wrapper :deep(.rubik-scale-wrapper) {
    -webkit-transform: scale(0.23);
    transform: scale(0.23);
  }
  .theme-4 .face, .theme-5 .face, .theme-6 .face, .theme-7 .face, .theme-8 .face, .theme-9 .face {
    border: 1px solid rgba(255,255,255,1);
  }
}
</style>

<style>

.face {
  border: 2px solid black;
  border-radius: 10px;
}

.face-color-inner { background-color: #333; }

/* --- Themes --- */

/* Theme 1: Standard Solid */
.theme-1 .face-color-red { background-color: red; }
.theme-1 .face-color-blue { background-color: blue; }
.theme-1 .face-color-green { background-color: green; }
.theme-1 .face-color-yellow { background-color: yellow; }
.theme-1 .face-color-white { background-color: white; }
.theme-1 .face-color-orange { background-color: orange; }

/* Theme 2: Tech Solid */
.theme-2 .face-color-red { background-color: #00BFFF; }
.theme-2 .face-color-blue { background-color: #1E90FF; }
.theme-2 .face-color-green { background-color: #00FFFF; }
.theme-2 .face-color-yellow { background-color: #7FFFD4; }
.theme-2 .face-color-white { background-color: #4682B4; }
.theme-2 .face-color-orange { background-color: #5F9EA0; }

/* Theme 3: Glossy Tech Solid */
.theme-3 .face-color-red { background-image: radial-gradient(circle at 20px 20px, rgba(255,255,255,0.5), transparent 40%), linear-gradient(to bottom right, #00BFFF, #008FFF); }
.theme-3 .face-color-blue { background-image: radial-gradient(circle at 20px 20px, rgba(255,255,255,0.5), transparent 40%), linear-gradient(to bottom right, #1E90FF, #1070CF); }
.theme-3 .face-color-green { background-image: radial-gradient(circle at 20px 20px, rgba(255,255,255,0.5), transparent 40%), linear-gradient(to bottom right, #00FFFF, #00CFCF); }
.theme-3 .face-color-yellow { background-image: radial-gradient(circle at 20px 20px, rgba(255,255,255,0.5), transparent 40%), linear-gradient(to bottom right, #7FFFD4, #6FDFB4); }
.theme-3 .face-color-white { background-image: radial-gradient(circle at 20px 20px, rgba(255,255,255,0.5), transparent 40%), linear-gradient(to bottom right, #4682B4, #3672A4); }
.theme-3 .face-color-orange { background-image: radial-gradient(circle at 20px 20px, rgba(255,255,255,0.5), transparent 40%), linear-gradient(to bottom right, #5F9EA0, #4F8E90); }

/* Glass Theme Base Styles */
.theme-4 .face, .theme-5 .face, .theme-6 .face, .theme-7 .face, .theme-8 .face, .theme-9 .face {
  border: 1px solid rgba(255,255,255,0.4);
  background-color: transparent;
}
.theme-4 .face-color-inner, .theme-5 .face-color-inner, .theme-6 .face-color-inner, .theme-7 .face-color-inner, .theme-8 .face-color-inner, .theme-9 .face-color-inner {
  background-color: rgba(128, 128, 128, 0.1);
}

/* Theme 4: Standard - 10% Glass */
.theme-4 .face-color-red { background-color: rgba(255, 0, 0, 0.1); }
.theme-4 .face-color-blue { background-color: rgba(0, 0, 255, 0.1); }
.theme-4 .face-color-green { background-color: rgba(0, 255, 0, 0.1); }
.theme-4 .face-color-yellow { background-color: rgba(255, 255, 0, 0.1); }
.theme-4 .face-color-white { background-color: rgba(255, 255, 255, 0.1); }
.theme-4 .face-color-orange { background-color: rgba(255, 165, 0, 0.1); }

/* Theme 5: Standard - 20% Glass */
.theme-5 .face-color-red { background-color: rgba(255, 0, 0, 0.2); }
.theme-5 .face-color-blue { background-color: rgba(0, 0, 255, 0.2); }
.theme-5 .face-color-green { background-color: rgba(0, 255, 0, 0.2); }
.theme-5 .face-color-yellow { background-color: rgba(255, 255, 0, 0.2); }
.theme-5 .face-color-white { background-color: rgba(255, 255, 255, 0.2); }
.theme-5 .face-color-orange { background-color: rgba(255, 165, 0, 0.2); }

/* Theme 6: Tech - 10% Glass */
.theme-6 .face-color-red { background-color: rgba(0, 191, 255, 0.1); }
.theme-6 .face-color-blue { background-color: rgba(30, 144, 255, 0.1); }
.theme-6 .face-color-green { background-color: rgba(0, 255, 255, 0.1); }
.theme-6 .face-color-yellow { background-color: rgba(127, 255, 212, 0.1); }
.theme-6 .face-color-white { background-color: rgba(70, 130, 180, 0.1); }
.theme-6 .face-color-orange { background-color: rgba(95, 158, 160, 0.1); }

/* Theme 7: Tech - 20% Glass */
.theme-7 .face-color-red { background-color: rgba(0, 191, 255, 0.2); }
.theme-7 .face-color-blue { background-color: rgba(30, 144, 255, 0.2); }
.theme-7 .face-color-green { background-color: rgba(0, 255, 255, 0.2); }
.theme-7 .face-color-yellow { background-color: rgba(127, 255, 212, 0.2); }
.theme-7 .face-color-white { background-color: rgba(70, 130, 180, 0.2); }
.theme-7 .face-color-orange { background-color: rgba(95, 158, 160, 0.2); }

/* Theme 8: Glossy Tech - 10% Glass */
.theme-8 .face-color-red { background-color: rgba(0, 191, 255, 0.1); background-image: radial-gradient(circle at 20px 20px, rgba(255,255,255,0.2), transparent 40%); }
.theme-8 .face-color-blue { background-color: rgba(30, 144, 255, 0.1); background-image: radial-gradient(circle at 20px 20px, rgba(255,255,255,0.2), transparent 40%); }
.theme-8 .face-color-green { background-color: rgba(0, 255, 255, 0.1); background-image: radial-gradient(circle at 20px 20px, rgba(255,255,255,0.2), transparent 40%); }
.theme-8 .face-color-yellow { background-color: rgba(127, 255, 212, 0.1); background-image: radial-gradient(circle at 20px 20px, rgba(255,255,255,0.2), transparent 40%); }
.theme-8 .face-color-white { background-color: rgba(70, 130, 180, 0.1); background-image: radial-gradient(circle at 20px 20px, rgba(255,255,255,0.2), transparent 40%); }
.theme-8 .face-color-orange { background-color: rgba(95, 158, 160, 0.1); background-image: radial-gradient(circle at 20px 20px, rgba(255,255,255,0.2), transparent 40%); }

/* Theme 9: Glossy Tech - 20% Glass */
.theme-9 .face-color-red { background-color: rgba(0, 191, 255, 0.2); background-image: radial-gradient(circle at 20px 20px, rgba(255,255,255,0.2), transparent 40%); }
.theme-9 .face-color-blue { background-color: rgba(30, 144, 255, 0.2); background-image: radial-gradient(circle at 20px 20px, rgba(255,255,255,0.2), transparent 40%); }
.theme-9 .face-color-green { background-color: rgba(0, 255, 255, 0.2); background-image: radial-gradient(circle at 20px 20px, rgba(255,255,255,0.2), transparent 40%); }
.theme-9 .face-color-yellow { background-color: rgba(127, 255, 212, 0.2); background-image: radial-gradient(circle at 20px 20px, rgba(255,255,255,0.2), transparent 40%); }
.theme-9 .face-color-white { background-color: rgba(70, 130, 180, 0.2); background-image: radial-gradient(circle at 20px 20px, rgba(255,255,255,0.2), transparent 40%); }
.theme-9 .face-color-orange { background-color: rgba(95, 158, 160, 0.2); background-image: radial-gradient(circle at 20px 20px, rgba(255,255,255,0.2), transparent 40%); }


/* Sidebar Styles */
#sidebar {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(255,255,255,0.5);
  padding: 10px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  z-index: 100;
}
#sidebar h3 {
  margin: 10px 0 5px 0;
  text-align: center;
  font-size: 1em;
  font-weight: bold;
}
#sidebar button {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  border: 1px solid #ccc;
  background: #fff;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 4px;
  font-family: sans-serif;
}
</style>
