<script setup lang="ts">
import { ref } from 'vue'

const tabs = [
  { value: 'list', path: '/', label: '一覧' },
  { value: 'ranking', path: '/ranking', label: 'ランキング' },
  { value: 'import', path: '/import', label: 'データ連携' },
]
const selectedTab = ref('list')
</script>
<template>
  <main class="w-100">
    <suspense>
      <v-card>
        <v-tabs
          v-model="selectedTab"
          align-tabs="center"
          color="primary"
          bg-color="blue-grey-darken-4"
          slider-color="indigo-lighten-4"
          grow
        >
          <v-tab v-for="tab in tabs" :key="tab.value" :to="tab.path" :value="tab.value">{{
            tab.label
          }}</v-tab>
        </v-tabs>
        <v-card-text>
          <router-view />
        </v-card-text>
      </v-card>
    </suspense>
  </main>
</template>
