export type Tokens = {
  accessToken: string;
  refreshToken: string;
}

export type JwtPayload = {
  userId: number;
  email: string;
}