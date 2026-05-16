<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick } from 'vue';
import { useGameStore } from './stores/counter';
import Chart from 'chart.js/auto';
import GameStatistics from './components/GameStatistics.vue'
import GameRanges from './components/GameRanges.vue'
import WelcomeModal from './components/WelcomeModal.vue';

const gameStore = useGameStore();

// Refs для графиков
const gdpChart = ref<HTMLCanvasElement>();
const inflationChart = ref<HTMLCanvasElement>();
const unemploymentChart = ref<HTMLCanvasElement>();
const industrialChart = ref<HTMLCanvasElement>();
const gdp = ref<HTMLCanvasElement>();
const budgetDeficit = ref<HTMLCanvasElement>();
const foreignReserves = ref<HTMLCanvasElement>();
const tradeBalance = ref<HTMLCanvasElement>();
let chartInstances: Chart[] = [];

const mainStats = computed(() => {
  // 1. Проверяем, что в массиве есть данные (минимум стартовый 1998 год)
  if (!gameStore.statistics || gameStore.statistics.length === 0) return [];

  // ИСПРАВЛЕНИЕ: Добавляем , чтобы получить объект за 1998 год (база для сравнения)
  const first = gameStore.statistics;
  const last = gameStore.statistics[gameStore.statistics.length - 1];
  const hasHistory = gameStore.statistics.length > 1;

  // Функция-помощник для расчета разницы
  const getChange = (lastVal: number, firstVal: number) => {
    return hasHistory ? Number((lastVal - firstVal).toFixed(2)) : 0;
  };

  return [
    {
      name: 'ВВП (млн. $)',
      value: last.firstColumn.gdp.value,
      unit: 'млн $',
      change: getChange(last.firstColumn.gdp.value, first[0].firstColumn.gdp.value),
      isPositive: last.firstColumn.gdp.value > first[0].firstColumn.gdp.value
    },
    {
      name: 'Темп роста ВВП (%)',
      value: last.firstColumn.gdpGrowth.value,
      unit: '%',
      change: getChange(last.firstColumn.gdpGrowth.value, first[0].firstColumn.gdpGrowth.value),
      isPositive: last.firstColumn.gdpGrowth.value > 0
    },
    {
      name: 'Безработица (%)',
      value: last.firstColumn.unemployment.value,
      unit: '%',
      change: getChange(last.firstColumn.unemployment.value, first[0].firstColumn.unemployment.value),
      // Положительно, если безработица падает ниже уровня 1998 года (13.26%)
      isPositive: last.firstColumn.unemployment.value < first[0].firstColumn.unemployment.value
    },
    {
      name: 'Инфляция (%)',
      value: last.firstColumn.inflation.value,
      unit: '%',
      change: getChange(last.firstColumn.inflation.value, first[0].firstColumn.inflation.value),
      // Положительно, если инфляция ниже стартовой (84.44%)
      isPositive: last.firstColumn.inflation.value < first[0].firstColumn.inflation.value
    },
    {
      name: 'Дефицит бюджета (%)',
      value: last.secondColumn.budgetDeficit.value,
      unit: '%',
      change: getChange(last.secondColumn.budgetDeficit.value, first[1].secondColumn.budgetDeficit.value),
      // Положительно, если дефицит снижается
      isPositive: last.secondColumn.budgetDeficit.value < first[1].secondColumn.budgetDeficit.value
    },
    {
      name: 'Золотовалютный резерв',
      value: last.secondColumn.foreignReserves.value,
      unit: 'млн $',
      change: getChange(last.secondColumn.foreignReserves.value, first[1].secondColumn.foreignReserves.value),
      isPositive: last.secondColumn.foreignReserves.value > first[1].secondColumn.foreignReserves.value
    },
    {
      name: 'Торговый баланс',
      value: last.secondColumn.tradeBalance.value,
      unit: 'млн $',
      change: getChange(last.secondColumn.tradeBalance.value, first[1].secondColumn.tradeBalance.value),
      isPositive: last.secondColumn.tradeBalance.value > 0
    },
    {
      name: 'Индекс промпроизводства',
      value: last.secondColumn.industrialOutput.value,
      unit: '%',
      change: getChange(last.secondColumn.industrialOutput.value, first[1].secondColumn.industrialOutput.value),
      isPositive: last.secondColumn.industrialOutput.value > first[1].secondColumn.industrialOutput.value
    }
  ];
});

