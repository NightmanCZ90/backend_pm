export {};

declare global {
  namespace Express {
    interface User {
      userId: number;
      email: string;
      iat: number;
      exp: number;
      refreshToken: string;
    }
  }
}