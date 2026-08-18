<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  type ChartData,
  type ChartOptions,
  type Plugin
} from 'chart.js'
import type { ClimateLog } from '@/type/log';
import { addDays, addHours, startOfDay, startOfToday } from 'date-fns';
import type { Summary } from '@/type/summary';
import 'chartjs-adapter-date-fns'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  TimeScale,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale
)

const props = defineProps<{
    summary: Summary
    log: ClimateLog
}>()

interface Highlight {
  start: number
  end: number
  color: string
}

const eventHighlights = computed<Highlight[]>(() => {
  return (props.summary.nightSummary?.awakeSession ?? []).map(s => ({
    start: new Date(s.start).getTime(),
    end: new Date(s.end).getTime(),
    color: 'rgba(255, 99, 132, 0.2)'
  }))
})

const eventHighlightPlugin: Plugin<'line'> = {
  id: 'eventHighlight',
  beforeDraw(chart) {
    const { ctx, chartArea, scales } = chart
    if (!chartArea || !scales.x) return

    ctx.save()

    eventHighlights.value.forEach(eventHighlight => {
      const startX = scales.x!.getPixelForValue(eventHighlight!.start)
      const endX = scales.x!.getPixelForValue(eventHighlight!.end)
      ctx.fillStyle = eventHighlight!.color
        ctx.fillRect(
          startX,
          chartArea.top,
          endX - startX,
          chartArea.bottom - chartArea.top
        )
    });
    
    ctx.restore()
  }
}

const temperatureData = computed<ChartData<'line'>>(() => {
  const data = props.log.data.map(log => ({x: log.datetime, y: log.temperature }))
  return {
    datasets: [
      {
        label: '気温',
        borderColor: '#1867C0',
        data
      }
    ]
  } as any
})

const humidityData = computed<ChartData<'line'>>(() => {
  const data = props.log.data.map(log => ({x: log.datetime, y: log.humidity}))
  return {
    datasets: [
      {
        label: '湿度',
        borderColor: '#C06718',
        data
      }
    ]
  } as any
})

const chartOptions = ref<ChartOptions<'line'>>({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      type: 'time',
      time: {
        unit: 'hour', 
        displayFormats: {
          hour: 'HH' 
        }
      },
      title: {
        display: true,
        text: '時刻'
      }
    },
  }
})
</script>
<template>
  <div style="height: 300px" class="d-flex ga-1">
    <div class="w-50">
      <Line :data="temperatureData" :options="chartOptions" :plugins="[eventHighlightPlugin]" />
    </div>
    <div class="w-50">
      <Line :data="humidityData" :options="chartOptions" :plugins="[eventHighlightPlugin]" />
    </div>
  </div>
</template>
