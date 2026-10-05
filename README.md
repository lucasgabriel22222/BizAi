# ClinicaPro — SaaS de Gestão para Profissionais de Saúde

Sistema web moderno para psicólogos e profissionais de saúde gerenciarem pacientes, consultas, agenda e finanças. Design premium com gradientes azul/roxo, glassmorphism e dark mode.

## Funcionalidades

- **Autenticação** — Login, cadastro e recuperação de senha (JWT + bcrypt)
- **Dashboard** — Métricas em tempo real, cards animados e gráficos de ganhos
- **Agenda** — Calendário estilo Google Calendar com horários livres, pausas e consultas
- **Agendamento online** — Página pública para pacientes (`/agendar/seu-slug`)
- **Pacientes** — CRUD completo com busca, histórico e totais
- **Financeiro** — Relatórios, filtros por período e gráficos (linha, barras, pizza)
- **Histórico** — Consultas com filtros por status e período
- **Configurações** — Perfil, horários, valores padrão, notificações e tema
- **Notificações** — Consultas marcadas, canceladas e lembretes

## Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend | Next.js 15, React 19, TypeScript |
| Estilo | TailwindCSS, Framer Motion |
| Backend | Next.js API Routes (Node.js) |
| Banco | PostgreSQL + Prisma ORM |
| Auth | JWT (jose) + cookies httpOnly |
| Gráficos | Recharts |
| Validação | Zod |

## Pré-requisitos

- Node.js 18+
- PostgreSQL (local ou [Supabase](https://supabase.com))

## Instalação

### 1. Clonar e instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/clinica_saas"
JWT_SECRET="sua-chave-secreta-com-pelo-menos-32-caracteres"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Supabase (este projeto):**

- URL: `https://wyhsymczapiykpksvqpb.supabase.co`
- No `.env`, troque `SUA_SENHA_DO_BANCO` pela senha em **Project Settings → Database**
- Ou rode o script (PowerShell):

```powershell
.\scripts\setup-supabase.ps1 -Password "sua-senha-do-banco"
```

### 3. Criar banco e popular dados demo

```bash
npx prisma db push
npm run db:seed
```

### 4. Iniciar desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

### Credenciais demo

| Campo | Valor |
|-------|-------|
| Email | `demo@clinica.com` |
| Senha | `123456` |

### Link de agendamento demo

`http://localhost:3000/agendar/ana-silva`

## Estrutura do projeto

```
src/
├── app/
│   ├── (auth)/          # Login, registro, recuperação
│   ├── (dashboard)/     # Área autenticada
│   ├── agendar/[slug]/  # Agendamento público
│   └── api/             # REST API
├── components/
│   ├── ui/              # Componentes base
│   ├── layout/          # Sidebar, header
│   ├── dashboard/       # Cards e gráficos
│   ├── agenda/          # Calendário
│   ├── patients/        # Pacientes
│   ├── finance/         # Financeiro
│   ├── booking/         # Agendamento online
│   └── settings/        # Configurações
└── lib/
    ├── auth.ts          # JWT e sessão
    ├── prisma.ts        # Cliente Prisma
    ├── stats.ts         # Métricas do dashboard
    └── validators.ts    # Zod + validação CPF
prisma/
├── schema.prisma        # Modelo do banco
└── seed.ts              # Dados de demonstração
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run db:push` | Sincronizar schema com o banco |
| `npm run db:seed` | Popular dados demo |
| `npm run db:studio` | Interface visual do Prisma |

## Segurança

- Senhas com bcrypt (12 rounds)
- JWT em cookie httpOnly
- Middleware protegendo rotas privadas
- Validação de CPF e sanitização com Zod
- Rotas de API autenticadas por sessão

## Adaptação para outras áreas

Altere o campo `specialty` do usuário e textos da interface. O modelo é genérico (pacientes, consultas, horários) e serve para odontologia, nutrição, fisioterapia e clínicas em geral.

## Produção

```bash
npm run build
npm start
```

Configure `DATABASE_URL`, `JWT_SECRET` e `NEXT_PUBLIC_APP_URL` no ambiente de produção (Vercel, Railway, etc.).

## Licença

MIT
