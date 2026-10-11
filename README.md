# Doçuras da Lara

Aplicação web para organizar a operação da confeitaria. O projeto está iniciando a fundação técnica; os módulos de domínio entram em etapas.

## Diagnóstico e decisões da fundação

- O catálogo original permanece em HTML/CSS/JS, preservado em `index.html`, `posts.html` e arquivos relacionados.
- A aplicação de gestão usa Next.js App Router, TypeScript estrito, Tailwind CSS 4 e Supabase.
- A hospedagem-alvo é Vercel; não há projeto Vercel ou Supabase vinculado neste checkout.
- A fundação do banco contém organizações, perfis, associações e funções de autorização; não antecipa as tabelas dos módulos seguintes.
- O acesso é fechado: usuários são criados pela equipe no Supabase Auth e vinculados à organização. Não há cadastro público.
- Datas do banco usam `timestamptz`; valores financeiros serão `numeric` nas migrations dos módulos financeiros.
- A mídia é privada no bucket `business-media`, com o UUID da organização como primeiro diretório.

## Requisitos

- Node.js 20.9 ou superior
- npm
- Projeto Supabase

## Executar localmente

```powershell
npm install
Copy-Item .env.example .env.local
```

Preencha `.env.local` com a URL do projeto Supabase e a chave pública `anon`/publishable. Não use `service_role` no navegador ou no arquivo público.

```powershell
npm run dev
```

Abra `http://localhost:3000`. Sem as variáveis Supabase, a página de configuração explica o que falta e o catálogo permanece em `/catalogo/index.html`.

## Supabase e primeiro administrador

1. Crie um projeto Supabase e configure `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2. Aplique as migrations versionadas em `supabase/migrations` pelo Supabase CLI (`supabase link` e `supabase db push`) ou pelo SQL Editor.
3. Crie o primeiro usuário em **Authentication > Users** com o e-mail da equipe. A inscrição pública não é utilizada.
4. No SQL Editor, substitua o e-mail e execute o provisionamento inicial:

```sql
do $$
declare
  target_user_id uuid;
  target_org_id uuid;
begin
  select id into target_user_id
  from auth.users
  where email = 'admin@seudominio.com';

  if target_user_id is null then
    raise exception 'Crie o usuário no Supabase Auth antes do provisionamento.';
  end if;

  insert into public.organizations (name, created_by)
  values ('Doçuras da Lara', target_user_id)
  returning id into target_org_id;

  insert into public.profiles (user_id, full_name)
  values (target_user_id, 'Administrador')
  on conflict (user_id) do nothing;

  insert into public.organization_memberships (organization_id, user_id, role, created_by)
  values (target_org_id, target_user_id, 'admin', target_user_id)
  on conflict (organization_id, user_id) do nothing;
end $$;
```

Crie os usuários adicionais no Auth e insira seus registros em `profiles` e `organization_memberships` pelo fluxo administrativo quando esse módulo estiver disponível. Papéis aceitos: `admin` e `operation`.

## Estrutura

```text
src/
  app/                 Rotas App Router e layouts
  components/          Interface compartilhada e autenticação
  lib/auth/            Sessão e validação de acesso
  lib/supabase/        Clientes browser/server e refresh de sessão
  types/               Tipos do banco
supabase/migrations/   Schema e RLS versionados
public/catalogo/       Cópia publicável do catálogo existente
```

## Roadmap

1. Fundação: layout, autenticação, organização, perfis, RLS e deploy.
2. Categorias, insumos, fornecedores, produtos e fichas técnicas.
3. Clientes, encomendas, agenda, entregas/retiradas e pagamentos.
4. Produção, compras, estoque essencial e despesas.
5. Indicadores, análises e rentabilidade.

## Vercel

Importe o repositório na Vercel, mantenha os valores padrão do framework Next.js e adicione as mesmas variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` nos ambientes necessários. Aplique migrations antes de liberar o ambiente. Não há projeto Vercel vinculado a este repositório neste momento.

## Comandos

- `npm run dev`: desenvolvimento local
- `npm run lint`: ESLint
- `npm run typecheck`: TypeScript sem emissão
- `npm run build`: build Next.js para produção
- `npm run build:stories`: ferramentas preexistentes de geração do catálogo social
