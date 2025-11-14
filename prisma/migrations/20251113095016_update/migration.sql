-- CreateTable
CREATE TABLE "maintenance_recommendations" (
    "id" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "mileage_milestone" INTEGER NOT NULL,
    "service_type_id" TEXT NOT NULL,

    CONSTRAINT "maintenance_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "maintenance_recommendations_model_mileage_milestone_idx" ON "maintenance_recommendations"("model", "mileage_milestone");

-- AddForeignKey
ALTER TABLE "maintenance_recommendations" ADD CONSTRAINT "maintenance_recommendations_service_type_id_fkey" FOREIGN KEY ("service_type_id") REFERENCES "service_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
