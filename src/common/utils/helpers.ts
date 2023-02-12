import { Role } from "../types/user"

export const isRoleValid = (role: Role) => {
  return [Role.Administrator, Role.PortfolioManager, Role.Investor].includes(role);
}