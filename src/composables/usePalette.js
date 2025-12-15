import { ref, computed, watch } from 'vue'
import {
  generateHarmoniousPalette,
  generatePaletteByType,
  generatePaletteByMood,
  generateId,
  PALETTE_TYPES,
  MOOD_TYPES
} from '@/utils/colorUtils'

// Глобальное состояние
const colors = ref([])
const lockedColors = ref(new Set())
const colorCount = ref(5)
const colorFormat = ref('hex')
const paletteType = ref(PALETTE_TYPES.RANDOM)
const moodType = ref(null)
const baseColor = ref(null)
const savedPalettes = ref([])
const currentPaletteName = ref('')

// Инициализация из localStorage
function initFromStorage() {
  try {
    const stored = localStorage.getItem('palette-forge-state')
    if (stored) {
      const state = JSON.parse(stored)
      if (state.colors) colors.value = state.colors
      if (state.lockedColors) lockedColors.value = new Set(state.lockedColors)
      if (state.colorCount) colorCount.value = state.colorCount
      if (state.colorFormat) colorFormat.value = state.colorFormat
      if (state.paletteType) paletteType.value = state.paletteType
      if (state.baseColor) baseColor.value = state.baseColor
    }

    const storedPalettes = localStorage.getItem('palette-forge-saved')
    if (storedPalettes) {
      savedPalettes.value = JSON.parse(storedPalettes)
    }
  } catch (e) {
    console.warn('Failed to load from localStorage:', e)
  }
}

// Сохранение в localStorage
function saveToStorage() {
  try {
    const state = {
      colors: colors.value,
      lockedColors: Array.from(lockedColors.value),
      colorCount: colorCount.value,
      colorFormat: colorFormat.value,
      paletteType: paletteType.value,
      baseColor: baseColor.value
    }
    localStorage.setItem('palette-forge-state', JSON.stringify(state))
  } catch (e) {
    console.warn('Failed to save to localStorage:', e)
  }
}

function savePalettesToStorage() {
  try {
    localStorage.setItem('palette-forge-saved', JSON.stringify(savedPalettes.value))
  } catch (e) {
    console.warn('Failed to save palettes:', e)
  }
}

// Генерация палитры
function generatePalette() {
  let newColors = []

  if (moodType.value) {
    newColors = generatePaletteByMood(moodType.value, colorCount.value)
  } else if (paletteType.value !== PALETTE_TYPES.RANDOM || baseColor.value) {
    newColors = generatePaletteByType(paletteType.value, colorCount.value, baseColor.value)
  } else {
    newColors = generateHarmoniousPalette(colorCount.value)
  }

  // Сохраняем закреплённые цвета
  colors.value = newColors.map((color, index) => {
    if (lockedColors.value.has(index) && colors.value[index]) {
      return colors.value[index]
    }
    return color
  })

  saveToStorage()
}

// Переключение блокировки цвета
function toggleLock(index) {
  if (lockedColors.value.has(index)) {
    lockedColors.value.delete(index)
  } else {
    lockedColors.value.add(index)
  }
  lockedColors.value = new Set(lockedColors.value) // Trigger reactivity
  saveToStorage()
}

// Проверка, заблокирован ли цвет
function isLocked(index) {
  return lockedColors.value.has(index)
}

// Изменение цвета
function updateColor(index, newColor) {
  colors.value[index] = newColor
  saveToStorage()
}

// Сохранение палитры
function savePalette(name, tags = []) {
  const palette = {
    id: generateId(),
    name: name || `Палитра ${savedPalettes.value.length + 1}`,
    colors: [...colors.value],
    tags,
    createdAt: new Date().toISOString(),
    isFavorite: false
  }

  savedPalettes.value.unshift(palette)
  savePalettesToStorage()
  return palette
}

// Загрузка палитры
function loadPalette(palette) {
  colors.value = [...palette.colors]
  colorCount.value = palette.colors.length
  lockedColors.value = new Set()
  currentPaletteName.value = palette.name
  saveToStorage()
}

// Удаление палитры
function deletePalette(id) {
  savedPalettes.value = savedPalettes.value.filter(p => p.id !== id)
  savePalettesToStorage()
}

// Обновление палитры
function updatePalette(id, updates) {
  const index = savedPalettes.value.findIndex(p => p.id === id)
  if (index !== -1) {
    savedPalettes.value[index] = { ...savedPalettes.value[index], ...updates }
    savePalettesToStorage()
  }
}

// Переключение избранного
function toggleFavorite(id) {
  const palette = savedPalettes.value.find(p => p.id === id)
  if (palette) {
    palette.isFavorite = !palette.isFavorite
    savePalettesToStorage()
  }
}

// Вычисляемые свойства
const hasColors = computed(() => colors.value.length > 0)

const favoritePalettes = computed(() =>
  savedPalettes.value.filter(p => p.isFavorite)
)

// Watcher для автосохранения
watch([colorCount, colorFormat, paletteType, baseColor], () => {
  saveToStorage()
})

export function usePalette() {
  // Инициализация при первом использовании
  if (colors.value.length === 0) {
    initFromStorage()
    if (colors.value.length === 0) {
      generatePalette()
    }
  }

  return {
    // Состояние
    colors,
    lockedColors,
    colorCount,
    colorFormat,
    paletteType,
    moodType,
    baseColor,
    savedPalettes,
    currentPaletteName,

    // Вычисляемые
    hasColors,
    favoritePalettes,

    // Константы
    PALETTE_TYPES,
    MOOD_TYPES,

    // Методы
    generatePalette,
    toggleLock,
    isLocked,
    updateColor,
    savePalette,
    loadPalette,
    deletePalette,
    updatePalette,
    toggleFavorite,
    initFromStorage
  }
}

