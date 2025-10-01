-- CreateTable
CREATE TABLE "BlogStat" (
    "slug" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogStat_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "BlogView" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BlogView_slug_createdAt_idx" ON "BlogView"("slug", "createdAt");

-- CreateIndex
CREATE INDEX "BlogView_slug_ipHash_createdAt_idx" ON "BlogView"("slug", "ipHash", "createdAt");
