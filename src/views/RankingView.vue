<script setup lang="ts">
import type { Ranking } from '@/type/ranking'
import { useFetch } from '@vueuse/core'
import { ref } from 'vue'
import RankingTab from '@/components/RankingTab.vue'

const since = ref('2026-07-01')
const until = ref('2026-07-21')
const num = ref(5)

const rankingUrl = ref(
  `/api/summaries/ranking?since=${since.value}&until=${until.value}&num=${num.value}`,
)
const { data: ranking } = await useFetch<Ranking>(rankingUrl, { refetch: true }).json()
</script>
<template>
  <RankingTab :ranking />
</template>
