<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';

const props = defineProps<{
  title: string;
  data: number[];
  labels: string[];
  color?: string;
}>();

const chartRef = ref<HTMLCanvasElement>();
let chart: Chart;

onMounted(() => {
  if (chartRef.value) {
    chart = new Chart(chartRef.value, {
      type: 'line',
      data: {
        labels: props.labels,
        datasets: [{
          label: props.title,
          data: props.data,
          borderColor: props.color || '#1976d2',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }
});

watch(() => props.data, () => {
  if (chart) {
    chart.data.labels = props.labels;
    chart.data.datasets[0].data = props.data;
    chart.update();
  }
});
</script>

<template>
  <div class="chart-container">
    <h3>{{ title }}</h3>
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<style scoped>
.chart-container {
  width: 100%;
  height: 300px;
}
</style>