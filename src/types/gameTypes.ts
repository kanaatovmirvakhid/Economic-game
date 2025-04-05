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
export interface RangeRow {
  firstColumn: Record<string, IParameter>;
  secondColumn: Record<string, IParameter>;
  thirdColumn: Record<string, IParameter>;
  fourthColumn: Record<string, IParameter>;
}
export interface IRow {
  firstColumn: IStatisticColumn;
  secondColumn: IStatisticColumn;
}
