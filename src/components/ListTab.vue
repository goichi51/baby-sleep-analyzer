<script setup lang="ts">
import SummaryCard from './SummaryCard.vue'
import type { Summary } from '@/type/summary.ts'
import HeatMapCalender from './HeatMapCalender.vue'
import EventCard from './EventCard.vue'
import type { ChildcareLog, ClimateLog } from '@/type/log.ts'

defineProps<{
  summaries: Summary[]
  summary: Summary | null
  childcareLog: ChildcareLog | null
  climateLog: ClimateLog | null
  selected: string
}>()
</script>
<template>
  <div class="d-flex ga-3 flex-column">
    <HeatMapCalender :selected :summaries />
    <SummaryCard v-if="summary" :summary :log="climateLog" />
    <EventCard v-if="childcareLog" :log="childcareLog" />
    <div v-else>データがありません</div>
  </div>
</template>
