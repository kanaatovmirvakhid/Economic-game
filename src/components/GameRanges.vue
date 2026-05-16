<script setup lang="ts">
import { defineProps } from 'vue';
import type { RangeRow } from '../types/gameTypes';

defineProps<{
  ranges: RangeRow[];
}>();

const teamColor = '#3f51b5'; // Единый цвет для всех групп
</script>

<template>
  <div class="ranges-container">
    <q-card
      v-for="(teamRanges, index) in ranges"
      :key="index"
      flat
      bordered
      class="team-card"
    >
      <!-- Заголовок блока (Центробанк, Бизнес и т.д.) -->
      <q-card-section class="team-header" :style="{ backgroundColor: teamColor }">
        <div class="text-h6 text-white">{{ teamRanges.team }}</div>
      </q-card-section>

      <q-card-section class="team-content">
        <div class="range-group">
          <!-- Проходим по всем колонкам рычагов внутри команды -->
          <div
            v-for="(item, key) in [
              ...Object.values(teamRanges.firstColumn || {}),
              ...Object.values(teamRanges.secondColumn || {}),
              ...Object.values(teamRanges.thirdColumn || {}),
              ...Object.values(teamRanges.fourthColumn || {})
            ]"
            :key="key"
            class="range-item"
          >
            <!-- Название рычага (с единицами измерения) и текущее значение -->
            <div class="range-info">
              <span class="range-label">{{ item.name }}</span>
              <span class="range-value">{{ typeof item.value === 'number' ? item.value.toFixed(2) : item.value }}</span>
            </div>

            <!-- Уникальный ползунок для каждого показателя -->
            <q-slider
              v-model="item.value"
              :min="item.min"
              :max="item.max"
              :step="0.01"
              label
              :color="teamColor"
              class="q-mt-sm"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<style scoped lang="scss">
.ranges-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 8px;
}

.team-card {
  border-radius: 8px;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.team-header {
  padding: 12px 16px;
}

.team-content {
  padding: 16px;
  flex-grow: 1;
}

.range-group {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.range-item {
  display: flex;
  flex-direction: column;
}

.range-info {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.range-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #333;
  line-height: 1.2;
  max-width: 75%;
}

.range-value {
  font-weight: bold;
  font-size: 1.1rem;
  color: #3f51b5;
}

/* Адаптивность */
@media (max-width: 1200px) {
  .ranges-container {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 600px) {
  .ranges-container {
    grid-template-columns: 1fr;
  }
}
</style>
