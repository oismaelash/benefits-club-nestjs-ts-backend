export interface IUser {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserJwtPayload {
  sub: string;
  email: string;
  name: string;
} 