# PureTrace MES 🏭🌱

> **Manufacturing Execution System (MES) focado em Rastreabilidade e Conformidade ESG.**

O **PureTrace** é um backend desenvolvido em **Node.js** que aplica princípios de **Programação Funcional** moderna para garantir resiliência e corretude em processos industriais. O foco do projeto não é apenas a execução da manufatura, mas a garantia de que os lotes produzidos respeitam limites de impacto ambiental (Sustentabilidade/ESG).

---

## 🚀 Tecnologias e Paradigmas

Este projeto foge do padrão MVC tradicional e adota uma abordagem **Domain-Driven Design (DDD)** funcional.

* **Linguagem:** TypeScript (Strict Mode).
* **Framework:** [NestJS](https://nestjs.com/) (Camada HTTP e Modularização).
* **Functional Core:** [Effect](https://effect.website/) (Gerenciamento de efeitos colaterais, tratamento de erros e injeção de dependência).
* **Validação:** [Zod](https://zod.dev/) (Schema Validation & Type Inference).
* **Testes:** Jest (Focado em testes de lógica pura).
* *(Em breve)* **Reatividade:** RxJS (Telemetria em tempo real).

---

## 🧠 Arquitetura e Decisões Técnicas

O diferencial deste projeto é a utilização da biblioteca **Effect** como uma "extensão da linguagem" para trazer robustez ao ecossistema TypeScript.

### 1. Railway Oriented Programming (Tratamento de Erros)
Abolimos o uso de `try/catch` e exceções não controladas na lógica de negócio.
* **Como fazemos:** As funções de domínio retornam tipos `Either<Error, Success>` ou `Effect<Success, Error>`.
* **Benefício:** A assinatura da função diz explicitamente o que pode dar errado. O compilador obriga o desenvolvedor a tratar os erros de domínio (ex: `InvalidWasteLimitError`).

### 2. Domain-Driven Design (DDD) Funcional
Separamos rigorosamente dados de comportamento.
* **Schema:** Definido com Zod (ex: `ProductionOrderSchema`). Garante que os dados *são* o que dizem ser.
* **Model:** Módulos de funções puras que contêm as regras de negócio (ex: Cálculo de limite de desperdício).
* **Repository:** Definido via Interfaces (`Context.Tag` do Effect) para permitir troca fácil de infraestrutura.

### 3. Gerenciamento de Estado Seguro
Utilizamos primitivas de concorrência (`Ref`) para gerenciar estado mutável de forma segura e atômica, evitando *race conditions* comuns em aplicações Node.js tradicionais.

### 4. Integração NestJS + Effect
Utilizamos um `ManagedRuntime` para manter o contexto do Effect vivo dentro do ciclo de vida do NestJS, permitindo que as duas tecnologias coexistam: o NestJS cuida do HTTP/Roteamento e o Effect cuida de toda a lógica e orquestração.

---

## 📂 Estrutura do Projeto

A estrutura reflete os *Bounded Contexts* do DDD:

```text
src/
├── production/                  # Contexto: Produção
│   ├── api/                     # Controllers (NestJS)
│   ├── application/             # Use Cases / Services (Effect)
│   ├── domain/                  # Regras de Negócio e Schemas (Puro)
│   │   ├── production-order.model.ts
│   │   ├── production-order.schema.ts
│   │   ├── production.errors.ts
│   │   └── production-order.repository.ts (Interface)
│   ├── infrastructure/          # Implementação de Repositórios
│   └── production.layer.ts      # Wiring de Dependências (Effect Layers)
├── shared/                      # Utilitários globais
│   └── pipes/                   # Pipes de validação (Zod)
└── app.module.ts
```

---

## ⚡ Como Rodar

### Pré-requisitos
- Node.js (v18+)
- NPM ou Yarn

### Instalação

```bash
# Clone o repositório
git clone [https://github.com/llslucas/puretrace-mes.git](https://github.com/llslucas/puretrace-mes.git)

# Instale as dependências
npm install
```

### Execução

```bash
# Rodar em modo de desenvolvimento (Watch mode)
npm run start:dev
```