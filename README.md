# Ninho | Controle financeiro familiar

Aplicacao Angular standalone para acompanhar o caixa familiar, despesas, orcamento 50/30/20 e metas compartilhadas. O backend em Java/Spring Boot expoe uma API REST e persiste os dados em tabelas PostgreSQL. O Angular mantem cache local para uso durante indisponibilidade da API e sincroniza as alteracoes quando o backend esta ativo.

## Organizacao de estilos

Os estilos globais seguem uma estrutura modular inspirada na organizacao do Bootstrap:

- `src/scss/abstracts/`: tokens de tema e variaveis compartilhadas.
- `src/scss/base/`: reset e tipografia global.
- `src/scss/layout/`: containers, linhas e colunas reutilizaveis.
- `src/scss/components/`: estilos base de botoes e superficies.
- `src/app/app.component.scss`: apresentacao e responsividade especificas do dashboard.
- `src/scss/main.scss`: ponto unico que importa os parciais globais; `src/styles.scss` apenas o referencia.

## Executar localmente

Inicie PostgreSQL e a API na raiz do projeto:

```bash
docker compose up --build
```

O banco fica disponivel em `localhost:5432` e a API em `http://localhost:8080/api/finance`. Para executar somente a API fora do Docker, entre em `backend/` e rode `mvn spring-boot:run` com PostgreSQL disponivel. As variaveis `DATABASE_URL`, `DATABASE_USER` e `DATABASE_PASSWORD` podem sobrescrever a conexao.

Em outro terminal, inicie o frontend:

```bash
npm install
npm start
```

Acesse `http://localhost:4200/` no navegador. O endpoint `GET /api/finance` carrega o estado financeiro e `PUT /api/finance` substitui o estado de forma transacional. Dados legados do `localStorage` sao enviados ao backend se o banco ainda estiver vazio.

O acesso ainda nao tem autenticacao: a API representa uma familia compartilhada e nao deve ser exposta publicamente sem implementar login e autorizacao.

## Build

```bash
npm run build
```
