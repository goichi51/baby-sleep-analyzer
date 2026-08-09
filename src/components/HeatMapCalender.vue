<script setup lang="ts">
import type { Score } from '@/type/score'
import { ref, watch } from 'vue'
import { format } from 'date-fns'
import router from '@/router';

const props = defineProps<{
  scores: Score[]
  selected: string
}>()

const today = format(new Date(), 'yyyy-MM-dd')
const selectedDay = ref(props.selected)
const calendar = ref()

const setToday = () => {
  router.push({path: '/' })
}

const prev = () => {
  calendar.value.prev()
}

const next = () => {
  calendar.value.next()
}

const dateScoreMap = new Map(
  (props.scores ?? []).map((s) => [format(s.date, 'yyyy-MM-dd'), s.value]),
)

watch(selectedDay, (newValue) => {
  router.push({path:'/', query: {date: newValue}})
})

/**
 * 睡眠スコアが低いと赤に近づき、高いと緑に近づく
 * @param date
 */
const getBgColor = (date: string) => {
  const score = dateScoreMap.get(date)!
  if (!score) {
    return 'rgba(0, 0, 0, 0)'
  }
  const red = Math.min(255 - (score * 255) / 100 + 30, 255)
  const green = Math.min((score * 255) / 100, 255)
  return `rgba(${red}, ${green}, 0, 0.3)`
}
</script>
<template>
  <v-row class="fill-height">
    <v-col style="max-width: 800px">
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
      <v-sheet height="600">
        <v-calendar ref="calendar" v-model="selectedDay" :now="today">
          <template v-slot:day="{ date }">
            <div class="day-background-layer" :style="{ backgroundColor: getBgColor(date) }" />
          </template>
        </v-calendar>
      </v-sheet>
    </v-col>
  </v-row>
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
    min-height: 90px !important;
    padding: 5px;
  }
}
</style>
