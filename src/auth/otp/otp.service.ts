import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class OtpService {
    constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) { }

    async storeOtp(userId: string, otp: string, ttl: number = 300): Promise<void> {
        await this.redis.set(`otp:${userId}`, otp, 'EX', ttl); // TTL in seconds
    }

    async getOtp(userId: string): Promise<string | null> {        
        return this.redis.get(`otp:${userId}`);
    }

    async deleteOtp(userId: string): Promise<void> {
        await this.redis.del(`otp:${userId}`);
    }
}
