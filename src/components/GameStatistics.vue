<script setup lang="ts">
import { defineProps, computed } from "vue";
import type { IRow } from "../types/gameTypes";

const props = defineProps<{
  statistics: IRow[];
}>();

const lastYear = computed(() => props.statistics.length - 1);

const getValueAppearance = (statKey: string, currentValue: number, prevValue: number) => {
  if (lastYear.value === 0 || prevValue === undefined) {
    return { color: 'text-default', arrow: null };
  }

  const difference = currentValue - prevValue;
  const absDifference = Math.abs(difference);

  // Для визуальной наглядности увеличиваем порог изменения
  if (absDifference < 0.1) {
    return { color: 'text-default', arrow: null };
  }

  const positiveStats = ['gdpGrowth', 'gdp', 'foreignReserves', 'industrialOutput', 'tradeBalance'];
  const negativeStats = ['unemployment', 'inflation', 'budgetDeficit'];

  let isPositive = false;

  if (positiveStats.includes(statKey)) {
    isPositive = difference > 0;
  } else if (negativeStats.includes(statKey)) {
    isPositive = difference < 0;
  }

  return {
    color: isPositive ? 'text-positive' : 'text-negative',
    arrow: isPositive ? '↑' : '↓',
    // Усиливаем визуализацию значительных изменений
    strong: absDifference > 1 ? 'font-bold' : ''
  };
};
</script>

<template>
  <div class="statistics-container">
    <div class="date-display text-h6 text-center q-mb-md text-dark">
      {{ statistics[lastYear].date }}
    </div>

    <div class="stats-grid">
      <!-- Левая колонка -->
      <div class="stats-column">
        <div
          class="stats-item q-pa-sm"
          v-for="(item, key) in statistics[lastYear].firstColumn"
          :key="key"
        >
          <div class="stats-name">{{ item?.name }}</div>
          <div class="stats-value">
            <span
              class="text-weight-bold"
              :class="[
                getValueAppearance(
                  key,
                  item.value,
                  lastYear > 0 ? statistics[lastYear - 1].firstColumn[key]?.value : undefined
                ).color,
                getValueAppearance(
                  key,
                  item.value,
                  lastYear > 0 ? statistics[lastYear - 1].firstColumn[key]?.value : undefined
                ).strong
              ]"
            >
              {{ item?.value.toFixed(2) }} {{ item?.symbol }}
              <span
                v-if="lastYear > 0 && getValueAppearance(
                  key,
                  item.value,
                  statistics[lastYear - 1].firstColumn[key]?.value
                ).arrow"
                class="arrow q-ml-xs"
                :class="getValueAppearance(
                  key,
                  item.value,
                  statistics[lastYear - 1].firstColumn[key]?.value
                ).color"
              >
                {{ getValueAppearance(
                  key,
                  item.value,
                  statistics[lastYear - 1].firstColumn[key]?.value
                ).arrow }}
              </span>
            </span>
          </div>
        </div>
      </div>

      <!-- Правая колонка -->
      <div class="stats-column">
        <div
          class="stats-item q-pa-sm"
          v-for="(item, key) in statistics[lastYear].secondColumn"
          :key="key"
        >
          <div class="stats-name">{{ item?.name }}</div>
          <div class="stats-value">
            <span
              class="text-weight-bold"
              :class="[
                getValueAppearance(
                  key,
                  item.value,
                  lastYear > 0 ? statistics[lastYear - 1].secondColumn[key]?.value : undefined
                ).color,
                getValueAppearance(
                  key,
                  item.value,
                  lastYear > 0 ? statistics[lastYear - 1].secondColumn[key]?.value : undefined
                ).strong
              ]"
            >
              {{ item?.value.toFixed(2) }} {{ item?.symbol }}
              <span
                v-if="lastYear > 0 && getValueAppearance(
                  key,
                  item.value,
                  statistics[lastYear - 1].secondColumn[key]?.value
                ).arrow"
                class="arrow q-ml-xs"
                :class="getValueAppearance(
                  key,
                  item.value,
                  statistics[lastYear - 1].secondColumn[key]?.value
                ).color"
              >
                {{ getValueAppearance(
                  key,
                  item.value,
                  statistics[lastYear - 1].secondColumn[key]?.value
                ).arrow }}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.statistics-container {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 5px rgba(0,0,0,0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.stats-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stats-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-radius: 4px;
  background: #f9f9f9;
  transition: all 0.3s ease;

  &:hover {
    background: #f0f0f0;
    transform: scale(1.02);
  }
}

.stats-name {
  font-size: 0.9rem;
  color: #333;
}

.stats-value {
  display: flex;
  align-items: center;
}

.text-default {
  color: #333;
}

.text-positive {
  color: #4CAF50;
}

.text-negative {
  color: #F44336;
}

.arrow {
  font-weight: bold;
  font-size: 1.2em;
}

.font-bold {
  font-weight: 800;
  text-shadow: 0 0 2px rgba(0,0,0,0.1);
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>