import { defineStore } from "pinia";
import { ref } from "vue";
import type { Ref } from "vue";
import type { IRow, RangeRow } from '../types/gameTypes'

export const useGameStore = defineStore("game", () => {
  const LOCAL_STORAGE_KEY = 'economic_game_data';

  // Статистика по умолчанию для 1998 года
  const statistics = ref<IRow[]>([
    {
      date: "1998 год",
      firstColumn: {
        gdpGrowth: { value: -5.3, name: "Темпы роста ВВП (%)", symbol: '%', canBeNegative: true },
        gdp: { value: 270.96, name: "ВВП (млрд $)", symbol: 'млрд $' },
        unemployment: { value: 13.26, name: "Уровень безработицы (%)", symbol: '%' },
        inflation: { value: 27.69, name: "Уровень инфляции (%)", symbol: '%' },
      },
      secondColumn: {
        budgetDeficit: { value: 5.8, name: "Дефицит бюджета (%)", symbol: '%', canBeNegative: true },
        foreignReserves: { value: 12.4, name: "Золотовалютные резервы (млрд $)", symbol: 'млрд $' },
        tradeBalance: { value: -2.1, name: "Торговый баланс (млрд $)", symbol: 'млрд $', canBeNegative: true },
        industrialOutput: { value: -6.5, name: "Промышленное производство (%)", symbol: '%', canBeNegative: true }
      },
    },
  ]);

  // Рычаги по умолчанию для 1998 года
  const ranges = ref<RangeRow[]>([
    {
      team: "Центробанк",
      firstColumn: {
        interestRate: { value: 60, name: "Ключевая ставка" },
        moneySupply: { value: 40, name: "Денежная масса" },
        reserveRequirements: { value: 60, name: "Резервные требования" },
      },
    },
    {
      team: "Бизнес",
      secondColumn: {
        productionInvestment: { value: 35, name: "Инвестиции в производство" },
        wageSpending: { value: 45, name: "Затраты на зарплаты" },
        productPrices: { value: 65, name: "Цены на товары" },
      },
    },
    {
      team: "Потребители",
      thirdColumn: {
        publicDissatisfaction: { value: 70, name: "Недовольство граждан" },
        wageDemands: { value: 60, name: "Требования к зарплатам" },
        priceDemands: { value: 75, name: "Требования к ценам" },
      },
    },
    {
      team: "Правительство",
      fourthColumn: {
        taxRate: { value: 50, name: "Налоги" },
        govSpending: { value: 50, name: "Государственные расходы" },
        laborMarketRegulation: { value: 50, name: "Регулирование рынка труда" },
      },
    }
  ]);

  const showWelcomeModal = ref(true);
  const hasSeenInstructions = ref(false);



  // Новая функция для закрытия приветственного окна
  function closeWelcome() {
    showWelcomeModal.value = false;
    hasSeenInstructions.value = true;
    saveToLocalStorage();
  }
  const currentRound = ref(1);
  const totalRounds = 10;
  const showFinalModal = ref(false);
  const finalAnalysis = ref("");
  const eventMessage = ref("");
  const showEventModal = ref(false);
  const showAnalysisModal = ref(false);
  const analysisData = ref({
    changes: [] as string[],
    events: [] as string[],
    summary: ""
  });

  // Усиленные формулы влияния для годового периода
  function calculateInfluenceFactor(paramKey: string, statKey: string): number {
    const influenceMatrix: Record<string, Record<string, number>> = {
      // Центробанк
      productionInvestment: {
        gdpGrowth: 1.8,  // Сильное влияние на рост
        gdp: 2.5,
        unemployment: -1.5
      },
      interestRate: {
        gdpGrowth: -1.2, // Сильное влияние при изменении
        inflation: -1.8
      },
      moneySupply: {
        gdpGrowth: 0.9,   // было 0.5 (деньги сильнее стимулируют ВВП)
        inflation: 1.5,   // было 0.8 (риск инфляции при перегреве)
        gdp: 1.5          // было 0.7 (прямой рост ВВП)
      },
      // Правительство
      govSpending: {
        gdpGrowth: 0.7,   // было 0.35 (госрасходы дают больше роста)
        unemployment: -0.6 // было -0.3
      }
    };

    return influenceMatrix[paramKey]?.[statKey] || 0;
  }

  // Обновленная функция loadFromLocalStorage
  function loadFromLocalStorage() {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        statistics.value = data.statistics || [statistics.value[0]];
        ranges.value = data.ranges || ranges.value;
        currentRound.value = data.currentRound || 1;
        hasSeenInstructions.value = data.hasSeenInstructions || false;

        // Если инструкция уже была показана, не показываем снова
        showWelcomeModal.value = !hasSeenInstructions.value;
      } catch (e) {
        console.error("Ошибка загрузки из localStorage:", e);
      }
    }
  }

  // Обновленная функция saveToLocalStorage
  function saveToLocalStorage() {
    const dataToSave = {
      statistics: statistics.value,
      ranges: ranges.value,
      currentRound: currentRound.value,
      hasSeenInstructions: hasSeenInstructions.value
    };

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error("Ошибка сохранения в localStorage:", e);
    }
  }

  function startGame() {
    if (currentRound.value >= totalRounds) {
      generateFinalAnalysis();
      showFinalModal.value = true;
      saveToLocalStorage();
      return;
    }

    // Очищаем предыдущие события перед новым раундом
    analysisData.value.events = [];

    const lastStat = statistics.value[statistics.value.length - 1];
    const newStatistics = calculateNewStatistics(lastStat);

    // Обновляем дату (каждый ход +1 год)
    const lastYear = parseInt(lastStat.date.split(" ")[0]);
    newStatistics.date = `${lastYear + 1} год`;

    statistics.value.push(newStatistics);
    currentRound.value++;

    if (currentRound.value < totalRounds) {
      generateRoundAnalysis(lastStat, newStatistics);
      showAnalysisModal.value = true;
    } else {
      generateFinalAnalysis();
      showFinalModal.value = true;
    }

    saveToLocalStorage();
  }

  function calculateTradeBalance(stats: IRow): number {
    // Торговый баланс зависит от:
    // 1. Инвестиций в производство (увеличивают экспорт)
    // 2. Курса валюты (имитируем через денежную массу)
    // 3. Потребления (цены и зарплаты)
    const investmentFactor = ranges.value[1].secondColumn?.productionInvestment?.value || 50;
    const moneySupply = ranges.value[0].firstColumn?.moneySupply?.value || 50;
    const productPrices = ranges.value[1].secondColumn?.productPrices?.value || 50;

    // Базовый расчет (примерная формула)
    let balance = (investmentFactor / 50 - 1) * 10; // -10 до +10
    balance -= (productPrices - 50) / 20; // Высокие цены снижают экспорт
    balance += (moneySupply - 50) / 25; // Девальвация помогает экспорту

    return parseFloat((stats.secondColumn.tradeBalance.value + balance).toFixed(2));
  }

  function calculateIndustrialOutput(stats: IRow): number {
    // Промпроизводство зависит от:
    // 1. Инвестиций бизнеса (основной фактор)
    // 2. Госрасходов
    // 3. Налогов (отрицательно)
    const investment = ranges.value[1].secondColumn?.productionInvestment?.value || 50;
    const govSpending = ranges.value[3].fourthColumn?.govSpending?.value || 50;
    const taxes = ranges.value[3].fourthColumn?.taxRate?.value || 50;

    // Формула с ощутимым влиянием:
    let growth = (investment - 50) * 0.4; // До +20/-20
    growth += (govSpending - 50) * 0.2; // До +10/-10
    growth -= (taxes - 50) * 0.3; // Налоги давят на производство

    return parseFloat((stats.secondColumn.industrialOutput.value + growth * 0.5).toFixed(2));
  }

  // Обновленная функция calculateNewStatistics
  function calculateNewStatistics(lastStat: IRow): IRow {
    const newStats = JSON.parse(JSON.stringify(lastStat));
    const POWER_MULTIPLIER = 3.0; // Усиленное влияние

    ranges.value.forEach(teamRanges => {
      const columns = [
        teamRanges.firstColumn,
        teamRanges.secondColumn,
        teamRanges.thirdColumn,
        teamRanges.fourthColumn
      ].filter(Boolean);

      columns.forEach(column => {
        if (!column) return;

        Object.entries(column).forEach(([paramKey, { value }]) => {
          const normalizedValue = ((value as number) - 50) / 50 * POWER_MULTIPLIER;

          // Применяем влияние ко всем показателям
          Object.keys(newStats.firstColumn).forEach(statKey => {
            const influence = calculateInfluenceFactor(paramKey, statKey);
            newStats.firstColumn[statKey].value += influence * normalizedValue;
          });

          Object.keys(newStats.secondColumn).forEach(statKey => {
            const influence = calculateInfluenceFactor(paramKey, statKey);
            newStats.secondColumn[statKey].value += influence * normalizedValue;
          });
        });
      });
    });

    // Явное обновление сложных показателей
    newStats.secondColumn.tradeBalance.value = calculateTradeBalance(newStats);
    newStats.secondColumn.industrialOutput.value = calculateIndustrialOutput(newStats);

    // Гарантируем обновление других показателей второй колонки
    newStats.secondColumn.budgetDeficit.value = calculateBudgetDeficit(newStats);
    newStats.secondColumn.foreignReserves.value = calculateReserves(newStats);

    applyRandomEvents(newStats);
    finalizeStatistics(newStats);

    return newStats;
  }

  // Добавьте также эти функции:
  function calculateBudgetDeficit(stats: IRow): number {
    const govSpending = ranges.value[3].fourthColumn?.govSpending?.value || 50;
    const taxRate = ranges.value[3].fourthColumn?.taxRate?.value || 50;

    // Дефицит = расходы - доходы
    const spendingFactor = govSpending / 50; // 0.8-1.2
    const taxIncome = 1 - (taxRate / 100); // 0.4-0.6

    let deficit = stats.secondColumn.budgetDeficit.value;
    deficit = deficit * 0.7 + (spendingFactor - taxIncome) * 10;

    return parseFloat(Math.max(0, deficit).toFixed(2));
  }

  function calculateReserves(stats: IRow): number {
    const tradeBalance = stats.secondColumn.tradeBalance.value;
    const moneySupply = ranges.value[0].firstColumn?.moneySupply?.value || 50;

    // Резервы растут при положительном торговом балансе
    // и уменьшаются при эмиссии денег
    let reserves = stats.secondColumn.foreignReserves.value;
    reserves += tradeBalance * 0.3;
    reserves -= (moneySupply - 50) / 10;

    return parseFloat(Math.max(0, reserves).toFixed(2));
  }

  function applyRandomEvents(stats: IRow) {
    if (Math.random() < 0.3) {
      const events = [
        {
          key: 'gdpGrowth',
          change: () => 6 + Math.random() * 5,
          message: "🚀 Экономический бум! Инвестиции дали результат",
          description: "Благоприятные экономические условия привели к резкому росту ВВП"
        },
        {
          key: 'inflation',
          change: () => 9 + Math.random() * 6,
          message: "💸 Гиперинфляция! Цены растут слишком быстро",
          description: "Чрезмерный рост денежной массы привел к резкому скачку цен"
        },
        {
          key: 'inflation',
          change: () => -6 - Math.random() * 4,
          message: "📉 Дефляция! Цены неожиданно снижаются",
          description: "Снижение потребительского спроса вызвало общее падение цен"
        },
        {
          key: 'unemployment',
          change: () => -8 - Math.random() * 5,
          message: "👔 Трудовой бум! Безработица снижается",
          description: "Активные инвестиции в производство создали множество новых рабочих мест"
        },
        {
          key: 'unemployment',
          change: () => 9 + Math.random() * 6,
          message: "😢 Массовые увольнения! Безработица растет",
          description: "Экономический спад вынудил компании сокращать персонал"
        },
        {
          key: 'debtToGdp',
          change: () => 15 + Math.random() * 10,
          message: "🏛️ Госдолг резко увеличился",
          description: "Масштабные государственные расходы привели к росту долговой нагрузки"
        }
      ];

      const event = events[Math.floor(Math.random() * events.length)];
      const change = event.change();

      if (stats.firstColumn[event.key]) {
        stats.firstColumn[event.key].value += change;
      } else if (stats.secondColumn[event.key]) {
        stats.secondColumn[event.key].value += change;
      }

      eventMessage.value = event.message;
      analysisData.value.events.push(`${event.message}\n${event.description} (Изменение: ${change > 0 ? '+' : ''}${change.toFixed(2)}%)`);
      showEventModal.value = true;
    }
  }

  function finalizeStatistics(stats: IRow) {
    const processStats = (column: Record<string, { value: number, canBeNegative?: boolean }>) => {
      Object.entries(column).forEach(([key, item]) => {
        item.value = parseFloat(item.value.toFixed(3));
        if (!item.canBeNegative && item.value < 0) item.value = 0;
        if (item.symbol === '%' && item.value > 100) item.value = 100;
      });
    };

    processStats(stats.firstColumn);
    processStats(stats.secondColumn);
  }

  function generateRoundAnalysis(lastStat: IRow, currentStat: IRow) {
    const changes: string[] = [];

    Object.entries(currentStat.firstColumn).forEach(([key, current]) => {
      const last = lastStat.firstColumn[key];
      const change = current.value - last.value;
      if (Math.abs(change) > 0.5) {
        changes.push(
          `${current.name}: ${last.value.toFixed(2)}${last.symbol} → ${current.value.toFixed(2)}${current.symbol} ` +
          `(${change > 0 ? '+' : ''}${change.toFixed(2)}${current.symbol})`
        );
      }
    });

    Object.entries(currentStat.secondColumn).forEach(([key, current]) => {
      const last = lastStat.secondColumn[key];
      const change = current.value - last.value;
      if (Math.abs(change) > 0.5) {
        changes.push(
          `${current.name}: ${last.value.toFixed(2)}${last.symbol} → ${current.value.toFixed(2)}${current.symbol} ` +
          `(${change > 0 ? '+' : ''}${change.toFixed(2)}${current.symbol})`
        );
      }
    });

    analysisData.value.changes = changes;
    analysisData.value.summary = `Отчет за ${currentStat.date}:\n\n` +
      `${changes.length > 0 ? changes.slice(0, 3).join('\n') : 'Незначительные изменения'}`;
  }

  function generateFinalAnalysis() {
    const gdpChanges = statistics.value.map(s => s.firstColumn.gdp.value);
    const inflationChanges = statistics.value.map(s => s.firstColumn.inflation.value);
    const unemploymentChanges = statistics.value.map(s => s.firstColumn.unemployment.value);

    const avgGdpGrowth = (gdpChanges[gdpChanges.length - 1] - gdpChanges[0]) / (totalRounds * 0.25);
    const avgInflation = inflationChanges.reduce((a, b) => a + b, 0) / inflationChanges.length;
    const avgUnemployment = unemploymentChanges.reduce((a, b) => a + b, 0) / unemploymentChanges.length;

    let countryLevel = "Венесуэла";
    if (avgGdpGrowth > 2 && avgInflation < 10) countryLevel = "Германия";
    else if (avgGdpGrowth > 0 && avgInflation < 20) countryLevel = "Бразилия";
    else if (avgGdpGrowth > -2) countryLevel = "Россия";

    finalAnalysis.value = `🏁 Игра завершена! Результаты за ${totalRounds * 3} месяцев:\n\n` +
      `📈 Средний рост ВВП: ${avgGdpGrowth.toFixed(2)}% в год\n` +
      `💰 Средняя инфляция: ${avgInflation.toFixed(2)}%\n` +
      `👔 Средняя безработица: ${avgUnemployment.toFixed(2)}%\n\n` +
      `🌍 Ваша экономика достигла уровня: ${countryLevel}\n\n` +
      `Графики изменений показателей доступны ниже.`;
  }

  function resetGame() {
    statistics.value = [statistics.value[0]];
    currentRound.value = 1;
    showFinalModal.value = false;
    eventMessage.value = "";
    showEventModal.value = false;
    analysisData.value = { changes: [], events: [], summary: "" };

    // Сброс рычагов к начальным значениям
    ranges.value = [
      {
        team: "Центробанк",
        firstColumn: {
          interestRate: { value: 80, name: "Ключевая ставка" },
          moneySupply: { value: 30, name: "Денежная масса" },
          reserveRequirements: { value: 70, name: "Резервные требования" },
        },
      },
      {
        team: "Бизнес",
        secondColumn: {
          productionInvestment: { value: 20, name: "Инвестиции в производство" },
          wageSpending: { value: 40, name: "Затраты на зарплаты" },
          productPrices: { value: 75, name: "Цены на товары" },
        },
      },
      {
        team: "Потребители",
        thirdColumn: {
          publicDissatisfaction: { value: 85, name: "Недовольство граждан" },
          wageDemands: { value: 65, name: "Требования к зарплатам" },
          priceDemands: { value: 90, name: "Требования к ценам" },
        },
      },
      {
        team: "Правительство",
        fourthColumn: {
          taxRate: { value: 60, name: "Налоги" },
          govSpending: { value: 45, name: "Государственные расходы" },
          laborMarketRegulation: { value: 55, name: "Регулирование рынка труда" },
        },
      }
    ];

    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }

  // Загружаем сохраненную игру при инициализации
  loadFromLocalStorage();


  return {
    statistics,
    ranges,
    currentRound,
    totalRounds,
    showFinalModal,
    finalAnalysis,
    eventMessage,
    showEventModal,
    showAnalysisModal,
    analysisData,
    startGame,
    resetGame,
    showWelcomeModal,
  hasSeenInstructions,
  closeWelcome
  };
});