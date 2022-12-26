// import { Module } from '@nestjs/common';
// import { TasksModule } from './tasks/tasks.module';
// import { TasksController } from './tasks/tasks.controller';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { AuthModule } from './auth/auth.module';
// import { ConfigModule } from '@nestjs/config';

// @Module({
//   imports: [
//     ConfigModule.forRoot({
//       envFilePath: [`.env.stage.${process.env.STAGE}`],
//     }),
//     TasksModule,
//     TypeOrmModule.forRoot({
//       type: 'postgres',
//       autoLoadEntities: true,
//       synchronize: true,
//       host: 'localhost',
//       port: 5432,
//       username: 'postgres',
//       password: 'test124',
//       database: 'task-management',
//     }),
//     AuthModule,
//   ],
//   controllers: [TasksController],
// })
// export class AppModule {}

import { Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';
import { TasksController } from './tasks/tasks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configValidationSchema } from './config.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.stage.${process.env.STAGE}`],
      validationSchema: configValidationSchema,
    }),
    TasksModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const isProduction = configService.get('STAGE') === 'prod';

        return {
          ssl: isProduction,
          extra: {
            ssl: isProduction ? { rejectUnauthorized: false } : null,
          },
          type: 'postgres',
          autoLoadEntities: true,
          synchronize: true,
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_DATABASE'),
        };
      },
    }),
    AuthModule,
  ],
  controllers: [TasksController],
})
export class AppModule {}
