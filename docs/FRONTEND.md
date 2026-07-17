# Frontend

Esse documento explica como o frontend do OniBus Express está organizado.

## Onde o frontend vive

- `src/app/**/page.tsx`: as rotas do App Router. Ficam finas, são Server Components que só leem `params`/`searchParams` e passam pra um Client Component em `src/components`. Não tem lógica de UI nas páginas.
- `src/components/**`: os componentes de UI (Client Components), onde de fato mora a interatividade, os formulários e as chamadas de dados.
- `src/lib/**`: o cliente HTTP (`api-client.ts`), os hooks de dados (`queries.ts`), os tipos das respostas da API (`types.ts`) e formatação (`format.ts`).
- `src/domain/cpf.ts`: reaproveitado no frontend pra validar CPF no cliente sem duplicar a regra, já que é uma função pura, sem depender de nada do servidor.

## Telas e arquivos

| Tela | Página | Componente principal |
| --- | --- | --- |
| 1. Busca de passagens | `app/page.tsx` | `components/search-form.tsx` + `components/trip-list.tsx` |
| 2. Seleção de assento | `app/viagens/[id]/page.tsx` | `components/trip-seat-selection.tsx` + `components/seat-map.tsx` |
| 3. Dados do passageiro e confirmação | `app/viagens/[id]/passageiro/page.tsx` + `app/reservas/sucesso/[codigo]/page.tsx` | `components/passenger-checkout.tsx` + `components/passenger-form.tsx` |
| 4. Consulta de reserva (bônus) | `app/reservas/consulta/page.tsx` | `components/reservation-lookup.tsx` |
| 5. Criar conta (bônus) | `app/criar-conta/page.tsx` | `components/register-form.tsx` |
| 6. Login por e-mail/senha (bônus) | `app/entrar/page.tsx` | `components/login-form.tsx` |
| 7. Minhas reservas (bônus) | `app/minhas-reservas/page.tsx` | `components/my-reservations.tsx` |

A navegação entre as telas 2 e 3 usa a própria URL (`/viagens/{id}/passageiro?assento=5`), então o assento escolhido sobrevive a um refresh de página sem precisar de um estado global (Redux/Zustand/Context) pra isso.

## Dados do servidor: React Query

Todo acesso a dados do backend passa por dois arquivos:

- `src/lib/api-client.ts`: funções `fetch` puras, uma por endpoint, que lançam `ApiError` quando a resposta não é OK.
- `src/lib/queries.ts`: hooks (`useRoutes`, `useTripSearch`, `useTripDetails`, `useReservationByCode`, `useCreateReservation`, `useCancelReservation`, `useCurrentUser`, `useRegister`, `useLogin`, `useLogout`, `useMyReservations`) que envolvem essas funções com `useQuery`/`useMutation`.

Os componentes nunca chamam `fetch` direto, sempre usam um hook de `queries.ts`. Assim toda a estratégia de cache fica concentrada em um lugar só.

### Chaves de cache

```ts
queryKeys.routes                  // ["routes"]
queryKeys.trips(filters)          // ["trips", { origin, destination, date }]
queryKeys.trip(tripId)            // ["trip", tripId]
queryKeys.reservation(code)       // ["reservation", code]
queryKeys.currentUser             // ["currentUser"]
queryKeys.myReservations          // ["myReservations"]
```

### Invalidação

Depois de criar uma reserva, `useCreateReservation` invalida `queryKeys.trip(tripId)` (o mapa de assentos daquela viagem mudou), todas as buscas (`["trips"]`, já que a contagem de vagas também muda) e `queryKeys.myReservations` (a reserva nova deve aparecer em "Minhas reservas" se o passageiro estiver logado). Depois de cancelar, `useCancelReservation` invalida `queryKeys.reservation(code)`, `queryKeys.myReservations` e também `queryKeys.trip(tripId)` mais `["trips"]`, senão o assento cancelado continua aparecendo como ocupado até um refresh.

### Cadastro, login e sessão

O fluxo fica em duas telas: `/criar-conta` (`register-form.tsx`) pede nome, CPF, data de nascimento, e-mail, senha e confirmação de senha uma vez só. `/entrar` (`login-form.tsx`) passa a pedir só e-mail e senha. Depois do cadastro, esses dados já ficam salvos na conta, então o passageiro não precisa redigitá-los nas próximas compras.

`useCurrentUser` busca `GET /api/auth/me`, que sempre responde `200` com `{ user: UserDto | null }`. Ele nunca lança erro por "não estar logado", então qualquer componente pode chamar o hook sem tratar um caso de erro à parte. O `SiteHeader` usa esse hook pra alternar entre o link "Entrar" e o nome do usuário com "Sair". `useRegister`, `useLogin` e `useLogout` atualizam direto o cache de `queryKeys.currentUser` no `onSuccess`, então a UI já reflete o novo estado de sessão sem esperar um refetch.

