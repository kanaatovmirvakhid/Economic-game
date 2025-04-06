import { defineStore } from "pinia";
import { ref } from "vue";
import type { Ref } from "vue";
import type { IRow, RangeRow } from '../types/gameTypes'

export const useGameStore = defineStore("game", () => {
  const LOCAL_STORAGE_KEY = 'economic_game_data';

  // Статистика по умолчанию
  const statistics = ref<IRow[]>([{
    date: "1998 год",
    firstColumn: {
      gdpGrowth: { value: -5.3, name: "Темпы роста ВВП (%)", symbol: '%', canBeNegative: true },
      gdp: { value: 270.96, name: "ВВП (млрд $)", symbol: 'млрд $' },
      unemployment: { value: 13.26, name: "Уровень безработицы (%)", symbol: '%' },
      inflation: { value: 27.69, name: "Уровень инфляции (%)", symbol: '%' }
    },
    secondColumn: {
      budgetDeficit: { value: 5.8, name: "Дефицит бюджета (%)", symbol: '%', canBeNegative: true },
      foreignReserves: { value: 12.4, name: "Золотовалютные резервы (млрд $)", symbol: 'млрд $' },
      tradeBalance: { value: -2.1, name: "Торговый баланс (млрд $)", symbol: 'млрд $', canBeNegative: true },
      industrialOutput: { value: -6.5, name: "Промышленное производство (%)", symbol: '%', canBeNegative: true }
    }
  }]);

  // Рычаги управления (полный набор)
  const ranges = ref<RangeRow[]>([
    {
      team: "Центробанк",
      firstColumn: {
        interestRate: { value: 60, name: "Ключевая ставка" },
        moneySupply: { value: 40, name: "Денежная масса" },
        reserveRequirements: { value: 60, name: "Резервные требования" }
      }
    },
    {
      team: "Бизнес",
      secondColumn: {
        productionInvestment: { value: 35, name: "Инвестиции в производство" },
        wageSpending: { value: 45, name: "Затраты на зарплаты" },
        productPrices: { value: 65, name: "Цены на товары" }
      }
    },
    {
      team: "Потребители",
      thirdColumn: {
        publicDissatisfaction: { value: 70, name: "Недовольство граждан" },
        wageDemands: { value: 60, name: "Требования к зарплатам" },
        priceDemands: { value: 75, name: "Требования к ценам" }
      }
    },
    {
      team: "Правительство",
      fourthColumn: {
        taxRate: { value: 50, name: "Налоги" },
        govSpending: { value: 50, name: "Государственные расходы" },
        laborMarketRegulation: { value: 50, name: "Регулирование рынка труда" }
      }
    }
  ]);

  // Состояние игры
  const currentRound = ref(1);
  const totalRounds = 10;
  const showFinalModal = ref(false);
  const showWelcomeModal = ref(true);
  const hasSeenInstructions = ref(false);
  const eventMessage = ref("");
  const showEventModal = ref(false);
  const showAnalysisModal = ref(false);
  const analysisData = ref({
    changes: [] as string[],
    events: [] as string[],
    summary: ""
  });

  // ================== ОСНОВНЫЕ ФУНКЦИИ ================== //

  function calculateNewStatistics(lastStat: IRow): IRow {
    const newStats = JSON.parse(JSON.stringify(lastStat));

    // 1. Применяем влияние рычагов
    applyPolicyEffects(newStats);

    // 2. Рассчитываем сложные показатели
    calculateComplexMetrics(newStats);

    // 3. Применяем взаимовлияние показателей
    applyIndicatorInteractions(newStats);

    // 4. Случайные события (15% вероятность)
    if (Math.random() < 0.15) {
      applyRandomEvent(newStats);
    }

    // 5. Финализируем статистику
    finalizeStatistics(newStats);

    return newStats;
  }

  function applyPolicyEffects(stats: IRow) {
    const effects = {
      // Центробанк
      interestRate: {
        gdpGrowth: (v: number) => -0.8 * Math.pow(v/50, 1.3),
        inflation: (v: number) => -1.2 * Math.sqrt(v/50),
        budgetDeficit: (v: number) => 0.3 * (v/50) // Рост ставок → рост госдолга
      },
      moneySupply: {
        gdp: (v: number) => 1.2 * Math.log1p(v/50),
        inflation: (v: number) => 1.5 * Math.pow(v/50, 1.5),
        foreignReserves: (v: number) => -0.5 * (v/50) // Эмиссия снижает резервы
      },
      // Бизнес
      productionInvestment: {
        gdp: (v: number) => 1.8 * Math.sqrt(v/50),
        industrialOutput: (v: number) => 1.5 * (v/50),
        tradeBalance: (v: number) => 0.6 * (v/50) // Инвестиции → экспорт
      },
      // Правительство
      govSpending: {
        gdpGrowth: (v: number) => 0.7 * (v/50),
        budgetDeficit: (v: number) => 0.9 * (v/50),
        unemployment: (v: number) => -0.5 * (v/50)
      }
    };

    ranges.value.forEach(team => {
      const policies = [
        ...Object.entries(team.firstColumn || {}),
        ...Object.entries(team.secondColumn || {}),
        ...Object.entries(team.thirdColumn || {}),
        ...Object.entries(team.fourthColumn || {})
      ];

      policies.forEach(([policy, { value }]) => {
        if (effects[policy]) {
          Object.entries(effects[policy]).forEach(([indicator, formula]) => {
            const change = formula(value) * ((value - 50) / 50);
            if (stats.firstColumn[indicator]) {
              stats.firstColumn[indicator].value += change;
            }
            if (stats.secondColumn[indicator]) {
              stats.secondColumn[indicator].value += change;
            }
          });
        }
      });
    });
  }

  function calculateComplexMetrics(stats: IRow) {
    // Динамика ВВП
    stats.firstColumn.gdp.value *= (1 + stats.firstColumn.gdpGrowth.value/100);

    // Влияние инфляции на ВВП
    stats.firstColumn.gdp.value *= (1 - Math.max(0, stats.firstColumn.inflation.value - 3)/200);

    // Торговый баланс зависит от:
    // - Промпроизводства (+)
    // - Курса (денежная масса) (-)
    // - Цен на товары (-)
    const prices = ranges.value[1].secondColumn?.productPrices?.value || 50;
    stats.secondColumn.tradeBalance.value +=
      (stats.secondColumn.industrialOutput.value/10) -
      (prices - 50)/20;

    // Промпроизводство зависит от:
    // - Инвестиций (+)
    // - Налогов (-)
    // - Регулирования (-)
    const taxes = ranges.value[3].fourthColumn?.taxRate?.value || 50;
    const regulation = ranges.value[3].fourthColumn?.laborMarketRegulation?.value || 50;
    stats.secondColumn.industrialOutput.value +=
      (ranges.value[1].secondColumn?.productionInvestment?.value - 50)/10 -
      (taxes - 50)/15 -
      (regulation - 50)/20;

    // Дефицит бюджета
    stats.secondColumn.budgetDeficit.value =
      5 + (ranges.value[3].fourthColumn?.govSpending?.value - 50)/10 -
      (ranges.value[3].fourthColumn?.taxRate?.value - 50)/8;

    // Золотовалютные резервы
    stats.secondColumn.foreignReserves.value +=
      stats.secondColumn.tradeBalance.value * 0.3 -
      (ranges.value[0].firstColumn?.moneySupply?.value - 50)/15;
  }

  function applyIndicatorInteractions(stats: IRow) {
    // Высокая инфляция снижает рост ВВП
    stats.firstColumn.gdpGrowth.value -= Math.max(0, stats.firstColumn.inflation.value - 5) * 0.3;

    // Низкая безработица увеличивает инфляцию
    stats.firstColumn.inflation.value += (5 - stats.firstColumn.unemployment.value) * 0.2;

    // Большой дефицит снижает резервы
    stats.secondColumn.foreignReserves.value -= Math.max(0, stats.secondColumn.budgetDeficit.value - 3) * 0.5;

    // Рост промпроизводства снижает безработицу
    stats.firstColumn.unemployment.value -= stats.secondColumn.industrialOutput.value * 0.1;
  }

  function applyRandomEvent(stats: IRow) {
    const events = [
      {
        name: "Нефтяной кризис",
        effects: {
          inflation: { name: "Инфляция", value: 8 },
          tradeBalance: { name: "Торговый баланс", value: -3 },
          industrialOutput: { name: "Промпроизводство", value: -4 }
        },
        description: "Резкий рост цен на нефть вызвал экономические потрясения"
      },
      {
        name: "Технологический прорыв",
        effects: {
          gdpGrowth: { name: "Рост ВВП", value: 3 },
          industrialOutput: { name: "Промпроизводство", value: 6 }
        },
        description: "Инновационные технологии дали толчок экономике"
      }
    ];

    const event = events[Math.floor(Math.random() * events.length)];
    let changes = "Изменения:\n";

    Object.entries(event.effects).forEach(([key, data]) => {
      if (stats.firstColumn[key]) {
        stats.firstColumn[key].value += data.value;
      }
      if (stats.secondColumn[key]) {
        stats.secondColumn[key].value += data.value;
      }
      changes += `${data.name}: ${data.value > 0 ? '+' : ''}${data.value}\n`;
    });

    eventMessage.value = event.name;
    analysisData.value.events = [`${event.name}\n${event.description}\n${changes}`];
    showEventModal.value = true;
  }
  function generateCountryRanking(gdp: number): { rank: number, neighbors: string[] } {
    const countryTiers = [
      { minGDP: 5000, countries: ["США", "Китай", "Япония", "Германия"], baseRank: 1 },
      { minGDP: 1000, countries: ["Россия", "Бразилия", "Испания", "Мексика"], baseRank: 10 },
      { minGDP: 500, countries: ["Польша", "Таиланд", "Аргентина", "ЮАР"], baseRank: 30 },
      { minGDP: 0, countries: ["Украина", "Перу", "Вьетнам", "Египет"], baseRank: 50 }
    ];

    const tier = countryTiers.find(t => gdp >= t.minGDP) || countryTiers[countryTiers.length-1];
    const rankOffset = Math.floor((gdp - tier.minGDP) / (tier.minGDP/5 || 100));
    const rank = tier.baseRank - rankOffset;

    return {
      rank: Math.max(1, rank),
      neighbors: [
        `${tier.countries[1]} (${Math.max(1, rank-1)})`,
        `${tier.countries[2]} (${rank+1})`
      ]
    };
  }
  function finalizeStatistics(stats: IRow) {
    // Ограничители
    stats.firstColumn.unemployment.value = Math.max(0.5, stats.firstColumn.unemployment.value);
    stats.firstColumn.inflation.value = Math.max(-2, Math.min(50, stats.firstColumn.inflation.value));
    stats.secondColumn.foreignReserves.value = Math.max(0, stats.secondColumn.foreignReserves.value);

    // Округление
    const round = (obj: Record<string, { value: number }>) => {
      Object.values(obj).forEach(item => {
        item.value = parseFloat(item.value.toFixed(2));
      });
    };

    round(stats.firstColumn);
    round(stats.secondColumn);
  }

  // ================== ИГРОВАЯ ЛОГИКА ================== //

  function startGame() {
    if (currentRound.value >= totalRounds) {
      showFinalModal.value = true;
      generateFinalAnalysis();
      return;
    }

    // Сбрасываем анализ перед новым раундом
    analysisData.value = { changes: [], events: [], summary: "" };

    const lastStat = statistics.value[statistics.value.length - 1];
    const newStats = calculateNewStatistics(lastStat);

    newStats.date = `${parseInt(lastStat.date) + 1} год`;
    statistics.value.push(newStats);
    currentRound.value++;

    // Генерируем анализ изменений
    generateRoundAnalysis(lastStat, newStats);
    saveToLocalStorage();
  }

  function generateRoundAnalysis(prev: IRow, current: IRow) {
    const changes: string[] = [];

    // Анализ первой колонки
    Object.entries(current.firstColumn).forEach(([key, curr]) => {
      const prevVal = prev.firstColumn[key]?.value || 0;
      const diff = curr.value - prevVal;
      if (Math.abs(diff) > 0.1) {
        changes.push(`${curr.name}: ${prevVal.toFixed(2)} → ${curr.value.toFixed(2)} (${diff > 0 ? '+' : ''}${diff.toFixed(2)})`);
      }
    });

    // Анализ второй колонки
    Object.entries(current.secondColumn).forEach(([key, curr]) => {
      const prevVal = prev.secondColumn[key]?.value || 0;
      const diff = curr.value - prevVal;
      if (Math.abs(diff) > 0.1) {
        changes.push(`${curr.name}: ${prevVal.toFixed(2)} → ${curr.value.toFixed(2)} (${diff > 0 ? '+' : ''}${diff.toFixed(2)})`);
      }
    });

    analysisData.value.changes = changes;
    showAnalysisModal.value = true;
  }

  function resetGame() {
    statistics.value = [JSON.parse(JSON.stringify(statistics.value[0]))];
    currentRound.value = 1;
    showFinalModal.value = false;
    analysisData.value = { changes: [], events: [], summary: "" };

    // Полный сброс всех рычагов
    ranges.value = [
      {
        team: "Центробанк",
        firstColumn: {
          interestRate: { value: 60, name: "Ключевая ставка" },
          moneySupply: { value: 40, name: "Денежная масса" },
          reserveRequirements: { value: 60, name: "Резервные требования" }
        }
      },
      {
        team: "Бизнес",
        secondColumn: {
          productionInvestment: { value: 35, name: "Инвестиции в производство" },
          wageSpending: { value: 45, name: "Затраты на зарплаты" },
          productPrices: { value: 65, name: "Цены на товары" }
        }
      },
      {
        team: "Потребители",
        thirdColumn: {
          publicDissatisfaction: { value: 70, name: "Недовольство граждан" },
          wageDemands: { value: 60, name: "Требования к зарплатам" },
          priceDemands: { value: 75, name: "Требования к ценам" }
        }
      },
      {
        team: "Правительство",
        fourthColumn: {
          taxRate: { value: 50, name: "Налоги" },
          govSpending: { value: 50, name: "Государственные расходы" },
          laborMarketRegulation: { value: 50, name: "Регулирование рынка труда" }
        }
      }
    ];

    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }

  // ================== LOCALSTORAGE ================== //

  function loadFromLocalStorage() {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      const data = JSON.parse(savedData);
      statistics.value = data.statistics || statistics.value;
      ranges.value = data.ranges || ranges.value;
      currentRound.value = data.currentRound || 1;
      hasSeenInstructions.value = data.hasSeenInstructions || false;
      showWelcomeModal.value = !hasSeenInstructions.value;
    }
  }

  function saveToLocalStorage() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
      statistics: statistics.value,
      ranges: ranges.value,
      currentRound: currentRound.value,
      hasSeenInstructions: hasSeenInstructions.value
    }));
  }

  function closeWelcome() {
    showWelcomeModal.value = false;
    hasSeenInstructions.value = true;
    saveToLocalStorage();
  }

  // Инициализация
  loadFromLocalStorage();

  return {
    statistics,
    ranges,
    currentRound,
    totalRounds,
    showFinalModal,
    showWelcomeModal,
    hasSeenInstructions,
    eventMessage,
    showEventModal,
    showAnalysisModal,
    analysisData,
    startGame,
    resetGame,
    closeWelcome
  };
});