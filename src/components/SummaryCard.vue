<script setup lang="ts">
import type { ClimateLog } from '@/type/log'
import type { Session, Summary } from '@/type/summary'
import { computed, ref } from 'vue'
import ClimateGraph from './ClimateGraph.vue'
import { toDisplayDate, toDisplayTime } from '@/utils/date.ts'
import SummaryUnitCard from './SummaryUnitCard.vue'
import { labels } from '@/utils/labels.ts'

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
  const {
    daySleepDuration,
    lastFeedingTime,
    lastSleepingTime,
    avgTemperature: avgTemperature,
  } = props.summary
  return {
    ...props.summary,
    nightSummary: summary,
    daySleepDuration: daySleepDuration ? floor(daySleepDuration) : null,
    lastFeedingTime: lastFeedingTime ? toDisplayTime(lastFeedingTime) : null,
    lastSleepingTime: lastSleepingTime ? toDisplayTime(lastSleepingTime) : null,
    avgTemperature: avgTemperature ? floor(avgTemperature) : null,
    nightSummaryTotal: summary.total,
    nightSummaryAwakenings: summary.awakenings,
    haveWalk: props.summary.haveWalk ? 'あり' : 'なし'
  }
})

const displayUnits = ['daySleepDuration', 'lastFeedingTime', 'haveWalk', 'lastSleepingTime', 'avgTemperature'] as (keyof Summary)[]

const tabs = [
  { value: 'detail', label: '詳細' },
  { value: 'climate', label: '気温・湿度' },
]

const tab = ref(tabs[0]?.value)

const getOrDefault = (val: unknown, defaultVal: string = '-') => {
  return val ?? defaultVal
}
</script>
<template>
  <v-container fluid class="bg-grey-darken-4 pa-3">
    <div class="d-flex align-center mb-6 ga-4">
        <span class="text-headline-medium font-weight-bold tracking-wide">{{ toDisplayDate(item.nightTimeStart) }}</span>
      <v-chip
        color="amber-darken-2"
        variant="flat"
        size="large"
        class="font-weight-bold px-4"
      >
        <v-icon start icon="mdi-star-circle-outline"></v-icon>
        {{item.score}}点
      </v-chip>
    </div>
      <div class="d-flex ga-2 mt-3 mb-6">
      <SummaryUnitCard v-for="unit in displayUnits" :title="labels[unit]!.name" :icon="labels[unit]!.icon" :color="labels[unit]!.color">
        <div class="stat-value font-weight-bold">
            {{ getOrDefault(item[unit]) }}
            <span v-if="labels[unit]?.unit" class="stat-unit ms-1">{{labels[unit]!.unit}}</span>
          </div>
      </SummaryUnitCard>
      <SummaryUnitCard :title="`${labels.nightSummaryTotal!.name}/${labels.nightSummaryAwakenings!.name}`" :icon="labels.nightSummaryTotal!.icon" :color="labels.nightSummaryTotal!.color">
         <div class="stat-value font-weight-bold">
            {{ getOrDefault(item.nightSummaryTotal) }}
            <span class="stat-unit ms-1">{{ labels.nightSummaryTotal!.unit }}</span> <span class="text-h5 text-grey">/</span> 
            {{ getOrDefault(item.nightSummaryAwakenings) }}
            <span class="stat-unit ms-1">{{ labels.nightSummaryAwakenings!.unit }}</span>
          </div>
      </SummaryUnitCard>
</div>
<v-card variant="tonal" rounded="lg">
      <v-tabs v-model="tab" grow inset >
        <v-tab v-for="t in tabs" :value="t.value">{{ t.label }}</v-tab>
      </v-tabs>

      <v-tabs-window v-model="tab">
        <v-tabs-window-item :value="tabs[0]?.value">
          <v-data-table
          class="pa-3"
            density="compact"
            hide-default-footer
            :items="item.nightSummary!.sleepSession"
          />
        </v-tabs-window-item>
        <v-tabs-window-item :value="tabs[1]?.value">
          <div v-if="log"><ClimateGraph :log="log" :summary /></div>
          <div v-else>データがありません</div>
        </v-tabs-window-item>
      </v-tabs-window>
</v-card>
   </v-container>
</template>
<style scoped>
.stat-value {
  font-size: 1.5rem !important;
  line-height: 1.2 !important;
  color: #ffffff !important;
}

.stat-unit {
  font-size: 1rem !important;
  font-weight: normal;
  margin-left: 2px;
  color: #b0bec5;
}

</style>
