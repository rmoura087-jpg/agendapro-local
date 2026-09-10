# AgendaPro Local — Vercel/Netlify + Supabase

SaaS de agendamento para barbearias, salões e negócios locais: painel do
estabelecimento, página pública de agendamento para o cliente, autoatendimento
(consultar/cancelar), planos pagos (Stripe) e estrutura pronta para WhatsApp.

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- React Router
- TanStack Query
- Supabase (Auth + PostgreSQL + RLS + RPC + Edge Functions)
- Vercel ou Netlify

## 1. Criar o Supabase

1. Crie um projeto no Supabase.
2. Abra **SQL Editor**.
3. Cole e execute o conteúdo de `supabase/schema.sql`.
4. Em seguida, cole e execute o conteúdo de `supabase/schema_v2_upgrades.sql`
   (planos, limites, autoatendimento do cliente). **A ordem importa.**
5. Em **Project Settings > API**, copie:
   - Project URL
   - anon/public key

Nunca coloque a `service_role` no frontend.

## 2. Configurar localmente

Copie `.env.example` para `.env`:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Depois:

```
npm install
npm run dev
```

## 3. Deploy (Vercel ou Netlify)

### Vercel

1. Suba o projeto para o GitHub.
2. Em vercel.com, **Add New > Project**, selecione o repositório.
3. Framework preset: Vite. Build command: `npm run build`. Output: `dist`.
4. Em **Environment Variables**, adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
5. Deploy.

### Netlify

1. **Add new site > Import an existing project** e selecione o repositório.
2. Build command: `npm run build`. Publish directory: `dist`.
3. Em **Environment variables**, adicione as mesmas duas chaves.

O `netlify.toml` e `public/_redirects` já cuidam do React Router em rotas diretas.

## 4. Primeiro acesso

Abra o site e clique em **Começar grátis**. O trigger do banco cria
automaticamente o perfil e o estabelecimento do dono. Se o Supabase exigir
confirmação de e-mail, confirme antes de entrar.

## 5. Fluxo do produto

**Dono do negócio:** conta → estabelecimento → serviços → profissionais →
horários → compartilha o link público → agendamento aparece na agenda.

**Cliente:** abre `/#/agendar/SEU-SLUG` → escolhe serviço, profissional,
data e horário → confirma com nome e WhatsApp → recebe a confirmação na tela
e pode voltar a `/#/agendar/SEU-SLUG/meus-agendamentos` a qualquer momento
para consultar ou cancelar, buscando pelo próprio número de WhatsApp.

## 6. Planos e cobrança (Stripe)

A página **Planos**, dentro do painel (`/app/planos`), já mostra os três
planos (Grátis, Profissional, Studio) e chama uma Edge Function para abrir o
checkout do Stripe. Para ativar cobranças reais:

1. Crie uma conta no [Stripe](https://stripe.com) e dois produtos recorrentes
   (Profissional e Studio), cada um com um **Price ID**.
2. Instale a CLI do Supabase e faça login (`supabase login`).
3. Configure os secrets do projeto:
   ```
   supabase secrets set STRIPE_SECRET_KEY=sk_live_...
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
   supabase secrets set STRIPE_PRICE_PROFISSIONAL=price_...
   supabase secrets set STRIPE_PRICE_STUDIO=price_...
   supabase secrets set APP_URL=https://seusite.vercel.app
   ```
4. Publique as funções:
   ```
   supabase functions deploy create-checkout-session
   supabase functions deploy stripe-webhook
   ```
5. No painel do Stripe, crie um webhook apontando para a URL da função
   `stripe-webhook` e assine os eventos `checkout.session.completed`,
   `customer.subscription.updated` e `customer.subscription.deleted`.

Sem essa configuração, o botão de assinar mostra um aviso explicando que o
checkout ainda não está ativo — o resto do app continua funcionando
normalmente no plano Grátis.

O plano Grátis já tem limites reais aplicados no banco: 1 profissional e 30
agendamentos por mês (ver `schema_v2_upgrades.sql`).

## 7. WhatsApp

Duas coisas diferentes:

- **Já funciona sem configurar nada:** ao confirmar um agendamento, o cliente
  vê um botão "Falar no WhatsApp" que abre uma conversa direta com o
  estabelecimento.
- **Automação real (opcional):** para enviar confirmações e lembretes
  automáticos, é preciso uma conta WhatsApp Business Cloud API (Meta) com
  número verificado e um template de mensagem aprovado. A função
  `supabase/functions/send-whatsapp` já está pronta para isso — configure
  `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID` e `WHATSAPP_TEMPLATE` como secrets e
  publique com `supabase functions deploy send-whatsapp`. Enquanto isso não
  for configurado, a função responde silenciosamente sem quebrar o
  agendamento.

## 8. Segurança

- Tabelas privadas usam Row Level Security: cada estabelecimento só acessa os
  próprios dados.
- A disponibilidade pública usa uma RPC que não expõe a agenda privada.
- A criação e o cancelamento de agendamentos pelo cliente usam RPCs que
  validam o horário e o telefone no servidor antes de qualquer alteração.

## 9. Próximas evoluções

- lembretes recorrentes por WhatsApp (cron + Edge Function)
- recuperação de clientes inativos
- bloqueios de horário pela interface do dono
- relatórios financeiros avançados
- Pix/sinal no ato do agendamento
- agente de IA no WhatsApp

## Observação

Antes de vender para muitos estabelecimentos, faça testes de concorrência de
agendamento, configure domínio/e-mail, política de privacidade, backups e
monitoramento.
