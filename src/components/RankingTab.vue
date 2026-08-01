<script setup lang="ts">
import type { Ranking } from '@/type/ranking.ts'
import SummaryCard from './SummaryCard.vue'

defineProps<{
  ranking: Ranking
}>()
</script>
<template>
  22時〜翌6時の睡眠の質をランクづけ
  <div class="text-headline-medium pt-5 pb-2">BEST 5</div>
  <div class="d-flex ga-4 flex-column">
    <summary-card v-for="(summary, idx) in ranking.best" :key="idx" :nth="idx + 1" :summary />
  </div>
  <div class="text-headline-medium pt-5 pb-2">WORST 5</div>
  <div class="d-flex ga-4 flex-column">
    <summary-card v-for="(summary, idx) in ranking.worst" :key="idx" :nth="idx + 1" :summary />
  </div>
</template>
