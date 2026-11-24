# WattIQ

**Energia medida. Inteligência aplicada.**

Plataforma de monitoramento e inteligência energética para empresas. A aplicação
calcula os indicadores de forma determinística; a IA interpreta os resultados
disponíveis e aponta onde investigar. Dados de mercado (EPE) são apresentados
sempre separados dos dados da própria empresa.

Site em produção: <https://watt-iq-engine.onrender.com>

## O que tem aqui

- **Landing** com hero fixo e parallax, texto que acende palavra por palavra,
  contadores animados, carrossel de cenários reais, método com trilho de rolagem
  e rodapé com marca gigante.
- **Login** com e-mail (verificação por código OTP) e Google OAuth.
- **Planejar** (`/planejar`): cadastro do contexto da empresa e busca de localização.
- **WattIQ Intelligence**: chat com IA (Gemini) sobre os indicadores calculados.
- **Dashboard** orientado a dados: consumo, custo, setores, equipamentos, variação
  e CO₂ estimado.

## Stack

| Camada | Tecnologia |
| --- | --- |
| Framework | TanStack Start + TanStack Router (React 19) |
| Estilo | Tailwind CSS v4, Radix UI, CSS próprio (`src/styles.css`) |
| Banco | PostgreSQL (`pg`) |
| IA | Google Gemini (`@google/genai`) |
| Login | Google OAuth + OTP por e-mail (Brevo) |
| Build / deploy | Vite + Nitro, hospedado no Render |

## Estrutura

```
src/
  routes/            páginas e endpoints (auth.*, api/*, planejar, index)
  components/
    landing/         Hero, Sections, ShowcaseSection, SiteChrome, primitives
    auth/            verificação de código
    location/        busca de localização
  hooks/             reveal, tilt, parallax, scroll suave
  lib/               db, sessão, OTP, e-mail, Google, utilitários
docs/                especificação (MASTER_PROMPT.md) e notas
```

## Rodando localmente

```bash
npm install
cp .env.example .env   # preencha as variáveis abaixo
npm run dev            # http://localhost:3000
npm run build && npm start
```

### Variáveis de ambiente

| Variável | Uso |
| --- | --- |
| `DATABASE_URL` | conexão PostgreSQL |
| `SESSION_SECRET` | assinatura da sessão |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | login com Google |
| `AUTH_REDIRECT_URL` | URL de retorno do OAuth |
| `GEMINI_API_KEY` | WattIQ Intelligence |
| `BREVO_API_KEY` | envio do código OTP por e-mail |
| `DB_INIT_SECRET` | protege a rota de inicialização do banco |
| `GOOGLE_SEARCH_API_KEY` / `GOOGLE_SEARCH_CX` | busca de localização |

Nunca faça commit de chaves. Use o painel do Render para as variáveis de produção.

## Deploy

O Render faz deploy automático a cada commit na `main`
(`npm install && npm run build`, start com `npm start`).

## Princípios do produto

- Não existe consumo ideal universal: eficiência é avaliada no contexto da operação.
- Cálculos determinísticos na aplicação; a IA só interpreta resultados.
- Referências de mercado nunca são apresentadas como resultado de clientes.
- Fotos de apoio: Unsplash. Dados públicos: EPE.

A especificação completa do produto está em [`docs/MASTER_PROMPT.md`](docs/MASTER_PROMPT.md).
