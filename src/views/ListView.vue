<script setup lang="ts">
import type { Summary } from '@/type/summary'
import type { Score } from '@/type/score'
import { useFetch } from '@vueuse/core'
import { format } from 'date-fns'
import { computed, ref } from 'vue'
import ListTab from '@/components/ListTab.vue'
import type { Log } from '@/type/log'

const scoreUrl = ref(`/api/summaries/score?since=2026-06-01&until=2026-07-30`)
const { data: scores } = await useFetch<Score[]>(scoreUrl, { refetch: true }).json()

const today = format(new Date(), 'yyyy-MM-dd')
const selectedDay = ref(today)

const summaryUrl = computed(() => `/api/summaries?date=${selectedDay.value}`)
const { data: summary, statusCode: summaryStatusCode } = await useFetch<Summary>(summaryUrl, {
  refetch: true,
}).json()

if (summaryStatusCode.value == null || summaryStatusCode.value >= 500) {
  throw new Error() //TODO
}

const logUrl = computed(() => `/api/summaries?date=${selectedDay.value}`)
const { data: log, statusCode: logStatusCode } = await useFetch<Log>(logUrl, {
  refetch: true,
}).json()
if (logStatusCode.value == null || logStatusCode.value >= 500) {
  throw new Error() //TODO
}
</script>

<template>
  <ListTab :scores :summary :log v-model="selectedDay"></ListTab>
</template>
