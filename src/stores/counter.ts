import { defineStore } from "pinia";
import { ref } from "vue";
import type { IRow, RangeRow, IStatItem } from '../types/gameTypes'

export const useGameStore = defineStore("game", () => {
  const LOCAL_STORAGE_KEY = 'economic_game_data';


  // Статистика по умолчанию
 const statistics = ref<IRow[]>([{
  date: "1998 год",
  firstColumn: {
    gdpGrowth: { value: -5.30, name: "Темп прироста ВВП", symbol: '%' },
    gdp: { value: 270955, name: "ВВП", symbol: 'млн $' },
    lnGdp: { value: 12.5097, name: "lnGDP", symbol: '' },
    unemployment: { value: 13.26, name: "Безработица", symbol: '%' },
    inflation: { value: 84.44, name: "Инфляция", symbol: '%' }
  },
  secondColumn: { // Теперь TypeScript увидит это свойство
    budgetDeficit: { value: 132397.2, name: "Дефицит бюджета", symbol: 'млн $' },
    foreignReserves: { value: 14738, name: "Резервы", symbol: 'млн $' },
    tradeBalance: { value: 16.43, name: "Торг. баланс", symbol: 'млн $' },
    industrialOutput: { value: 33.94, name: "Промпроизводство", symbol: '%' }
  }
}]);

  const ranges = ref<RangeRow[]>([
    {
      team: "Центробанк",
      firstColumn: {
        interestRate: { value: 19.62, min: 0, max: 100, name: "Ключевая ставка (%)", start: 19.62 },
        moneySupply: { value: 20.80, min: 5, max: 120, name: "Денежная масса (% от ВВП)", start: 20.80 },
        creditPrivate: { value: 15.63, min: 0, max: 80, name: "Кредит частному сектору (% от ВВП)", start: 15.63 }
      }
    },
    {
      team: "Бизнес",
      secondColumn: {
        investments: { value: 16.15, min: 5, max: 50, name: "Инвестиции в осн. капитал (% от ВВП)", start: 16.15 },
        wageCosts: { value: 12.70, min: 5, max: 80, name: "Затраты на зарплаты (индекс)", start: 12.70 },
        cpiPrices: { value: 13.71, min: 10, max: 160, name: "Индекс потреб. цен", start: 13.71 }
      }
    },
    {
      team: "Потребители",
      thirdColumn: {
        protests: { value: 34.3, min: 0, max: 200, name: "Количество протестов (акций)", start: 34.3 },
        householdCons: { value: 57.50, min: 30, max: 90, name: "Потребление домохозяйств (% от ВВП)", start: 57.50 },
        savings: { value: 21.63, min: 5, max: 60, name: "Сбережения (% ВВП)", start: 21.63 }
      }
    },
    {
      team: "Правительство",
      fourthColumn: {
        taxes: { value: 11.24, min: 5, max: 45, name: "Налоги (% от ВВП)", start: 11.24 },
        govSpending: { value: 25.04, min: 5, max: 45, name: "Госрасходы (% от ВВП)", start: 25.04 },
        laborParticipation: { value: 60.40, min: 40, max: 90, name: "Участие в рабочей силе (%)", start: 60.40 }
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
  const getDelta = (teamIdx: number, col: string, key: string) => {
    const team = ranges.value[teamIdx];
    const item = (team as any)?.[col]?.[key];
    return item ? item.value - item.start : 0;
  };

  // Дельты рычагов
  const dKr = getDelta(0, 'firstColumn', 'interestRate');
  const dMs = getDelta(0, 'firstColumn', 'moneySupply');
  const dCp = getDelta(0, 'firstColumn', 'creditPrivate');
  const dInv = getDelta(1, 'secondColumn', 'investments');
  const dSal = getDelta(1, 'secondColumn', 'wageCosts');
  const dCpi = getDelta(1, 'secondColumn', 'cpiPrices');
  const dHc = getDelta(2, 'thirdColumn', 'householdCons');
  const dSv = getDelta(2, 'thirdColumn', 'savings');
  const dTx = getDelta(3, 'fourthColumn', 'taxes');
  const dGs = getDelta(3, 'fourthColumn', 'govSpending');
  const dLp = getDelta(3, 'fourthColumn', 'laborParticipation');

  // ИСПРАВЛЕННЫЙ ИНДЕКС: Потребители находятся под индексом [1]
  const prItem = ranges.value[1].thirdColumn?.protests;
  const dPr = prItem ? (prItem.value / 1000) - (prItem.start / 1000) : 0;

  // ПРИМЕНЕНИЕ КОЭФФИЦИЕНТОВ ИЗ ВАШЕГО ИССЛЕДОВАНИЯ
  // 1. Темп роста ВВП
  stats.firstColumn.gdpGrowth.value += (dKr * -0.1181) + (dInv * 0.4483) + (dCpi * 0.0834) + (dPr * -44.62) + (dHc * -0.1648) + (dTx * 0.1589) + (dSv * 0.1458);

  // 2. lnGDP (скрытый технический показатель для точности расчетов)
  stats.firstColumn.lnGdp.value += (dMs * 0.0161) + (dInv * 0.0812) + (dSal * -0.0553) + (dHc * 0.032) + (dLp * -0.0616) + (dTx * 0.0445) + (dSv * -0.0378);

  // 3. СИНХРОНИЗАЦИЯ: Обновляем видимый ВВП (млн $) через экспоненту lnGDP
  stats.firstColumn.gdp.value = Math.round(Math.exp(stats.firstColumn.lnGdp.value));

  // 4. Безработица и Инфляция
  stats.firstColumn.unemployment.value += (dMs * -0.0305) + (dCp * -0.0549) + (dInv * -0.1405) + (dCpi * -0.066) + (dPr * 45.99) + (dTx * 0.151) + (dGs * 0.4242);
  stats.firstColumn.inflation.value += (dKr * 0.4535) + (dMs * -0.2582) + (dCp * -0.2535) + (dSal * -0.4365) + (dCpi * -0.2569) + (dPr * 185.77) + (dHc * -0.7368) + (dTx * 0.8774) + (dSv * 0.6623);

  // 5. Второй блок (масштабировано до млн $)
  stats.secondColumn.budgetDeficit.value += (dKr * -254.62) + (dCpi * 145.23) + (dHc * -250.22) + (dLp * 456.79) + (dSv * 315.42);
  stats.secondColumn.foreignReserves.value += (dMs * 211) + (dInv * 1540) + (dSal * -607) + (dCpi * 395) + (dPr * -1480) + (dLp * -822);
  stats.secondColumn.tradeBalance.value += (dMs * -119.58) + (dCp * -167.49) + (dPr * 120813) + (dHc * -488.25) + (dLp * 599) + (dGs * -738) + (dSv * 653);
  stats.secondColumn.industrialOutput.value += (dKr * -0.0815) + (dSal * 0.257) + (dCpi * 0.0835) + (dPr * -43.93) + (dLp * 0.2715) + (dTx * -0.4198) + (dGs * -1.1467) + (dSv * 0.3637);
}

function calculateComplexMetrics(stats: IRow) {
    // Пересчет абсолютного ВВП на основе lnGDP для пользователя
    stats.firstColumn.gdp.value = Math.round(Math.exp(stats.firstColumn.lnGdp.value));
  }

function applyIndicatorInteractions(stats: IRow) {
  // 1. Влияние высокой инфляции на рост (Порог: 10%)
  // Если инфляция выше 10%, каждый лишний процент отнимает 0.05% от роста ВВП
  if (stats.firstColumn.inflation.value > 10) {
    const penalty = (stats.firstColumn.inflation.value - 10) * 0.05;
    stats.firstColumn.gdpGrowth.value -= penalty;
  }

  // 2. Влияние рецессии на безработицу
  // Если темп роста ВВП отрицательный, безработица растет сама по себе
  if (stats.firstColumn.gdpGrowth.value < 0) {
    stats.firstColumn.unemployment.value += Math.abs(stats.firstColumn.gdpGrowth.value) * 0.1;
  }

  // 3. Большой дефицит бюджета «проедает» резервы
  // Если дефицит > 3% ВВП, резервы падают на 200 млн $ за каждый лишний процент
  if (stats.secondColumn.budgetDeficit.value > 3) {
    const reserveDrain = (stats.secondColumn.budgetDeficit.value - 3) * 200;
    stats.secondColumn.foreignReserves.value -= reserveDrain;
  }
}

// Исправление 5: Добавляем отсутствующую функцию generateFinalAnalysis
function generateFinalAnalysis() {
  const statsArray = statistics.value;

  // 1. Проверяем наличие данных (нужно минимум 2 точки для сравнения)
  if (statsArray.length < 2) return;

  // 2. ИСПРАВЛЕНИЕ: Добавляем [0], чтобы получить первый объект массива
  const first = statsArray[0];
  const last = statsArray[statsArray.length - 1];

  // 3. Проверяем существование вложенных полей через опциональную цепочку или проверку
  if (first?.firstColumn?.gdp && last?.firstColumn?.gdp) {

    // Вычисляем разницу
    const diff = (last.firstColumn.gdp.value - first.firstColumn.gdp.value).toFixed(2);

    // Формируем строку анализа
    // Используем обратные кавычки `` для интерполяции переменных
    analysisData.value.summary = `За ${statsArray.length - 1} лет ВВП изменился на ${diff} млрд $.`;
  }
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
  const changes = "Изменения:\n";

    Object.entries(event.effects).forEach(([key, data]) => {
    // Используем приведение к любому типу (as any), чтобы обойти строгую проверку ключей
  const firstCol = stats.firstColumn as Record<string, IStatItem>;
  const secondCol = stats.secondColumn as Record<string, IStatItem>;

    if (firstCol[key]) {
      firstCol[key].value += data.value;
    }
    if (secondCol[key]) {
      secondCol[key].value += data.value;
    }
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
 // Оставляем только те лимиты, которые не дают показателям стать отрицательными
  stats.firstColumn.unemployment.value = Math.max(0, stats.firstColumn.unemployment.value);
  stats.secondColumn.foreignReserves.value = Math.max(0, stats.secondColumn.foreignReserves.value);
  // Инфляцию не ограничиваем сверху, чтобы видеть реальный кризис
  stats.firstColumn.inflation.value = Math.max(-100, stats.firstColumn.inflation.value);

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
    generateFinalAnalysis(); // Теперь функция существует
    return;
  }

  analysisData.value = { changes: [], events: [], summary: "" };
  const lastStat = statistics.value[statistics.value.length - 1];
  const newStats = calculateNewStatistics(lastStat);

  // Корректный расчет года
  const currentYear = parseInt(lastStat.date);
  newStats.date = `${currentYear + 1} год`;

  statistics.value.push(newStats);
  currentRound.value++;

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
        interestRate: { value: 19.62, min: 0, max: 100, name: "Ключевая ставка (%)", start: 19.62 },
        moneySupply: { value: 20.80, min: 5, max: 120, name: "Денежная масса (% от ВВП)", start: 20.80 },
        creditPrivate: { value: 15.63, min: 0, max: 80, name: "Кредит частному сектору (% от ВВП)", start: 15.63 }
      }
    },
    {
      team: "Бизнес",
      secondColumn: {
        investments: { value: 16.15, min: 5, max: 50, name: "Инвестиции в осн. капитал (% от ВВП)", start: 16.15 },
        wageCosts: { value: 12.70, min: 5, max: 80, name: "Затраты на зарплаты (индекс)", start: 12.70 },
        cpiPrices: { value: 13.71, min: 10, max: 160, name: "Индекс потреб. цен", start: 13.71 }
      }
    },
    {
      team: "Потребители",
      thirdColumn: {
        protests: { value: 34.3, min: 0, max: 200, name: "Количество протестов (акций)", start: 34.3 },
        householdCons: { value: 57.50, min: 30, max: 90, name: "Потребление домохозяйств (% от ВВП)", start: 57.50 },
        savings: { value: 21.63, min: 5, max: 60, name: "Сбережения (% ВВП)", start: 21.63 }
      }
    },
    {
      team: "Правительство",
      fourthColumn: {
        taxes: { value: 11.24, min: 5, max: 45, name: "Налоги (% от ВВП)", start: 11.24 },
        govSpending: { value: 25.04, min: 5, max: 45, name: "Госрасходы (% от ВВП)", start: 25.04 },
        laborParticipation: { value: 60.40, min: 40, max: 90, name: "Участие в рабочей силе (%)", start: 60.40 }
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

