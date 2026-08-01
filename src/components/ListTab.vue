<script setup lang="ts">
import type { Score } from '@/type/score.ts'
import SummaryCard from './SummaryCard.vue'
import type { Summary } from '@/type/ranking.ts'
import HeatMapCalender from './HeatMapCalender.vue'

defineProps<{
  scores: Score[]
  summary: Summary | null
}>()

const selected = defineModel({ type: String, required: true })
</script>
<template>
  <div class="d-flex ga-5 flex-column">
    <HeatMapCalender v-model="selected" :scores />
    <div v-if="summary">
      <SummaryCard :summary />
    </div>
    <div v-else>データがありません</div>
  </div>
</template>
