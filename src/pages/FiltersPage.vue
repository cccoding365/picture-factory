<script setup>
import { useRouter } from 'vue-router'
import FilterEditor from '../components/FilterEditor.vue'

const router = useRouter()
function backHome() {
  router.push({ name: 'home' })
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h2 class="text-lg font-medium">滤镜编辑</h2>
      <button class="px-3 py-2 rounded bg-gray-200" @click="backHome">返回首页</button>
    </div>
    <FilterEditor />
  </div>
</template>

<style scoped></style>