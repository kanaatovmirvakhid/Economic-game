<script setup lang="ts">
import { defineProps, computed } from "vue";
import type { IRow } from "../types/gameTypes";

const props = defineProps<{
  statistics: IRow[];
}>();

const lastYear = computed(() => {
  return props.statistics.length - 1;
});
</script>

<template>
  <div class="statistics">
    <div class="statistics__column">
      <div
        class="statistics__item"
        v-for="(item, index) in statistics[lastYear].firstColumn"
        :key="index"
      >
        <div class="statistics__name">{{ item?.name }}</div>
        <div class="statistics__value"  v-if="
              lastYear > 0 &&
              Number(item?.value.toFixed(0)) > statistics[lastYear - 1]?.firstColumn[index]?.value
            ">
          <span class="increase">{{ item?.value.toFixed(3) }}</span> <img src="../assets/img/increase.png" alt="">
        </div>
        <div class="statistics__value" v-else-if="
              lastYear > 0 &&
              Number(item?.value.toFixed(0)) < statistics[lastYear - 1]?.firstColumn[index]?.value
            ">
          <span class="decrease">{{ item?.value.toFixed(3) }}</span> <img src="../assets/img/decrease.png" alt="">
        </div>
        <div class="statistics__value" v-else>
          <span >{{ item?.value.toFixed(3) }}</span>
        </div>
      </div>
    </div>
    <div class="statistics__column">
      <div
        class="statistics__item"
        v-for="(item, index) in statistics[lastYear].secondColumn"
        :key="index"
      >
        <div class="statistics__name">{{ item?.name }}</div>
        <div class="statistics__value"  v-if="
              lastYear > 0 &&
              Number(item?.value.toFixed(0)) > statistics[lastYear - 1]?.secondColumn[index]?.value
            ">
          <span class="increase">{{ item?.value.toFixed(3) }}</span> <img src="../assets/img/increase.png" alt="">
        </div>
        <div class="statistics__value" v-else-if="
              lastYear > 0 &&
              Number(item?.value.toFixed(0)) < statistics[lastYear - 1]?.secondColumn[index]?.value
            ">
          <span class="decrease">{{ item?.value.toFixed(3) }}</span> <img src="../assets/img/decrease.png" alt="">
        </div>
        <div class="statistics__value" v-else>
          <span >{{ item?.value.toFixed(3) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.statistics {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin: 0 auto;
  border: 1px solid #000000;
  border-top: 0;
  padding: 20px;
  border-radius: 0 0 10px 10px;
  &__column {
    width: 400px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  &__item {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
  }
  &__value{
    display: flex;
    align-items: center;
    gap: 10px;
  }
}
.increase{
  color: #21BA45;
}
.decrease{
  color: #C10015;
}
</style>
