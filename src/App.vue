<script setup>
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
      <div class="max-w-5xl mx-auto px-4 py-3">
        <h1 class="text-lg md:text-xl font-semibold">图片工厂</h1>
      </div>
    </header>
    <main class="max-w-5xl mx-auto px-4 py-4">
      <RouterView />
    </main>
  </div>
</template>

<style scoped></style>