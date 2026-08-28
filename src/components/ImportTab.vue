<script setup lang="ts">
import { useFetch } from '@vueuse/core'
import { ref } from 'vue'
import TheSnackBar from './TheSnackBar.vue'

const childcareLog = ref('')
const climateLog = ref('')

const snackbar = ref(false)
const snackbarMessage = ref('')

const importChildcareLog = async () => {
  const { error } = await useFetch(`/api/logs/childcare`).post({ text: childcareLog.value }).json()
  if (error.value) {
    snackbarMessage.value = 'ぴよログのデータのインポートに失敗しました'
  } else {
    snackbarMessage.value = 'ぴよログのデータのインポートが完了しました'
    childcareLog.value = ''
  }
  snackbar.value = true
}

const importClimateLog = async () => {
  const { error } = await useFetch(`/api/logs/climate`).post({ text: climateLog.value }).json()
  if (error.value) {
    snackbarMessage.value = 'switch bot のデータのインポートに失敗しました'
  } else {
    snackbarMessage.value = 'switch bot のデータのインポートが完了しました'
    climateLog.value = ''
  }
  snackbar.value = true
}
</script>
<template>
  <TheSnackBar v-model="snackbar" :message="snackbarMessage" />
  <div class="my-6">
    <div class="text-headline-medium my-2">育児記録</div>
    ぴよログのメニュー > 記録の出力 > データのエクスポート で出力したデータを貼り付けてください。
    <v-textarea class="mt-2" v-model="childcareLog" />
    <v-btn
      size="large"
      :disabled="childcareLog.length === 0"
      variant="outlined"
      @click="importChildcareLog"
      >Import</v-btn
    >
  </div>
  <div class="my-6">
    <div class="text-headline-medium py-2">気温・湿度</div>
    switch bot の温湿度計 > データエクスポート で出力したデータを貼り付けてください。
    <v-textarea class="mt-2" v-model="climateLog" />
    <v-btn
      size="large"
      :disabled="climateLog.length === 0"
      variant="outlined"
      @click="importClimateLog"
      >Import</v-btn
    >
  </div>
</template>