O formulário de passageiro (`passenger-form.tsx`) lê o usuário logado direto do cache do React Query (`queryClient.getQueryData`), só pra preencher nome, CPF e e-mail como valor inicial do formulário. Isso evita usar `useEffect` pra sincronizar estado, o que geraria uma renderização em cascata, e mantém os campos editáveis normalmente.

### Optimistic updates

Duas mutações usam `onMutate`/`onError`/`onSettled` pra atualizar a UI antes da resposta do servidor chegar, com rollback se der erro:

- **Reservar assento** (`useCreateReservation`): o assento escolhido é adicionado a `occupiedSeats` no cache do mapa de assentos assim que o formulário é enviado. Se a API rejeitar (por exemplo, alguém reservou o mesmo assento um instante antes), o cache volta ao estado anterior e o mapa libera o assento de novo.
- **Cancelar reserva** (`useCancelReservation`): o status da reserva já aparece como `CANCELLED` na tela de consulta antes da resposta da API confirmar, com o mesmo rollback em caso de erro.

## Formulários e validação

Os formulários (`search-form.tsx`, `passenger-form.tsx`, `register-form.tsx`, `login-form.tsx`) usam estado local do React (`useState`), sem biblioteca de formulários, dado o tamanho do projeto. A validação roda no `onSubmit`, antes de chamar a mutação, espelhando as mesmas regras do backend:

- Nome: mínimo de 3 caracteres.
- CPF: `isValidCpf`, a mesma função usada no backend, importada de `src/domain/cpf.ts`.
- E-mail: regex simples de formato.
- Data de nascimento: obrigatória e não pode estar no futuro.
- Senha: mínimo de 8 caracteres, e a confirmação precisa ser idêntica à senha.

Erros de validação de campo aparecem inline, abaixo do input. Erros que vêm da API (uma regra de negócio violada, tipo assento ocupado) aparecem como toast (`react-hot-toast`), já que não são erro de um campo específico.

## Feedback visual e estados

- **Loading:** os botões usam a prop `isLoading` do componente `ui/button.tsx`, que desabilita o botão e troca o texto pra "Carregando...". A lista de viagens mostra "Buscando viagens..." enquanto a busca está rodando.
- **Vazio:** a lista de viagens mostra "Nenhuma viagem encontrada para esta busca." quando não há resultado.
- **Erro:** toast pra erros de mutação (reservar/cancelar) e mensagem inline pra erros de busca (tipo reserva não encontrada).

## Testes de componente

Os testes usam Testing Library e simulam o comportamento do usuário (preencher, clicar, ver o resultado), não detalhes de implementação:

- `search-form.test.tsx`: preenche origem, destino e data, confirma que `onSearch` é chamado com os valores certos, e garante que campos obrigatórios vazios não submetem.
- `seat-map.test.tsx`: clicar num assento livre chama `onSelectSeat`; um assento ocupado fica `disabled` e não dispara o callback.
- `passenger-form.test.tsx`: submissão vazia mostra os três erros de validação; CPF inválido bloqueia o envio mesmo com os outros campos certos; dados válidos chamam a API e `onSuccess` com o código retornado.
- `reservation-lookup.test.tsx`: busca por código exibe os detalhes da reserva; cancelar atualiza o status na tela (cobrindo o optimistic update).
- `login-form.test.tsx`: submissão vazia mostra os erros de e-mail/senha; login válido chama a API e redireciona.
- `register-form.test.tsx`: submissão vazia mostra os erros de validação; senha e confirmação diferentes bloqueiam o envio; cadastro válido chama a API e redireciona.
- `my-reservations.test.tsx`: visitante sem sessão vê convite pra logar; usuário logado vê a lista de reservas ou o estado vazio.

As chamadas de API são sempre mockadas via `jest.mock("@/lib/api-client")`, então os testes de componente não dependem de rede nem de banco de dados. Nos componentes que usam hooks de `queries.ts`, os testes envolvem o componente num `QueryClientProvider` de teste (`src/test/render-with-query-client.tsx`).

```bash
npm test -- src/components
```

## Adicionando uma nova tela

1. Crie a página em `src/app/.../page.tsx` como Server Component, lendo só `params`/`searchParams`.
2. Crie o Client Component correspondente em `src/components`, com a lógica de UI e os hooks de `src/lib/queries.ts`.
3. Se precisar de um endpoint novo, adicione a função em `api-client.ts`, o tipo de resposta em `types.ts` e o hook em `queries.ts`.
4. Escreva um teste de comportamento do componente, mockando `@/lib/api-client`.
