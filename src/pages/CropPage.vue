<script setup>
import { useRouter } from 'vue-router'
import CropEditor from '../components/CropEditor.vue'

const router = useRouter()
function backHome() {
  router.push({ name: 'home' })
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h2 class="text-lg font-medium">裁剪编辑</h2>
      <button class="px-3 py-2 rounded bg-gray-200" @click="backHome">返回首页</button>
    </div>
    <CropEditor />
  </div>
</template>

<style scoped></style>