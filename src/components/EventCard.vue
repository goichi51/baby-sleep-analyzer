<script setup lang="ts">
import type { Log } from '@/type/log'
import { format } from 'date-fns'
import { computed } from 'vue'

const props = defineProps<{
  log: Log
}>()

const events = computed(() =>
  props.log.events.map((e) => ({
    時刻: format(e.datetime, 'yyyy-MM-dd HH:mm'),
    出来事: e.name,
    メモ: e.memo,
  })),
)
</script>
<template>
  <v-card variant="tonal" title="一日の記録">
    <v-card-text>
      <v-data-table class="border-b-sm" hide-default-footer :items="events" />
      <div class="mt-4" v-if="log.diary">
        <div class="mb-2 text-title-medium font-weight-bold">日記</div>
        {{ log.diary.text }}
      </div>
    </v-card-text>
  </v-card>
</template>
