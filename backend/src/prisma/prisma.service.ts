import 'dotenv/config';
import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        const databaseURL = process.env.DATABASE_URL;
        if (!databaseURL) {
            throw new Error("DATABASE_URL não esta declarada no .env");
        }

        //vi na aula que a variavel pode ser connectionString ao inves de url
        const adapter = new PrismaPg({ url: databaseURL });
        super({ adapter });
    }

    async onModuleInit() {
        await this.$connect();
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
}