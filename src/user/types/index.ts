export type JwtPayload = {
  email: string;
  sub: string;
};

export type Tokens = {
  access_token: string;
  refresh_token: string;
};
