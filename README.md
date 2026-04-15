# CineWeb Backend 🎬

## Visão Geral
O **CineWeb Backend** é uma API RESTful completa e robusta desenvolvida para o gerenciamento de um sistema de controle de cinemas. Evoluindo de um projeto acadêmico, esta versão atual inclui Swagger, regras de negócio baseadas no domínio, validação rigorosa de dados com class-validator e as integrações necessárias para operar com PostgreSQL. A aplicação suporta desde o cadastro de Gêneros, Filmes e alocação de Salas até a venda de Ingressos e gestão de Lanches e Pedidos consolidados. 

## 🛠 Stack Tecnológica & Arquitetura

Este projeto adota uma arquitetura modular baseada em serviços, utilizando as seguintes tecnologias:

* **Linguagem:** TypeScript
* **Framework:** NestJS (Node.js)
* **Banco de Dados:** PostgreSQL
* **ORM:** Prisma ORM
* **Documentação:** Swagger (OpenAPI)
* **Validação:** class-validator e class-transformer

## 🗄️ Entidades e Funcionalidades Implementadas

A arquitetura de dados foi desenhada para garantir integridade referencial, e as validações foram transferidas para os services da API, aplicando DTOs para proteção dos endpoints:

* **Gênero:** CRUD completo. Nome único.
* **Filme:** CRUD completo com referência a um Gênero. Duração controlada em minutos e relacionamento retornado nas consultas (Swagger e endpoints de GET).
* **Sala:** CRUD completo, garantindo que o número ou identificação da sala seja estritamente único. Capacidade em assentos.
* **Sessão (Regra de Negócio 1):** CRUD completo. Ao criar ou atualizar uma sessão, o sistema garante ativamente que a Sala selecionada **não** possua nenhuma outra Sessão agendada cujos horários se sobreponham, baseado tanto no horário de início quanto na duração em minutos do filme atrelado.
* **Ingresso (Regra de Negócio 2):** Criação e Visualização. A emissão de tickets é bloqueada (409 Conflict) caso a sessão em questão já tenha atingido a capacidade máxima estabelecida da respectiva Sala.
* **LancheCombo:** CRUD completo contendo gestão de valores.
* **Pedido (Regra de Negócio 3):** Criação e Visualização. Calcula de maneira automática o `valorTotal` do pedido efetuando a soma do preço de ingressos e/ou itens e lanches inseridos nele.

## 🚀 Como iniciar e testar

1. Entre no diretório do backend e garanta que as dependências estejam instaladas:
   ```bash
   cd backend
   npm install
   ```

2. Certifique-se de configurar a variável `DATABASE_URL` em um arquivo `.env` localizado na pasta `backend` caso o seu banco de dados PostgreSQL exija dados de login (O padrão assumido aponta para a URL local).

3. Sincronize o banco de dados via Prisma:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

4. Inicie o servidor:
   ```bash
   # Rodar em desenvolvimento (watch)
   npm run start:dev
   ```

5. **Documentação Swagger:** Navegue para `http://localhost:3000/api` para testar os endpoints de forma visual. O NestJS validation fará com que qualquer entrada incorreta retorne `400 Bad Request`.

---
Desenvolvido como projeto acadêmico - CineWeb 2.0.