<script setup>
import { computed, ref } from 'vue'
import { useToast } from '@/composables/useToast'
import { formatColor, getContrastTextColor, hexToRgb, hexToHsl } from '@/utils/colorUtils'

const props = defineProps({
  color: {
    type: String,
    required: true
  },
  index: {
    type: Number,
    required: true
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  format: {
    type: String,
    default: 'hex'
  },
  showDetails: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['lock', 'update'])

const { copyToClipboard } = useToast()
const isEditing = ref(false)
const colorInput = ref(null)

const textColor = computed(() => getContrastTextColor(props.color))

const formattedColor = computed(() => formatColor(props.color, props.format))

const rgbValues = computed(() => {
  const rgb = hexToRgb(props.color)
  return rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : ''
})

const hslValues = computed(() => {
  const hsl = hexToHsl(props.color)
  return hsl ? `${Math.round(hsl.h)}°, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%` : ''
})

function handleCopy() {
  copyToClipboard(formattedColor.value, `${formattedColor.value} скопировано!`)
}

function handleLock() {
  emit('lock', props.index)
}

function handleColorChange(event) {
  emit('update', props.index, event.target.value.toUpperCase())
}

function openColorPicker() {
  colorInput.value?.click()
}
</script>

<template>
  <div
    class="color-card"
    :style="{ '--card-bg': color, '--text-color': textColor }"
    :class="{ 'is-locked': isLocked }"
  >
    <input
      ref="colorInput"
      type="color"
      :value="color"
      class="color-input-hidden"
      @input="handleColorChange"
    />

    <div class="card-actions">
      <button
        class="card-btn"
        @click="handleLock"
        :title="isLocked ? 'Разблокировать' : 'Закрепить'"
      >
        <svg v-if="isLocked" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
        </svg>
      </button>

      <button
        class="card-btn"
        @click="openColorPicker"
        title="Изменить цвет"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
      </button>
    </div>

    <div class="card-content" @click="handleCopy">
      <div class="color-value mono">{{ formattedColor }}</div>

      <div v-if="showDetails" class="color-details">
        <div class="detail-row">
          <span class="detail-label">RGB</span>
          <span class="detail-value mono">{{ rgbValues }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">HSL</span>
          <span class="detail-value mono">{{ hslValues }}</span>
        </div>
      </div>

      <div class="copy-hint">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
        Копировать
      </div>
    </div>

    <div v-if="isLocked" class="locked-indicator">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1a5 5 0 0 0-5 5v4H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V12a2 2 0 0 0-2-2h-2V6a5 5 0 0 0-5-5zm3 9H9V6a3 3 0 1 1 6 0v4z"/>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.color-card {
  position: relative;
  flex: 1;
  min-width: 140px;
  min-height: 220px;
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
  cursor: pointer;
}

.color-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

.color-card.is-locked {
  box-shadow: 0 0 0 3px var(--accent-primary);
}

.color-input-hidden {
  position: absolute;
  opacity: 0;
  pointer-events: none;
  width: 0;
  height: 0;
}

.card-actions {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity var(--transition-base);
}

.color-card:hover .card-actions {
  opacity: 1;
}

.card-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-color);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.card-btn:hover {
  background: rgba(0, 0, 0, 0.5);
  transform: scale(1.1);
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 1.25rem;
  color: var(--text-color);
}

.color-value {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  letter-spacing: 0.5px;
}

.color-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  opacity: 0.8;
  font-size: 0.75rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-weight: 500;
  opacity: 0.7;
}

.copy-hint {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  font-size: 0.75rem;
  opacity: 0;
  transition: opacity var(--transition-base);
}

.color-card:hover .copy-hint {
  opacity: 0.7;
}

.locked-indicator {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: var(--accent-primary);
  border-radius: 50%;
  color: white;
}

@media (max-width: 768px) {
  .color-card {
    min-height: 180px;
  }

  .card-actions {
    opacity: 1;
  }

  .color-details {
    display: none;
  }
}
</style>


