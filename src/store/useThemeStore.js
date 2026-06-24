import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const MANUAL_THEME_KEY = 'fibersight_theme_manual'
  const SETTINGS_TOGGLES_KEY = 'fibersight_settings_toggles'

  function shouldBeDark(date = new Date()) {
    const h = date.getHours()
    const m = date.getMinutes()

    // Dark Mode: 17:00 - 23:59
    if (h >= 17) return true

    // Dark Mode: 00:00 - 04:59
    if (h < 5) return true

    // Dark Mode: tepat 05:00
    if (h === 5 && m === 0) return true

    // Light Mode: 05:01 - 16:59
    return false
  }

  function isAutoThemeEnabled() {
    return true
  }

  function persistAutoThemeEnabled() {
    try {
      const saved = localStorage.getItem(SETTINGS_TOGGLES_KEY)
      const settings = saved ? JSON.parse(saved) : {}

      localStorage.setItem(
        SETTINGS_TOGGLES_KEY,
        JSON.stringify({ ...settings, autoTheme: true })
      )
    } catch {
      localStorage.setItem(
        SETTINGS_TOGGLES_KEY,
        JSON.stringify({ autoTheme: true })
      )
    }
  }

  function getInitialTheme() {
    return shouldBeDark()
  }

  const isDark = ref(getInitialTheme())

  function applyTheme() {
    document.documentElement.classList.toggle('dark', isDark.value)
    document.documentElement.classList.toggle('light', !isDark.value)
  }

  function toggle() {
    resetToAuto()
  }

  function autoCheckTime() {
    const nextTheme = shouldBeDark()

    if (nextTheme !== isDark.value) {
      isDark.value = nextTheme
      applyTheme()
    }
  }

  function resetToAuto() {
    localStorage.removeItem(MANUAL_THEME_KEY)
    persistAutoThemeEnabled()

    isDark.value = shouldBeDark()
    applyTheme()
  }

  function initTheme() {
    resetToAuto()
  }

  return {
    isDark,
    shouldBeDark,
    isAutoThemeEnabled,
    toggle,
    autoCheckTime,
    resetToAuto,
    initTheme
  }
})
