<script setup>
import { ref, computed } from 'vue'
import { imageUrl } from '../stores/image.js'
import { RefreshCcw, Save, Sun, Snowflake, Film, Palette } from 'lucide-vue-next'

const filters = ref({
  brightness: 100,
  contrast: 100,
  saturate: 100,
  sepia: 0,
  grayscale: 0,
  blur: 0,
  hue: 0,
})

const filterString = computed(
  () =>
    `brightness(${filters.value.brightness}%) contrast(${filters.value.contrast}%) saturate(${filters.value.saturate}%) sepia(${filters.value.sepia}%) grayscale(${filters.value.grayscale}%) blur(${filters.value.blur}px) hue-rotate(${filters.value.hue}deg)`
)

function resetFilters() {
  filters.value = { brightness: 100, contrast: 100, saturate: 100, sepia: 0, grayscale: 0, blur: 0, hue: 0 }
}

function applyPreset(name) {
  switch (name) {
    case 'warm':
      filters.value = { brightness: 105, contrast: 100, saturate: 120, sepia: 10, grayscale: 0, blur: 0, hue: 20 }
      break
    case 'cool':
      filters.value = { brightness: 95, contrast: 105, saturate: 110, sepia: 0, grayscale: 0, blur: 0, hue: -20 }
      break
    case 'film':
      filters.value = { brightness: 100, contrast: 115, saturate: 95, sepia: 20, grayscale: 0, blur: 0, hue: 0 }
      break
    case 'mono':
      filters.value = { brightness: 100, contrast: 100, saturate: 100, sepia: 0, grayscale: 100, blur: 0, hue: 0 }
      break
  }
}

const exporting = ref(false)
const exportError = ref('')

async function exportImage() {
  if (!imageUrl.value || exporting.value) return
  exporting.value = true
  exportError.value = ''
  try {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = imageUrl.value
    await new Promise((res, rej) => {
      img.onload = res
      img.onerror = rej
    })
    const canvas = document.createElement('canvas')
    const naturalW = img.naturalWidth || img.width
    const naturalH = img.naturalHeight || img.height
    canvas.width = naturalW
    canvas.height = naturalH
    const ctx = canvas.getContext('2d')
    ctx.filter = filterString.value
    ctx.drawImage(img, 0, 0, naturalW, naturalH)
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('导出失败'))), 'image/png', 0.92)
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'filtered.png'
    a.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    exportError.value = err?.message || '导出过程中出现错误'
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="relative w-full aspect-[4/3] bg-gray-100 rounded overflow-hidden flex items-center justify-center">
      <img v-if="imageUrl" :src="imageUrl" :style="{ filter: filterString }" class="max-h-full w-auto" />
      <div v-else class="text-sm text-gray-500">请返回首页上传图片。</div>
    </div>

    <div class="space-y-3">
      <div class="flex flex-wrap gap-2">
        <button class="px-3 py-2 rounded border hover:bg-gray-50 inline-flex items-center gap-1" @click="applyPreset('warm')"><Sun class="w-4 h-4" /> 暖色</button>
        <button class="px-3 py-2 rounded border hover:bg-gray-50 inline-flex items-center gap-1" @click="applyPreset('cool')"><Snowflake class="w-4 h-4" /> 冷色</button>
        <button class="px-3 py-2 rounded border hover:bg-gray-50 inline-flex items-center gap-1" @click="applyPreset('film')"><Film class="w-4 h-4" /> 胶片</button>
        <button class="px-3 py-2 rounded border hover:bg-gray-50 inline-flex items-center gap-1" @click="applyPreset('mono')"><Palette class="w-4 h-4" /> 黑白</button>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label class="flex items-center gap-3">
          <span class="w-20 text-sm text-gray-600">亮度</span>
          <input type="range" min="0" max="200" v-model.number="filters.brightness" />
          <span class="w-10 text-right text-sm">{{ filters.brightness }}%</span>
        </label>
        <label class="flex items-center gap-3">
          <span class="w-20 text-sm text-gray-600">对比度</span>
          <input type="range" min="0" max="200" v-model.number="filters.contrast" />
          <span class="w-10 text-right text-sm">{{ filters.contrast }}%</span>
        </label>
        <label class="flex items-center gap-3">
          <span class="w-20 text-sm text-gray-600">饱和度</span>
          <input type="range" min="0" max="200" v-model.number="filters.saturate" />
          <span class="w-10 text-right text-sm">{{ filters.saturate }}%</span>
        </label>
        <label class="flex items-center gap-3">
          <span class="w-20 text-sm text-gray-600">复古</span>
          <input type="range" min="0" max="100" v-model.number="filters.sepia" />
          <span class="w-10 text-right text-sm">{{ filters.sepia }}%</span>
        </label>
        <label class="flex items-center gap-3">
          <span class="w-20 text-sm text-gray-600">灰度</span>
          <input type="range" min="0" max="100" v-model.number="filters.grayscale" />
          <span class="w-10 text-right text-sm">{{ filters.grayscale }}%</span>
        </label>
        <label class="flex items-center gap-3">
          <span class="w-20 text-sm text-gray-600">模糊</span>
          <input type="range" min="0" max="20" v-model.number="filters.blur" />
          <span class="w-10 text-right text-sm">{{ filters.blur }}px</span>
        </label>
        <label class="flex items-center gap-3">
          <span class="w-20 text-sm text-gray-600">色相</span>
          <input type="range" min="-180" max="180" v-model.number="filters.hue" />
          <span class="w-12 text-right text-sm">{{ filters.hue }}°</span>
        </label>
      </div>

      <div class="flex items-center gap-2">
        <button class="px-3 py-2 rounded bg-gray-200 inline-flex items-center gap-1" @click="resetFilters"><RefreshCcw class="w-4 h-4" /> 重置</button>
        <button class="px-3 py-2 rounded bg-indigo-600 text-white inline-flex items-center gap-1 disabled:bg-gray-300" :disabled="!imageUrl || exporting" @click="exportImage">
          <Save class="w-4 h-4" />
          {{ exporting ? '导出中...' : '导出滤镜结果' }}
        </button>
        <span v-if="exportError" class="text-sm text-rose-700">{{ exportError }}</span>
      </div>
    </div>
  </div>
  
</template>

<style scoped></style>