# MilScale - Frontend

Interface do MilScale em React (SPA). Consome apenas o BFF, através do API Gateway.

O shell carrega quatro microfrontends independentes, que não importam código um do outro (só o módulo `shared`):

| Módulo | O que faz |
|---|---|
| Painel | Painel do dia com uma única chamada a `GET /aggregated-data` |
| Efetivo | CRUD de militares e mudança de situação |
| Escalas e trocas | Escalar, publicar, remover, pedir e aprovar trocas |
| Eventos | Eventos publicados no Service Bus |

## Arquitetura

```
Usuário -> Microfrontend (React) -> API Gateway (AWS) -> BFF (Node.js)
                                                         |-> Efetivo Service -> MongoDB Atlas
                                                         |-> Escala Service  -> Azure SQL
                                                         |                   -> Azure Service Bus -> Function (notificar-escala)
                                                         |-> Azure Function (calcular-ciclo)
```

```
src/
  shell/      layout e navegação entre os módulos
  mfe/        painel, efetivo, escalas, eventos
  shared/     cliente HTTP (único ponto com fetch), tipos e componentes comuns
tests/        testes de arquitetura dos microfrontends e unitários
```

## Tecnologias

React 19, TypeScript, Vite, Vitest.

## Como rodar localmente

```bash
npm install
cp .env.example .env   # VITE_API_URL = URL do API Gateway
npm run dev
npm test
```

## Links

- Frontend: _LINK_FRONTEND_
- API Gateway: _LINK_GATEWAY_

## Projetos do sistema

| Componente | Repositório |
|---|---|
| Microfrontend (React) | [milscale-frontend](https://github.com/enzoojapa/milscale-frontend) |
| BFF (Node.js) | [milscale-bff](https://github.com/enzoojapa/milscale-bff) |
| Microsserviço de efetivo (MongoDB) | [milscale-efetivo-service](https://github.com/enzoojapa/milscale-efetivo-service) |
| Microsserviço de escalas (Azure SQL) | [milscale-escala-service](https://github.com/enzoojapa/milscale-escala-service) |
| Azure Function | [milscale-function](https://github.com/enzoojapa/milscale-function) |

## Alunos

- Enzo Watanabe de Lima
- João Guilherme Salomão
- João Guilherme Cordeiro
- Rafael Zeni Simião

PUCPR - Engenharia de Software - Arquitetura e Soluções Cloud (2026/2)
