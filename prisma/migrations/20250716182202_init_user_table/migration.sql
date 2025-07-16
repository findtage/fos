-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "board" TEXT NOT NULL DEFAULT 'board_whiteorange2',
    "body" TEXT NOT NULL DEFAULT 'body0',
    "body_acc" TEXT NOT NULL DEFAULT 'none',
    "bottom" TEXT NOT NULL DEFAULT 'bottom0',
    "costume" TEXT NOT NULL DEFAULT 'none',
    "eyes" TEXT NOT NULL DEFAULT 'eyes0',
    "face_acc" TEXT NOT NULL DEFAULT 'none',
    "gender" TEXT NOT NULL DEFAULT 'female',
    "hair" TEXT NOT NULL DEFAULT 'hair0',
    "hair_acc" TEXT NOT NULL DEFAULT 'none',
    "head" TEXT NOT NULL DEFAULT 'head0',
    "home" TEXT NOT NULL DEFAULT 'home0',
    "outfit" TEXT NOT NULL DEFAULT 'none',
    "shoes" TEXT NOT NULL DEFAULT 'shoe0',
    "stars" INTEGER NOT NULL DEFAULT 2500,
    "top" TEXT NOT NULL DEFAULT 'top0',
    "idfone_level" INTEGER NOT NULL DEFAULT 0
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
