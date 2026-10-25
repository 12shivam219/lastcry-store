-- LastCry Initial Database Migration (0001_initial_schema)
-- Dialect: PostgreSQL
-- Enforces decimal-safe INR monetary columns, foreign key constraints, unique indexes, and soft archival timestamps.

CREATE TYPE "RoleType" AS ENUM ('CUSTOMER', 'ADMIN', 'OPERATIONS_MANAGER', 'CONTENT_REVIEWER', 'FINANCE_AUDITOR');
CREATE TYPE "ReviewStatus" AS ENUM ('DRAFT', 'PENDING_CULTURAL_REVIEW', 'REVIEWED_VERIFIED', 'ARCHIVED');
CREATE TYPE "PublicationStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'UNPUBLISHED', 'ARCHIVED');
CREATE TYPE "ItemDesignation" AS ENUM ('ESSENTIAL', 'OPTIONAL', 'REGION_DEPENDENT');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING_PAYMENT', 'PAYMENT_FAILED', 'CONFIRMED', 'PROCESSING', 'READY_FOR_DISPATCH', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUND_PENDING', 'REFUNDED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'AUTHORIZED', 'PAID', 'FAILED', 'REFUND_PENDING', 'PARTIALLY_REFUNDED', 'REFUNDED');
CREATE TYPE "FulfilmentStatus" AS ENUM ('UNFULFILLED', 'RESERVED', 'PREPARING', 'READY_FOR_DISPATCH', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'RETURNED');

CREATE TABLE "Role" (
  "id" TEXT PRIMARY KEY,
  "name" "RoleType" NOT NULL UNIQUE,
  "permissions" TEXT[] NOT NULL,
  "description" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "phone" TEXT UNIQUE,
  "fullName" TEXT NOT NULL,
  "passwordHash" TEXT,
  "roleId" TEXT NOT NULL REFERENCES "Role"("id"),
  "deletionRequestedAt" TIMESTAMP(3),
  "archivedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Category" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "description" TEXT NOT NULL,
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  "publicationStatus" "PublicationStatus" NOT NULL DEFAULT 'PUBLISHED',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Supplier" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL UNIQUE,
  "legalBusinessName" TEXT NOT NULL,
  "gstin" TEXT,
  "contactPerson" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "fulfilmentRegions" TEXT[] NOT NULL,
  "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING_VERIFICATION',
  "dispatchSlaHours" INTEGER NOT NULL DEFAULT 24,
  "onTimeRatePercent" DECIMAL(5,2),
  "operationalNotes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Product" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "sku" TEXT NOT NULL UNIQUE,
  "shortDescription" TEXT NOT NULL,
  "fullDescription" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL REFERENCES "Category"("id"),
  "supplierId" TEXT NOT NULL REFERENCES "Supplier"("id"),
  "currencyCode" TEXT NOT NULL DEFAULT 'INR',
  "sellingPriceInr" DECIMAL(12,2) NOT NULL,
  "mrpInr" DECIMAL(12,2) NOT NULL,
  "costPriceInr" DECIMAL(12,2) NOT NULL,
  "gstPercent" DECIMAL(5,2) NOT NULL DEFAULT 5.00,
  "hsnCode" TEXT,
  "weightGrams" INTEGER NOT NULL DEFAULT 500,
  "dimensionsCm" TEXT NOT NULL,
  "materials" TEXT,
  "traditionNotes" TEXT,
  "designation" "ItemDesignation" NOT NULL DEFAULT 'ESSENTIAL',
  "estimatedDispatch" TEXT NOT NULL,
  "returnEligibility" TEXT NOT NULL,
  "complianceVerified" BOOLEAN NOT NULL DEFAULT true,
  "isSampleData" BOOLEAN NOT NULL DEFAULT true,
  "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'REVIEWED_VERIFIED',
  "reviewedBy" TEXT,
  "publicationStatus" "PublicationStatus" NOT NULL DEFAULT 'PUBLISHED',
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  "archivedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Order" (
  "id" TEXT PRIMARY KEY,
  "orderNumber" TEXT NOT NULL UNIQUE,
  "userId" TEXT REFERENCES "User"("id"),
  "customerName" TEXT NOT NULL,
  "customerEmail" TEXT NOT NULL,
  "customerPhone" TEXT NOT NULL,
  "shippingLine1" TEXT NOT NULL,
  "shippingLine2" TEXT,
  "shippingCity" TEXT NOT NULL,
  "shippingState" TEXT NOT NULL,
  "shippingPinCode" TEXT NOT NULL,
  "deliveryInstructions" TEXT,
  "deliveryMethod" TEXT NOT NULL,
  "currencyCode" TEXT NOT NULL DEFAULT 'INR',
  "subtotalInr" DECIMAL(12,2) NOT NULL,
  "taxInr" DECIMAL(12,2) NOT NULL,
  "deliveryFeeInr" DECIMAL(12,2) NOT NULL,
  "discountInr" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  "totalInr" DECIMAL(12,2) NOT NULL,
  "couponCode" TEXT,
  "orderStatus" "OrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
  "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "fulfilmentStatus" "FulfilmentStatus" NOT NULL DEFAULT 'UNFULFILLED',
  "internalNotes" TEXT,
  "isSampleData" BOOLEAN NOT NULL DEFAULT false,
  "archivedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "AuditLog" (
  "id" TEXT PRIMARY KEY,
  "actorUserId" TEXT REFERENCES "User"("id"),
  "actorEmail" TEXT NOT NULL,
  "actorRole" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
