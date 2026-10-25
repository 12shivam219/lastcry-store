export type RoleType =
  | 'CUSTOMER'
  | 'ADMIN'
  | 'OPERATIONS_MANAGER'
  | 'CONTENT_REVIEWER'
  | 'FINANCE_AUDITOR';

export type ReviewStatus =
  | 'DRAFT'
  | 'PENDING_CULTURAL_REVIEW'
  | 'REVIEWED_VERIFIED'
  | 'ARCHIVED';

export type PublicationStatus = 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED' | 'ARCHIVED';

export type ItemDesignation = 'ESSENTIAL' | 'OPTIONAL' | 'REGION_DEPENDENT';

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_FAILED'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'READY_FOR_DISPATCH'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUND_PENDING'
  | 'REFUNDED';

export type PaymentStatus =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'PAID'
  | 'FAILED'
  | 'REFUND_PENDING'
  | 'PARTIALLY_REFUNDED'
  | 'REFUNDED';

export type FulfilmentStatus =
  | 'UNFULFILLED'
  | 'RESERVED'
  | 'PREPARING'
  | 'READY_FOR_DISPATCH'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

export interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  groupSlug: 'essentials' | 'ritual-kits' | 'memorials' | 'condolence-gifts' | 'services';
  description: string;
  seoTitle: string;
  seoDescription: string;
  publicationStatus: PublicationStatus;
  sortOrder: number;
}

export interface TraditionCollection {
  id: string;
  name: string;
  slug: string;
  shortLabel: string;
  description: string;
  regionalQualificationNote: string;
  reviewerName: string;
  reviewerCredentials: string;
  reviewStatus: ReviewStatus;
  lastReviewedAt: string;
}

export interface SupplierRecord {
  id: string;
  name: string;
  code: string;
  legalBusinessName: string;
  gstin: string;
  contactPerson: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  fulfilmentRegions: string[]; // PIN prefixes e.g. ['400', '411'] or ['ALL_INDIA']
  verificationStatus: 'VERIFIED_CONTRACT' | 'PENDING_VERIFICATION' | 'SUSPENDED';
  dispatchSlaHours: number;
  onTimeRatePercent: number;
  operationalNotes: string;
  isSampleData: boolean;
}

export interface ProductVariantRecord {
  id: string;
  name: string;
  sku: string;
  sellingPriceInr: number;
  mrpInr: number;
  stockQuantity: number;
  attributes: Record<string, string>;
}

