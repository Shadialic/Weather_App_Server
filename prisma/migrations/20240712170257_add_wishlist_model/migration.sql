-- CreateTable
CREATE TABLE "Wishlist" (
    "id" SERIAL NOT NULL,
    "place" TEXT NOT NULL,
    "temperature" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "humidity" TEXT NOT NULL,

    CONSTRAINT "Wishlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Wishlist_place_key" ON "Wishlist"("place");
