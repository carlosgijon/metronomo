import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PresetsModule } from './presets/presets.module';
import { MetronomeModule } from './metronome/metronome.module';

@Module({
  imports: [
    // Configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Configuración de TypeORM con PostgreSQL
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USER || 'metronome_user',
      password: process.env.DB_PASSWORD || 'changeme123',
      database: process.env.DB_NAME || 'metronome',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Habilitado para desarrollo para sincronizar el esquema
      logging: process.env.NODE_ENV === 'development',
    }),

    // Módulos de la aplicación
    PresetsModule,
    MetronomeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
