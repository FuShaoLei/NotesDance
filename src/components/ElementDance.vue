<template>
  <div class="element-dance">
    <div
      v-for="(element, index) in elements"
      :key="index"
      class="dance-element"
      :style="getElementStyle(element, index)"
    >
      <div class="element-inner" :style="getInnerStyle(element, index)"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  bassLevel: {
    type: Number,
    default: 0
  },
  midLevel: {
    type: Number,
    default: 0
  },
  trebleLevel: {
    type: Number,
    default: 0
  }
})

// Create dancing elements
const elements = ref([])

onMounted(() => {
  // Create 20 random elements
  for (let i = 0; i < 20; i++) {
    elements.value.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 30 + Math.random() * 70,
      speed: 0.5 + Math.random() * 1.5,
      rotationSpeed: (Math.random() - 0.5) * 2,
      hue: Math.random() * 360
    })
  }
})

const getElementStyle = (element, index) => {
  const bassIntensity = props.bassLevel / 255
  const midIntensity = props.midLevel / 255
  const trebleIntensity = props.trebleLevel / 255

  // Calculate offset based on audio levels
  const offsetX = Math.sin(Date.now() / 1000 * element.speed + index) * (20 + bassIntensity * 50)
  const offsetY = Math.cos(Date.now() / 1000 * element.speed + index) * (20 + midIntensity * 50)
  const rotation = (Date.now() / 1000 * element.rotationSpeed) * (1 + trebleIntensity * 3)

  // Scale based on combined audio levels
  const scale = 1 + (bassIntensity + midIntensity + trebleIntensity) / 3 * 0.5

  return {
    left: `${element.x}%`,
    top: `${element.y}%`,
    width: `${element.size}px`,
    height: `${element.size}px`,
    transform: `translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg) scale(${scale})`,
    transition: 'transform 0.05s ease-out'
  }
}

const getInnerStyle = (element, index) => {
  const bassIntensity = props.bassLevel / 255
  const midIntensity = props.midLevel / 255
  const trebleIntensity = props.trebleLevel / 255

  // Dynamic hue shift
  const hueShift = (bassIntensity * 60) + (trebleIntensity * 60)
  const saturation = 60 + midIntensity * 40
  const lightness = 40 + (bassIntensity + midIntensity + trebleIntensity) / 3 * 30
  const opacity = 0.3 + trebleIntensity * 0.5

  return {
    background: `radial-gradient(circle, hsla(${element.hue + hueShift}, ${saturation}%, ${lightness}%, ${opacity}) 0%, transparent 70%)`,
    boxShadow: `0 0 ${20 + bassIntensity * 30}px hsla(${element.hue + hueShift}, ${saturation}%, ${lightness}%, ${opacity * 0.5})`
  }
}
</script>

<style scoped>
.element-dance {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
}

.dance-element {
  position: absolute;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  will-change: transform;
}

.element-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  transition: background 0.1s ease-out, box-shadow 0.1s ease-out;
}
</style>
