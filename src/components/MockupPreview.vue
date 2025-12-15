<script setup>
import { computed, ref } from 'vue'
import { usePalette } from '@/composables/usePalette'
import { getContrastTextColor } from '@/utils/colorUtils'

const { colors } = usePalette()

const darkMode = ref(false)

const previewBg = computed(() => darkMode.value ? '#1a1a2e' : '#ffffff')
const previewText = computed(() => darkMode.value ? '#f0f0f5' : '#1a1a2e')

// Используем цвета палитры для элементов
const primaryColor = computed(() => colors.value[0] || '#7C5CFF')
const secondaryColor = computed(() => colors.value[1] || '#5C9CFF')
const accentColor = computed(() => colors.value[2] || '#4ECDC4')
const bgColor = computed(() => colors.value[3] || '#f5f5fa')
const textAccent = computed(() => colors.value[4] || '#ff6b6b')

const buttonTextColor = computed(() => getContrastTextColor(primaryColor.value))
const cardBgColor = computed(() => darkMode.value ? colors.value[3] : colors.value[3] + '20')
</script>

<template>
  <div class="mockup-preview">
    <div class="preview-header">
      <h3 class="preview-title">Превью UI</h3>
      <div class="preview-toggle">
        <button
          class="toggle-btn"
          :class="{ active: !darkMode }"
          @click="darkMode = false"
          title="Светлый фон"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
        </button>
        <button
          class="toggle-btn"
          :class="{ active: darkMode }"
          @click="darkMode = true"
          title="Тёмный фон"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>
      </div>
    </div>

    <div
      class="preview-canvas"
      :style="{ background: previewBg, color: previewText }"
    >
      <!-- Заголовок -->
      <div class="preview-header-demo">
        <div class="demo-logo" :style="{ background: primaryColor }">
          <span :style="{ color: buttonTextColor }">Logo</span>
        </div>
        <nav class="demo-nav">
          <span :style="{ color: secondaryColor }">Главная</span>
          <span style="opacity: 0.6">Продукты</span>
          <span style="opacity: 0.6">О нас</span>
        </nav>
      </div>

      <!-- Героический блок -->
      <div class="preview-hero">
        <h2 :style="{ color: primaryColor }">Яркий заголовок</h2>
        <p class="hero-subtitle">Описание вашего проекта с использованием выбранной палитры</p>
        <div class="hero-buttons">
          <button
            class="demo-btn primary"
            :style="{ background: primaryColor, color: buttonTextColor }"
          >
            Начать
          </button>
          <button
            class="demo-btn secondary"
            :style="{
              background: 'transparent',
              border: '2px solid ' + secondaryColor,
              color: secondaryColor
            }"
          >
            Узнать больше
          </button>
        </div>
      </div>

      <!-- Карточки -->
      <div class="preview-cards">
        <div
          class="demo-card"
          :style="{
            background: cardBgColor,
            borderColor: secondaryColor + '30'
          }"
        >
          <div class="card-icon" :style="{ background: accentColor }">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <h4>Функция 1</h4>
          <p style="opacity: 0.7; font-size: 0.85rem">Краткое описание функции</p>
        </div>

        <div
          class="demo-card"
          :style="{
            background: cardBgColor,
            borderColor: secondaryColor + '30'
          }"
        >
          <div class="card-icon" :style="{ background: textAccent }">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h4>Функция 2</h4>
          <p style="opacity: 0.7; font-size: 0.85rem">Краткое описание функции</p>
        </div>

        <div
          class="demo-card"
          :style="{
            background: cardBgColor,
            borderColor: secondaryColor + '30'
          }"
        >
          <div class="card-icon" :style="{ background: secondaryColor }">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h4>Функция 3</h4>
          <p style="opacity: 0.7; font-size: 0.85rem">Краткое описание функции</p>
        </div>
      </div>

      <!-- Статистика -->
      <div class="preview-stats">
        <div class="stat-item">
          <span class="stat-value" :style="{ color: primaryColor }">150+</span>
          <span class="stat-label">Клиентов</span>
        </div>
        <div class="stat-item">
          <span class="stat-value" :style="{ color: accentColor }">99%</span>
          <span class="stat-label">Довольных</span>
        </div>
        <div class="stat-item">
          <span class="stat-value" :style="{ color: textAccent }">24/7</span>
          <span class="stat-label">Поддержка</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mockup-preview {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.preview-title {
  font-size: 1rem;
  font-weight: 600;
}

.preview-toggle {
  display: flex;
  gap: 0.25rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  padding: 0.25rem;
}

.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-base);
}

.toggle-btn:hover {
  color: var(--text-primary);
}

.toggle-btn.active {
  background: var(--accent-primary);
  color: white;
}

.preview-canvas {
  padding: 1.5rem;
  min-height: 400px;
  transition: all var(--transition-base);
}

.preview-header-demo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.demo-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.9rem;
}

.demo-nav {
  display: flex;
  gap: 1.5rem;
  font-size: 0.85rem;
}

.preview-hero {
  text-align: center;
  margin-bottom: 2rem;
}

.preview-hero h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.hero-subtitle {
  opacity: 0.7;
  font-size: 0.9rem;
  margin-bottom: 1.25rem;
}

.hero-buttons {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.demo-btn {
  padding: 0.6rem 1.25rem;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
}

.demo-btn.primary {
  border: none;
}

.demo-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.preview-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.demo-card {
  padding: 1rem;
  border-radius: var(--radius-md);
  border: 1px solid;
  text-align: center;
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.75rem;
}

.demo-card h4 {
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.preview-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.75rem;
  opacity: 0.6;
}

@media (max-width: 600px) {
  .preview-cards {
    grid-template-columns: 1fr;
  }

  .preview-stats {
    gap: 1.5rem;
  }
}
</style>

