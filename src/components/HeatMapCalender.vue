<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { format } from 'date-fns'
import router from '@/router'
import type { Summary } from '@/type/summary';
import { toDisplayTime } from '@/utils/date';

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

const dateSummaryMap = computed(() => new Map(
  props.summaries.map((s) => [format(s.nightTimeStart, 'yyyy-MM-dd'), s]),
))

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
</script>
<template>
  <v-card>
    <v-card-text>
<div class="d-flex flex-sm-wrap ga-4">
      <span><v-icon icon="mdi-food-fork-drink" size="small"/>：日中最後のごはんの時間</span>
      <span><v-icon icon="mdi-sleep" size="small"/>：夜間睡眠に入った時間</span>
      <span><v-icon icon="mdi-shoe-print" size="small"/>：さんぽの有無</span>
      <span><v-icon icon="mdi-thermometer" size="small"/>：夜間帯の平均気温</span>
    </div>
  <v-row class="fill-height">
    <v-col class="w-100">
      <v-sheet height="64">
        <v-toolbar flat>
          <v-btn color="primary" class="mx-4" variant="outlined" @click="setToday"> Today </v-btn>
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
            <div class="mx-1">
              <v-icon icon="mdi-food-fork-drink" size="small"/>
               {{ toDisplayTime(dateSummaryMap.get(date)?.lastFeedingTime) }}
            </div>
            <div class="mx-1">
              <v-icon icon="mdi-sleep" size="small"/>
               {{ toDisplayTime(dateSummaryMap.get(date)?.lastSleepingTime) }}
            </div>
            <div class="mx-1">
              <v-icon icon="mdi-shoe-print" size="small"/>
               {{ doesHaveWalk(date) }}
            </div>
            <div class="mx-1">
              <v-icon icon="mdi-thermometer" size="small"/>
               {{ dateSummaryMap.get(date)?.avgTemperature ? Math.floor(dateSummaryMap.get(date)!.avgTemperature! * 10) / 10  : '-'}}
            </div>
          </div>
          </template>
        </v-calendar>
      </v-sheet>
    </v-col>
  </v-row>
</v-card-text>
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
</style>
