import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import * as process from 'node:process';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/ecommerce'),
    ConfigModule.forRoot(),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET as string,
      signOptions: { expiresIn: '60s' },
    }),
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
