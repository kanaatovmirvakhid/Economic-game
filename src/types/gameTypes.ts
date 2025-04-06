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
    unemployment: IStatItem;
    inflation: IStatItem;
    [key: string]: IStatItem;
  };
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

