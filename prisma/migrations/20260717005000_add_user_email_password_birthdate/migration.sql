/*
  Warnings:

  - Added the required columns `birthDate`, `email` and `passwordHash` to the `User` table.
  - The login flow changed from "nome + CPF" to "e-mail + senha", so existing dev/seed accounts
    (created under the old flow, without email/senha/data de nascimento) are removed here.
    Their reservations are kept, just detached from the account (`Reservation.userId` becomes NULL).

*/
-- Detach reservations from accounts that will be removed
UPDATE "Reservation" SET "userId" = NULL WHERE "userId" IS NOT NULL;

-- Remove accounts created under the old CPF-only login flow
DELETE FROM "User";

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "birthDate" DATETIME NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("cpf", "createdAt", "id", "name") SELECT "cpf", "createdAt", "id", "name" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_cpf_key" ON "User"("cpf");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
