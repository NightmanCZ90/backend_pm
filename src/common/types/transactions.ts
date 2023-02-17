export enum TransactionType {
  Buy = 'buy',
  Sell = 'sell',
  BuyToCover = 'buyToCover',
  SellShort = 'sellShort',
  /** Dividends plus Reinvestments */
  DRIP = 'drip',
  Dividends = 'dividends',
  Split = 'split',
}

export enum ExecutionType {
  FIFO = 'fifo',
  LIFO = 'lifo',
  WeightedAverage = 'weightedAverage',
  SpecificLots = 'specificLots',
  HighCost = 'highCost',
  LowCost = 'lowCost',
}