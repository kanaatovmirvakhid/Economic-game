export interface IStatItem {
  value: number;
  name: string;
  symbol: string;
  canBeNegative?: boolean;
}
export interface IRow {
  date: string;
  firstColumn: {
    gdpGrowth: IStatItem;       // Темп прироста ВВП (%)
    gdp: IStatItem;             // ВВП (млрд $)
    unemployment: IStatItem;    // Безработица (%)
    inflation: IStatItem;       // Потребительская инфляция (%)
    [key: string]: any;
  };
  secondColumn: {
    budgetDeficit: IStatItem;   // Дефицит бюджета (млн долл -> в игре %)
    foreignReserves: IStatItem; // Золотовалютный резерв (долл -> в игре млрд)
    tradeBalance: IStatItem;    // Торговый баланс (млн долл -> в игре млрд)
    industrialOutput: IStatItem;// Индекс промпроизводства (%)
    [key: string]: any;
  };
}

export interface RangeRow {
  team: string;
  firstColumn?: {
    [key: string]: {
      value: number;
      name: string;
    };
  };
  secondColumn?: {
    [key: string]: {
      value: number;
      name: string;
    };
  };
  thirdColumn?: {
    [key: string]: {
      value: number;
      name: string;
    };
  };
  fourthColumn?: {
    [key: string]: {
      value: number;
      name: string;
    };
  };
}
export interface IParameter {
  value: number;
  name: string;
  symbol?: string;
}

export interface IStatisticColumn {
  gdpGrowth?: IParameter;
  gdp?: IParameter;
  unemployment?: IParameter;
  inflation?: IParameter;
  interestRate?: IParameter;
  debtToGdp?: IParameter;
  incomeTaxRate?: IParameter;
  reserveRatio?: IParameter;
}

