<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'
import { imageUrl } from '../stores/image.js'
import { RotateCcw, RotateCw, FlipHorizontal, FlipVertical, ZoomIn, ZoomOut, RefreshCcw, Save } from 'lucide-vue-next'

const imageEl = ref(null)
let cropper = null

const aspectRatio = ref(NaN)
const aspectOptions = [
  { label: '自由', value: NaN },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:2', value: 3 / 2 },
  { label: '16:9', value: 16 / 9 },
  { label: '9:16', value: 9 / 16 },
]

const exportWidth = ref(0)
const exportHeight = ref(0)
const exportFormat = ref('png') // 'png' | 'jpeg' | 'webp'
const exporting = ref(false)
const exportError = ref('')

  function initCropper() {
  destroyCropper()
  if (!imageEl.value) return
  cropper = new Cropper(imageEl.value, {
    viewMode: 2,
    background: false,
    autoCropArea: 1,
    responsive: true,
    movable: true,
    zoomable: true,
    rotatable: true,
    scalable: true,
  })
  if (!Number.isNaN(aspectRatio.value)) {
    cropper.setAspectRatio(aspectRatio.value)
  }
  fitImageToContainer()
  centerCanvas()
  if (Number.isNaN(aspectRatio.value)) {
    setFullImageCrop()
  }
  const img = cropper.getImageData()
  exportWidth.value = Math.round(img.naturalWidth)
  exportHeight.value = Math.round(img.naturalHeight)
  }

function destroyCropper() {
  if (cropper) {
    cropper.destroy()
    cropper = null
  }
}

watch(imageUrl, async (val) => {
  if (val) {
    await nextTick()
    initCropper()
  } else {
    destroyCropper()
  }
})

onMounted(async () => {
  if (imageUrl.value) {
    await nextTick()
    initCropper()
  }
})

onUnmounted(() => destroyCropper())

async function rotateLeft() {
  if (!cropper) return
  cropper.rotate(-90)
  fitImageToContainer()
  await nextTick()
  centerCanvas()
}

async function rotateRight() {
  if (!cropper) return
  cropper.rotate(90)
  fitImageToContainer()
  await nextTick()
  centerCanvas()
}

function flipHorizontal() {
  if (!cropper) return
  const { scaleX } = cropper.getImageData()
  cropper.scaleX(scaleX === 1 ? -1 : 1)
}

function flipVertical() {
  if (!cropper) return
  const { scaleY } = cropper.getImageData()
  cropper.scaleY(scaleY === 1 ? -1 : 1)
}

function zoomIn() {
  if (!cropper) return
  cropper.zoom(0.1)
}

function zoomOut() {
  if (!cropper) return
  cropper.zoom(-0.1)
}

function setAspect(value) {
  aspectRatio.value = value
  if (cropper) {
    cropper.setAspectRatio(Number.isNaN(value) ? NaN : value)
  }
}

function resetCrop() {
  if (!cropper) return
  cropper.reset()
  fitImageToContainer()
  centerCanvas()
}

function fitImageToContainer() {
  if (!cropper) return
  const container = cropper.getContainerData()
  const img = cropper.getImageData()
  const rotated = Math.abs((img.rotate || 0) % 180) === 90
  const naturalW = rotated ? img.naturalHeight : img.naturalWidth
  const naturalH = rotated ? img.naturalWidth : img.naturalHeight
  const targetRatio = Math.min(container.width / naturalW, container.height / naturalH)
  cropper.zoomTo(targetRatio)
}

function centerCanvas() {
  if (!cropper) return
  const container = cropper.getContainerData()
  const canvas = cropper.getCanvasData()
  const left = Math.round((container.width - canvas.width) / 2)
  const top = Math.round((container.height - canvas.height) / 2)
  cropper.setCanvasData({ ...canvas, left, top })
}

function setFullImageCrop() {
  if (!cropper) return
  const img = cropper.getImageData()
  cropper.setData({ x: 0, y: 0, width: img.naturalWidth, height: img.naturalHeight })
}

