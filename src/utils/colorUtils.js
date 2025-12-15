export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('').toUpperCase()
}

export function rgbToHsl(r, g, b) {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2

  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 }
}

export function hslToRgb(h, s, l) {
  h /= 360
  s /= 100
  l /= 100

  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  }
}

export function hexToHsl(hex) {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  return rgbToHsl(rgb.r, rgb.g, rgb.b)
}

export function hslToHex(h, s, l) {
  const rgb = hslToRgb(h, s, l)
  return rgbToHex(rgb.r, rgb.g, rgb.b)
}

export function generateRandomColor() {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

export function generateHarmoniousPalette(count = 5, baseHue = null) {
  const hue = baseHue ?? Math.random() * 360
  const colors = []
  const goldenRatio = 0.618033988749895

  for (let i = 0; i < count; i++) {
    const h = (hue + (i * goldenRatio * 360)) % 360
    const s = 55 + Math.random() * 30
    const l = 45 + Math.random() * 25
    colors.push(hslToHex(h, s, l))
  }

  return colors
}

export const PALETTE_TYPES = {
  RANDOM: 'random',
  ANALOGOUS: 'analogous',
  MONOCHROMATIC: 'monochromatic',
  TRIADIC: 'triadic',
  COMPLEMENTARY: 'complementary',
  SPLIT_COMPLEMENTARY: 'split-complementary',
  TETRADIC: 'tetradic'
}

export function generatePaletteByType(type, count, baseColor = null) {
  const baseHex = baseColor || generateRandomColor()
  const baseHsl = hexToHsl(baseHex)
  if (!baseHsl) return [baseHex]

  const { h, s, l } = baseHsl
  const colors = []

  switch (type) {
    case PALETTE_TYPES.ANALOGOUS:
      const analogousStep = 30
      for (let i = 0; i < count; i++) {
        const offset = (i - Math.floor(count / 2)) * analogousStep
        colors.push(hslToHex((h + offset + 360) % 360, s, l + (i % 2 === 0 ? 5 : -5)))
      }
      break

    case PALETTE_TYPES.MONOCHROMATIC:
      for (let i = 0; i < count; i++) {
        const lightness = 25 + (i * (50 / (count - 1 || 1)))
        const saturation = s - (i * 5)
        colors.push(hslToHex(h, Math.max(saturation, 30), lightness))
      }
      break

    case PALETTE_TYPES.TRIADIC:
      for (let i = 0; i < count; i++) {
        const hue = (h + (i * 120)) % 360
        const lightness = l + (i % 2 === 0 ? 0 : 10)
        colors.push(hslToHex(hue, s, lightness))
      }
      break

    case PALETTE_TYPES.COMPLEMENTARY:
      for (let i = 0; i < count; i++) {
        const hue = i % 2 === 0 ? h : (h + 180) % 360
        const lightness = l + ((i % 3) * 10 - 10)
        colors.push(hslToHex(hue, s, Math.max(30, Math.min(80, lightness))))
      }
      break

    case PALETTE_TYPES.SPLIT_COMPLEMENTARY:
      const splitAngles = [0, 150, 210]
      for (let i = 0; i < count; i++) {
        const angle = splitAngles[i % splitAngles.length]
        const hue = (h + angle) % 360
        colors.push(hslToHex(hue, s, l + (i * 5 - 10)))
      }
      break

    case PALETTE_TYPES.TETRADIC:
      for (let i = 0; i < count; i++) {
        const hue = (h + (i * 90)) % 360
        colors.push(hslToHex(hue, s, l + (i % 2 === 0 ? 0 : 8)))
      }
      break

    default:
      return generateHarmoniousPalette(count, h)
  }

  return colors.slice(0, count)
}

export const MOOD_TYPES = {
  CALM: 'calm',
  ENERGETIC: 'energetic',
  PROFESSIONAL: 'professional',
  PLAYFUL: 'playful',
  NATURE: 'nature',
  SUNSET: 'sunset'
}

export function generatePaletteByMood(mood, count) {
  const moodSettings = {
    [MOOD_TYPES.CALM]: { hueRange: [180, 240], satRange: [20, 40], lightRange: [60, 80] },
    [MOOD_TYPES.ENERGETIC]: { hueRange: [0, 60], satRange: [70, 95], lightRange: [50, 65] },
    [MOOD_TYPES.PROFESSIONAL]: { hueRange: [200, 230], satRange: [30, 50], lightRange: [35, 55] },
    [MOOD_TYPES.PLAYFUL]: { hueRange: [280, 340], satRange: [60, 85], lightRange: [55, 75] },
    [MOOD_TYPES.NATURE]: { hueRange: [80, 160], satRange: [40, 70], lightRange: [40, 65] },
    [MOOD_TYPES.SUNSET]: { hueRange: [0, 45], satRange: [60, 90], lightRange: [50, 70] }
  }

  const settings = moodSettings[mood] || moodSettings[MOOD_TYPES.CALM]
  const colors = []

  for (let i = 0; i < count; i++) {
    const h = settings.hueRange[0] + Math.random() * (settings.hueRange[1] - settings.hueRange[0])
    const s = settings.satRange[0] + Math.random() * (settings.satRange[1] - settings.satRange[0])
    const l = settings.lightRange[0] + Math.random() * (settings.lightRange[1] - settings.lightRange[0])
    colors.push(hslToHex(h, s, l))
  }

  return colors
}

export function getLuminance(hex) {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(v => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })

  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function getContrastRatio(color1, color2) {
  const l1 = getLuminance(color1)
  const l2 = getLuminance(color2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

export function getWCAGLevel(contrastRatio) {
  if (contrastRatio >= 7) return { level: 'AAA', text: 'Отлично', class: 'wcag-aaa' }
  if (contrastRatio >= 4.5) return { level: 'AA', text: 'Хорошо', class: 'wcag-aa' }
  if (contrastRatio >= 3) return { level: 'AA Large', text: 'Крупный текст', class: 'wcag-aa-large' }
  return { level: 'Fail', text: 'Недостаточно', class: 'wcag-fail' }
}

export function isColorDark(hex) {
  return getLuminance(hex) < 0.5
}

export function getContrastTextColor(hex) {
  return isColorDark(hex) ? '#FFFFFF' : '#1A1A2E'
}

export function formatColor(hex, format) {
  switch (format) {
    case 'rgb': {
      const rgb = hexToRgb(hex)
      return rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : hex
    }
    case 'hsl': {
      const hsl = hexToHsl(hex)
      return hsl ? `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)` : hex
    }
    default:
      return hex
  }
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
