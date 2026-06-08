import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'node:crypto';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

type SafeUsuario = {
  id: number;
  nome: string;
  email: string;
  role: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    return this.createUsuario(dto, 'USER');
  }

  async bootstrapAdmin(dto: RegisterDto) {
    const admins = await this.prisma.usuario.count({
      where: { role: 'ADMIN' as any },
    });

    if (admins > 0) {
      throw new ConflictException('Administrador inicial ja foi criado');
    }

    return this.createUsuario(dto, 'ADMIN');
  }

  async login(dto: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciais invalidas');
    }

    const senhaValida = await bcrypt.compare(dto.senha, usuario.senhaHash);
    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais invalidas');
    }

    return this.issueToken(this.toSafeUsuario(usuario));
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!usuario) {
      return {
        message: 'Se o e-mail existir, um token de recuperacao sera gerado.',
      };
    }

    const resetToken = randomBytes(24).toString('hex');
    const resetTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 30);

    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: { resetToken, resetTokenExpiresAt },
    });

    return {
      message: 'Token de recuperacao gerado.',
      resetToken,
      expiresAt: resetTokenExpiresAt,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { resetToken: dto.token },
    });

    if (!usuario || !usuario.resetTokenExpiresAt || usuario.resetTokenExpiresAt < new Date()) {
      throw new UnauthorizedException('Token de recuperacao invalido ou expirado');
    }

    const senhaHash = await bcrypt.hash(dto.novaSenha, 10);
    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        senhaHash,
        resetToken: null,
        resetTokenExpiresAt: null,
      },
    });

    return { message: 'Senha atualizada com sucesso' };
  }

  async findById(id: number) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new NotFoundException('Usuario nao encontrado');
    return this.toSafeUsuario(usuario);
  }

  private async createUsuario(dto: RegisterDto, role: 'ADMIN' | 'USER') {
    const email = dto.email.toLowerCase();
    const exists = await this.prisma.usuario.findUnique({ where: { email } });
    if (exists) {
      throw new ConflictException('E-mail ja cadastrado');
    }

    const senhaHash = await bcrypt.hash(dto.senha, 10);
    const usuario = await this.prisma.usuario.create({
      data: {
        nome: dto.nome,
        email,
        senhaHash,
        role: role as any,
      },
    });

    return this.issueToken(this.toSafeUsuario(usuario));
  }

  private issueToken(usuario: SafeUsuario) {
    const accessToken = this.jwtService.sign({
      sub: usuario.id,
      email: usuario.email,
      role: usuario.role,
      nome: usuario.nome,
    });

    return { accessToken, usuario };
  }

  private toSafeUsuario(usuario: any): SafeUsuario {
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
    };
  }
}