export interface ProductRecord {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string;
  fullDescription: string;
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  groupSlug: 'essentials' | 'ritual-kits' | 'memorials' | 'condolence-gifts';
  traditionSlugs: string[];
  images: {
    url: string;
    altText: string;
    isPlaceholder: boolean;
  }[];
  currencyCode: 'INR';
  sellingPriceInr: number;
  mrpInr: number;
  costPriceInr: number; // Server-side / Admin only
  gstPercent: number; // e.g. 0, 5, 12
  hsnCode: string;
  stockQuantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
  stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  weightGrams: number;
  dimensionsCm: string;
  materials: string;
  specifications: Record<string, string>;
  variants: ProductVariantRecord[];
  supplierId: string;
  deliveryEligibility: 'ALL_SUPPORTED_ZONES' | 'METRO_HUBS_ONLY';
  restrictedPinPrefixes?: string[]; // If METRO_HUBS_ONLY, allowed prefixes
  estimatedDispatch: string;
  returnEligibility: string;
  kitContentsSummary?: string[];
  designation: ItemDesignation;
  traditionNotes: string;
  complianceVerified: boolean;
  reviewStatus: ReviewStatus;
  reviewedBy: string;
  lastReviewedAt: string;
  publicationStatus: PublicationStatus;
  seoTitle: string;
  seoDescription: string;
  isSampleData: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RitualKitItemEntry {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  sku: string;
  quantity: number;
  designation: ItemDesignation;
  intendedUseNote: string;
  unitPriceInr: number;
  includedByDefault: boolean; // true for ESSENTIAL items, false for OPTIONAL additions
}

export interface RitualKitRecord {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string;
  fullDescription: string;
  intendedTradition: string;
  traditionSlug: string;
  regionalApplicability: string;
  reviewStatus: ReviewStatus;
  reviewedBy: string;
  reviewerCredentials: string;
  lastReviewedAt: string;
  publicationStatus: PublicationStatus;
  currencyCode: 'INR';
  basePriceInr: number;
  mrpInr: number;
  gstPercent: number;
  imageUrl: string;
  imageAlt: string;
  isPlaceholderImage: boolean;
  estimatedDispatch: string;
  supplierId: string;
  includedItems: RitualKitItemEntry[];
  optionalItems: RitualKitItemEntry[];
  versionNumber: number;
  versionHistory: {
    version: number;
    date: string;
    editor: string;
    note: string;
  }[];
  isSampleData: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryZoneRecord {
  id: string;
  zoneName: string;
  city: string;
  state: string;
  pinCodePrefixes: string[];
  supportedDeliveryModes: ('STANDARD_SURFACE' | 'PRIORITY_LOCAL_COURIER')[];
  standardFeeInr: number;
  freeDeliveryThresholdInr: number;
  dispatchCutoffLocalTime: string;
  estimatedWindow: string;
  priorityWindow?: string;
  priorityFeeInr?: number;
  supportsPerishableFlowers: boolean;
  isActive: boolean;
}

export interface CouponRecord {
  id: string;
  code: string;
  description: string;
  discountType: 'FLAT_INR' | 'PERCENTAGE';
  discountValue: number;
  minOrderInr: number;
  maxDiscountInr?: number;
  isActive: boolean;
  expiresAt?: string;
  usageLimit?: number;
  usedCount: number;
}

export interface OrderLineItem {
  id: string;
  itemType: 'PRODUCT' | 'RITUAL_KIT';
  productId?: string;
  ritualKitId?: string;
  slug: string;
  title: string;
  sku: string;
  variantId?: string;
  variantLabel?: string;
  quantity: number;
  unitPriceInr: number;
  gstPercent: number;
  taxAmountInr: number;
  lineTotalInr: number;
  optionalSelectedIds?: string[];
  kitContentsSummary?: string[];
}

export interface OrderStatusHistoryEntry {
  timestamp: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfilmentStatus: FulfilmentStatus;
  actor: string;
  note: string;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pinCode: string;
  };
  deliveryInstructions?: string;
  deliveryMethod: 'STANDARD_SURFACE' | 'PRIORITY_LOCAL_COURIER';
  estimatedDeliveryWindow: string;
  currencyCode: 'INR';
  subtotalInr: number;
  taxInr: number;
  deliveryFeeInr: number;
  discountInr: number;
  totalInr: number;
  couponCode?: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfilmentStatus: FulfilmentStatus;
  paymentDetails: {
    provider: 'RAZORPAY_LIVE' | 'RAZORPAY_SANDBOX';
    providerOrderId: string;
    providerPaymentId?: string;
    idempotencyKey: string;
    signatureVerified: boolean;
    isSandbox: boolean;
    failureReason?: string;
  };
  shipmentDetails?: {
    supplierId?: string;
    carrierName: string;
    trackingNumber?: string;
    dispatchedAt?: string;
    deliveredAt?: string;
  };
  refundDetails?: {
    refundId: string;
    amountInr: number;
    reason: string;
    status: 'PENDING_APPROVAL' | 'PROCESSED' | 'REJECTED';
    requestedAt: string;
    processedAt?: string;
  };
  internalNotes: string[];
  statusHistory: OrderStatusHistoryEntry[];
  items: OrderLineItem[];
  isSampleData: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceListingRecord {
  id: string;
  providerName: string;
  slug: string;
  category:
    | 'Funeral Directors'
    | 'Authorized Funeral Transport'
    | 'Memorial Florists'
    | 'Memorial Printers'
    | 'Crematorium & Cemetery Information'
    | 'Grief Support Organizations';
  city: string;
  state: string;
  serviceAreas: string[];
  publicPhone: string;
  publicEmail: string;
  publishedPriceInfo: string;
  availabilityInfo: string;
  verificationStatus: 'VERIFIED_PROVIDER' | 'DEMO_SAMPLE_UNVERIFIED' | 'UNDER_REVIEW';
  verifiedBy?: string;
  description: string;
  bookingWorkflow: 'ENQUIRY_REFERRAL_ONLY';
  isSampleData: boolean;
}

export interface ServiceEnquiryRecord {
  id: string;
  enquiryNumber: string;
  serviceId: string;
  providerName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  city: string;
  pinCode: string;
  message: string;
  status: 'RECEIVED' | 'FORWARDED_TO_PROVIDER' | 'CLOSED';
  createdAt: string;
}

export interface GuidanceArticleRecord {
  id: string;
  title: string;
  slug: string;
  summary: string;
  contentSections: {
    heading: string;
    paragraphs: string[];
    bulletPoints?: string[];
  }[];
  applicableRegion: string;
  applicableTradition: string;
  reviewerName: string;
  reviewerCredentials: string;
  reviewStatus: ReviewStatus;
  lastReviewedDate: string;
  relatedProductSlugs: string[];
  relatedKitSlugs: string[];
  sources: string[];
  disclaimer: string;
  publicationStatus: PublicationStatus;
  isSampleData: boolean;
}

export interface UserAccountRecord {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  passwordHash: string; // Salted hash
  role: RoleType;
  permissions: string[];
  savedAddresses: {
    id: string;
    label: string;
    recipient: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pinCode: string;
    isDefault: boolean;
  }[];
  wishlistProductIds: string[];
  consentPreferences: {
    orderUpdatesEmail: boolean;
    orderUpdatesSms: boolean;
    guidanceNewsletterOptIn: boolean;
    bereavementPrivacyAck: boolean;
    updatedAt: string;
  };
  deletionRequestedAt?: string;
  createdAt: string;
}

export interface SupportTicketRecord {
  id: string;
  ticketNumber: string;
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  orderNumber?: string;
  category: 'ORDER_SUPPORT' | 'KIT_GUIDANCE' | 'DELIVERY_QUERY' | 'GRIEVANCE_REDRESSAL' | 'ACCOUNT_PRIVACY';
  subject: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  resolutionNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogRecord {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: RoleType | 'SYSTEM';
  action:
    | 'PRICE_CHANGE'
    | 'INVENTORY_ADJUSTMENT'
    | 'REFUND_APPROVAL'
    | 'ORDER_STATUS_UPDATE'
    | 'PRODUCT_PUBLICATION'
    | 'SUPPLIER_VERIFICATION'
    | 'SEED_DATA_RESET'
    | 'ADMIN_AUTH'
    | 'DELIVERY_ZONE_UPDATE';
  entityType: string;
  entityId: string;
  summary: string;
}

export interface DatabaseState {
  categories: CategoryRecord[];
  traditions: TraditionCollection[];
  suppliers: SupplierRecord[];
  products: ProductRecord[];
  ritualKits: RitualKitRecord[];
  deliveryZones: DeliveryZoneRecord[];
  coupons: CouponRecord[];
  orders: OrderRecord[];
  serviceListings: ServiceListingRecord[];
  serviceEnquiries: ServiceEnquiryRecord[];
  guidanceArticles: GuidanceArticleRecord[];
  users: UserAccountRecord[];
  supportTickets: SupportTicketRecord[];
  auditLogs: AuditLogRecord[];
}
