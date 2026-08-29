import type { Summary } from '@/type/summary'

interface Label {
  name: string
  icon: string
  color: string
  unit?: string
}

export const labels: Record<string, Label> = {
  daySleepDuration: {
    name: 'おひるね合計',
    icon: 'mdi-weather-sunny',
    color: 'orange-lighten-3',
    unit: 'h',
  },
  lastFeedingTime: { name: '最後のごはん', icon: 'mdi-food-fork-drink', color: 'red-lighten-3' },
  haveWalk: { name: 'さんぽ', icon: 'mdi-shoe-print', color: 'black-lighten-3' },
  lastSleepingTime: { name: 'おやすみ', icon: 'mdi-sleep', color: 'green-lighten-3' },
  avgTemperature: {
    name: '夜の平均気温',
    icon: 'mdi-thermometer',
    color: 'blue-lighten-3',
    unit: '℃',
  },
  nightSummaryTotal: {
    name: '睡眠時間',
    icon: 'mdi-weather-night',
    color: 'yellow-lighten-3',
    unit: 'h',
  },
  nightSummaryAwakenings: {
    name: '覚醒',
    icon: 'mdi-sleep-off',
    color: 'white-lighten-3',
    unit: '回',
  },
} as const
