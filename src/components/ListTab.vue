<script setup lang="ts">
import type { Score } from '@/type/score.ts'
import SummaryCard from './SummaryCard.vue'
import type { Summary } from '@/type/summary.ts'
import HeatMapCalender from './HeatMapCalender.vue'
import EventCard from './EventCard.vue'
import type { Log } from '@/type/log.ts'

defineProps<{
  scores: Score[]
  summary: Summary | null
  log: Log | null
  selected: string
}>()

</script>
<template>
  <div class="d-flex ga-5 flex-column">
    <HeatMapCalender :selected :scores />
    <SummaryCard v-if="summary" :summary />
    <EventCard v-if="log" :log />
    <div v-else>データがありません</div>
  </div>
</template>
