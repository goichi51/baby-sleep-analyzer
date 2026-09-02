<script setup lang="ts">
import { computed, ref, watch, type Ref } from 'vue'
import { format } from 'date-fns'
import router from '@/router'
import type { Summary } from '@/type/summary'
import { toDisplayTime } from '@/utils/date'
import { labels } from '@/utils/labels'
import { tryOnBeforeUnmount } from '@vueuse/core'

const props = defineProps<{
  summaries: Summary[]
  selected: string
}>()

const today = format(new Date(), 'yyyy-MM-dd')
const selectedDay = ref(props.selected)
const calendar = ref()

const setToday = () => {
  router.push({ path: '/' })
}

const prev = () => {
  calendar.value.prev()
}

const next = () => {
  calendar.value.next()
}

const dateSummaryMap = computed(
  () => new Map(props.summaries.map((s) => [format(s.nightTimeStart, 'yyyy-MM-dd'), s])),
)

watch(selectedDay, (newValue) => {
  router.push({ path: '/', query: { date: newValue } })
})

/**
 * 睡眠スコアが低いと赤に近づき、高いと緑に近づく
 * @param date
 */
const getBgColor = (date: string) => {
  const score = dateSummaryMap.value.get(date)?.score
  if (!score) {
    return 'rgba(0, 0, 0, 0)'
  }
  const red = Math.min(255 - (score * 255) / 100 + 30, 255)
  const green = Math.min((score * 255) / 100, 255)
  return `rgba(${red}, ${green}, 0, 0.3)`
}

const doesHaveWalk = (date: string) => {
  if (!dateSummaryMap.value.get(date)?.haveWalk === null) return '-'
  return dateSummaryMap.value.get(date)?.haveWalk ? '○' : '×'
}

const toDisplayFloat = (val: number | null | undefined) => {
  if (!val) return '-'
  return Math.floor(val * 10) / 10
}

const calenderItemNames = ['daySleepDuration', 'lastFeedingTime', 'haveWalk', 'lastSleepingTime', 'avgTemperature'] as const
type CalenderItemName = typeof calenderItemNames[number]

const getCalenderItem = (date: string, name: CalenderItemName) => {
  const summary = dateSummaryMap.value.get(date)
  switch(name) {
    case 'lastSleepingTime':
    case 'lastFeedingTime':
      return toDisplayTime(summary ? summary[name] : undefined)
    case 'haveWalk':
      return doesHaveWalk(date)
    case 'daySleepDuration':
    case 'avgTemperature':
      return toDisplayFloat(summary ? summary[name] : undefined)
  }
}

const displayed: Ref<Record<CalenderItemName, boolean>> = ref({
  lastSleepingTime: true,
  lastFeedingTime: true,
  haveWalk: true,
  daySleepDuration: true,
  avgTemperature: true
})
</script>
<template>
  <v-card variant="flat">
    <div class="d-flex flex-sm-wrap ga-4">
        <span v-for="name in calenderItemNames">
          <v-checkbox v-model="displayed[name]" density="compact" color="primary">
            <template v-slot:label>
              <v-icon :icon="labels[name]!.icon" :color="labels[name]!.color" size="small" class="mr-1"/>{{ labels[name]!.name }}
            </template>
          </v-checkbox>
        </span>
      </div>
      <v-row class="fill-height">
        <v-col class="w-100">
          <v-sheet height="64">
            <v-toolbar flat>
              <v-btn color="primary" class="mx-4" variant="outlined" @click="setToday">
                Today
              </v-btn>
              <v-btn variant="text" icon @click="prev">
                <v-icon color="primary" size="large" icon="mdi-chevron-left" />
              </v-btn>
              <v-btn variant="text" icon @click="next">
                <v-icon color="primary" size="large" icon="mdi-chevron-right" />
              </v-btn>
              <v-toolbar-title v-if="calendar">
                {{ calendar.title }}
              </v-toolbar-title>
            </v-toolbar>
          </v-sheet>
          <v-sheet>
            <v-calendar ref="calendar" v-model="selectedDay" :now="today">
              <template v-slot:day="{ date }">
                <div class="day-background-layer" :style="{ backgroundColor: getBgColor(date) }" />
                <div class="d-flex flex-sm-wrap">
                  <div v-for="name in calenderItemNames" >
                    <div class="mx-1 day-info" v-if="displayed[name]">
                    <v-icon :icon="labels[name]!.icon" size="small" />
                    {{ getCalenderItem(date, name) }}
                    </div>
                  </div>
                </div>
              </template>
            </v-calendar>
          </v-sheet>
        </v-col>
      </v-row>
  </v-card>
</template>
<style scoped>
/* セル全体に背景色を行き渡らせるためのスタイル調整 */
.day-background-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0; /* 日付のテキストより後ろに配置する */
  pointer-events: none; /* クリックイベントを邪魔しないようにする */
}
</style>
<style>
@media (min-width: 600px) {
  .v-calendar-weekly__day {
    min-height: 115px !important;
    padding: 5px;
  }
}
.day-info {
  width: 60px;
  opacity: 0.6; 
}
</style>
