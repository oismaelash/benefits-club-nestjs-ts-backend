export interface IUserJwtPayload {
  sub: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
} 