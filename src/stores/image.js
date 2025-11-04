import { ref } from 'vue'

export const imageUrl = ref('')
export const imageFile = ref(null)

export function setImageFile(file) {
  if (!file) return
  imageFile.value = file
  const url = URL.createObjectURL(file)
  imageUrl.value = url
}

export function clearImage() {
  imageFile.value = null
  imageUrl.value = ''
}