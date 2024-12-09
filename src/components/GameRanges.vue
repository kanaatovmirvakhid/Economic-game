<script setup lang="ts">
import { defineProps } from 'vue';
import type{ IRow } from '../types/gameTypes'

const props = defineProps<{
  ranges: IRow[];
}>();

</script>

<template>
  <div class="range">
    <div class="range__column">
      <div
        class="range__item"
        v-for="(item, key) in ranges[0]?.firstColumn"
        v-bind:key="key"
      >
        <q-badge color="secondary">
          {{ item?.name }}: {{ item?.value }}
        </q-badge>
        <q-slider
          v-model="ranges[0].firstColumn[key].value"
          :min="0"
          :max="100"
          :step="1"
          label
          color="light-green"
        />
      </div>
    </div>
    <div class="range__column">
      <div
        class="range__item"
        v-for="(item, key) in ranges[0]?.secondColumn"
        v-bind:key="key"
      >
        <q-badge color="secondary">
          {{ item?.name }}: {{ item?.value }}
        </q-badge>
        <q-slider
          v-model="ranges[0].secondColumn[key].value"
          :min="0"
          :max="100"
          :step="1"
          label
          color="light-green"
        />
      </div>
    </div>
    <div class="range__column">
      <div
        class="range__item"
        v-for="(item, key) in ranges[0]?.thirdColumn"
        v-bind:key="key"
      >
        <q-badge color="secondary">
          {{ item?.name }}: {{ item?.value }}
        </q-badge>
        <q-slider
          v-model="ranges[0].thirdColumn[key].value"
          :min="0"
          :max="100"
          :step="1"
          label
          color="light-green"
        />
      </div>
    </div>
    <div class="range__column">
      <div
        class="range__item"
        v-for="(item, key) in ranges[0]?.fourthColumn"
        v-bind:key="key"
      >
        <q-badge color="secondary">
          {{ item?.name }}: {{ item?.value }}
        </q-badge>
        <q-slider
          v-model="ranges[0].fourthColumn[key].value"
          :min="0"
          :max="100"
          :step="1"
          label
          color="light-green"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.range{
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 30px;
  &__column{
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
}
</style>
