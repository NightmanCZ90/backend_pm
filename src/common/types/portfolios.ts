import { Portfolio, Transaction, User } from "@prisma/client"

export interface ExtendedPortfolio extends Portfolio {
  portfolioManager: User;
  user: User;
  transactions: Transaction[];
}

export type UsersPortfolios = {
  managed: ExtendedPortfolio[];
  managing: ExtendedPortfolio[];
  personal: ExtendedPortfolio[];
}