<script setup lang="ts">
import type { Summary } from '@/type/summary'
import type { Score } from '@/type/score'
import { useFetch } from '@vueuse/core'
import { endOfMonth, format, startOfMonth } from 'date-fns'
import { computed, ref } from 'vue'
import ListTab from '@/components/ListTab.vue'
import type { Log } from '@/type/log'
import { useRoute } from 'vue-router'

const toDateStr = (date: Date) => format(date, 'yyyy-MM-dd')

const route = useRoute()
const selectedDay = computed(() => route.query.date && route.query.date.length > 0 ? new Date(route.query.date as string) : new Date())
const selectedDayStr = computed(() => toDateStr(selectedDay.value))
const range = computed(() => {
 const since =  toDateStr(startOfMonth(selectedDay.value))
 const until = toDateStr(endOfMonth(selectedDay.value))
 return { since, until }
})

const scoreUrl = computed(() => `/api/summaries/score?since=${range.value.since}&until=${range.value.until}`)
const { data: scores } = await useFetch<Score[]>(scoreUrl, { refetch: true }).json()


const summaryUrl = computed(() => `/api/summaries?date=${selectedDayStr.value}`)
const { data: summary, statusCode: summaryStatusCode } = await useFetch<Summary>(summaryUrl, {
  refetch: true,
}).json()

if (summaryStatusCode.value == null || summaryStatusCode.value >= 500) {
  throw new Error() //TODO
}

const logUrl = computed(() => `/api/logs/piyolog?date=${selectedDayStr.value}`)
const { data: log = null, statusCode: logStatusCode } = await useFetch<Log>(logUrl, {
  refetch: true,
}).json()
if (logStatusCode.value == null || logStatusCode.value >= 500) {
  throw new Error() 
}
</script>

<template>
  {{ range.since }}
  {{  range.until }}
  <ListTab :scores :summary :log :selected="selectedDayStr"></ListTab>
</template>