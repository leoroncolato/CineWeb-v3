# CineWeb

Sistema de cinema com API NestJS, painel web React e aplicativo mobile React Native com Expo.

## Funcionalidades

- Login, cadastro de usuario e recuperacao de senha com JWT.
- Painel web para admin cadastrar generos, filmes, salas, sessoes, lanches/combos e consultar pedidos.
- App mobile para listar filmes/sessoes, escolher sessao, assentos, tipo de ingresso, combos e pagamento.
- Emissao de comprovante com codigo unico.
- Sincronizacao: filmes/sessoes/lanches cadastrados no web aparecem no mobile; compras feitas no mobile aparecem no web.
- Armazenamento local dos ingressos no mobile com SQLite e sincronizacao via API.

## Estrutura

- `backend`: API NestJS + Prisma + PostgreSQL.
- `frontend`: painel administrativo web em React/Vite.
- `mobile`: app Expo/React Native.

## Backend

```bash
cd backend
npm install
```

Crie `backend/.env`:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/cineweb"
JWT_SECRET="troque-este-segredo"
```

Rode migrations e gere o Prisma Client:

```bash
npx prisma migrate dev
npx prisma generate
npm run start:dev
```

Swagger: `http://localhost:3000/api`.

## Web Admin

```bash
cd frontend
npm install
npm run dev
```

Variavel opcional:

```env
VITE_API_URL=http://localhost:3000
```

No primeiro acesso, use a opcao `Primeiro admin` para criar o administrador inicial. Depois use login normalmente.

## Mobile Expo

```bash
cd mobile
npm install
npm run start
```

Variavel opcional:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

Em emulador Android, use `http://10.0.2.2:3000`. Em aparelho fisico, use o IP da maquina na rede, por exemplo `http://192.168.0.10:3000`.

## Fluxo principal

1. Admin entra no web e cadastra filmes, salas, sessoes e combos.
2. Usuario cria conta ou entra no mobile.
3. Mobile lista as sessoes vindas da API.
4. Usuario escolhe assento, tipo de ingresso, combos e forma de pagamento.
5. Backend valida JWT, assento livre, capacidade, calcula total e cria pedido/ingressos.
6. Mobile salva o comprovante localmente no SQLite.
7. Web admin consulta `Pedidos Sync` e ve a compra feita pelo mobile.
