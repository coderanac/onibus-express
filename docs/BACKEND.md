# Backend

Esse documento explica como o backend do OniBus Express está organizado. Ele vive dentro do mesmo app Next.js, como Route Handlers (`src/app/api/**/route.ts`), mas a lógica de negócio não sabe que o Next existe. Ela fica separada em camadas.

## Camadas

```
src/domain          regras puras, sem depender de Prisma nem de Next.js
src/application     casos de uso: orquestram o domínio e os repositórios (via interfaces)
src/infrastructure   implementações concretas: Prisma, container de dependências
src/app/api          Route Handlers: só HTTP (validação de entrada, status code, resposta)
```

A regra é simples: `domain` não importa nada de fora. `application` importa `domain` e conhece só as interfaces de repositório (`application/ports/*.ts`), nunca o Prisma direto. `infrastructure` implementa essas interfaces. E `app/api` amarra tudo: recebe a requisição, chama o caso de uso passando as dependências do `container.ts` e transforma o resultado (ou erro) numa resposta HTTP.

Com essa separação, dá pra testar os casos de uso com repositórios fake em memória, sem precisar de banco, e testar os repositórios do Prisma isoladamente contra um SQLite de teste.

## Entidades e regras de negócio

- **Route** (`origin`, `destination`, `durationMinutes`): os trajetos disponíveis.
- **Trip** (`route`, `departureAt`, `basePrice`, `totalSeats`): uma viagem específica de uma rota.
- **Reservation** (`code`, `trip`, `seatNumber`, dados do passageiro, `status`, `userId?`): a reserva de um assento.
- **User** (`name`, `cpf`, `email`, `birthDate`, `passwordHash`): a conta criada na tela de cadastro.

As regras ficam em `src/domain/entities.ts` e nos próprios casos de uso:

- Um assento só pode ter uma reserva `CONFIRMED` por viagem (`SeatAlreadyTakenError`).
- Não dá pra reservar uma viagem que já partiu (`TripAlreadyDepartedError`).
- O número do assento tem que estar entre 1 e `totalSeats` (`InvalidSeatNumberError`).
- O CPF é validado com o algoritmo oficial de dígito verificador, em `src/domain/cpf.ts` (`InvalidCpfError`).
- Cancelamento só é permitido até 2 horas antes da partida (`CancellationWindowExpiredError`) e não pode ser feito duas vezes (`ReservationAlreadyCancelledError`).
- O código da reserva sai no formato legível `ABC-12345` (`src/domain/reservation-code.ts`). Se colidir com um código existente, gera outro.
- Pra criar conta é preciso data de nascimento válida no passado (`InvalidBirthDateError`), senha com no mínimo 8 caracteres (`InvalidPasswordError`) e confirmação de senha igual à senha (`PasswordsDoNotMatchError`). CPF e e-mail também precisam ser únicos (`CpfAlreadyRegisteredError` / `EmailAlreadyRegisteredError`).

## Cadastro, login por e-mail/senha e sessão

O cadastro acontece uma única vez, em `POST /api/auth/registrar` (caso de uso `src/application/auth/register-user.ts`), pedindo nome completo, CPF, data de nascimento, e-mail e senha com confirmação. Depois disso, o login usa só e-mail e senha (`POST /api/auth/login`, caso de uso `src/application/auth/login-with-email.ts`). Não precisa redigitar nome, CPF ou e-mail em cada compra, porque esses dados já ficam salvos na conta e são usados pra pré-preencher o formulário do passageiro.

- `src/domain/password.ts` cuida do hash e da verificação de senha com `crypto.scryptSync` (nativo do Node, sem dependência externa) e um salt aleatório por usuário. A senha em texto puro nunca é salva nem devolvida pela API.
- `registerUser` valida nome (mínimo 3 caracteres), CPF, data de nascimento (tem que ser real e estar no passado), confirmação de senha e tamanho mínimo de senha, além de garantir que CPF e e-mail sejam únicos.
- `loginWithEmail` busca o hash da senha pelo e-mail e compara com `verifyPassword`. Se o e-mail não existir ou a senha estiver errada, o erro devolvido é o mesmo genérico (`InvalidCredentialsError`, 401), pra não dar dica de qual dos dois estava errado.
- `PrismaUserRepository` nunca devolve `passwordHash` nos métodos que retornam `User` (o mapeamento remove esse campo explicitamente). O hash só é lido pelo método `findCredentialsByEmail`, usado exclusivamente no login.
- Depois do cadastro ou do login, a API grava o `id` do usuário num cookie `httpOnly` (`src/lib/session.ts`). Esse cookie é a sessão inteira, não tem JWT nem tabela de sessões. É simples de propósito, dado o escopo do desafio.

