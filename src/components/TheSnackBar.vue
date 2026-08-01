<script setup lang="ts">
defineProps<{
  message: string
}>()

const snackbar = defineModel<boolean>()
</script>
<template>
  <div class="text-center ma-2">
    <v-snackbar v-model="snackbar">
      {{ message }}
      <template v-slot:actions>
        <v-btn color="primary" variant="text" @click="snackbar = false"> Close </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>
