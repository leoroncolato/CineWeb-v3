-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "resetToken" TEXT,
    "resetTokenExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "ingressos" ADD COLUMN "assento" TEXT;

-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN "formaPagamento" TEXT;
ALTER TABLE "pedidos" ADD COLUMN "statusPagamento" TEXT NOT NULL DEFAULT 'APROVADO';
ALTER TABLE "pedidos" ADD COLUMN "codigoComprovante" TEXT;
ALTER TABLE "pedidos" ADD COLUMN "combos" JSONB;
ALTER TABLE "pedidos" ADD COLUMN "usuarioId" INTEGER;

UPDATE "pedidos"
SET "codigoComprovante" = 'CW-' || LPAD("id"::TEXT, 6, '0')
WHERE "codigoComprovante" IS NULL;

ALTER TABLE "pedidos" ALTER COLUMN "codigoComprovante" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_resetToken_key" ON "usuarios"("resetToken");

-- CreateIndex
CREATE UNIQUE INDEX "ingressos_sessaoId_assento_key" ON "ingressos"("sessaoId", "assento");

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_codigoComprovante_key" ON "pedidos"("codigoComprovante");

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
