<script setup>
import { ref, computed } from 'vue'
import { usePalette } from '@/composables/usePalette'
import { useToast } from '@/composables/useToast'
import { formatColor, getContrastTextColor } from '@/utils/colorUtils'

const {
  savedPalettes,
  loadPalette,
  deletePalette,
  toggleFavorite,
  updatePalette
} = usePalette()

const { showToast, copyToClipboard } = useToast()

const searchQuery = ref('')
const filterMode = ref('all') // all, favorites
const editingPalette = ref(null)
const editName = ref('')
const editTags = ref('')

const filteredPalettes = computed(() => {
  let palettes = savedPalettes.value

  // Фильтр по избранному
  if (filterMode.value === 'favorites') {
    palettes = palettes.filter(p => p.isFavorite)
  }

  // Поиск
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    palettes = palettes.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.tags?.some(t => t.toLowerCase().includes(query)) ||
      p.colors.some(c => c.toLowerCase().includes(query))
    )
  }

  return palettes
})

function handleLoad(palette) {
  loadPalette(palette)
  showToast(`Палитра "${palette.name}" загружена`, 'success')
}

function handleDelete(palette) {
  if (confirm(`Удалить палитру "${palette.name}"?`)) {
    deletePalette(palette.id)
    showToast('Палитра удалена', 'success')
  }
}

function startEditing(palette) {
  editingPalette.value = palette.id
  editName.value = palette.name
  editTags.value = palette.tags?.join(', ') || ''
}

function saveEdit() {
  if (editingPalette.value) {
    const tags = editTags.value.split(',').map(t => t.trim()).filter(Boolean)
    updatePalette(editingPalette.value, {
      name: editName.value,
      tags
    })
    showToast('Палитра обновлена', 'success')
    cancelEdit()
  }
}

function cancelEdit() {
  editingPalette.value = null
  editName.value = ''
  editTags.value = ''
}

function copyAllColors(palette) {
  const colorsText = palette.colors.join(', ')
  copyToClipboard(colorsText, 'Цвета скопированы!')
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}
</script>

