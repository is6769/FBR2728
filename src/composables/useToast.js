import { ref } from 'vue'

const toasts = ref([])
let toastId = 0

export function useToast() {
  function showToast(message, type = 'success', duration = 2500) {
    const id = ++toastId

    toasts.value.push({
      id,
      message,
      type
    })

    setTimeout(() => {
      removeToast(id)
    }, duration)

    return id
  }

  function removeToast(id) {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  function copyToClipboard(text, successMessage = 'Скопировано!') {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMessage, 'success')
    }).catch(() => {
      showToast('Ошибка копирования', 'error')
    })
  }

  return {
    toasts,
    showToast,
    removeToast,
    copyToClipboard
  }
}

