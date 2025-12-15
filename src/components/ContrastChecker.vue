<script setup>
import { computed } from 'vue'
import { usePalette } from '@/composables/usePalette'
import { getContrastRatio, getWCAGLevel, getContrastTextColor } from '@/utils/colorUtils'

const { colors } = usePalette()

const colorPairs = computed(() => {
  const pairs = []

  for (let i = 0; i < colors.value.length; i++) {
    for (let j = i + 1; j < colors.value.length; j++) {
      const ratio = getContrastRatio(colors.value[i], colors.value[j])
      const wcag = getWCAGLevel(ratio)

      pairs.push({
        color1: colors.value[i],
        color2: colors.value[j],
        ratio: ratio.toFixed(2),
        wcag
      })
    }
  }

  return pairs.sort((a, b) => parseFloat(b.ratio) - parseFloat(a.ratio))
})

const bestTextCombinations = computed(() => {
  return colorPairs.value.filter(p => parseFloat(p.ratio) >= 4.5).slice(0, 3)
})
</script>

<template>
  <div class="contrast-checker">
    <div class="checker-header">
      <h3 class="checker-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 2a10 10 0 0 1 0 20"/>
        </svg>
        Проверка контрастности WCAG
      </h3>
    </div>

    <div class="checker-content">
      <!-- Лучшие комбинации -->
      <div v-if="bestTextCombinations.length > 0" class="best-combinations">
        <h4 class="section-title">Рекомендуемые для текста</h4>
        <div class="combination-list">
          <div
            v-for="(pair, index) in bestTextCombinations"
            :key="index"
            class="combination-item recommended"
          >
            <div class="color-pair">
              <div
                class="color-swatch"
                :style="{ background: pair.color1 }"
              >
                <span :style="{ color: pair.color2 }">Aa</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="arrow-icon">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
              <div
                class="color-swatch"
                :style="{ background: pair.color2 }"
              >
                <span :style="{ color: pair.color1 }">Aa</span>
              </div>
            </div>
            <div class="pair-info">
              <span class="ratio-badge" :class="pair.wcag.class">
                {{ pair.ratio }}:1
              </span>
              <span class="wcag-level" :class="pair.wcag.class">
                {{ pair.wcag.level }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Все комбинации -->
      <div class="all-combinations">
        <h4 class="section-title">Все комбинации</h4>
        <div class="combinations-grid">
          <div
            v-for="(pair, index) in colorPairs"
            :key="index"
            class="combination-card"
          >
            <div
              class="card-preview"
              :style="{ background: pair.color1 }"
            >
              <span
                class="preview-text"
                :style="{ color: pair.color2 }"
              >
                Пример текста
              </span>
            </div>
            <div class="card-details">
              <div class="color-codes mono">
                <span>{{ pair.color1 }}</span>
                <span>{{ pair.color2 }}</span>
              </div>
              <div class="card-stats">
                <span class="ratio">{{ pair.ratio }}:1</span>
                <span class="level" :class="pair.wcag.class">{{ pair.wcag.text }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Легенда -->
      <div class="wcag-legend">
        <h4 class="section-title">Стандарты WCAG 2.1</h4>
        <div class="legend-items">
          <div class="legend-item">
            <span class="legend-badge wcag-aaa">AAA</span>
            <span class="legend-text">≥ 7:1 — Усиленный контраст</span>
          </div>
          <div class="legend-item">
            <span class="legend-badge wcag-aa">AA</span>
            <span class="legend-text">≥ 4.5:1 — Обычный текст</span>
          </div>
          <div class="legend-item">
            <span class="legend-badge wcag-aa-large">AA Large</span>
            <span class="legend-text">≥ 3:1 — Крупный текст (18px+)</span>
          </div>
          <div class="legend-item">
            <span class="legend-badge wcag-fail">Fail</span>
            <span class="legend-text">&lt; 3:1 — Недостаточный контраст</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contrast-checker {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.checker-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.checker-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
}

.checker-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 1rem;
}

.combination-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.combination-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.combination-item.recommended {
  border: 1px solid var(--success);
  background: linear-gradient(135deg, rgba(78, 205, 196, 0.1) 0%, transparent 100%);
}

.color-pair {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.color-swatch {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.1rem;
}

.arrow-icon {
  color: var(--text-muted);
}

.pair-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.ratio-badge {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  background: var(--bg-card);
  border-radius: var(--radius-sm);
}

.wcag-level {
  font-weight: 600;
  font-size: 0.85rem;
}

.combinations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
}

.combination-card {
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.card-preview {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-text {
  font-weight: 500;
  font-size: 0.9rem;
}

.card-details {
  padding: 0.75rem;
}

.color-codes {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.card-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ratio {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.level {
  font-size: 0.75rem;
  font-weight: 600;
}

.wcag-legend {
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.legend-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.legend-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  min-width: 60px;
  text-align: center;
}

.legend-badge.wcag-aaa {
  background: rgba(78, 205, 196, 0.2);
}

.legend-badge.wcag-aa {
  background: rgba(124, 179, 66, 0.2);
}

.legend-badge.wcag-aa-large {
  background: rgba(255, 217, 61, 0.2);
}

.legend-badge.wcag-fail {
  background: rgba(255, 107, 107, 0.2);
}

.legend-text {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

@media (max-width: 600px) {
  .combinations-grid {
    grid-template-columns: 1fr 1fr;
  }

  .legend-items {
    grid-template-columns: 1fr;
  }
}
</style>


