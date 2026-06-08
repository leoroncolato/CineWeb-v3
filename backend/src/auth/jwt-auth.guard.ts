import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException('Token JWT nao informado');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: Number(payload.sub) },
      });

      if (!usuario) {
        throw new UnauthorizedException('Usuario do token nao encontrado');
      }

      request.user = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Token JWT invalido ou expirado');
    }
  }

  private extractToken(authorization?: string) {
    const [type, token] = authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
