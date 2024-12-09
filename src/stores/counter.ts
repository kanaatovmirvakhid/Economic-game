import { defineStore } from "pinia";
import { ref } from "vue";
import type { Ref } from "vue";
import type { IRow, IParameter, RangeRow } from '../types/gameTypes'

export const useGameStore = defineStore("game", () => {
  // Статистика по умолчанию
  const statistics = ref<IRow[]>([
    {
      firstColumn: {
        GDP: { value: 100_000, name: "ВВП (млрд $)" },
        inflation: { value: 2.5, name: "Инфляция (%)" },
        unemployment: { value: 5.5, name: "Безработица (%)" },
        deficitSurplus: {
          value: -3,
          name: "Бюджетный дефицит/профицит (% ВВП)",
        },
        debtBurden: { value: 60, name: "Долговая нагрузка (% ВВП)" },
      },
      secondColumn: {
        happiness: { value: 70, name: "Индекс счастья" },
        ecology: { value: 65, name: "Экологическое состояние" },
        poverty: { value: 12, name: "Уровень бедности (%)" },
        export: { value: 20_000, name: "Чистый экспорт (млрд $)" },
        priceIndex: { value: 102, name: "Индекс потребительских цен" },
      },
    },
  ]);

  // Ползунки по умолчанию
  const ranges: Ref<RangeRow[]> = ref([
    {
      firstColumn: {
        taxRate: {
          value: 20, // Налоговая ставка
          name: "Налоговая ставка",
        },
        governmentSpending: {
          value: 50, // Государственные расходы
          name: "Государственные расходы",
        },
        loanRate: {
          value: 5, // Ставка по кредитам
          name: "Ставка по кредитам",
        },
        minimumWage: {
          value: 30, // Минимальная зарплата
          name: "Минимальная зарплата",
        },
        tradeBalance: {
          value: 10, // Экспорт и импорт
          name: "Экспорт и импорт",
        },
      },
      secondColumn: {
        subsidyPrograms: {
          value: 40, // Программы субсидий
          name: "Программы субсидий",
        },
        energyPolicy: {
          value: 50, // Энергетическая политика
          name: "Энергетическая политика",
        },
        agriculture: {
          value: 30, // Сельское хозяйство
          name: "Сельское хозяйство",
        },
        technologyInvestment: {
          value: 20, // Инвестиции в технологии
          name: "Инвестиции в технологии",
        },
        transportInfrastructure: {
          value: 60, // Транспортная инфраструктура
          name: "Транспортная инфраструктура",
        },
      },
      thirdColumn: {
        healthcare: {
          value: 40, // Здравоохранение
          name: "Здравоохранение",
        },
        education: {
          value: 50, // Образование
          name: "Образование",
        },
        militarySpending: {
          value: 20, // Военные расходы
          name: "Военные расходы",
        },
        pensionRate: {
          value: 5, // Ставка по пенсионным накоплениям
          name: "Ставка по пенсионным накоплениям",
        },
        consumerLoans: {
          value: 15, // Потребительские кредиты
          name: "Потребительские кредиты",
        },
      },
      fourthColumn: {
        propertyTax: {
          value: 10, // Налог на имущество
          name: "Налог на имущество",
        },
        pensionReform: {
          value: 20, // Пенсионная реформа
          name: "Пенсионная реформа",
        },
        currencyRate: {
          value: 70, // Валютный курс
          name: "Валютный курс",
        },
        cultureAndArts: {
          value: 30, // Культура и искусство
          name: "Культура и искусство",
        },
        antiCorruption: {
          value: 50, // Борьба с коррупцией
          name: "Борьба с коррупцией",
        },
      },
    },
  ]);

  // function startGame() {
  //   // Функция для добавления случайной погрешности в диапазоне 3-5%
  //   const applyRandomError = (value: number) => {
  //     const errorPercent = Math.random() * (5 - 3) + 3; // случайное число от 3 до 5
  //     const error = value * (errorPercent / 100);
  //     return Math.random() > 0.5 ? value + error : value - error; // случайно увеличиваем или уменьшаем
  //   };

  //   if (!ranges.value || !statistics.value) {
  //     console.error("Данные для ranges или statistics отсутствуют!");
  //     return;
  //   }

  //   // Копируем текущую статистику, чтобы создать новую
  //   const newStatistics: IRow = JSON.parse(JSON.stringify(statistics.value[0]));

  //   // Перебираем строки в диапазонах
  //   Object.values(ranges.value[0]).forEach((column) => {
  //     if (!column) return; // Если колонка не существует, пропускаем

  //     Object.entries(column).forEach(([key, range]) => {
  //       const rangeValue = (range as IParameter)?.value;
  //       if (rangeValue === undefined) return; // Пропускаем, если значение не определено

  //       const impactPercentage = rangeValue / 100; // Переводим в доли

  //       // Динамически обновляем статистику
  //       Object.values(newStatistics).forEach((statColumn) => {
  //         Object.entries(statColumn).forEach(([statKey, statParam]) => {
  //           if (statParam && statParam.value !== undefined) {
  //             const influenceFactor = calculateInfluenceFactor(key, statKey);

  //             // Обновляем значение статистики с учетом погрешности
  //             statParam.value = applyRandomError(
  //               statParam.value + impactPercentage * influenceFactor
  //             );
  //           }
  //         });
  //       });
  //     });
  //   });
  //   statistics.value.push(newStatistics);
  // }




  // Функция для расчета влияния параметра на статистику

  function startGame() {
    // Функция для добавления случайной погрешности в диапазоне 3-5%
    const applyRandomError = (value: number) => {
      const errorPercent = Math.random() * (5 - 3) + 3; // случайное число от 3 до 5
      const error = value * (errorPercent / 100);
      return Math.random() > 0.5 ? value + error : value - error; // случайно увеличиваем или уменьшаем
    };

    if (!ranges.value || !statistics.value) {
      console.error("Данные для ranges или statistics отсутствуют!");
      return;
    }

    // Копируем текущую статистику, чтобы создать новую
    const newStatistics: IRow = JSON.parse(JSON.stringify(statistics.value[0]));

    // Перебираем строки в диапазонах
    Object.values(ranges.value[0]).forEach((column) => {
      if (!column) return; // Если колонка не существует, пропускаем

      Object.entries(column).forEach(([key, range]) => {
        const rangeValue = (range as IParameter)?.value;
        if (rangeValue === undefined) return; // Пропускаем, если значение не определено

        const impactPercentage = rangeValue / 100; // Переводим в доли

        // Суммируем влияние на статистику
        const totalImpact: Record<string, number> = {};

        // Перебираем всю статистику и для каждого столбца считаем влияние
        Object.values(newStatistics).forEach((statColumn) => {
          Object.entries(statColumn).forEach(([statKey, statParam]) => {
            if (statParam && statParam.value !== undefined) {
              // Получаем коэффициент влияния для текущего параметра
              const influenceFactor = calculateInfluenceFactor(key, statKey);

              // Добавляем процентное влияние на статистику
              if (!totalImpact[statKey]) {
                totalImpact[statKey] = 0;
              }
              totalImpact[statKey] += influenceFactor * impactPercentage;
            }
          });
        });

        // Теперь применяем итоговый процент ко всем статистическим значениям
        Object.values(newStatistics).forEach((statColumn) => {
          Object.entries(statColumn).forEach(([statKey, statParam]) => {
            if (statParam && statParam.value !== undefined) {
              const totalInfluence = totalImpact[statKey] || 0;

              // Применяем итоговый процент с погрешностью к текущему значению
              statParam.value = applyRandomError(statParam.value * (1 + totalInfluence));
            }
          });
        });
      });
    });

    // Добавляем обновленную статистику в массив statistics
    statistics.value.push(newStatistics);
  }

  function calculateInfluenceFactor(paramKey: string, statKey: string): number {
    const influenceMapping: Record<string, Record<string, number>> = {
      taxRate: {
        GDP: -2,      // Влияние на ВВП
        inflation: -1, // Влияние на инфляцию
        unemployment: 1, // Влияние на безработицу
        deficitSurplus: 3, // Влияние на бюджетный дефицит
        happiness: -2, // Влияние на уровень счастья
      },
      governmentSpending: {
        GDP: 4,       // Влияние на ВВП
        inflation: 3,  // Влияние на инфляцию
        debtBurden: 2, // Влияние на долговую нагрузку
        happiness: 5,  // Влияние на уровень счастья
      },
      loanRate: {
        GDP: -3,      // Влияние на ВВП
        unemployment: 2, // Влияние на безработицу
        priceIndex: -1, // Влияние на индекс потребительских цен
        happiness: -3,  // Влияние на уровень счастья
      },
      minimumWage: {
        GDP: -1,      // Влияние на ВВП
        unemployment: 2, // Влияние на безработицу
        poverty: -4,   // Влияние на уровень бедности
        happiness: 3,  // Влияние на уровень счастья
      },
      tradeBalance: {
        GDP: 5,       // Влияние на ВВП
        debtBurden: -3, // Влияние на долговую нагрузку
        export: 7,     // Влияние на экспорт
        priceIndex: -2, // Влияние на индекс потребительских цен
      },
      subsidyPrograms: {
        GDP: 2,       // Влияние на ВВП
        inflation: 1,  // Влияние на инфляцию
        happiness: 4,  // Влияние на уровень счастья
        poverty: -3,   // Влияние на уровень бедности
      },
      energyPolicy: {
        ecology: 5,    // Влияние на экологию
        GDP: -2,       // Влияние на ВВП
        happiness: 3,  // Влияние на уровень счастья
      },
      agriculture: {
        GDP: 3,        // Влияние на ВВП
        poverty: -2,   // Влияние на уровень бедности
        ecology: -1,   // Влияние на экологию
      },
      technologyInvestment: {
        GDP: 5,        // Влияние на ВВП
        happiness: 2,  // Влияние на уровень счастья
        unemployment: -3, // Влияние на безработицу
      },
      transportInfrastructure: {
        GDP: 4,        // Влияние на ВВП
        ecology: -2,   // Влияние на экологию
        happiness: 3,  // Влияние на уровень счастья
      },
      healthcare: {
        happiness: 6,  // Влияние на уровень счастья
        poverty: -4,   // Влияние на уровень бедности
        unemployment: -2, // Влияние на безработицу
        GDP: 3,        // Влияние на ВВП
      },
      education: {
        GDP: 5,        // Влияние на ВВП
        poverty: -3,   // Влияние на уровень бедности
        unemployment: -2, // Влияние на безработицу
        happiness: 4,  // Влияние на уровень счастья
      },
      militarySpending: {
        GDP: 2,        // Влияние на ВВП
        inflation: 1,  // Влияние на инфляцию
        debtBurden: 3, // Влияние на долговую нагрузку
        happiness: -2, // Влияние на уровень счастья
      },
      pensionRate: {
        happiness: 4,  // Влияние на уровень счастья
        debtBurden: -2, // Влияние на долговую нагрузку
        priceIndex: -1, // Влияние на индекс потребительских цен
        poverty: -3,   // Влияние на уровень бедности
      },
      consumerLoans: {
        GDP: 4,        // Влияние на ВВП
        inflation: 2,  // Влияние на инфляцию
        unemployment: -3, // Влияние на безработицу
        happiness: 3,  // Влияние на уровень счастья
      },
      propertyTax: {
        GDP: -2,       // Влияние на ВВП
        happiness: -3, // Влияние на уровень счастья
        deficitSurplus: 5, // Влияние на бюджетный дефицит
        poverty: -1,   // Влияние на уровень бедности
      },
      pensionReform: {
        happiness: -3, // Влияние на уровень счастья
        deficitSurplus: 4, // Влияние на бюджетный дефицит
        debtBurden: -2, // Влияние на долговую нагрузку
        poverty: -2,   // Влияние на уровень бедности
      },
      currencyRate: {
        GDP: 5,        // Влияние на ВВП
        export: 6,     // Влияние на экспорт
        inflation: -2, // Влияние на инфляцию
        poverty: -3,   // Влияние на уровень бедности
      },
      cultureAndArts: {
        happiness: 6,  // Влияние на уровень счастья
        GDP: 2,        // Влияние на ВВП
        unemployment: -1, // Влияние на безработицу
        ecology: 2,    // Влияние на экологию
      },
      antiCorruption: {
        happiness: 5,  // Влияние на уровень счастья
        GDP: 4,        // Влияние на ВВП
        poverty: -5,   // Влияние на уровень бедности
        unemployment: -2, // Влияние на безработицу
      },
    };

    return influenceMapping[paramKey]?.[statKey] || 0; // Если нет явного влияния, возвращаем 0
  }

  return {
    statistics,
    ranges,
    startGame,
  };
});
