import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseBadge from '@/components/common/BaseBadge.vue'

describe('BaseBadge', () => {
  it('menampilkan teks status', () => {
    const wrapper = mount(BaseBadge, { props: { status: 'Normal' } })
    expect(wrapper.text()).toBe('Normal')
  })

  it.each([
    ['Normal',   'badge-normal'],
    ['Warning',  'badge-warning'],
    ['Critical', 'badge-critical'],
    ['Offline',  'badge-offline'],
    ['Unknown',  'badge-offline'], // fallback untuk status tak dikenal
  ])('memberi class "%s" -> "%s"', (status, expectedClass) => {
    const wrapper = mount(BaseBadge, { props: { status } })
    expect(wrapper.classes()).toContain(expectedClass)
    expect(wrapper.classes()).toContain('badge')
  })
})
