<script setup lang="ts">
import type { Session, Summary } from '@/type/summary'
import { format } from 'date-fns'
import { computed } from 'vue'

const props = defineProps<{
  summary: Summary
  nth?: number
}>()

const toDate = (date: string) => format(date, 'yyyy/MM/dd')
const toDatetime = (date: string) => format(date, 'yyyy/MM/dd HH:mm')
const floor = (n: number) => Math.floor(n * 100) / 100

const convertSession = (s: Session) => ({
  睡眠開始: toDatetime(s.start),
  睡眠終了: toDatetime(s.end),
  '睡眠時間（h）': floor(s.duration),
})

const item = computed(() => {
  const nightSummary = {
    ...props.summary.nightSummary,
    total: props.summary.nightSummary.total ? floor(props.summary.nightSummary.total) : undefined,
  }
  const summary = {
    ...nightSummary,
    sleepSession: nightSummary.sleepSession.map((s) => convertSession(s)),
    awakeSession: nightSummary.awakeSession.map((s) => convertSession(s)),
  }
  const {daySleepDuration, lastFeedingTime, lastSleepingTime} = props.summary
  return {
    ...props.summary,
    daySleepDuration: daySleepDuration ? floor(daySleepDuration) : null,
    lastFeedingTime: lastFeedingTime ? toDatetime(lastFeedingTime): null,
    lastSleepingTime: lastSleepingTime ? toDatetime(lastSleepingTime): null,
    nightSummary: summary,
  }
})
</script>
<template>
  <v-card
    variant="tonal"
    :title="`${nth ? nth + `. ` : ''}${toDate(item.nightTimeStart)} ${item.score ?? '-'}点`"
  >
    <v-card-text>
      <div>日中(6~22時)の睡眠時間: {{ item.daySleepDuration ?? '-' }}時間</div>
      <div>最後のごはん： {{ item.lastFeedingTime ?? '-' }}</div>
      <div>夜間睡眠の入眠時刻： {{ item.lastSleepingTime ?? '-' }}</div>
      <div>夜間睡眠時間: {{ item.nightSummary.total ?? '-' }}</div>
      <div>夜間覚醒回数： {{ item.nightSummary.awakenings ?? '-' }}</div>
      <v-data-table hide-default-footer :items="item.nightSummary.sleepSession" />
    </v-card-text>
  </v-card>
</template>
