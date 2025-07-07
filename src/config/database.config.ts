import { MongooseModuleOptions } from '@nestjs/mongoose';

export const databaseConfig = (): MongooseModuleOptions => ({
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/benefits-club',
}); 