-- CreateTable
CREATE TABLE "TeamNumber" (
    "id" TEXT NOT NULL,
    "teamNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamNumber_pkey" PRIMARY KEY ("id")
);
