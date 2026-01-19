# PureTrace MES 🏭🌱

> **Manufacturing Execution System (MES) com Arquitetura Hexagonal, DDD e Programação Funcional.**

O **PureTrace** é um backend industrial robusto desenvolvido em **Node.js (NestJS)**. Ele demonstra como aplicar princípios de **Engenharia de Software Moderna** para resolver problemas complexos de manufatura e sustentabilidade (ESG), garantindo que regras de negócio sejam invioláveis e que a infraestrutura seja plugável.

---

## 🏗️ Arquitetura e Paradigmas

Este projeto foi desenvolvido como um projeto de portfólio avançado, demonstrando a união entre a robustez corporativa do NestJS e a segurança matemática da Programação Funcional.

### 1. Domain-Driven Design (DDD) & Rich Models
A lógica de negócio não está espalhada em Services. Ela reside em **Entidades Ricas**.
* **Exemplo:** A regra de que *"o desperdício não pode exceder 10%"* não é uma validação no Controller ou Service. Ela pertence à entidade `ProductionOrderModel`. É impossível instanciar uma ordem inválida no sistema.

### 2. Functional Core, Imperative Shell
Utilizamos a biblioteca **[Effect](https://effect.website/)** para criar um núcleo funcional puro.
* **Core (Domínio/Use Cases):** Funções puras, sem exceções (`throw`), retornando descrições de programas (`Effect<Success, Error>`).
* **Shell (NestJS):** Lida com a injeção de dependência, controllers HTTP e conexão com banco de dados, executando os efeitos na "borda" do sistema.

### 3. Hexagonal Architecture (Ports & Adapters)
A aplicação desconhece o banco de dados ou o protocolo de IoT.
* **Ports:** Interfaces definidas no Domínio (ex: `ProductionOrderRepository`, `TelemetryListener`).
* **Adapters:** Implementações na Infraestrutura (ex: `PrismaProductionOrderRepository`, `MqttTelemetryListener`).
Isso nos permite trocar Postgres por In-Memory ou MQTT por Kafka sem tocar numa linha de regra de negócio.

---

## 🛠️ Tech Stack

* **Framework:** [NestJS](https://nestjs.com/) (Orquestração e DI).
* **Linguagem:** TypeScript (Strict Mode).
* **Functional Lib:** [Effect](https://effect.website/) (Error Handling, Pipelines).
* **Database:** PostgreSQL + [Prisma ORM](https://www.prisma.io/).
* **Real-time:** [RxJS](https://rxjs.dev/) + Server-Sent Events (SSE).
* **IoT:** MQTT (Mosquitto) para telemetria de máquinas.
* **Validation:** [Zod](https://zod.dev/).
* **Infra:** Docker & Docker Compose.

---

## 📂 Estrutura de Pastas (Screaming Architecture)

A estrutura reflete a intenção do sistema, não apenas tipos de arquivos.

```text
src/
├── production/
│   ├── api/                     # Controllers (Interface Layer)
│   ├── application/             # Services NestJS (Orquestradores)
│   ├── domain/                  # O Núcleo Puro (Sem NestJS, sem Prisma)
│   │   ├── entities/            # Entidades (Interfaces e Models)
│   │   ├── use-cases/           # Regras de fluxo (ex: CreateOrderUseCase)
│   ├── infra/                   # Repositórios
│   └── production.module.ts     # Wiring (Injeção de Dependência)
├── telemetry/                   # Módulo de Monitoramento IoT
│   ├── domain/                  # Portas e Tipos
│   ├── infra/                   # Adaptador MQTT (Hexagonal)
│   └── api/                     # Controller SSE (Real-time stream)
├── shared/
│   ├── pipes/                   # Pipes de Validação do Nest
└── └── database/                # Implementação concreta do Database Module para uso em vários domínios se necessário
```

## 🚀 Como Rodar
### Pré-requisitos
- Node.js (v18+)
- Docker & Docker Compose

### 1. Subir Infraestrutura (Banco + Broker MQTT)

```Bash
docker-compose up -d
```

Isso iniciará o PostgreSQL (porta 5432) e o Mosquitto MQTT (porta 1883).

### 2. Configurar Banco de Dados
```Bash
# Instalar dependências
npm install

# Rodar migrações do Prisma
npx prisma migrate dev --name init
3. Iniciar a Aplicação
Bash
# Modo desenvolvimento
npm run start:dev
```

Acesse a API em: `http://localhost:3000`

## 🧪 Testes
A arquitetura permite estratégias de teste distintas e eficientes:

### Testes Unitários (Domínio & Aplicação)
Testam a lógica de negócio e os Use Cases usando o Repositório em Memória. Rodam em milissegundos, sem Docker.

```Bash
npm run test
```
Destaque: Graças ao polimorfismo, o ProductionService é testado trocando o PrismaRepository pelo InMemoryRepository via injeção de dependência.

### Testes de Integração (Infraestrutura)
Testam a conexão real com o MQTT e Banco de Dados usando Testcontainers.

```Bash
npm run test:e2e
```

## 📡 Endpoints Principais
### Produção (HTTP REST)
- POST /production: Cria uma ordem de produção.
  - Regra: Rejeita se wasteLimitInKg > 10% da quantity.

## Telemetria (Server-Sent Events)
- GET /telemetry/stream: Stream de dados em tempo real das máquinas.
  - Conecte um simulador MQTT na porta 1883 e veja os dados aparecerem aqui instantaneamente.