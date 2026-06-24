import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useFormValidation, rules, PATTERNS } from '@/composables/useFormValidation.js'

describe('useFormValidation', () => {
  function createForm(overrides = {}) {
    return ref({
      id: '', location: '', rxPower: -18, txPower: 2, temperature: 40,
      ...overrides,
    })
  }

  const schema = {
    id: [
      rules.required('Device ID wajib diisi'),
      rules.pattern(PATTERNS.DEVICE_ID, 'Format harus XXX-00'),
    ],
    location: [
      rules.required('Lokasi wajib diisi'),
      rules.custom(v => v.trim().length >= 3, 'Lokasi minimal 3 karakter'),
    ],
    rxPower: [rules.range(-40, -5, 'Rx Power harus antara -40 dan -5 dBm')],
  }

  it('validate() gagal kalau field required kosong', () => {
    const form = createForm()
    const { validate, errors } = useFormValidation(form, schema)

    const isValid = validate()

    expect(isValid).toBe(false)
    expect(errors.value.id).toBe('Device ID wajib diisi')
    expect(errors.value.location).toBe('Lokasi wajib diisi')
  })

  it('validate() sukses kalau semua field valid', () => {
    const form = createForm({ id: 'ODP-12', location: 'Jakarta Selatan' })
    const { validate, errors, isValid } = useFormValidation(form, schema)

    const result = validate()

    expect(result).toBe(true)
    expect(errors.value).toEqual({})
    expect(isValid.value).toBe(true)
  })

  it('rules.pattern menolak Device ID dengan format salah', () => {
    const form = createForm({ id: 'odp12', location: 'Jakarta Selatan' })
    const { validateField, errors } = useFormValidation(form, schema)

    validateField('id')

    expect(errors.value.id).toBe('Format harus XXX-00')
  })

  it('rules.pattern menerima Device ID dengan format benar', () => {
    const form = createForm({ id: 'ODP-12', location: 'Jakarta Selatan' })
    const { validateField, errors } = useFormValidation(form, schema)

    const valid = validateField('id')

    expect(valid).toBe(true)
    expect(errors.value.id).toBeUndefined()
  })

  it('rules.custom menolak lokasi terlalu pendek', () => {
    const form = createForm({ id: 'ODP-12', location: 'JK' })
    const { validateField, errors } = useFormValidation(form, schema)

    validateField('location')

    expect(errors.value.location).toBe('Lokasi minimal 3 karakter')
  })

  it('rules.range menolak Rx Power di luar batas', () => {
    const form = createForm({ rxPower: -50 })
    const { validateField, errors } = useFormValidation(form, schema)

    validateField('rxPower')

    expect(errors.value.rxPower).toBe('Rx Power harus antara -40 dan -5 dBm')
  })

  it('resetErrors() mengosongkan semua error', () => {
    const form = createForm()
    const { validate, errors, resetErrors } = useFormValidation(form, schema)

    validate()
    expect(Object.keys(errors.value).length).toBeGreaterThan(0)

    resetErrors()
    expect(errors.value).toEqual({})
  })

  it('field yang sebelumnya error menjadi valid setelah diperbaiki', () => {
    const form = createForm({ id: '', location: 'Jakarta Selatan' })
    const { validateField, errors } = useFormValidation(form, schema)

    validateField('id')
    expect(errors.value.id).toBeDefined()

    form.value.id = 'ODP-01'
    validateField('id')
    expect(errors.value.id).toBeUndefined()
  })
})
