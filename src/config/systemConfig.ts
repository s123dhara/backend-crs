import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SystemConfig {
    constructor(private readonly configService: ConfigService) { }

    get mode(): string {
        return this.configService.get('MODE', 'DEVELOPMENT');
    }

    get mongodb_uri_password(): string {
        return this.configService.get<string>('MONGODB_URI_CLUSER_PASSWORD', '');
    }

    get isDev(): boolean {
        return this.mode === 'DEVELOPMENT';
    }

    get port(): number {
        return Number(this.configService.get('PORT', 3000)); // fallback to 3000
    }

    get clientPort() : number {
        return Number(this.configService.get<number>('CLIENT_PORT')) || 5173;
    }

    get backendUri(): string {
        return this.isDev ? `http://localhost:${this.port}` : this.configService.get<string>('BACKEND_URI') || '';
    }
    get clientUri(): string {
        return this.isDev ? `http://localhost:${this.clientPort}` : this.configService.get<string>('CLIENT_URI') || '';
    }

    get mongodbUri(): string {
        // return this.isDev ? `mongodb://localhost:27017/crs` : this.configService.get<string>('DB_URI', '');
        return `mongodb+srv://spdh427:${this.mongodb_uri_password}@cluster0.wiyn3lh.mongodb.net/crs`
    }
}
