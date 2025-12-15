<script setup>
import { ref } from 'vue'
import { usePalette } from '@/composables/usePalette'
import { useKeyboard } from '@/composables/useKeyboard'
import { useUrlParams } from '@/composables/useUrlParams'
import ColorCard from '@/components/ColorCard.vue'
import PaletteControls from '@/components/PaletteControls.vue'
import MockupPreview from '@/components/MockupPreview.vue'
import ContrastChecker from '@/components/ContrastChecker.vue'
import ColorWheel from '@/components/ColorWheel.vue'

const {
  colors,
  colorFormat,
  toggleLock,
  isLocked,
  updateColor
} = usePalette()

useKeyboard()
useUrlParams()

const activeTab = ref('preview')
</script>

<template>
  <div class="generator-view">
    <header class="page-header">
      <h1>Генератор палитр</h1>
      <p class="page-subtitle">Создавайте гармоничные цветовые схемы для ваших проектов</p>
    </header>

    <PaletteControls />

    <section class="palette-section">
      <div class="palette-display">
        <TransitionGroup name="palette" tag="div" class="color-cards">
          <ColorCard
            v-for="(color, index) in colors"
            :key="index"
            :color="color"
            :index="index"
            :is-locked="isLocked(index)"
            :format="colorFormat"
            @lock="toggleLock"
            @update="updateColor"
          />
        </TransitionGroup>
      </div>
    </section>

    <section class="tools-section">
      <div class="tabs">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'preview' }"
          @click="activeTab = 'preview'"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          Превью
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'contrast' }"
          @click="activeTab = 'contrast'"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 2a10 10 0 0 1 0 20"/>
          </svg>
          Контрастность
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'wheel' }"
          @click="activeTab = 'wheel'"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="6"/>
            <circle cx="12" cy="12" r="2"/>
          </svg>
          Цветовой круг
        </button>
      </div>

      <div class="tab-content">
        <MockupPreview v-if="activeTab === 'preview'" />
        <ContrastChecker v-if="activeTab === 'contrast'" />
        <ColorWheel v-if="activeTab === 'wheel'" />
      </div>
    </section>

    <section class="keyboard-hints">
      <div class="hint">
        <kbd>Space</kbd>
        <span>Новая палитра</span>
      </div>
      <div class="hint">
        <kbd>Клик</kbd>
        <span>Копировать цвет</span>
      </div>
      <div class="hint">
        <kbd>🔒</kbd>
        <span>Закрепить цвет</span>
      </div>
    </section>
  </div>
</template>

<style scoped>
.generator-view {
  animation: fadeIn 0.4s ease;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  margin-bottom: 0.5rem;
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.palette-section {
  margin-bottom: 2rem;
}

.palette-display {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
}

.color-cards {
  display: flex;
  gap: 1rem;
}

.palette-enter-active,
.palette-leave-active {
  transition: all 0.4s ease;
}

.palette-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}

.palette-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}

.palette-move {
  transition: transform 0.4s ease;
}

.tools-section {
  margin-bottom: 2rem;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.25rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  width: fit-content;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
}

.tab-btn:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

.tab-btn.active {
  background: var(--accent-gradient);
  color: white;
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

.keyboard-hints {
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
}

.hint {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  padding: 0.25rem 0.5rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
}

@media (max-width: 768px) {
  .color-cards {
    flex-direction: column;
  }

  .tabs {
    width: 100%;
    overflow-x: auto;
  }

  .keyboard-hints {
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }
}
</style>

