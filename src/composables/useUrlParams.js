import { onMounted } from 'vue'
import { usePalette } from './usePalette'

export function useUrlParams() {
  const { colors } = usePalette()

  onMounted(() => {
    const params = new URLSearchParams(window.location.search)
    const colorsParam = params.get('colors')

    if (colorsParam) {
      const parsedColors = colorsParam.split('-').map(c => {
        const hex = c.startsWith('#') ? c : `#${c}`
        if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
          return hex.toUpperCase()
        }
        return null
      }).filter(Boolean)

      if (parsedColors.length > 0) {
        colors.value = parsedColors
      }

      window.history.replaceState({}, '', window.location.pathname)
    }
  })
}
