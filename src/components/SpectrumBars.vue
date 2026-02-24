<template>
  <div class="spectrum-bars">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  analyzer: {
    type: Object,
    required: true
  }
})

const canvas = ref(null)
let ctx = null
let animationId = null

onMounted(() => {
  ctx = canvas.value.getContext('2d')
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
  animate()
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas)
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})

const resizeCanvas = () => {
  canvas.value.width = window.innerWidth
  canvas.value.height = window.innerHeight
}

const animate = () => {
  animationId = requestAnimationFrame(animate)

  const width = canvas.value.width
  const height = canvas.value.height

  // Clear canvas
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
  ctx.fillRect(0, 0, width, height)

  // Get frequency data
  const frequencyData = props.analyzer.getFrequencyData()

  // Draw spectrum bars
  const barCount = 64
  const barWidth = width / barCount - 2
  const barSpacing = 2

  for (let i = 0; i < barCount; i++) {
    // Map bar index to frequency data index (logarithmic scale for better visualization)
    const dataIndex = Math.floor(Math.pow(i / barCount, 2) * frequencyData.length)
    const value = frequencyData[dataIndex] || 0

    // Calculate bar height
    const barHeight = (value / 255) * height * 0.8

    // Calculate color based on frequency and intensity
    const hue = (i / barCount) * 360
    const saturation = 70 + (value / 255) * 30
    const lightness = 40 + (value / 255) * 30

    // Draw bar with gradient
    const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight)
    gradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness}%, 0.8)`)
    gradient.addColorStop(1, `hsla(${hue + 30}, ${saturation}%, ${lightness + 20}%, 0.9)`)

    ctx.fillStyle = gradient

    // Draw bar from bottom
    const x = i * (barWidth + barSpacing)
    const y = height - barHeight

    // Round top corners
    const radius = barWidth / 2
    ctx.beginPath()
    ctx.moveTo(x, height)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius)
    ctx.lineTo(x + barWidth, height)
    ctx.closePath()
    ctx.fill()

    // Add glow effect for high values
    if (value > 200) {
      ctx.shadowColor = `hsla(${hue}, 100%, 50%, 0.5)`
      ctx.shadowBlur = 20
    } else {
      ctx.shadowBlur = 0
    }
  }

  // Reset shadow
  ctx.shadowBlur = 0
}
</script>

<style scoped>
.spectrum-bars {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-end;
}

canvas {
  display: block;
}
</style>
