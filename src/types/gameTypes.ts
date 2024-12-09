export interface IParameter {
  value: number;
  name: string;
}

export interface IStatisticColumn {
  GDP?: IParameter;
  inflation?: IParameter;
  unemployment?: IParameter;
  deficitSurplus?: IParameter;
  debtBurden?: IParameter;
  happiness?: IParameter;
  ecology?: IParameter;
  poverty?: IParameter;
  export?: IParameter;
  priceIndex?: IParameter;
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
