<script setup>
import { computed, ref } from 'vue'
import { usePalette } from '@/composables/usePalette'
import { hexToHsl } from '@/utils/colorUtils'

const { colors } = usePalette()

const wheelSize = 200
const centerX = wheelSize / 2
const centerY = wheelSize / 2
const radius = 80

// Вычисляем позиции цветов на цветовом круге
const colorPositions = computed(() => {
  return colors.value.map((color, index) => {
    const hsl = hexToHsl(color)
    if (!hsl) return null

    // Угол определяется оттенком (hue)
    const angle = (hsl.h - 90) * (Math.PI / 180) // -90 чтобы 0° было сверху

    // Расстояние от центра определяется насыщенностью
    const distance = (hsl.s / 100) * radius

    const x = centerX + Math.cos(angle) * distance
    const y = centerY + Math.sin(angle) * distance

    return {
      color,
      x,
      y,
      hue: hsl.h,
      saturation: hsl.s,
      lightness: hsl.l
    }
  }).filter(Boolean)
})

// Соединительные линии между цветами
const connectionLines = computed(() => {
  const lines = []
  for (let i = 0; i < colorPositions.value.length - 1; i++) {
    lines.push({
      x1: colorPositions.value[i].x,
      y1: colorPositions.value[i].y,
      x2: colorPositions.value[i + 1].x,
      y2: colorPositions.value[i + 1].y
    })
  }
  // Замыкаем круг
  if (colorPositions.value.length > 2) {
    const last = colorPositions.value.length - 1
    lines.push({
      x1: colorPositions.value[last].x,
      y1: colorPositions.value[last].y,
      x2: colorPositions.value[0].x,
      y2: colorPositions.value[0].y
    })
  }
  return lines
})
</script>

<template>
  <div class="color-wheel-container">
    <h4 class="wheel-title">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="6"/>
        <circle cx="12" cy="12" r="2"/>
      </svg>
      Цветовой круг
    </h4>

    <svg
      class="color-wheel"
      :width="wheelSize"
      :height="wheelSize"
      :viewBox="`0 0 ${wheelSize} ${wheelSize}`"
    >
      <defs>
        <!-- Градиент для цветового круга -->
        <linearGradient id="wheelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="hsl(0, 70%, 50%)"/>
          <stop offset="16.6%" stop-color="hsl(60, 70%, 50%)"/>
          <stop offset="33.3%" stop-color="hsl(120, 70%, 50%)"/>
          <stop offset="50%" stop-color="hsl(180, 70%, 50%)"/>
          <stop offset="66.6%" stop-color="hsl(240, 70%, 50%)"/>
          <stop offset="83.3%" stop-color="hsl(300, 70%, 50%)"/>
          <stop offset="100%" stop-color="hsl(360, 70%, 50%)"/>
        </linearGradient>

        <!-- Коническийградиент через clipPath -->
        <clipPath id="wheelClip">
          <circle :cx="centerX" :cy="centerY" :r="radius + 10"/>
        </clipPath>
      </defs>

      <!-- Фоновый круг с секторами -->
      <g clip-path="url(#wheelClip)">
        <g v-for="i in 360" :key="i">
          <line
            :x1="centerX"
            :y1="centerY"
            :x2="centerX + (radius + 10) * Math.cos((i - 90) * Math.PI / 180)"
            :y2="centerY + (radius + 10) * Math.sin((i - 90) * Math.PI / 180)"
            :stroke="`hsl(${i}, 70%, 50%)`"
            stroke-width="2"
          />
        </g>
      </g>

      <!-- Центральный круг (белый) -->
      <circle
        :cx="centerX"
        :cy="centerY"
        :r="15"
        fill="var(--bg-secondary)"
        stroke="var(--border-color)"
        stroke-width="1"
      />

      <!-- Соединительные линии -->
      <g class="connection-lines">
        <line
          v-for="(line, index) in connectionLines"
          :key="index"
          :x1="line.x1"
          :y1="line.y1"
          :x2="line.x2"
          :y2="line.y2"
          stroke="rgba(255, 255, 255, 0.3)"
          stroke-width="2"
          stroke-dasharray="4 2"
        />
      </g>

      <!-- Точки цветов -->
      <g class="color-points">
        <g
          v-for="(pos, index) in colorPositions"
          :key="index"
          class="color-point"
        >
          <circle
            :cx="pos.x"
            :cy="pos.y"
            r="14"
            :fill="pos.color"
            stroke="white"
            stroke-width="3"
            class="point-circle"
          />
          <text
            :x="pos.x"
            :y="pos.y + 1"
            text-anchor="middle"
            dominant-baseline="middle"
            fill="white"
            font-size="10"
            font-weight="600"
            class="point-index"
          >
            {{ index + 1 }}
          </text>
        </g>
      </g>
    </svg>

    <!-- Легенда -->
    <div class="wheel-legend">
      <div
        v-for="(pos, index) in colorPositions"
        :key="index"
        class="legend-item"
      >
        <div class="legend-color" :style="{ background: pos.color }"></div>
        <span class="legend-info mono">
          H:{{ Math.round(pos.hue) }}° S:{{ Math.round(pos.saturation) }}%
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.color-wheel-container {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.wheel-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
  align-self: flex-start;
}

.color-wheel {
  filter: drop-shadow(0 4px 20px rgba(0, 0, 0, 0.3));
}

.color-point {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.color-point:hover {
  transform: scale(1.2);
}

.point-circle {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.wheel-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.6rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-info {
  font-size: 0.7rem;
  color: var(--text-muted);
}
</style>

