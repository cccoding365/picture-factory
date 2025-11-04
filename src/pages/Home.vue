<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { imageUrl, setImageFile, clearImage } from '../stores/image.js'
import { Upload, ImagePlus, Scissors, Sliders, AlertCircle } from 'lucide-vue-next'

const router = useRouter()
const uploading = ref(false)
const isDragging = ref(false)
const bigFileWarning = ref('')
const MAX_SIZE_MB = 10

function handleFile(file) {
  if (!file) return
  bigFileWarning.value = ''
  const sizeMB = file.size / (1024 * 1024)
  if (sizeMB > MAX_SIZE_MB) {
    bigFileWarning.value = `文件大小约 ${sizeMB.toFixed(1)}MB，处理可能较慢。建议先压缩后再上传。`
  }
  uploading.value = true
  setImageFile(file)
  uploading.value = false
}

function onFileChange(e) {
  const file = e.target.files?.[0]
  handleFile(file)
}

function onDragOver(e) {
  e.preventDefault()
  isDragging.value = true
}
function onDragLeave(e) {
  e.preventDefault()
  isDragging.value = false
}
function onDrop(e) {
  e.preventDefault()
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  handleFile(file)
}

function goTo(routeName) {
  if (!imageUrl.value) return
  router.push({ name: routeName })
}
</script>

<template>
  <section class="bg-white rounded-lg shadow-sm border p-4 space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div class="flex items-center gap-2">
        <ImagePlus class="w-5 h-5 text-gray-700" />
        <div>
          <h2 class="font-medium">上传图片</h2>
          <p class="text-sm text-gray-500">支持 PNG/JPG/WebP 等常见格式，可拖拽到下方区域</p>
        </div>
      </div>
      <label class="inline-flex items-center gap-2 px-3 py-2 rounded bg-gray-900 text-white cursor-pointer w-fit">
        <Upload class="w-4 h-4" />
        <input type="file" accept="image/*" class="hidden" @change="onFileChange" />
        <span>{{ uploading ? '处理中...' : '选择文件' }}</span>
      </label>
    </div>

    <div
      class="relative rounded border-2 border-dashed p-6 flex flex-col items-center justify-center text-center transition"
      :class="isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-gray-50'"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
    >
      <p class="text-sm text-gray-600">拖拽图片到此处上传，或点击上方按钮选择文件</p>
    </div>

    <div v-if="!imageUrl" class="text-sm text-gray-500">
      尚未选择图片。请选择一张图片开始编辑。
    </div>

    <div v-if="bigFileWarning" class="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 text-sm">
      <AlertCircle class="w-4 h-4" />
      <span>{{ bigFileWarning }}</span>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <button
        class="px-4 py-3 rounded bg-indigo-600 text-white disabled:bg-gray-300 disabled:text-gray-600 inline-flex items-center justify-center gap-2"
        :disabled="!imageUrl"
        @click="goTo('crop')"
      >
        <Scissors class="w-4 h-4" />
        裁剪
      </button>
      <button
        class="px-4 py-3 rounded bg-indigo-600 text-white disabled:bg-gray-300 disabled:text-gray-600 inline-flex items-center justify-center gap-2"
        :disabled="!imageUrl"
        @click="goTo('filters')"
      >
        <Sliders class="w-4 h-4" />
        滤镜
      </button>
    </div>

    <div v-if="imageUrl" class="flex items-center gap-2">
      <img :src="imageUrl" class="h-24 w-auto rounded border" />
      <button class="px-3 py-2 rounded bg-gray-200" @click="clearImage">清除图片</button>
    </div>
  </section>
</template>

<style scoped></style>