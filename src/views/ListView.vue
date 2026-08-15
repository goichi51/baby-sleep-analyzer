<script setup lang="ts">
import type { Summary } from '@/type/summary'
import type { Score } from '@/type/score'
import { useFetch } from '@vueuse/core'
import { endOfMonth, format, startOfMonth } from 'date-fns'
import { computed, ref } from 'vue'
import ListTab from '@/components/ListTab.vue'
import { useRoute } from 'vue-router'
import type { ChildcareLog, ClimateLog } from '@/type/log'
import { toIsoDate } from '@/utils/date'

const route = useRoute()
const selectedDay = computed(() =>
  route.query.date && route.query.date.length > 0
    ? new Date(route.query.date as string)
    : new Date(),
)
const selectedDayStr = computed(() => toIsoDate(selectedDay.value))
const range = computed(() => {
  const since = toIsoDate(startOfMonth(selectedDay.value))
  const until = toIsoDate(endOfMonth(selectedDay.value))
  return { since, until }
})

const summariesUrl = computed(() => `/api/summaries?since=${range.value.since}&until=${range.value.until}`)
const { data: summaries, statusCode: summariesStatusCode } = await useFetch<Summary>(summariesUrl, {
  refetch: true,
}).json()



const summaryUrl = computed(() => `/api/summaries?date=${selectedDayStr.value}`)
const { data: summary, statusCode: summaryStatusCode } = await useFetch<Summary>(summaryUrl, {
  refetch: true,
}).json()

if (summaryStatusCode.value == null || summaryStatusCode.value >= 500) {
  throw new Error() //TODO
}

const childcareLogUrl = computed(() => `/api/logs/childcare?date=${selectedDayStr.value}`)
const { data: childcareLog = null, statusCode: childcareLogStatusCode } = await useFetch<ChildcareLog>(childcareLogUrl, {
  refetch: true,
}).json()
if (childcareLogStatusCode.value == null || childcareLogStatusCode.value >= 500) {
  throw new Error()
}

const climateLogUrl = computed(() => `/api/logs/climate?date=${selectedDayStr.value}`)
const { data: climateLog = null, statusCode: climateLogStatusCode } = await useFetch<ClimateLog>(climateLogUrl, {
  refetch: true,
}).json()
if (climateLogStatusCode.value == null || climateLogStatusCode.value >= 500) {
  throw new Error()
}
</script>

<template>
  <ListTab :summary :summaries :childcareLog="childcareLog" :climateLog="climateLog" :selected="selectedDayStr"></ListTab>
</template>
