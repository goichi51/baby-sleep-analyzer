<script setup lang="ts">
import { useFetch } from '@vueuse/core'
import { ref } from 'vue'
import TheSnackBar from './TheSnackBar.vue'

const eventLog = ref('')
const snackbar = ref(false)
const snackbarMessage = ref('')

const importEventLog = async () => {
  const { error } = await useFetch(`/api/events`).post({ text: eventLog.value }).json()
  if (error.value) {
    snackbarMessage.value = 'データのインポートに失敗しました'
  } else {
    snackbarMessage.value = 'データのインポートが完了しました'
  }
  eventLog.value = ''
  snackbar.value = true
}
</script>
<template>
  <div class="my-6">
    <TheSnackBar v-model="snackbar" :message="snackbarMessage" />
    <div class="text-headline-medium my-2">育児記録</div>
    ぴよログのメニュー > 記録の出力 > データのエクスポート で出力したデータを貼り付けてください。
    <v-textarea v-model="eventLog" />
    <v-btn size="large" variant="outlined" @click="importEventLog">Import</v-btn>
  </div>
  <div class="text-headline-medium py-2">気温・湿度</div>
  <v-textarea class="my-3" />
</template>
