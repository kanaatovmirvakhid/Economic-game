<script setup lang="ts">
import { defineProps } from 'vue';
import type { RangeRow } from '../types/gameTypes';

const props = defineProps<{
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
      <q-card-section class="team-header" :style="{ backgroundColor: teamColor }">
        <div class="text-h6 text-white">{{ teamRanges.team }}</div>
      </q-card-section>

      <q-card-section class="team-content">
        <div class="range-group">
          <div
            v-for="(item, key) in [...Object.values(teamRanges.firstColumn || {}),
                                 ...Object.values(teamRanges.secondColumn || {}),
                                 ...Object.values(teamRanges.thirdColumn || {}),
                                 ...Object.values(teamRanges.fourthColumn || {})]"
            :key="key"
            class="range-item"
          >
            <div class="range-name" style="width: 100%; display: flex; justify-content: space-between;">{{ item.name }} <span style="text-align: right; font-weight: bold; font-size: 18px;">{{ item.value }}</span></div>
            <q-slider
              v-model="item.value"
              :min="0"
              :max="100"
              :step="1"
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
  display: flex;
  flex-direction: column;
}

.range-group {
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex-grow: 1;
}

.range-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.range-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
}

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