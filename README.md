# Gerenciador de Dados de Energia Lumi

## Descrição

Este é um projeto backend desenvolvido para gerenciar dados de faturas de energia elétrica, utilizando Express, Node.js e Prisma ORM. O sistema permite a criação, busca por número do cliente e listagem de todas as faturas de energia.

## Pré-requisitos

Certifique-se de que você tem instalados em sua máquina:
- [Node.js](https://nodejs.org/en/download/)
- [PostgreSQL](https://www.postgresql.org/download/)
- [npm](https://npmjs.com/) ou [Yarn](https://yarnpkg.com/)

## Configuração do Ambiente

### Clonando o Projeto

Clone o projeto para sua máquina local usando o seguinte comando:

```bash
git clone https://github.com/FranciscoGabriel1/energy-backend.git
cd energy-backend

```
### Instalação de dependências


```bash 
npm install
```

.env
```bash
DATABASE_URL="postgresql://<usuario>:<senha>@localhost:5432/lumi_energy_db?schema=public"
```

### Rode as migrations do Prisma ORM
```bash
npx prisma migrate dev
```

### rodando o projeto

```bash
npm start
``` 

### Testando a API
Você pode testar a API usando ferramentas como Postman ou Insomnia:

#### POST /create-invoices
- Permite a criação de novas faturas.
#### GET /get-invoice
- Lista todas as faturas disponíveis.
