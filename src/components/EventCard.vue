<script setup lang="ts">
import type { Log } from '@/type/log'

defineProps<{
  log: Log
}>()
</script>
<template>
  <v-card variant="tonal" title="一日の記録">
    <v-card-text>
      <v-data-table class="border-b-sm" hide-default-footer :items="log.events ?? []" />
      <div class="mt-4" v-if="log.diary">
        <div class="mb-2 text-title-medium font-weight-bold">日記</div>
        {{ log.diary.text }}
      </div>
    </v-card-text>
  </v-card>
</template>
