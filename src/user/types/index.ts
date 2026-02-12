import { ApiProperty } from '@nestjs/swagger';

export type JwtPayload = {
  email: string;
  sub: string;
};

export type Tokens = {
  access_token: string;
  refresh_token: string;
};

/** Swagger-visible class for the token response shape. */
export class TokensResponse {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...', description: 'Short-lived access token (15 min)' })
  access_token: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...', description: 'Long-lived refresh token (7 days)' })
  refresh_token: string;
}
