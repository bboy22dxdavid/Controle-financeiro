## CONTROLE FINANCEIRO

* Objetivo: cria uma aplicação para controle financeiro famíliar. Que possam gerenciar receitas, despesas, metas de economia e orçamentos de forma colaborativa, "ex: uma viagem em familia" e em tempo real.

* Estrutura dividida em três pilares
  - • Receitas (Entradas): Salário, rendas extras e outras fontes.
  - • Despesas Fixas e Variáveis: Habitação, transporte, saúde, lazer e estilo de vida.
  - • Reserva e Investimentos: Espaço dedicado para você pagar a si mesmo primeiro


# Estrutura Recomendada para o Projeto
  ├── 50% ➔ Necessidades Essenciais (Aluguel, contas, mercado)
  ├── 30% ➔ Desejos Pessoais (Lazer, restaurantes, hobbies)
  └── 20% ➔ Futuro e Segurança (Reserva de emergência, investimentos)

  # Telas
   * na tela de lançamentos 
    - tela com lista de todos as despesas
    - criar filtro por mes
    - deve filtrar pelo usuario tambem 
    - calcular o valor total 


* Requisitos: 
 - Gestão de Perfis Familiares
 - Registro Contábil
 - Planejamento Orçamentário
 - Metas de Economia
 - Relatórios e Dashboards


# 1 . Modelagem do Banco de Dados (PostgreSQL) 
 * Para suportar o gerenciamento colaborativo, a estrutura de tabelas precisa vincular os dados a um grupo familiar central.
  - - Principais Entidades:
    - • GrupoFamiliar: ID, Nome (ex: "Família Silva"), Data de Criação.
    - • Usuario: ID, Nome, Email, Senha (criptografada), Role (ADMIN, MEMBRO),    - GrupoFamiliar_ID.
    - • Lancamento (Registro Contábil): ID, Descricao, Valor, Tipo (RECEITA/DESPESA),     - Data, Categoria, Usuario_ID, GrupoFamiliar_ID.
    - • Orcamento: ID, Categoria, ValorLimite, ValorConsumido, MesAno, GrupoFamiliar_ID.
    - • Meta (ex: "Viagem em Família"): ID, Nome, ValorAlvo, ValorAtual, DataLimite,  - GrupoFamiliar_ID.

# 3. Estruturação do Desenvolvimento (Back-end & Front-end) 
   * Organizado sob a arquitetura de camadas padrão:
    - • controller/: Criação dos endpoints REST (ex: /api/lancamentos, /api/metas).
    - • service/: Regras de negócio (ex: atualizar o ValorAtual da Meta   automaticamente   - quando um membro fizer um lançamento destinado à viagem).
    - • repository/: Interfaces do Spring Data JPA para comunicação com o PostgreSQL.
    - • security/: Implementação de autenticação via JWT (JSON Web Tokens). Toda  - requisição valida o usuário e garante que ele só acesse dados do seu próprio      GrupoFamiliar_ID.
    - • Tempo Real: Utilização de Server-Sent Events (SSE) ou WebSockets do Spring para   - notificar instantaneamente o front-end quando outro membro da família cadastrar uma   - despesa.

# 4 Front-end: Angular + TypeScript 
 * Estrutura modular focada em reusabilidade e estados reativos: 
    - • components/: Componentes visuais isolados (Gráficos, Tabelas de Lançamento, Cards     - de Metas).
    - • services/: Integração com a API Java via HttpClient. Uso de RxJS para escutar os  - eventos em tempo real do back-end.
    - • guards/: Proteção de rotas para garantir que usuários não autenticados não acessem    - os dashboards.
    - • Interface (HTML/CSS): Sugiro utilizar Tailwind CSS ou Angular Material junto ao   - CSS puro para criar dashboards limpos, focados em cartões visuais para as metas   - (como uma barra de progresso para a viagem da família).

    

* Requisitos não funcionais no momento
  - no momento não e necessario anexação de comprovantes.