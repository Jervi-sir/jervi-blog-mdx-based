-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "bodyMarkdown" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "thumbnailUrl" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogComment" (
    "id" TEXT NOT NULL,
    "postSlug" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "showEmail" BOOLEAN NOT NULL DEFAULT false,
    "content" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT true,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogComment_pkey" PRIMARY KEY ("id")
);

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
    "postSlug" TEXT NOT NULL,
    "ip" TEXT,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogComment_postSlug_createdAt_idx" ON "BlogComment"("postSlug", "createdAt");

-- CreateIndex
CREATE INDEX "BlogView_postSlug_createdAt_idx" ON "BlogView"("postSlug", "createdAt");

-- CreateIndex
CREATE INDEX "BlogView_postSlug_ipHash_createdAt_idx" ON "BlogView"("postSlug", "ipHash", "createdAt");

-- AddForeignKey
ALTER TABLE "BlogComment" ADD CONSTRAINT "BlogComment_postSlug_fkey" FOREIGN KEY ("postSlug") REFERENCES "BlogPost"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogStat" ADD CONSTRAINT "BlogStat_slug_fkey" FOREIGN KEY ("slug") REFERENCES "BlogPost"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogView" ADD CONSTRAINT "BlogView_postSlug_fkey" FOREIGN KEY ("postSlug") REFERENCES "BlogPost"("slug") ON DELETE CASCADE ON UPDATE CASCADE;
