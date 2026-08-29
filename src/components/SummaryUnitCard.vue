<script setup lang="ts">
defineProps<{
  title: string
  icon: string
  color: string
}>()
</script>
<template>
  <v-card class="bg-grey-bottom-1 pa-3" rounded="lg" variant="tonal" style="width: 180px">
    <div class="d-flex justify-space-between align-center text-grey-lighten-1 mb-3">
      <span class="text-caption font-weight-bold">{{ title }}</span>
      <v-icon :icon="icon" :color="color" size="small"></v-icon>
    </div>
    <slot />
  </v-card>
</template>
