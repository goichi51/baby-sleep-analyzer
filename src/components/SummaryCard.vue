<script setup lang="ts">
import type { ClimateLog } from '@/type/log';
import type { Session, Summary } from '@/type/summary'
import { computed, ref } from 'vue'
import ClimateGraph from './ClimateGraph.vue';
import { toDisplayDate, toDisplayTime } from '@/utils/date.ts';

const props = defineProps<{
  summary: Summary
  log: ClimateLog | null
  nth?: number
}>()

const floor = (n: number) => Math.floor(n * 100) / 100

const convertSession = (s: Session) => ({
  睡眠開始: toDisplayTime(s.start),
  睡眠終了: toDisplayTime(s.end),
  '睡眠時間（h）': floor(s.duration),
})

const item = computed(() => {
  const nightSummary = {
    ...props.summary.nightSummary,
    total: props.summary.nightSummary?.total ? floor(props.summary.nightSummary.total) : undefined,
  }
  const summary = {
    ...nightSummary,
    sleepSession: nightSummary.sleepSession?.map((s) => convertSession(s)),
    awakeSession: nightSummary.awakeSession?.map((s) => convertSession(s)),
  }
  const { daySleepDuration, lastFeedingTime, lastSleepingTime, avgTemperature: avgTemperature } = props.summary
  return {
    ...props.summary,
    daySleepDuration: daySleepDuration ? floor(daySleepDuration) : null,
    lastFeedingTime: lastFeedingTime ? toDisplayTime(lastFeedingTime) : null,
    lastSleepingTime: lastSleepingTime ? toDisplayTime(lastSleepingTime) : null,
    avgTemperature: avgTemperature ? floor(avgTemperature) : null,
    nightSummary: summary,
  }
})

const tabs = [
  { value: 'detail', label: '詳細' },
  { value: 'climate', label: '気温・湿度' },
]

const tab = ref(tabs[0]?.value)
</script>
<template>
  <v-card
    variant="tonal"
    :title="`${nth ? nth + `. ` : ''}${toDisplayDate(item.nightTimeStart)} ${item.score ?? '-'}点`"
  >
    <v-card-text>
      <div class="mb-4">
        <div>日中(6~22時)の睡眠時間: {{ item.daySleepDuration ?? '-' }}時間</div>
        <div>日中の散歩： {{ item.haveWalk ? 'あり' : 'なし' }}</div>
        <div>最後のごはん： {{ item.lastFeedingTime ?? '-' }}</div>
        <div>夜間睡眠の入眠時刻： {{ item.lastSleepingTime ?? '-' }}</div>
        <div>夜間の平均気温： {{ item.avgTemperature ?? '-' }}</div>
        <div>夜間睡眠時間: {{ item.nightSummary.total ?? '-' }}</div>
        <div>夜間覚醒回数： {{ item.nightSummary.awakenings ?? '-' }}</div>
      </div>

        <v-tabs v-model="tab" inset grow class="mb-1">
          <v-tab v-for="t in tabs" :value="t.value">{{ t.label }}</v-tab>
        </v-tabs>

        <v-tabs-window v-model="tab">
          <v-tabs-window-item :value="tabs[0]?.value">
            <v-data-table density="compact" hide-default-footer :items="item.nightSummary.sleepSession" />
          </v-tabs-window-item>
          <v-tabs-window-item :value="tabs[1]?.value">
            <div v-if="log"><ClimateGraph :log="log" :summary /></div>
            <div v-else>データがありません</div>
          </v-tabs-window-item>
        </v-tabs-window>

    </v-card-text>
  </v-card>
</template>
