# AgendaPro Local — Netlify + Supabase

MVP SaaS de agendamento para barbearias e negócios locais.

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- React Router
- TanStack Query
- Supabase Auth + PostgreSQL + RLS + RPC
- Netlify

## 1. Criar o Supabase

1. Crie um projeto no Supabase.
2. Abra **SQL Editor**.
3. Abra o arquivo `supabase/schema.sql` deste projeto.
4. Cole todo o conteúdo no SQL Editor e execute.
5. Em **Project Settings > API**, copie:
   - Project URL
   - anon/public key

Nunca coloque a `service_role` no frontend.

## 2. Configurar localmente

Copie `.env.example` para `.env`:

VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

Depois:

npm install
npm run dev

## 3. Deploy no Netlify

### Opção recomendada: GitHub

1. Crie um repositório no GitHub.
2. Envie todos os arquivos desta pasta.
3. No Netlify, escolha **Add new site > Import an existing project**.
4. Selecione o repositório.
5. Build command: `npm run build`
6. Publish directory: `dist`
7. Em **Site configuration > Environment variables**, crie:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
8. Faça o deploy.

O `netlify.toml` e `public/_redirects` já estão incluídos para o React Router funcionar em rotas diretas.

## 4. Primeiro acesso

Abra o site e clique em **Começar grátis**.

O cadastro envia os dados básicos como metadata do usuário. O trigger do `schema.sql` cria automaticamente o perfil e o estabelecimento.

Se o Supabase exigir confirmação de e-mail, confirme o e-mail antes de entrar.

## 5. Fluxo do MVP

Conta → estabelecimento → serviços → profissionais → horários → página pública → cliente agenda → agendamento aparece na agenda → cliente fica salvo.

Página pública:

`/#/agendar/SEU-SLUG`

## 6. Segurança

As tabelas privadas usam Row Level Security. O estabelecimento só consegue acessar os próprios dados.

A disponibilidade pública usa uma RPC que não expõe a agenda privada.

A criação pública do agendamento usa uma RPC que valida o horário no servidor antes de inserir.

## 7. Próximas evoluções

A base está preparada para:

- confirmação automática por WhatsApp
- lembretes
- recuperação de clientes inativos
- bloqueios de horários pela interface
- relatórios financeiros avançados
- Pix/sinal
- planos pagos
- Mercado Pago/Stripe
- agente de IA no WhatsApp

## Observação

Este ZIP é um MVP funcional para iniciar o projeto. Antes de vender para muitos estabelecimentos, faça testes de concorrência de agendamento, configure domínio/e-mail, política de privacidade, backups e monitoramento.
