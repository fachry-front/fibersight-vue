import { ref, computed } from 'vue'

/**
 * Validation rule library.
 * Each rule is a function: (value, formValues) => string | null
 * Returns an error message string, or null if valid.
 */
export const rules = {
  /** Field harus diisi (tidak kosong / null / undefined). */
  required: (message = 'Field ini wajib diisi') => (value) => {
    if (value === null || value === undefined) return message
    if (typeof value === 'string' && value.trim() === '') return message
    return null
  },

  /** Value harus cocok dengan regex pattern. */
  pattern: (regex, message = 'Format tidak valid') => (value) => {
    if (value === null || value === undefined || value === '') return null // biar required terpisah
    return regex.test(String(value)) ? null : message
  },

  /** Angka harus berada dalam rentang [min, max] inklusif. */
  range: (min, max, message) => (value) => {
    if (value === null || value === undefined || value === '') return null
    const num = Number(value)
    if (Number.isNaN(num)) return 'Harus berupa angka'
    if (num < min || num > max) return message || `Harus di antara ${min} dan ${max}`
    return null
  },

  /** Custom validator generik — terima fungsi (value, formValues) => boolean, plus pesan error. */
  custom: (validatorFn, message = 'Nilai tidak valid') => (value, formValues) => {
    return validatorFn(value, formValues) ? null : message
  },
}

// ── Common regex patterns dipakai di FiberSight ──
export const PATTERNS = {
  // Device ID: 2-4 huruf kapital, dash, 2-4 digit. Contoh: OLT-01, ODP-123
  DEVICE_ID: /^[A-Z]{2,4}-\d{2,4}$/,
}

/**
 * useFormValidation — composable untuk validasi form reaktif.
 *
 * @param {Object} formRef - ref() ke object form, contoh: ref({ id: '', location: '' })
 * @param {Object} schema - mapping field -> array of validator functions
 *
 * Contoh:
 *   const form = ref({ id: '', location: '', rxPower: -18 })
 *   const { errors, validate, validateField, isValid, resetErrors } = useFormValidation(form, {
 *     id: [rules.required('Device ID wajib diisi'), rules.pattern(PATTERNS.DEVICE_ID, 'Format: XXX-00 (contoh: ODP-12)')],
 *     location: [rules.required('Lokasi wajib diisi')],
 *     rxPower: [rules.range(-40, -5, 'Rx Power harus antara -40 dan -5 dBm')],
 *   })
 */
export function useFormValidation(formRef, schema) {
  const errors = ref({})

  /** Validasi satu field, simpan error pertama yang gagal (kalau ada). */
  function validateField(field) {
    const validators = schema[field] || []
    const value = formRef.value[field]

    for (const validator of validators) {
      const result = validator(value, formRef.value)
      if (result) {
        errors.value = { ...errors.value, [field]: result }
        return false
      }
    }

    // Field valid — hapus error sebelumnya kalau ada
    if (errors.value[field]) {
      const next = { ...errors.value }
      delete next[field]
      errors.value = next
    }
    return true
  }

  /** Validasi semua field di schema. Return true kalau semua valid. */
  function validate() {
    let allValid = true
    for (const field of Object.keys(schema)) {
      const fieldValid = validateField(field)
      if (!fieldValid) allValid = false
    }
    return allValid
  }

  function resetErrors() {
    errors.value = {}
  }

  const isValid = computed(() => Object.keys(errors.value).length === 0)

  return { errors, validate, validateField, isValid, resetErrors }
}
