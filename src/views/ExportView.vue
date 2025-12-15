<script setup>
import { ref, computed } from 'vue'
import { usePalette } from '@/composables/usePalette'
import { useToast } from '@/composables/useToast'
import { hexToRgb, hexToHsl, getContrastTextColor } from '@/utils/colorUtils'

const { colors, currentPaletteName } = usePalette()
const { copyToClipboard, showToast } = useToast()

const exportFormat = ref('css')
const colorNaming = ref('semantic') // semantic, indexed

const colorNames = ['primary', 'secondary', 'accent', 'background', 'highlight', 'muted', 'contrast']

function getColorName(index) {
  if (colorNaming.value === 'indexed') {
    return `color-${index + 1}`
  }
  return colorNames[index] || `color-${index + 1}`
}

// Генерация CSS Variables
const cssVariablesCode = computed(() => {
  const lines = [':root {']
  colors.value.forEach((color, index) => {
    const name = getColorName(index)
    lines.push(`  --${name}: ${color};`)

    // Добавляем RGB версию
    const rgb = hexToRgb(color)
    if (rgb) {
      lines.push(`  --${name}-rgb: ${rgb.r}, ${rgb.g}, ${rgb.b};`)
    }
  })
  lines.push('}')
  return lines.join('\n')
})

// Генерация SCSS Variables
const scssVariablesCode = computed(() => {
  const lines = ['// Цветовая палитра']
  colors.value.forEach((color, index) => {
    const name = getColorName(index)
    lines.push(`$${name}: ${color};`)
  })

  lines.push('')
  lines.push('// Карта цветов')
  lines.push('$colors: (')
  colors.value.forEach((color, index) => {
    const name = getColorName(index)
    const comma = index < colors.value.length - 1 ? ',' : ''
    lines.push(`  "${name}": $${name}${comma}`)
  })
  lines.push(');')

  return lines.join('\n')
})

