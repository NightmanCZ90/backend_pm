-- CreateEnum
CREATE TYPE "Role" AS ENUM ('investor', 'portfolioManager', 'administrator');

-- CreateTable
CREATE TABLE "pgmigrations" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "run_on" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "pgmigrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolios" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "name" VARCHAR(20) NOT NULL,
    "description" VARCHAR(240),
    "color" CHAR(6),
    "url" TEXT,
    "user_id" INTEGER NOT NULL,
    "pm_id" INTEGER,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "portfolios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "stock_name" VARCHAR(20) NOT NULL,
    "stock_sector" VARCHAR(20),
    "transaction_time" TIMESTAMPTZ(6) NOT NULL,
    "transaction_type" VARCHAR(40) NOT NULL,
    "num_shares" DECIMAL NOT NULL,
    "price" DECIMAL NOT NULL,
    "currency" VARCHAR(4) NOT NULL,
    "execution" VARCHAR(20) NOT NULL,
    "commissions" DECIMAL,
    "notes" TEXT,
    "portfolio_id" INTEGER NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "email" VARCHAR(40) NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" VARCHAR(40),
    "last_name" VARCHAR(40),
    "role" "Role" DEFAULT 'investor',
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_pm_id_fkey" FOREIGN KEY ("pm_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "portfolios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
