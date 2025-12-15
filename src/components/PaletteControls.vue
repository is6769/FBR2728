<script setup>
import { ref, watch } from 'vue'
import { usePalette } from '@/composables/usePalette'
import { useToast } from '@/composables/useToast'

const {
  colorCount,
  colorFormat,
  paletteType,
  moodType,
  baseColor,
  generatePalette,
  savePalette,
  PALETTE_TYPES,
  MOOD_TYPES
} = usePalette()

const { showToast } = useToast()

const showSaveModal = ref(false)
const paletteName = ref('')
const paletteTags = ref('')

const paletteTypeLabels = {
  [PALETTE_TYPES.RANDOM]: 'Случайная',
  [PALETTE_TYPES.ANALOGOUS]: 'Аналогичная',
  [PALETTE_TYPES.MONOCHROMATIC]: 'Монохромная',
  [PALETTE_TYPES.TRIADIC]: 'Триада',
  [PALETTE_TYPES.COMPLEMENTARY]: 'Комплементарная',
  [PALETTE_TYPES.SPLIT_COMPLEMENTARY]: 'Раздельно-компл.',
  [PALETTE_TYPES.TETRADIC]: 'Тетрадная'
}

const moodLabels = {
  '': 'Без настроения',
  [MOOD_TYPES.CALM]: '😌 Спокойные',
  [MOOD_TYPES.ENERGETIC]: '⚡ Энергичные',
  [MOOD_TYPES.PROFESSIONAL]: '💼 Профессиональные',
  [MOOD_TYPES.PLAYFUL]: '🎨 Игривые',
  [MOOD_TYPES.NATURE]: '🌿 Природные',
  [MOOD_TYPES.SUNSET]: '🌅 Закат'
}

function handleGenerate() {
  generatePalette()
}

function handleSave() {
  const tags = paletteTags.value.split(',').map(t => t.trim()).filter(Boolean)
  savePalette(paletteName.value, tags)
  showToast('Палитра сохранена!', 'success')
  showSaveModal.value = false
  paletteName.value = ''
  paletteTags.value = ''
}

function handleBaseColorChange(e) {
  baseColor.value = e.target.value.toUpperCase()
}

function clearBaseColor() {
  baseColor.value = null
}

// Сбрасываем настроение при смене типа и наоборот
watch(paletteType, () => {
  if (paletteType.value !== PALETTE_TYPES.RANDOM) {
    moodType.value = null
  }
})

watch(moodType, () => {
  if (moodType.value) {
    paletteType.value = PALETTE_TYPES.RANDOM
  }
})
</script>

<template>
  <div class="palette-controls">
    <div class="controls-row">
      <div class="control-group">
        <label class="control-label">Количество</label>
        <div class="btn-group">
          <button
            v-for="count in [3, 5, 7]"
            :key="count"
            class="btn btn-sm"
            :class="{ 'btn-primary': colorCount === count }"
            @click="colorCount = count"
          >
            {{ count }}
          </button>
        </div>
      </div>

      <div class="control-group">
        <label class="control-label">Формат</label>
        <div class="btn-group">
          <button
            v-for="format in ['hex', 'rgb', 'hsl']"
            :key="format"
            class="btn btn-sm"
            :class="{ 'btn-primary': colorFormat === format }"
            @click="colorFormat = format"
          >
            {{ format.toUpperCase() }}
          </button>
        </div>
      </div>

      <div class="control-group">
        <label class="control-label">Тип палитры</label>
        <select v-model="paletteType" class="select">
          <option v-for="(label, type) in paletteTypeLabels" :key="type" :value="type">
            {{ label }}
          </option>
        </select>
      </div>

      <div class="control-group">
        <label class="control-label">Настроение</label>
        <select v-model="moodType" class="select">
          <option v-for="(label, mood) in moodLabels" :key="mood" :value="mood || null">
            {{ label }}
          </option>
        </select>
      </div>

      <div class="control-group">
        <label class="control-label">Базовый цвет</label>
        <div class="base-color-picker">
          <input
            type="color"
            :value="baseColor || '#7C5CFF'"
            @input="handleBaseColorChange"
            class="color-picker-input"
          />
          <span class="base-color-value mono">{{ baseColor || 'Авто' }}</span>
          <button
            v-if="baseColor"
            class="btn btn-sm clear-btn"
            @click="clearBaseColor"
            title="Сбросить"
          >
            ✕
          </button>
        </div>
      </div>
    </div>

    <div class="controls-actions">
      <button class="btn btn-primary btn-lg generate-btn" @click="handleGenerate">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
          <path d="M16 21h5v-5"/>
        </svg>
        Сгенерировать
      </button>

      <button class="btn btn-lg" @click="showSaveModal = true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
          <polyline points="17 21 17 13 7 13 7 21"/>
          <polyline points="7 3 7 8 15 8"/>
        </svg>
        Сохранить
      </button>
    </div>

    <!-- Модальное окно сохранения -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showSaveModal" class="modal-overlay" @click.self="showSaveModal = false">
          <div class="modal">
            <h3 class="modal-title">Сохранить палитру</h3>

            <div class="modal-body">
              <div class="form-group">
                <label class="control-label">Название</label>
                <input
                  v-model="paletteName"
                  type="text"
                  class="input w-full"
                  placeholder="Моя красивая палитра"
                />
              </div>

              <div class="form-group">
                <label class="control-label">Теги (через запятую)</label>
                <input
                  v-model="paletteTags"
                  type="text"
                  class="input w-full"
                  placeholder="природа, спокойные, синий"
                />
              </div>
            </div>

            <div class="modal-actions">
              <button class="btn" @click="showSaveModal = false">Отмена</button>
              <button class="btn btn-primary" @click="handleSave">Сохранить</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.palette-controls {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.controls-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-group {
  display: flex;
  gap: 0.25rem;
}

.btn-group .btn {
  border-radius: var(--radius-sm);
}

.btn-group .btn:first-child {
  border-radius: var(--radius-md) var(--radius-sm) var(--radius-sm) var(--radius-md);
}

.btn-group .btn:last-child {
  border-radius: var(--radius-sm) var(--radius-md) var(--radius-md) var(--radius-sm);
}

.base-color-picker {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.color-picker-input {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  padding: 0;
}

.color-picker-input::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-picker-input::-webkit-color-swatch {
  border: none;
  border-radius: var(--radius-sm);
}

.base-color-value {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.clear-btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.controls-actions {
  display: flex;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.generate-btn {
  flex: 1;
}

/* Модальное окно */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  width: 100%;
  max-width: 420px;
  box-shadow: var(--shadow-lg);
}

.modal-title {
  margin-bottom: 1.5rem;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

/* Анимации модального окна */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.25s ease;
}

.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: all 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: scale(0.95) translateY(10px);
}

@media (max-width: 768px) {
  .controls-row {
    flex-direction: column;
  }

  .control-group {
    width: 100%;
  }

  .controls-actions {
    flex-direction: column;
  }
}
</style>

