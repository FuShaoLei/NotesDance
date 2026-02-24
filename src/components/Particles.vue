<template>
  <div class="particles">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  analyzer: {
    type: Object,
    required: true
  },
  bassLevel: {
    type: Number,
    default: 0
  },
  trebleLevel: {
    type: Number,
    default: 0
  }
})

const canvas = ref(null)
let ctx = null
let animationId = null
let particles = []

class Particle {
  constructor(canvasWidth, canvasHeight) {
    this.reset(canvasWidth, canvasHeight)
  }

  reset(canvasWidth, canvasHeight) {
    this.x = Math.random() * canvasWidth
    this.y = Math.random() * canvasHeight
    this.baseSize = 2 + Math.random() * 4
    this.size = this.baseSize
    this.baseSpeedX = (Math.random() - 0.5) * 1
    this.baseSpeedY = (Math.random() - 0.5) * 1
    this.speedX = this.baseSpeedX
    this.speedY = this.baseSpeedY
    this.hue = Math.random() * 360
    this.life = 1
    this.maxLife = 100 + Math.random() * 200
    this.age = 0
  }

  update(bassLevel, trebleLevel, canvasWidth, canvasHeight) {
    const bassIntensity = bassLevel / 255
    const trebleIntensity = trebleLevel / 255

    // Size reacts to bass
    this.size = this.baseSize * (1 + bassIntensity * 3)

    // Speed reacts to treble
    this.speedX = this.baseSpeedX * (1 + trebleIntensity * 5)
    this.speedY = this.baseSpeedY * (1 + trebleIntensity * 5)

    // Move particle
    this.x += this.speedX
    this.y += this.speedY

    // Age particle
    this.age++
    this.life = 1 - (this.age / this.maxLife)

    // Wrap around edges
    if (this.x < 0) this.x = canvasWidth
    if (this.x > canvasWidth) this.x = 0
    if (this.y < 0) this.y = canvasHeight
    if (this.y > canvasHeight) this.y = 0

    // Reset when too old
    if (this.age >= this.maxLife) {
      this.reset(canvasWidth, canvasHeight)
    }
  }

  draw(ctx) {
    const alpha = this.life * 0.8
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${this.hue}, 70%, 60%, ${alpha})`
    ctx.fill()

    // Add glow
    ctx.shadowColor = `hsla(${this.hue}, 100%, 50%, ${alpha})`
    ctx.shadowBlur = this.size * 2
  }
}

onMounted(() => {
  ctx = canvas.value.getContext('2d')
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)

  // Create initial particles
  createParticles()

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

const createParticles = () => {
  particles = []
  const particleCount = 150
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle(canvas.value.width, canvas.value.height))
  }
}

const animate = () => {
  animationId = requestAnimationFrame(animate)

  const width = canvas.value.width
  const height = canvas.value.height

  // Clear canvas with fade effect
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
  ctx.fillRect(0, 0, width, height)

  // Get audio levels
  const bassLevel = props.bassLevel
  const trebleLevel = props.trebleLevel

  // Draw connections between nearby particles
  ctx.strokeStyle = `rgba(138, 43, 226, ${0.1 + (bassLevel / 255) * 0.2})`
  ctx.lineWidth = 1

  for (let i = 0; i < particles.length; i++) {
    const p1 = particles[i]

    // Update and draw particle
    p1.update(bassLevel, trebleLevel, width, height)
    p1.draw(ctx)

    // Draw connections to nearby particles
    for (let j = i + 1; j < particles.length; j++) {
      const p2 = particles[j]
      const dx = p1.x - p2.x
      const dy = p1.y - p2.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      // Connect particles that are close
      if (distance < 100) {
        const alpha = (1 - distance / 100) * 0.3
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.strokeStyle = `hsla(${p1.hue}, 70%, 50%, ${alpha})`
        ctx.stroke()
      }
    }
  }

  // Reset shadow for next frame
  ctx.shadowBlur = 0
}
</script>

<style scoped>
.particles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

canvas {
  display: block;
}
</style>
