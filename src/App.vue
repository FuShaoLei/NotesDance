<script setup>
import { ref, shallowRef } from 'vue'
import { useAudioAnalyzer } from '@/composables/useAudioAnalyzer.js'
import BackgroundPulse from '@/components/BackgroundPulse.vue'
import SpectrumBars from '@/components/SpectrumBars.vue'
import ElementDance from '@/components/ElementDance.vue'
import Particles from '@/components/Particles.vue'

const { analyzer, isRunning, bassLevel, midLevel, trebleLevel, volumeLevel, start, stop } = useAudioAnalyzer()

// Current active effect
const currentEffect = ref('particles')

// Audio source mode: 'mic' or 'system'
const audioMode = ref('system')

// Effects configuration
const effects = [
  { id: 'background', name: 'Background Pulse', component: BackgroundPulse },
  { id: 'spectrum', name: 'Spectrum Bars', component: SpectrumBars },
  { id: 'dance', name: 'Element Dance', component: ElementDance },
  { id: 'particles', name: 'Particles', component: Particles }
]

// Start/Stop audio capture
const toggleAudio = async () => {
  if (isRunning.value) {
    stop()
  } else {
    try {
      if (audioMode.value === 'system') {
        // For system audio, show helpful message
        const helpMsg = audioMode.value === 'system'
          ? '请在弹出的对话框中:\n1. 勾选 "分享系统音频" (Share system audio)\n2. 选择 "整个屏幕" 或 "浏览器标签页"\n3. 点击"分享"'
          : ''
        if (helpMsg) alert(helpMsg)
      }
      await start(audioMode.value)
    } catch (error) {
      const errorMsg = audioMode.value === 'system'
        ? '无法捕获系统音频。请确保在对话框中勾选了"分享系统音频"选项。'
        : '无法访问麦克风。请允许麦克风访问权限。'
      alert(errorMsg)
      console.error(error)
    }
  }
}
</script>

<template>
  <div class="app">
    <!-- Visualization Layer -->
    <component
      :is="effects.find(e => e.id === currentEffect)?.component"
      :analyzer="analyzer"
      :bass-level="bassLevel"
      :mid-level="midLevel"
      :treble-level="trebleLevel"
      :volume-level="volumeLevel"
    />

    <!-- Control Panel -->
    <div class="control-panel">
      <div class="control-header">
        <h1>NotesDance</h1>
        <button
          :class="['start-button', { active: isRunning }]"
          @click="toggleAudio"
          :disabled="isRunning"
        >
          {{ isRunning ? 'Running' : 'Start' }}
        </button>
      </div>

      <!-- Audio Source Selection -->
      <div class="audio-source-selector" v-if="!isRunning">
        <span class="selector-label">Audio Source:</span>
        <div class="mode-buttons">
          <button
            :class="['mode-button', { active: audioMode === 'mic' }]"
            @click="audioMode = 'mic'"
          >
            🎤 Microphone
          </button>
          <button
            :class="['mode-button', { active: audioMode === 'system' }]"
            @click="audioMode = 'system'"
          >
            🔊 System Audio
          </button>
        </div>
        <p class="hint-text" v-if="audioMode === 'system'">
          捕获系统播放的音频（如网易云音乐）- 需要勾选"分享系统音频"
        </p>
        <p class="hint-text" v-else>
          捕获麦克风输入的声音
        </p>
      </div>

      <!-- Effect Selection -->
      <div class="effect-selector">
        <button
          v-for="effect in effects"
          :key="effect.id"
          :class="['effect-button', { active: currentEffect === effect.id }]"
          @click="currentEffect = effect.id"
        >
          {{ effect.name }}
        </button>
      </div>

      <!-- Audio Level Indicators -->
      <div v-if="isRunning" class="audio-levels">
        <div class="level-item">
          <span class="level-label">Bass</span>
          <div class="level-bar">
            <div class="level-fill" :style="{ width: (bassLevel / 255 * 100) + '%', background: 'linear-gradient(to right, #8a2be2, #da70d6)' }"></div>
          </div>
        </div>
        <div class="level-item">
          <span class="level-label">Mid</span>
          <div class="level-bar">
            <div class="level-fill" :style="{ width: (midLevel / 255 * 100) + '%', background: 'linear-gradient(to right, #4169e1, #87ceeb)' }"></div>
          </div>
        </div>
        <div class="level-item">
          <span class="level-label">Treble</span>
          <div class="level-bar">
            <div class="level-fill" :style="{ width: (trebleLevel / 255 * 100) + '%', background: 'linear-gradient(to right, #ffd700, #ffff00)' }"></div>
          </div>
        </div>
        <div class="level-item">
          <span class="level-label">Volume</span>
          <div class="level-bar">
            <div class="level-fill" :style="{ width: (volumeLevel / 255 * 100) + '%', background: 'linear-gradient(to right, #ff6b6b, #ffd93d)' }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  overflow: hidden;
  background: #000;
}
</style>

<style scoped>
.app {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.control-panel {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  min-width: 350px;
  max-width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 1000;
}

.control-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.control-header h1 {
  color: #fff;
  font-size: 24px;
  font-weight: 600;
  background: linear-gradient(135deg, #8a2be2, #da70d6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.start-button {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: linear-gradient(135deg, #8a2be2, #9370db);
  color: #fff;
}

.start-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(138, 43, 226, 0.4);
}

.start-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.start-button.active {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
}

.audio-source-selector {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.selector-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  font-weight: 600;
  display: block;
  margin-bottom: 8px;
}

.mode-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 10px;
}

.mode-button {
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.mode-button.active {
  background: linear-gradient(135deg, #8a2be2, #9370db);
  border-color: transparent;
}

.hint-text {
  color: rgba(255, 255, 255, 0.5);
  font-size: 11px;
  line-height: 1.4;
  margin: 0;
  padding: 8px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
}

.effect-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.effect-button {
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.effect-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.effect-button.active {
  background: linear-gradient(135deg, #8a2be2, #9370db);
  border-color: transparent;
}

.audio-levels {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.level-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.level-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  min-width: 50px;
}

.level-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.level-fill {
  height: 100%;
  transition: width 0.1s ease-out;
  border-radius: 4px;
}
</style>
