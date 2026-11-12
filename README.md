# MilScale - Frontend

Essa é a interface do MilScale, feita em React. Ela só conversa com o BFF, passando pelo API Gateway da AWS, e nunca chama os microsserviços direto.

A tela foi dividida em microfrontends que ficam dentro de um shell com o menu lateral. O painel do dia mostra o efetivo, a escala e o ciclo de serviço usando uma única chamada ao `GET /aggregated-data`. A parte de efetivo tem o cadastro dos militares e a troca de situação (apto, missão, afastado). A parte de escalas permite escalar, publicar, remover, pedir e aprovar trocas. E a parte de eventos mostra o que foi publicado no Service Bus. Um microfrontend não importa código do outro, todos usam só a pasta `shared`, onde fica o cliente HTTP, os tipos e alguns componentes comuns, e os testes de arquitetura conferem isso.

Foi feito com React 19, TypeScript e Vite, e os testes rodam com Vitest. O deploy é feito pelo GitHub Actions no GitHub Pages.

Pra rodar localmente é preciso colocar a URL do API Gateway no `.env`:

```bash
npm install
cp .env.example .env
npm run dev
npm test
```

O frontend publicado está em https://enzoojapa.github.io/milscale-frontend/ e o endpoint que ele consome pelo gateway é https://2r51s1kurb.execute-api.us-east-1.amazonaws.com/aggregated-data. O backend está no BFF (https://github.com/enzoojapa/milscale-bff), no serviço de efetivo (https://github.com/enzoojapa/milscale-efetivo-service), no serviço de escalas (https://github.com/enzoojapa/milscale-escala-service) e na Function (https://github.com/enzoojapa/milscale-function).

Trabalho feito por Enzo Watanabe de Lima, João Guilherme Salomão, João Guilherme Cordeiro e Rafael Zeni Simião, para a disciplina de Arquitetura e Soluções Cloud da PUCPR (2026/2).
