import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface HealthCheck {
  status: 'ok' | 'error';
  db: 'up' | 'down';
  uptime: number;
  timestamp: string;
}

@Injectable()
export class AppService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /** Health check da API: estado geral, conexão com o banco e uptime. */
  async healthCheck(): Promise<HealthCheck> {
    let db: HealthCheck['db'] = 'up';
    try {
      await this.dataSource.query('SELECT 1');
    } catch {
      db = 'down';
    }

    const payload: HealthCheck = {
      status: db === 'up' ? 'ok' : 'error',
      db,
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };

    // Banco fora → responde 503 com o mesmo corpo (fail visível ao monitor).
    if (db === 'down') {
      throw new ServiceUnavailableException(payload);
    }
    return payload;
  }
}