// Генерация Tailwind Config
const tailwindConfigCode = computed(() => {
  const colorEntries = colors.value.map((color, index) => {
    const name = getColorName(index)
    return `        '${name}': '${color}',`
  }).join('\n')

  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
${colorEntries}
      },
    },
  },
}`
})

// Генерация JSON
const jsonCode = computed(() => {
  const obj = {}
  colors.value.forEach((color, index) => {
    const name = getColorName(index)
    const rgb = hexToRgb(color)
    const hsl = hexToHsl(color)
    obj[name] = {
      hex: color,
      rgb: rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : null,
      hsl: hsl ? `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)` : null
    }
  })
  return JSON.stringify(obj, null, 2)
})

// Генерация массива
const arrayCode = computed(() => {
  return `const palette = [\n  ${colors.value.map(c => `'${c}'`).join(',\n  ')}\n];`
})

// Генерация объекта цветов
const objectCode = computed(() => {
  const entries = colors.value.map((color, index) => {
    const name = getColorName(index)
    return `  ${name}: '${color}'`
  }).join(',\n')

  return `const colors = {\n${entries}\n};`
})

const currentCode = computed(() => {
  switch (exportFormat.value) {
    case 'css': return cssVariablesCode.value
    case 'scss': return scssVariablesCode.value
    case 'tailwind': return tailwindConfigCode.value
    case 'json': return jsonCode.value
    case 'array': return arrayCode.value
    case 'object': return objectCode.value
    default: return cssVariablesCode.value
  }
})

function copyCode() {
  copyToClipboard(currentCode.value, 'Код скопирован!')
}

function downloadCode() {
  const extensions = {
    css: 'css',
    scss: 'scss',
    tailwind: 'js',
    json: 'json',
    array: 'js',
    object: 'js'
  }

  const filename = `palette-${Date.now()}.${extensions[exportFormat.value]}`
  const blob = new Blob([currentCode.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()

  URL.revokeObjectURL(url)
  showToast(`Файл ${filename} скачан`, 'success')
}

// Генерация ссылки для шаринга
const shareLink = computed(() => {
  const colorsParam = colors.value.map(c => c.replace('#', '')).join('-')
  return `${window.location.origin}?colors=${colorsParam}`
})

function copyShareLink() {
  copyToClipboard(shareLink.value, 'Ссылка скопирована!')
}
</script>

<template>
  <div class="export-view">
    <header class="page-header">
      <h1>Экспорт палитры</h1>
      <p class="page-subtitle">Получите код палитры для вашего проекта</p>
    </header>

    <!-- Превью текущей палитры -->
    <section class="current-palette">
      <h3 class="section-title">Текущая палитра</h3>
      <div class="palette-strip">
        <div
          v-for="(color, index) in colors"
          :key="index"
          class="strip-color"
          :style="{ background: color }"
        >
          <span class="color-name" :style="{ color: getContrastTextColor(color) }">
            {{ getColorName(index) }}
          </span>
          <span class="color-hex mono" :style="{ color: getContrastTextColor(color) }">
            {{ color }}
          </span>
        </div>
      </div>
    </section>

    <!-- Настройки экспорта -->
    <section class="export-options">
      <div class="options-row">
        <div class="option-group">
          <label class="control-label">Формат</label>
          <div class="format-buttons">
            <button
              v-for="format in ['css', 'scss', 'tailwind', 'json', 'array', 'object']"
              :key="format"
              class="btn btn-sm"
              :class="{ 'btn-primary': exportFormat === format }"
              @click="exportFormat = format"
            >
              {{ format.toUpperCase() }}
            </button>
          </div>
        </div>

        <div class="option-group">
          <label class="control-label">Имена переменных</label>
          <div class="naming-buttons">
            <button
              class="btn btn-sm"
              :class="{ 'btn-primary': colorNaming === 'semantic' }"
              @click="colorNaming = 'semantic'"
            >
              Семантические
            </button>
            <button
              class="btn btn-sm"
              :class="{ 'btn-primary': colorNaming === 'indexed' }"
              @click="colorNaming = 'indexed'"
            >
              По номерам
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Код -->
    <section class="code-section">
      <div class="code-header">
        <h3 class="section-title">Код</h3>
        <div class="code-actions">
          <button class="btn btn-sm" @click="copyCode">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Копировать
          </button>
          <button class="btn btn-sm" @click="downloadCode">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Скачать
          </button>
        </div>
      </div>

      <div class="code-block">
        <pre><code>{{ currentCode }}</code></pre>
      </div>
    </section>

    <!-- Шаринг -->
    <section class="share-section">
      <h3 class="section-title">Поделиться палитрой</h3>
      <div class="share-row">
        <input
          type="text"
          class="input share-input mono"
          :value="shareLink"
          readonly
        />
        <button class="btn btn-primary" @click="copyShareLink">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          Копировать ссылку
        </button>
      </div>
    </section>

    <!-- UI компоненты превью -->
    <section class="components-preview">
      <h3 class="section-title">Превью компонентов</h3>

      <div class="components-grid">
        <!-- Кнопки -->
        <div class="component-card">
          <h4>Кнопки</h4>
          <div class="component-demo">
            <button
              class="demo-button"
              :style="{ background: colors[0], color: getContrastTextColor(colors[0]) }"
            >
              Primary
            </button>
            <button
              class="demo-button"
              :style="{
                background: 'transparent',
                border: '2px solid ' + colors[1],
                color: colors[1]
              }"
            >
              Secondary
            </button>
            <button
              class="demo-button"
              :style="{ background: colors[2], color: getContrastTextColor(colors[2]) }"
            >
              Accent
            </button>
          </div>
        </div>

        <!-- Карточка -->
        <div class="component-card">
          <h4>Карточка</h4>
          <div
            class="demo-card-component"
            :style="{
              background: colors[3] + '30',
              borderColor: colors[1] + '40'
            }"
          >
            <div
              class="card-badge"
              :style="{ background: colors[2], color: getContrastTextColor(colors[2]) }"
            >
              New
            </div>
            <h5 :style="{ color: colors[0] }">Заголовок карточки</h5>
            <p>Описание содержимого карточки с примером текста</p>
            <span class="card-link" :style="{ color: colors[1] }">Подробнее →</span>
          </div>
        </div>

        <!-- Инпут -->
        <div class="component-card">
          <h4>Форма</h4>
          <div class="component-demo vertical">
            <div
              class="demo-input-wrapper"
              :style="{ borderColor: colors[1] + '50' }"
            >
              <input type="text" placeholder="Введите email" class="demo-input" />
            </div>
            <button
              class="demo-button full"
              :style="{ background: colors[0], color: getContrastTextColor(colors[0]) }"
            >
              Подписаться
            </button>
          </div>
        </div>

        <!-- Бейджи -->
        <div class="component-card">
          <h4>Бейджи</h4>
          <div class="component-demo">
            <span
              v-for="(color, index) in colors"
              :key="index"
              class="demo-badge"
              :style="{
                background: color + '25',
                color: color,
                borderColor: color + '40'
              }"
            >
              {{ getColorName(index) }}
            </span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.export-view {
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

.section-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 1rem;
}

/* Текущая палитра */
.current-palette {
  margin-bottom: 2rem;
}

.palette-strip {
  display: flex;
  border-radius: var(--radius-lg);
  overflow: hidden;
  height: 100px;
}

.strip-color {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  transition: flex var(--transition-base);
}

.strip-color:hover {
  flex: 1.5;
}

.color-name {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.8;
}

.color-hex {
  font-size: 0.75rem;
}

/* Опции экспорта */
.export-options {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.options-row {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.control-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.format-buttons,
.naming-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* Блок кода */
.code-section {
  margin-bottom: 2rem;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.code-header .section-title {
  margin-bottom: 0;
}

.code-actions {
  display: flex;
  gap: 0.5rem;
}

.code-block {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  overflow-x: auto;
}

.code-block pre {
  margin: 0;
}

.code-block code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  color: var(--text-primary);
  line-height: 1.6;
}

/* Шаринг */
.share-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.share-row {
  display: flex;
  gap: 1rem;
}

.share-input {
  flex: 1;
  font-size: 0.85rem;
}

/* Превью компонентов */
.components-preview {
  margin-bottom: 2rem;
}

.components-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.component-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
}

.component-card h4 {
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-secondary);
}

.component-demo {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
}

.component-demo.vertical {
  flex-direction: column;
  align-items: stretch;
}

.demo-button {
  padding: 0.6rem 1.25rem;
  border: none;
  border-radius: var(--radius-md);
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
}

.demo-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.demo-button.full {
  width: 100%;
}

.demo-card-component {
  padding: 1rem;
  border-radius: var(--radius-md);
  border: 1px solid;
}

.card-badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.demo-card-component h5 {
  font-size: 0.95rem;
  margin-bottom: 0.35rem;
}

.demo-card-component p {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.card-link {
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
}

.demo-input-wrapper {
  border: 1px solid;
  border-radius: var(--radius-md);
  overflow: hidden;
}

.demo-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-family: inherit;
  font-size: 0.9rem;
  background: transparent;
  border: none;
  color: var(--text-primary);
}

.demo-input::placeholder {
  color: var(--text-muted);
}

.demo-badge {
  padding: 0.3rem 0.6rem;
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
  font-weight: 500;
  border: 1px solid;
}

@media (max-width: 768px) {
  .options-row {
    flex-direction: column;
    gap: 1.5rem;
  }

  .share-row {
    flex-direction: column;
  }

  .palette-strip {
    height: 80px;
  }

  .color-name {
    display: none;
  }
}
</style>

