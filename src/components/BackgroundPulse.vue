<template>
  <div class="background-pulse" :style="{ background: backgroundStyle }">
    <div class="pulse-circle" :style="circleStyle"></div>
    <div class="pulse-circle pulse-circle-2" :style="circleStyle2"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  bassLevel: {
    type: Number,
    default: 0
  },
  volumeLevel: {
    type: Number,
    default: 0
  }
})

// Background color that shifts with bass
const backgroundStyle = computed(() => {
  const intensity = props.bassLevel / 255
  const hue = 240 + intensity * 60 // Blue to purple
  const lightness = 5 + intensity * 15
  return `hsl(${hue}, 50%, ${lightness}%)`
})

// Main pulse circle
const circleStyle = computed(() => {
  const scale = 1 + (props.bassLevel / 255) * 0.5
  const opacity = 0.3 + (props.bassLevel / 255) * 0.4
  return {
    transform: `scale(${scale})`,
    opacity: opacity
  }
})

// Secondary pulse circle with delay effect
const circleStyle2 = computed(() => {
  const scale = 0.8 + (props.volumeLevel / 255) * 0.3
  const opacity = 0.2 + (props.volumeLevel / 255) * 0.3
  return {
    transform: `scale(${scale})`,
    opacity: opacity
  }
})
</script>

<style scoped>
.background-pulse {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: background 0.1s ease-out;
}

.pulse-circle {
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(138, 43, 226, 0.4) 0%, rgba(138, 43, 226, 0) 70%);
  transition: transform 0.05s ease-out, opacity 0.05s ease-out;
  will-change: transform, opacity;
}

.pulse-circle-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(75, 0, 130, 0.3) 0%, rgba(75, 0, 130, 0) 70%);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.4;
  }
}
</style>
