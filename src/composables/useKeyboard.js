import { onMounted, onUnmounted } from 'vue'
import { usePalette } from './usePalette'

export function useKeyboard() {
  const { generatePalette } = usePalette()

  function handleKeydown(event) {
    // Игнорируем, если фокус на инпуте
    if (
      event.target.tagName === 'INPUT' ||
      event.target.tagName === 'TEXTAREA' ||
      event.target.isContentEditable
    ) {
      return
    }

    // Пробел — генерация новой палитры
    if (event.code === 'Space') {
      event.preventDefault()
      generatePalette()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
}

