import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CinemaModule } from './cinema/cinema.module';
import { SalaModule } from './sala/sala.module';
import { FilmeModule } from './filme/filme.module';
import { SessaoModule } from './sessao/sessao.module';
import { IngressoModule } from './ingresso/ingresso.module';
import { LancheComboModule } from './lanche-combo/lanche-combo.module';
import { PedidoModule } from './pedido/pedido.module';
import { GeneroModule } from './genero/genero.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule, CinemaModule, SalaModule, FilmeModule, SessaoModule, IngressoModule, LancheComboModule, PedidoModule, GeneroModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
