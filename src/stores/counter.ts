import { defineStore } from "pinia";
import { ref } from "vue";
import type { IRow, RangeRow, IStatItem } from '../types/gameTypes'

export const useGameStore = defineStore("game", () => {
  const LOCAL_STORAGE_KEY = 'economic_game_data';


  // Статистика по умолчанию
  const statistics = ref<IRow[]>([{
    date: "1998 год",
    firstColumn: {
      gdpGrowth: { value: -1.9, name: "Темп прироста ВВП", symbol: '%', canBeNegative: true },
      gdp: { value: 270.96, name: "ВВП", symbol: 'млрд $' },
      unemployment: { value: 11.32, name: "Безработица", symbol: '%' },
      inflation: { value: 10.6, name: "Потребительская инфляция", symbol: '%' }
    },
    secondColumn: {
      budgetDeficit: { value: 5.8, name: "Дефицит бюджета", symbol: '%', canBeNegative: true },
      foreignReserves: { value: 12.4, name: "Золотовалютный резерв", symbol: 'млрд $' },
      tradeBalance: { value: -2.1, name: "Торговый баланс", symbol: 'млрд $', canBeNegative: true },
      industrialOutput: { value: 30.6, name: "Индекс промпроизводства", symbol: '%' }
    }
  }]);

  // 2. Новые рычаги управления (на основе регрессоров X) [1, 2]
  const ranges = ref<RangeRow[]>([
  {
      team: "Центробанк",
      firstColumn: {
        interestRate: { value: 60, name: "Ключевая ставка" },
        moneySupply: { value: 40, name: "Денежная масса" },
        creditPrivate: { value: 50, name: "Кредит частному сектору" }
      }
    },
    {
      team: "Бизнес",
      secondColumn: {
        investments: { value: 35, name: "Инвестиции в осн. капитал" },
        wageCosts: { value: 45, name: "Затраты на зарплаты" },
        cpiPrices: { value: 65, name: "Индекс потребительских цен" }
      }
    },
    {
      team: "Потребители",
      thirdColumn: {
        protests: { value: 70, name: "Недовольство граждан" },
        householdCons: { value: 50, name: "Потребление домохозяйств" },
        savings: { value: 50, name: "Сбережения" }
      }
    },
    {
      team: "Правительство",
      fourthColumn: {
        taxes: { value: 50, name: "Налоги" },
        govSpending: { value: 50, name: "Государственные расходы" },
        laborParticipation: { value: 50, name: "Участие в рабочей силе" }
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
    // УДАЛИЛИ внутренний getVal, используем внешний из контекста выше
const getVal = (teamIdx: number, col: string, key: string): number => {
    const team = ranges.value[teamIdx];
    // Проверяем: есть ли команда, есть ли у неё эта колонка, и есть ли в ней этот ключ
    if (team && (team as any)[col] && (team as any)[col][key]) {
      return (team as any)[col][key].value - 50;
    }
    // Если чего-то нет, возвращаем 0 (нейтральный эффект), чтобы игра не падала
    return 0;
  };
    // X-переменные (рычаги) - теперь безопасно получают значения
    const kr = getVal(0, 'firstColumn', 'interestRate');
    const ms = getVal(0, 'firstColumn', 'moneySupply');
    const cp = getVal(0, 'firstColumn', 'creditPrivate');
    const inv = getVal(1, 'secondColumn', 'investments');
    const sal = getVal(1, 'secondColumn', 'wageCosts');
    const cpi = getVal(1, 'secondColumn', 'cpiPrices');
    const pr = getVal(2, 'thirdColumn', 'protests');
    const hc = getVal(2, 'thirdColumn', 'householdCons');
    const sv = getVal(2, 'thirdColumn', 'savings');
    const tx = getVal(3, 'fourthColumn', 'taxes');
    const gs = getVal(3, 'fourthColumn', 'govSpending');
    const lp = getVal(3, 'fourthColumn', 'laborParticipation');

    // --- ПРИМЕНЕНИЕ ТОЛЬКО ЗНАЧИМЫХ КОЭФФИЦИЕНТОВ [1-3] ---

    // 1. Темп прироста ВВП (%)
    stats.firstColumn.gdpGrowth.value += (kr * -0.1181) + (inv * 0.4483) + (cpi * 0.0834) + (pr * -0.044) + (hc * -0.1648) + (tx * 0.1589) + (sv * 0.1458);

    // 3. Безработица (%)
    stats.firstColumn.unemployment.value += (ms * -0.0305) + (cp * -0.0549) + (inv * -0.1405) + (cpi * -0.066) + (pr * 0.0459) + (tx * 0.151) + (gs * 0.4242);

    // 4. Инфляция (%)
    stats.firstColumn.inflation.value += (kr * 0.4535) + (ms * -0.2582) + (cp * -0.2535) + (sal * -0.4365) + (cpi * -0.2569) + (pr * 0.1857) + (hc * -0.7368) + (tx * 0.8774) + (sv * 0.6623);

    // 5. Дефицит бюджета (%) - Коэффициенты делим на 100 для соответствия игровому масштабу
    stats.secondColumn.budgetDeficit.value += (kr * -2.54) + (cpi * 1.45) + (hc * -2.50) + (lp * 4.56) + (sv * 3.15);

    // 6. Золотовалютный резерв (масштаб млрд $)
    stats.secondColumn.foreignReserves.value += (ms * 0.21) + (inv * 1.54) + (sal * -0.60) + (cpi * 0.39) + (pr * -1.48) + (lp * -0.82);

    // 7. Торговый баланс (масштаб млрд $)
    stats.secondColumn.tradeBalance.value += (ms * -0.11) + (cp * -0.16) + (pr * 0.12) + (hc * -0.48) + (lp * 0.59) + (gs * -0.73) + (sv * 0.65);

    // 8. Индекс промпроизводства (%)
    stats.secondColumn.industrialOutput.value += (kr * -0.0815) + (sal * 0.257) + (cpi * 0.0835) + (pr * -0.043) + (lp * 0.2715) + (tx * -0.4198) + (gs * -1.1467) + (sv * 0.3637);
  }

function calculateComplexMetrics(stats: IRow) {
  // Теперь stats.firstColumn.gdp существует благодаря правке в types
  const growthFactor = 1 + (stats.firstColumn.gdpGrowth.value / 100);
  stats.firstColumn.gdp.value *= growthFactor;
}

function applyIndicatorInteractions(stats: IRow) {
  // Обновляем рейтинг на основе нового ВВП
  const ranking = generateCountryRanking(stats.firstColumn.gdp.value);
  console.log(`Текущее место в мире: ${ranking.rank}`); // Теперь функция используется

  // Взаимовлияние (на основе выводов отчета) [12, 13]
  if (stats.firstColumn.inflation.value > 15) {
    stats.firstColumn.gdpGrowth.value -= 2; // Гиперинфляция тормозит рост
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
    // Ограничители
    stats.firstColumn.unemployment.value = Math.max(0.5, stats.firstColumn.unemployment.value);
    stats.firstColumn.inflation.value = Math.min(stats.firstColumn.inflation.value, 50);
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
        interestRate: { value: 60, name: "Ключевая ставка" },
        moneySupply: { value: 40, name: "Денежная масса" },
        creditPrivate: { value: 50, name: "Кредит частному сектору" } // Проверь это название
      }
    },
    {
      team: "Бизнес",
      secondColumn: {
        investments: { value: 35, name: "Инвестиции в осн. капитал" },
        wageCosts: { value: 45, name: "Затраты на зарплаты" },
        cpiPrices: { value: 65, name: "Индекс потребительских цен" }
      }
    },
    {
      team: "Потребители",
      thirdColumn: {
        protests: { value: 70, name: "Недовольство граждан" },
        householdCons: { value: 50, name: "Потребление домохозяйств" },
        savings: { value: 50, name: "Сбережения" }
      }
    },
    {
      team: "Правительство",
      fourthColumn: {
        taxes: { value: 50, name: "Налоги" },
        govSpending: { value: 50, name: "Государственные расходы" },
        laborParticipation: { value: 50, name: "Участие в рабочей силе" }
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