async function exportImage() {
  if (!cropper || exporting.value) return
  exporting.value = true
  exportError.value = ''
  try {
    const width = Math.max(1, Math.floor(exportWidth.value || 0))
    const height = Math.max(1, Math.floor(exportHeight.value || 0))
    const canvas = cropper.getCroppedCanvas({
      width,
      height,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
    })
    const mime = exportFormat.value === 'jpeg' ? 'image/jpeg' : exportFormat.value === 'webp' ? 'image/webp' : 'image/png'
    const fileName = `cropped.${exportFormat.value}`
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('导出失败'))), mime, 0.92)
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
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
      <img v-if="imageUrl" :src="imageUrl" ref="imageEl" class="max-h-full w-auto" />
      <div v-else class="text-sm text-gray-500">请返回首页上传图片。</div>
    </div>

    <div class="space-y-2 text-sm text-gray-500">
      <div class="space-y-2">
        <h4 class="text-sm font-medium text-gray-700">变换</h4>
        <div class="flex flex-wrap gap-2">
          <button class="px-3 py-2 rounded border hover:bg-gray-50 inline-flex items-center gap-1" @click="rotateLeft"><RotateCcw class="w-4 h-4" /> 左旋90°</button>
          <button class="px-3 py-2 rounded border hover:bg-gray-50 inline-flex items-center gap-1" @click="rotateRight"><RotateCw class="w-4 h-4" /> 右旋90°</button>
          <button class="px-3 py-2 rounded border hover:bg-gray-50 inline-flex items-center gap-1" @click="flipHorizontal"><FlipHorizontal class="w-4 h-4" /> 水平翻转</button>
          <button class="px-3 py-2 rounded border hover:bg-gray-50 inline-flex items-center gap-1" @click="flipVertical"><FlipVertical class="w-4 h-4" /> 垂直翻转</button>
          <button class="px-3 py-2 rounded border hover:bg-gray-50 inline-flex items-center gap-1" @click="zoomIn"><ZoomIn class="w-4 h-4" /> 放大</button>
          <button class="px-3 py-2 rounded border hover:bg-gray-50 inline-flex items-center gap-1" @click="zoomOut"><ZoomOut class="w-4 h-4" /> 缩小</button>
          <button class="px-3 py-2 rounded border hover:bg-gray-50 inline-flex items-center gap-1" @click="resetCrop"><RefreshCcw class="w-4 h-4" /> 重置</button>
        </div>
      </div>

      <div class="space-y-2">
        <h4 class="text-sm font-medium text-gray-700">裁剪比例</h4>
        <div class="flex items-center gap-3">
          <select class="border rounded px-2 py-1" :value="aspectRatio" @change="setAspect(Number($event.target.value))">
            <option v-for="opt in aspectOptions" :key="opt.label" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>
      </div>

      <div class="space-y-2">
        <h4 class="text-sm font-medium text-gray-700">导出设置</h4>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <label class="flex items-center gap-2">
            <span class="w-16">宽度</span>
            <input type="number" min="1" class="border rounded px-2 py-1 w-full" v-model.number="exportWidth" />
          </label>
          <label class="flex items-center gap-2">
            <span class="w-16">高度</span>
            <input type="number" min="1" class="border rounded px-2 py-1 w-full" v-model.number="exportHeight" />
          </label>
          <label class="flex items-center gap-2">
            <span class="w-16">格式</span>
            <select class="border rounded px-2 py-1 w-full" v-model="exportFormat">
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
              <option value="webp">WebP</option>
            </select>
          </label>
        </div>
        <div class="flex items-center gap-2">
          <button class="px-3 py-2 rounded bg-indigo-600 text-white inline-flex items-center gap-1 disabled:bg-gray-300" :disabled="!imageUrl || exporting" @click="exportImage">
            <Save class="w-4 h-4" />
            {{ exporting ? '导出中...' : '导出裁剪结果' }}
          </button>
          <span v-if="exportError" class="text-sm text-rose-700">{{ exportError }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>