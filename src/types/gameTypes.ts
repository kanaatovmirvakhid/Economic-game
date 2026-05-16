export interface IStatItem {
  value: number;
  name: string;
  symbol: string;
  canBeNegative?: boolean;
}

export interface IRow {
  date: string;
  firstColumn: {
    gdpGrowth: IStatItem;
    gdp: IStatItem;
    lnGdp: IStatItem;
    unemployment: IStatItem;
    inflation: IStatItem;
    [key: string]: IStatItem;
  };
  // ДОБАВЛЯЕМ ЭТОТ БЛОК:
  secondColumn: {
    budgetDeficit: IStatItem;
    foreignReserves: IStatItem;
    tradeBalance: IStatItem;
    industrialOutput: IStatItem;
    [key: string]: IStatItem;
  };
}

export interface RangeRow {
  team: string;
  // Мы обновляем структуру, чтобы она поддерживала min, max и start
  firstColumn?: {
    [key: string]: {
      value: number;
      name: string;
      min: number;
      max: number;
      start: number;
    };
  };
  secondColumn?: {
    [key: string]: {
      value: number;
      name: string;
      min: number;
      max: number;
      start: number;
    };
  };
  thirdColumn?: {
    [key: string]: {
      value: number;
      name: string;
      min: number;
      max: number;
      start: number;
    };
  };
  fourthColumn?: {
    [key: string]: {
      value: number;
      name: string;
      min: number;
      max: number;
      start: number;
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

