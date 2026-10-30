# Amareli — Doces artesanais

Loja virtual com catálogo público, carrinho salvo no navegador, caixinhas personalizadas e pedidos encaminhados para o WhatsApp. A arquitetura usa Next.js App Router, TypeScript, Tailwind CSS, Prisma/PostgreSQL, Zod e Better Auth.

## Arquitetura

- `src/app`: página pública, metadados e rotas de API.
- `src/features/store`: catálogo, componentes da loja, validação e regra de montagem do pedido.
- `src/lib`: cliente Prisma, Better Auth, autorização administrativa e formatação monetária.
- `src/features/admin`: login Google e painel de produtos, categorias e configurações comerciais.
- `prisma`: schema, migrações e seed idempotente.
- O navegador guarda apenas identificadores, quantidades e personalizações. A rota `/api/checkout` relê preços e disponibilidade no servidor e prepara o texto codificado do WhatsApp.
- Se o banco ainda não estiver disponível, a vitrine e o pedido usam um catálogo de reserva tipado; a aplicação avisa no log do servidor. Com o banco conectado, o conteúdo do catálogo passa a vir do PostgreSQL.
- Better Auth está ligado ao adaptador Prisma com login Google. O catálogo, carrinho e checkout públicos continuam sem exigir conta. O painel `/admin` e suas APIs exigem uma sessão Google cujo e-mail esteja na lista `ADMIN_EMAILS`.

## Requisitos

- Node.js 20.9 ou mais recente (recomendado Node 22/24).
- npm.
- Docker Desktop para iniciar o PostgreSQL local, ou uma instância PostgreSQL própria.

O Compose publica o PostgreSQL na porta local `5433` (porta `5432` dentro do contêiner) para evitar conflitos com instalações locais de PostgreSQL. A `DATABASE_URL` do `.env` deve usar `localhost:5433`.

## Primeira execução

1. Copie `.env.example` para `.env` e defina `BETTER_AUTH_SECRET` com uma chave aleatória de pelo menos 32 caracteres. Os valores do exemplo para o banco servem apenas para uso local com o `docker-compose.yml` deste projeto.
2. Instale os pacotes:

   ```bash
   npm install
   ```

3. Abra o Docker Desktop e aguarde ele indicar que está em execução.
4. Gere o Prisma Client, inicie o PostgreSQL, aplique a migration, carregue o catálogo e inicie a loja em sequência:

   ```bash
   npm run dev:local
   ```

   Acesse <http://localhost:3001>. O comando para se o Docker ou qualquer etapa do banco falhar.

Para uma instância PostgreSQL já existente, atualize `DATABASE_URL`. Não publique o `.env`.

## Configurações comerciais

`NEXT_PUBLIC_STORE_NAME`, `NEXT_PUBLIC_WHATSAPP_NUMBER` e `NEXT_PUBLIC_MONTHLY_PROMOTION` fornecem valores iniciais para a vitrine. Depois do seed, nome, WhatsApp, promoção e pagamentos ficam em `StoreSettings` e podem ser alterados no painel `/admin`. O telefone deve usar o formato internacional somente com dígitos, por exemplo `5582991140378`.

## Ativar o painel e o login Google

1. No Google Cloud Console, crie um OAuth Client ID do tipo **Aplicativo da Web** e configure a URI de redirecionamento autorizada como `http://localhost:3001/api/auth/callback/google` (a aplicação deve rodar na porta 3001 em desenvolvimento; em produção, use o domínio HTTPS do site seguido de `/api/auth/callback/google`).
2. No `.env`, configure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ADMIN_EMAILS` com os e-mails autorizados, `BETTER_AUTH_URL` e `BETTER_AUTH_TRUSTED_ORIGINS` com as origens usadas no desenvolvimento, além de um `BETTER_AUTH_SECRET` aleatório com pelo menos 32 caracteres.
3. Reinicie `npm run dev`, acesse `/admin/login` e entre com uma conta Google listada em `ADMIN_EMAILS`.

Somente os e-mails explicitamente listados podem criar sessão autenticada pelo Google; as rotas de leitura e alteração do painel verificam novamente a sessão e essa lista no servidor. Para autorizar mais de uma pessoa, separe os e-mails por vírgula. O primeiro seed cria o catálogo e as categorias para que o painel possa administrá-los.

O painel permite cadastrar, editar e remover produtos, controlar preço, categoria, disponibilidade e destaque, gerenciar categorias, alterar o texto da promoção mensal e atualizar os dados comerciais e formas de pagamento. Imagens são informadas por URL nesta versão; upload de arquivos ainda não está implementado. Os pedidos continuam sendo encaminhados ao WhatsApp e não são registrados para consulta no painel.

O checkout oferece retirada. As formas de pagamento informadas são Pix, dinheiro e cartão.

## Verificações

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

`npm run db:migrate` e `npm run db:seed` requerem um PostgreSQL acessível. O banco atual armazena produtos, categorias, configurações e um modelo de pedido preparado para persistência futura; o checkout desta versão encaminha o pedido ao WhatsApp sem gravá-lo como confirmado.