Quando uma reserva é criada (`POST /api/reservas`), o Route Handler lê esse cookie (`getSessionUserId`) e passa o `userId` pro caso de uso `createReservation`, que grava esse vínculo em `Reservation.userId`. Assim, toda reserva feita por alguém logado fica associada à conta e aparece em `GET /api/minhas-reservas`. Se ninguém estiver logado, `userId` fica `null` e a reserva funciona normalmente, a consulta por código continua funcionando sem login também.

Um detalhe importante: a disponibilidade de assentos não depende de quem está logado. Qualquer reserva `CONFIRMED` bloqueia o assento pra todo mundo, então, ao trocar de conta, os assentos já reservados por outra pessoa aparecem com "X" do mesmo jeito.

## Endpoints

| Método   | Rota                                  | Caso de uso                          | Autenticação                                    |
| -------- | ------------------------------------- | ------------------------------------ | ----------------------------------------------- |
| `GET`    | `/api/rotas`                          | `listRoutes`                         | não                                             |
| `GET`    | `/api/viagens?origem=&destino=&data=` | `searchTrips`                        | não                                             |
| `GET`    | `/api/viagens/{id}`                   | `getTripDetails`                     | não                                             |
| `POST`   | `/api/reservas`                       | `createReservation`                  | opcional (associa ao usuário logado, se houver) |
| `GET`    | `/api/reservas/{codigo}`              | `getReservation`                     | não                                             |
| `DELETE` | `/api/reservas/{codigo}`              | `cancelReservation`                  | não                                             |
| `POST`   | `/api/auth/registrar`                 | `registerUser`                       | cria a conta e a sessão                         |
| `POST`   | `/api/auth/login`                     | `loginWithEmail`                     | cria a sessão                                   |
| `POST`   | `/api/auth/logout`                    | -                                    | encerra a sessão                                |
| `GET`    | `/api/auth/me`                        | -                                    | lê a sessão atual                               |
| `GET`    | `/api/minhas-reservas`                | `reservationRepository.findByUserId` | obrigatória (401 sem sessão)                    |

A validação de entrada é feita com Zod (`src/lib/schemas.ts`). Erros de domínio (`DomainError`) e de validação são convertidos em respostas HTTP em `src/lib/http.ts` (`handleApiError`).

## Banco de dados

SQLite via Prisma (`prisma/schema.prisma`), com os modelos `Route`, `Trip`, `Reservation` e `User`. `Reservation.userId` é opcional (`String?`) pra manter compatibilidade com reservas feitas sem login.

```bash
npm run db:migrate   # cria/atualiza o schema (dev)
npm run db:seed      # popula rotas e viagens de exemplo (idempotente)
```

## Testes

- **Domínio** (`src/domain/*.test.ts`): funções puras, sem mock.
- **Casos de uso** (`src/application/**/*.test.ts`): repositórios fake em memória, cobrindo os caminhos felizes e cada erro de negócio.
- **Integração** (`src/infrastructure/**/*.integration.test.ts`): Prisma real contra um SQLite dedicado a testes, criado e destruído em `beforeAll`/`afterAll`.

```bash
npm test -- src/domain src/application
npm test -- src/infrastructure
```

## Adicionando um novo endpoint

1. Defina a regra de negócio em `src/domain` (se for uma regra pura) ou direto no caso de uso.
2. Crie o caso de uso em `src/application/<contexto>/<acao>.ts`, recebendo os repositórios como parâmetro. Nunca importe o Prisma direto aqui.
3. Se precisar de uma operação de banco nova, adicione o método na interface em `application/ports/*-repository.ts` e implemente em `infrastructure/repositories/prisma-*-repository.ts`.
4. Crie o Route Handler em `src/app/api/.../route.ts`: valide a entrada com Zod, chame o caso de uso com as dependências de `infrastructure/container.ts` e devolva a resposta ou `handleApiError(error)`.
5. Escreva o teste do caso de uso com um repositório fake.