// Рейтинг страны
const countryRanking = computed(() => {
  const gdp = gameStore.statistics[gameStore.statistics.length - 1].firstColumn.gdp.value;

  // Примерные ранги на основе ВВП
  if (gdp > 20000) return { rank: 1, neighbors: ['США', 'Китай'] };
  if (gdp > 10000) return { rank: 5, neighbors: ['Германия', 'Индия'] };
  if (gdp > 5000) return { rank: 10, neighbors: ['Канада', 'Южная Корея'] };
  if (gdp > 1000) return { rank: 30, neighbors: ['Польша', 'Таиланд'] };
  if (gdp > 500) return { rank: 54, neighbors: ['Греция', 'Чили'] };
  return { rank: 70, neighbors: ['Украина', 'Перу'] };
});

// Инициализация графиков
onMounted(() => {
  watch(() => gameStore.showFinalModal, (val) => {
    if (val) {
      nextTick(() => {
        initCharts();
      });
    } else {
      destroyCharts();
    }
  });
});

function initCharts() {
  destroyCharts();
  const labels = gameStore.statistics.map(s => s.date);
  const colors = [
    '#4CAF50', '#F44336', '#2196F3', '#FF9800',
    '#9C27B0', '#607D8B', '#795548', '#3F51B5'
  ];

  // Полный список из 8 графиков согласно твоему исследованию
  const chartsConfig = [
    // Первая колонка (firstColumn)
    { ref: gdpChart, dataKey: 'firstColumn.gdpGrowth.value', label: 'Темп роста ВВП (%)' },
    { ref: gdp, dataKey: 'firstColumn.gdp.value', label: 'ВВП (млрд $)' },
    { ref: unemploymentChart, dataKey: 'firstColumn.unemployment.value', label: 'Безработица (%)' },
    { ref: inflationChart, dataKey: 'firstColumn.inflation.value', label: 'Инфляция (%)' },

    // Вторая колонка (secondColumn)
    { ref: budgetDeficit, dataKey: 'secondColumn.budgetDeficit.value', label: 'Дефицит бюджета (%)' },
    { ref: foreignReserves, dataKey: 'secondColumn.foreignReserves.value', label: 'Золотовалютные резервы (млрд $)' },
    { ref: tradeBalance, dataKey: 'secondColumn.tradeBalance.value', label: 'Торговый баланс (млрд $)' },
    { ref: industrialChart, dataKey: 'secondColumn.industrialOutput.value', label: 'Индекс промпроизводства (%)' }
  ];

  chartsConfig.forEach((chart, i) => {
    // Проверяем, что ref существует и привязан к canvas в шаблоне
    if (chart.ref && chart.ref.value) {
      const data = gameStore.statistics.map(s => {
        const keys = chart.dataKey.split('.');
        const val = keys.reduce((obj: any, key: string) =>
          (obj && obj[key] !== undefined) ? obj[key] : null, s as any);
        return val as unknown as number;
      });

      const config = getChartConfig(labels, data, chart.label, colors[i]);
      const newChart = new Chart(chart.ref.value, config as any);
      chartInstances.push(newChart);
    }
  });
}

function destroyCharts() {
  chartInstances.forEach(instance => instance.destroy());
  chartInstances = [];
}