<template>
  <div class="library-view">
    <header class="page-header">
      <h1>Библиотека палитр</h1>
      <p class="page-subtitle">Ваши сохранённые цветовые схемы</p>
    </header>

    <!-- Панель управления -->
    <div class="library-controls">
      <div class="search-box">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          class="input search-input"
          placeholder="Поиск по названию, тегам или цветам..."
        />
      </div>

      <div class="filter-buttons">
        <button
          class="btn btn-sm"
          :class="{ 'btn-primary': filterMode === 'all' }"
          @click="filterMode = 'all'"
        >
          Все ({{ savedPalettes.length }})
        </button>
        <button
          class="btn btn-sm"
          :class="{ 'btn-primary': filterMode === 'favorites' }"
          @click="filterMode = 'favorites'"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          Избранные
        </button>
      </div>
    </div>

    <!-- Список палитр -->
    <div v-if="filteredPalettes.length > 0" class="palettes-grid">
      <div
        v-for="palette in filteredPalettes"
        :key="palette.id"
        class="palette-card"
        :class="{ 'is-editing': editingPalette === palette.id }"
      >
        <!-- Режим просмотра -->
        <template v-if="editingPalette !== palette.id">
          <div class="card-header">
            <div class="card-title-row">
              <h3 class="card-title">{{ palette.name }}</h3>
              <button
                class="favorite-btn"
                :class="{ active: palette.isFavorite }"
                @click="toggleFavorite(palette.id)"
                :title="palette.isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" :fill="palette.isFavorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </button>
            </div>
            <span class="card-date">{{ formatDate(palette.createdAt) }}</span>
          </div>

          <div class="color-strip" @click="handleLoad(palette)">
            <div
              v-for="(color, index) in palette.colors"
              :key="index"
              class="strip-color"
              :style="{ background: color }"
              :title="color"
            >
              <span
                class="color-label mono"
                :style="{ color: getContrastTextColor(color) }"
              >
                {{ color }}
              </span>
            </div>
          </div>

          <div v-if="palette.tags?.length" class="card-tags">
            <span
              v-for="tag in palette.tags"
              :key="tag"
              class="tag"
            >
              {{ tag }}
            </span>
          </div>

          <div class="card-actions">
            <button class="btn btn-sm" @click="handleLoad(palette)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="16 3 21 3 21 8"/>
                <line x1="4" y1="20" x2="21" y2="3"/>
              </svg>
              Загрузить
            </button>
            <button class="btn btn-sm" @click="copyAllColors(palette)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              Копировать
            </button>
            <button class="btn btn-sm" @click="startEditing(palette)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </button>
            <button class="btn btn-sm btn-danger" @click="handleDelete(palette)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </template>

        <!-- Режим редактирования -->
        <template v-else>
          <div class="edit-form">
            <div class="form-group">
              <label class="control-label">Название</label>
              <input
                v-model="editName"
                type="text"
                class="input w-full"
                @keyup.enter="saveEdit"
              />
            </div>
            <div class="form-group">
              <label class="control-label">Теги (через запятую)</label>
              <input
                v-model="editTags"
                type="text"
                class="input w-full"
                @keyup.enter="saveEdit"
              />
            </div>
            <div class="edit-actions">
              <button class="btn btn-sm" @click="cancelEdit">Отмена</button>
              <button class="btn btn-sm btn-primary" @click="saveEdit">Сохранить</button>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Пустое состояние -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          <line x1="9" y1="10" x2="15" y2="10"/>
        </svg>
      </div>
      <h3>{{ searchQuery ? 'Ничего не найдено' : 'Библиотека пуста' }}</h3>
      <p v-if="!searchQuery">Сохраните палитру из генератора, чтобы она появилась здесь</p>
      <p v-else>Попробуйте изменить поисковый запрос</p>
    </div>
  </div>
</template>

<style scoped>
.library-view {
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

/* Панель управления */
.library-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 280px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-box svg {
  position: absolute;
  left: 1rem;
  color: var(--text-muted);
}

.search-input {
  width: 100%;
  padding-left: 2.75rem;
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
}

/* Сетка палитр */
.palettes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.palette-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  overflow: hidden;
  transition: all var(--transition-base);
}

.palette-card:hover {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-md);
}

.palette-card.is-editing {
  border-color: var(--accent-primary);
}

.card-header {
  padding: 1rem 1.25rem;
}

.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
}

.favorite-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.favorite-btn:hover {
  color: var(--warning);
}

.favorite-btn.active {
  color: var(--warning);
}

.card-date {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Полоса цветов */
.color-strip {
  display: flex;
  height: 80px;
  cursor: pointer;
  transition: transform var(--transition-base);
}

.color-strip:hover {
  transform: scale(1.02);
}

.strip-color {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 0.5rem;
}

.color-label {
  font-size: 0.65rem;
  opacity: 0;
  transition: opacity var(--transition-base);
}

.color-strip:hover .color-label {
  opacity: 0.8;
}

/* Теги */
.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
}

.tag {
  padding: 0.2rem 0.6rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  color: var(--text-secondary);
}

/* Действия */
.card-actions {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-top: 1px solid var(--border-color);
}

.btn-danger {
  color: var(--error);
}

.btn-danger:hover {
  background: rgba(255, 107, 107, 0.15);
}

/* Редактирование */
.edit-form {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding-top: 0.5rem;
}

/* Пустое состояние */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  color: var(--text-muted);
  margin-bottom: 1.5rem;
  opacity: 0.5;
}

.empty-state h3 {
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}

.empty-state p {
  color: var(--text-muted);
  font-size: 0.95rem;
}

@media (max-width: 600px) {
  .library-controls {
    flex-direction: column;
  }

  .palettes-grid {
    grid-template-columns: 1fr;
  }
}
</style>

