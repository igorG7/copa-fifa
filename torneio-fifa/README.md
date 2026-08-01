# Torneio FIFA 17 — Grupos & Mata-mata

Ferramenta para o sorteio dos grupos, tabela de classificação e chaveamento
do mata-mata (semifinal, final e disputa de 3º lugar) de um torneio de FIFA
entre 8 amigos.

Stack: **Next.js (App Router) + MongoDB (Atlas)**, tudo comunicando pela
própria camada de API Routes do Next. Design mobile-first com visual de
estádio à noite / placar de jogo.

## Como funciona

1. O admin cadastra os 8 nomes dos jogadores.
2. O admin sorteia os grupos (aleatório) — o app já gera os 6 jogos de cada
   grupo (todos contra todos, turno único).
3. Qualquer pessoa acompanha a tabela; só o admin lança os placares.
4. A tabela é recalculada automaticamente com os critérios de desempate
   usados em Copa do Mundo / Champions League: pontos → confronto direto →
   saldo de gols → gols marcados.
5. Quando todos os jogos de grupo estiverem com placar, o admin gera as
   semifinais (A1 x B2, B1 x A2).
6. No mata-mata, empate no tempo normal libera os campos de prorrogação;
   empate na prorrogação libera os pênaltis. Vencedores e perdedores das
   semis avançam automaticamente para a final e a disputa de 3º lugar.

## Configuração local

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie o arquivo de variáveis de ambiente e preencha os valores:

   ```bash
   cp .env.example .env.local
   ```

   - `MONGODB_URI`: connection string do seu cluster MongoDB Atlas (crie um
     usuário de banco e libere o acesso de rede para `0.0.0.0/0` ou para os
     IPs da Vercel).
   - `MONGODB_DB`: nome do banco (pode deixar `torneio-fifa`).
   - `ADMIN_PASSWORD`: a senha única que só quem administra o torneio deve
     saber.
   - `SESSION_SECRET`: qualquer string longa e aleatória (usada só para
     assinar o cookie de sessão do admin).

3. Rode em desenvolvimento:

   ```bash
   npm run dev
   ```

   Acesse http://localhost:3000.

## Deploy na Vercel

1. Suba este projeto para um repositório no GitHub.
2. Na Vercel, importe o repositório.
3. Em **Environment Variables**, adicione as mesmas 4 variáveis do
   `.env.example` (`MONGODB_URI`, `MONGODB_DB`, `ADMIN_PASSWORD`,
   `SESSION_SECRET`).
4. Deploy. Pronto — o app já é responsivo para celular.

## Estrutura

```
src/
  app/
    page.tsx              Início: cadastro de jogadores + sorteio + status
    login/page.tsx         Login do admin
    grupos/page.tsx        Tabela de classificação + placares
    mata-mata/page.tsx     Semifinal, final e disputa de 3º lugar
    api/                   Rotas de API (players, groups, matches, knockout, auth, reset)
  components/               Componentes de UI (cards de jogo, tabela, navbar...)
  lib/                      Conexão Mongo, autenticação, tipos, cálculo de tabela
  hooks/                    Hook de carregamento dos dados do torneio
```

## Observações

- Só existe um "usuário" (o admin), autenticado por senha única — não há
  cadastro de contas.
- "Reiniciar sorteio e jogos" (na página inicial, visível ao admin) apaga
  grupos, jogos e mata-mata, mas mantém os 8 jogadores cadastrados.
- Editar a lista de jogadores depois do sorteio também zera grupos, jogos e
  mata-mata (já que tudo depende de quem está jogando).
