import { defineStore } from "pinia";
import { ref } from "vue";
import type { Ref } from "vue";
import type { IRow, RangeRow } from '../types/gameTypes'

export const useGameStore = defineStore("game", () => {
  // Статистика по умолчанию
  const statistics = ref<IRow[]>([
    {
      firstColumn: {
        gdpGrowth: { value: -5.3, name: "Темпы роста ВВП (%)",symbol: '%'},
        gdp: { value: 270.96, name: "ВВП (млрд $)" ,symbol: 'млрд $'},
        unemployment: { value:  13.26, name: "Уровень безработицы (%)",symbol: '%' },
        inflation: { value: 27.69, name: "Уровень инфляции (%)" ,symbol: '%'},
      },
      secondColumn: {
        interestRate: {
          value: 30,
          name: "Процентная ставка (%)", symbol: '%'
        },
        debtToGdp: { value: 70, name: "Государственный долг к ВВП (%)",symbol: '%' },
        incomeTaxRate: { value: 12, name: "Ставка подоходного налога (%)",symbol: '%' },
        reserveRatio: { value: 11, name: "Норма обязательных резервов (%)",symbol: '%' }
      },
    },
  ]);

  // Ползунки по умолчанию
  const ranges: Ref<RangeRow[]> = ref([
    {
      firstColumn: {
        interestRate: {
          value: 50,
          name: "Ключевая ставка",
        },
        moneySupply: {
          value: 50,
          name: "Денежная масса",
        },
        reserveRequirements: {
          value: 50,
          name: "Резервные требования",
        },
      },
      secondColumn: {
        productionInvestment: {
          value: 50,
          name: "Инвестиции в производство",
        },
        wageSpending: {
          value: 50,
          name: "Затраты на зарплаты",
        },
        productPrices: {
          value: 50,
          name: "Цены на товары",
        },
      },
      thirdColumn: {
        publicDissatisfaction: {
          value: 50,
          name: "Недовольство граждан",
        },
        wageDemands: {
          value: 50,
          name: "Требования к зарплатам",
        },
        priceDemands: {
          value: 50,
          name: "Требования к ценам",
        },
      },
      fourthColumn: {
        taxRate: {
          value: 50,
          name: "Налоги",
        },
        govSpending: {
          value: 50,
          name: "Государственные расходы",
        },
        laborMarketRegulation: {
          value: 50,
          name: "Регулирование рынка труда",
        },
      },
    },
  ])

  // Функция для расчета влияния параметра на статистику

  function calculateInfluenceFactor(paramKey: string, statKey: string): number {
    // Матрица влияния параметров на статистику
    const influenceMatrix: Record<string, Record<string, number>> = {
      // Первая колонка (монетарная политика)
      interestRate: {
        gdpGrowth: -0.08,
        inflation: -0.25,
        unemployment: 0.07,
        debtToGdp: -0.1,
        interestRate: 0.3
      },
      moneySupply: {
        gdpGrowth: 0.12,
        inflation: 0.3,
        unemployment: -0.08,
        gdp: 0.2
      },
      reserveRequirements: {
        gdpGrowth: -0.05,
        inflation: -0.15,
        unemployment: 0.05,
        reserveRatio: 0.4
      },

      // Вторая колонка (производство)
      productionInvestment: {
        gdpGrowth: 0.25,
        unemployment: -0.2,
        gdp: 0.35,
        inflation: 0.1
      },
      wageSpending: {
        gdpGrowth: 0.1,
        unemployment: -0.15,
        inflation: 0.2
      },
      productPrices: {
        gdpGrowth: -0.05,
        inflation: 0.4,
        unemployment: 0.1
      },

      // Третья колонка (социальные факторы)
      publicDissatisfaction: {
        gdpGrowth: -0.15,
        unemployment: 0.2
      },
      wageDemands: {
        gdpGrowth: -0.1,
        inflation: 0.25,
        unemployment: -0.1
      },
      priceDemands: {
        inflation: -0.2,
        gdpGrowth: 0.05
      },

      // Четвертая колонка (фискальная политика)
      taxRate: {
        gdpGrowth: -0.15,
        unemployment: -0.1,
        debtToGdp: -0.2,
        incomeTaxRate: 0.5
      },
      govSpending: {
        gdpGrowth: 0.2,
        unemployment: -0.15,
        debtToGdp: 0.3,
        inflation: 0.15
      },
      laborMarketRegulation: {
        gdpGrowth: -0.1,
        unemployment: -0.25,
        inflation: 0.1
      }
    };

    return influenceMatrix[paramKey]?.[statKey] || 0;
  }

  function startGame() {
    // Копируем последнюю статистику
    const lastStat = statistics.value[statistics.value.length - 1];
    const newStatistics: IRow = JSON.parse(JSON.stringify(lastStat));

    // Применяем влияние всех параметров
    applyAllParametersInfluence(newStatistics);

    // Добавляем случайные события
    applyRandomEvents(newStatistics);

    // Обеспечиваем минимальные значения и округляем
    finalizeStatistics(newStatistics);

    // Добавляем новую статистику в массив
    statistics.value.push(newStatistics);
  }

  function applyAllParametersInfluence(stats: IRow) {
    const currentRanges = ranges.value[0];

    // Функция для обработки каждой колонки параметров
    const applyColumnInfluence = (column: Record<string, { value: number }>) => {
      Object.entries(column).forEach(([paramKey, { value: paramValue }]) => {
        // Нормализуем значение параметра (0-100) к диапазону -1..1
        const normalizedValue = (paramValue - 50) / 50;

        // Применяем влияние к первой колонке статистики
        Object.keys(stats.firstColumn).forEach(statKey => {
          const influence = calculateInfluenceFactor(paramKey, statKey);
          stats.firstColumn[statKey].value += influence * normalizedValue;
        });

        // Применяем влияние ко второй колонке статистики
        Object.keys(stats.secondColumn).forEach(statKey => {
          const influence = calculateInfluenceFactor(paramKey, statKey);
          stats.secondColumn[statKey].value += influence * normalizedValue;
        });
      });
    };

    // Обрабатываем все колонки параметров
    applyColumnInfluence(currentRanges.firstColumn);
    applyColumnInfluence(currentRanges.secondColumn);
    applyColumnInfluence(currentRanges.thirdColumn);
    applyColumnInfluence(currentRanges.fourthColumn);
  }

  function applyRandomEvents(stats: IRow) {
    // 15% шанс случайного события
    if (Math.random() < 0.15) {
      const events = [
        { key: 'gdpGrowth', change: 2.5, message: "Экономический бум! ВВП растет" },
        { key: 'gdpGrowth', change: -3.5, message: "Финансовый кризис! ВВП падает" },
        { key: 'inflation', change: 7, message: "Гиперинфляция! Цены растут" },
        { key: 'inflation', change: -4, message: "Дефляция! Цены падают" },
        { key: 'unemployment', change: -5, message: "Трудовой бум! Безработица снижается" },
        { key: 'unemployment', change: 6, message: "Массовые увольнения! Безработица растет" },
        { key: 'debtToGdp', change: 10, message: "Госдолг резко увеличился" }
      ];

      const event = events[Math.floor(Math.random() * events.length)];

      if (stats.firstColumn[event.key]) {
        stats.firstColumn[event.key].value += event.change;
      } else if (stats.secondColumn[event.key]) {
        stats.secondColumn[event.key].value += event.change;
      }

      console.log("Событие:", event.message);
    }
  }

  function finalizeStatistics(stats: IRow) {
    // Обеспечиваем минимальные значения и округляем
    const processStats = (column: Record<string, { value: number }>) => {
      Object.values(column).forEach(item => {
        // Округляем до 3 знаков после запятой
        item.value = parseFloat(item.value.toFixed(3));

        // Устанавливаем минимальные значения
        if (item.value < 0) item.value = 0;
        if (item.symbol === '%' && item.value > 100) item.value = 100;
      });
    };

    processStats(stats.firstColumn);
    processStats(stats.secondColumn);
  }
  
  return {
    statistics,
    ranges,
    startGame,
  };
});