function getChartConfig(labels: string[], data: number[], label: string, color: string) {
  const getUnit = (l: string) => {
    if (l.includes('ln')) return '';
    if (l.includes('ВВП') && !l.includes('рост')) return ' млрд $';
    if (l.includes('Резервы') || l.includes('баланс')) return ' млрд $';
    return '%';
  };

  const unit = getUnit(label);

  return {
    type: 'line' as const, // Указываем литеральный тип для Chart.js
    data: {
      labels,
      datasets: [{
        label,
        data,
        borderColor: color,
        backgroundColor: `${color}20`,
        tension: 0.3,
        fill: true,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            // Исправляем any на конкретный тип контекста (или оставляем так, если линтер пропустит)
            label: (context: { raw: unknown }) => `${label}: ${context.raw}${unit}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: !label.includes('ВВП'),
          title: {
            display: true,
            text: unit.trim() || 'индекс'
          }
        }
      }
    }
  };
}

// Оценка экономического состояния
const economicAssessment = computed(() => {
  const last = gameStore.statistics[gameStore.statistics.length - 1];
  const gdpGrowth = last.firstColumn.gdpGrowth.value;
  const inflation = last.firstColumn.inflation.value;
  const unemployment = last.firstColumn.unemployment.value;

  if (gdpGrowth > 5 && inflation < 10 && unemployment < 5)
    return "Экономика в отличном состоянии! Страна переживает экономический бум.";
  if (gdpGrowth > 2 && inflation < 15 && unemployment < 8)
    return "Экономика стабильна и показывает умеренный рост.";
  if (gdpGrowth > 0 && inflation < 20 && unemployment < 12)
    return "Экономика испытывает небольшие трудности, но в целом стабильна.";
  if (gdpGrowth <= 0 || inflation >= 20 || unemployment >= 12)
    return "Экономика в кризисном состоянии. Требуются срочные реформы.";
  return "Экономика находится в переходном состоянии.";
});
</script>

<template>
  <WelcomeModal v-if="gameStore.showWelcomeModal" />

  <div class="game-container">
    <!-- Основной игровой интерфейс -->
    <div class="header">
      <q-btn
        round
        icon="help"
        class="help-btn"
        @click="gameStore.showWelcomeModal = true"
      />
      <div class="round-info text-primary">
        Раунд: {{ gameStore.currentRound }}/{{ gameStore.totalRounds }}
      </div>
      <GameStatistics :statistics="gameStore.statistics" />
    </div>

    <div class="main-content">
      <GameRanges :ranges="gameStore.ranges" />
    </div>

    <div class="footer">
      <q-btn
        size="22px"
        class="action-button"
        color="primary"
        :label="gameStore.currentRound < gameStore.totalRounds ? 'Следующий год' : 'Завершить игру'"
        @click="gameStore.startGame"
      />
    </div>

<!-- Модальное окно анализа раунда -->
<q-dialog v-model="gameStore.showAnalysisModal" persistent>
  <q-card style="min-width: 600px; max-width: 800px;">
    <q-card-section class="bg-primary text-white">
      <div class="text-h6" style="color: white">📊 Отчет за период: {{ gameStore.statistics[gameStore.statistics.length-1].date }}</div>
    </q-card-section>

    <q-card-section>
      <div v-if="gameStore.analysisData.events.length > 0" class="q-mb-md">
        <div class="text-subtitle1 q-mb-sm text-weight-bold">События:</div>
        <q-list bordered separator>
          <q-item
            v-for="(event, index) in gameStore.analysisData.events"
            :key="index"
            class="bg-grey-2"
          >
            <q-item-section>
              <q-item-label class="text-weight-bold">{{ event.split('\n')[0] }}</q-item-label>
              <q-item-label caption>{{ event.split('\n')[1] }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <div>
        <div class="text-subtitle1 q-mb-sm text-weight-bold">Основные изменения:</div>
        <q-markup-table flat bordered>
          <tbody>
            <tr
              v-for="(change, index) in gameStore.analysisData.changes"
              :key="index"
              :class="index % 2 === 0 ? 'bg-grey-1' : ''"
            >
              <td>{{ change }}</td>
            </tr>
          </tbody>
        </q-markup-table>
      </div>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat label="Закрыть" color="primary" v-close-popup />
    </q-card-actions>
  </q-card>
</q-dialog>

    <!-- Финальное модальное окно -->
    <q-dialog v-model="gameStore.showFinalModal" maximized>
      <q-card class="final-modal bg-grey-1">
        <q-card-section class="bg-primary text-white">
          <div class="text-h4" style="color: white;">Итоговый отчет (10 лет)</div>
        </q-card-section>

        <q-card-section class="scroll">
          <div class="final-analysis q-pa-md">
            <!-- Основные показатели -->
            <q-card flat class="q-mb-md">
              <q-card-section>
                <div class="text-h5 text-dark">📊 Основные экономические показатели</div>
                <div class="row q-col-gutter-md q-mt-sm">
                  <div class="col-md-3 col-6" v-for="(stat, index) in mainStats" :key="index">
                    <q-card bordered flat>
                      <q-card-section>
                        <!-- Названия теперь берутся из объекта, который мы обновили ниже -->
                        <div class="text-subtitle1 text-dark">{{ stat.name }}</div>
                        <div class="text-h6">
                          {{ stat.value.toFixed(2) }} {{ stat.unit }}
                          <span :class="stat.isPositive ? 'text-positive' : 'text-negative'">
                            ({{ stat.change > 0 ? '+' : '' }}{{ stat.change.toFixed(2) }})
                          </span>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- Рейтинг страны -->
            <q-card flat class="q-mb-md">
              <q-card-section>
                <div class="text-h5 text-dark">🏆 Позиция в мировом рейтинге</div>
                <div class="text-body1 q-mt-sm text-dark">
                  Ваша страна занимает <strong>{{ countryRanking.rank }}</strong> место в мировом экономическом рейтинге.
                  Ближайшие соседи: {{ countryRanking.neighbors[0] }} ({{ countryRanking.rank-1 }})
                  и {{ countryRanking.neighbors[1] }} ({{ countryRanking.rank+1 }}).
                </div>
              </q-card-section>
            </q-card>

            <!-- Оценка экономики -->
            <q-card flat class="q-mb-md">
              <q-card-section>
                <div class="text-h5 text-dark">📈 Оценка экономического состояния</div>
                <div class="text-body1 q-mt-sm text-dark">
                  {{ economicAssessment }}
                </div>
              </q-card-section>
            </q-card>

            <!-- Графики -->
            <div class="row q-col-gutter-md">
              <div class="col-md-6 col-12">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-h6 text-dark">Темп роста ВВП (%)</div>
                    <canvas ref="gdpChart"></canvas>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-md-6 col-12">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-h6 text-dark">Инфляция (%)</div>
                    <canvas ref="inflationChart"></canvas>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-md-6 col-12">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-h6 text-dark">Безработица (%)</div>
                    <canvas ref="unemploymentChart"></canvas>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-md-6 col-12">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-h6 text-dark">Индекс промпроизводства (%)</div>
                    <canvas ref="industrialChart"></canvas>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-md-6 col-12">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-h6 text-dark">ВВП (млрд $)</div>
                    <canvas ref="gdp"></canvas>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-md-6 col-12">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-h6 text-dark">Дефицит бюджета (%)</div>
                    <canvas ref="budgetDeficit"></canvas>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-md-6 col-12">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-h6 text-dark">Золотовалютные резервы (млрд $)</div>
                    <canvas ref="foreignReserves"></canvas>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-md-6 col-12">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-h6 text-dark">Торговый баланс (млрд $)</div>
                    <canvas ref="tradeBalance"></canvas>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="bg-grey-3">
          <q-btn flat label="Закрыть" color="primary" v-close-popup />
          <q-btn flat label="Новая игра" color="positive" @click="gameStore.resetGame" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped lang="scss">
.game-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-color: #f5f5f5;
}

.header {
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 1px 5px rgba(0,0,0,0.1);
}

.round-info {
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 15px;
}

.main-content {
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 1px 5px rgba(0,0,0,0.1);
}

.footer {
  display: flex;
  justify-content: center;
}

.action-button {
  padding: 10px 30px;
  font-weight: bold;
}

.final-modal {
  width: 95vw;
  max-width: 1400px;
}

.text-positive {
  color: #4CAF50;
  font-weight: bold;
}

.text-negative {
  color: #F44336;
  font-weight: bold;
}

.text-dark {
  color: #333;
}

canvas {
  width: 100% !important;
  height: 300px !important;
}

.stat-item {
  border-bottom: 1px solid rgba(0,0,0,0.1);
  padding: 8px 0;

  &:last-child {
    border-bottom: none;
  }
}

.analysis-text {
  white-space: pre-wrap;
  line-height: 1.6;
  font-size: 1rem;
  color: #333;
}
.event-message {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #333;
  padding: 8px 0;
}

.q-dialog__inner--minimized > div {
  max-width: 600px;
}

.q-card__section--event {
  padding: 20px;
}

.q-markup-table {
  width: 100%;
}

.q-markup-table td {
  padding: 12px 16px;
  font-size: 0.95rem;
  color: #333;
}

.text-subtitle1 {
  font-size: 1rem;
  font-weight: 500;
  color: #444;
}

.q-item__label {
  font-size: 0.95rem;
  line-height: 1.4;
}.event-message {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #212121;
  padding: 8px 0;
}

.q-dialog__inner--minimized > div {
  max-width: 600px;
  background: white;
}

.q-card {
  background: white;
  color: #212121;
}

.q-card__section {
  padding: 20px;
}

.q-markup-table {
  width: 100%;
  background: white;
}

.q-markup-table td {
  padding: 12px 16px;
  font-size: 0.95rem;
  color: #212121;
  border-color: #e0e0e0;
}

.text-subtitle1 {
  font-size: 1rem;
  font-weight: 500;
  color: #212121;
}

.q-item {
  color: #212121;
}

.q-item__label {
  font-size: 0.95rem;
  line-height: 1.4;
  color: #212121;
}

.q-item__label--caption {
  color: #616161;
}

.final-modal {
  background: white;
}

.text-h4, .text-h5, .text-h6 {
  color: #212121;
}
.help-btn {
  position: absolute;
  top: 15px;
  left: 15px;
  z-index: 1000;
}
</style>








