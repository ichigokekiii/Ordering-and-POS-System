export const TERMS_SCOPE = {
  CUSTOMER: "customer",
  INTERNAL: "internal",
};

export const resolveTermsScopeFromRole = (role) => {
  const normalizedRole = (role || "").toLowerCase();

  if (["admin", "owner", "staff"].includes(normalizedRole)) {
    return TERMS_SCOPE.INTERNAL;
  }

  return TERMS_SCOPE.CUSTOMER;
};

const TERMS_CONFIG = {
  [TERMS_SCOPE.CUSTOMER]: {
    key: TERMS_SCOPE.CUSTOMER,
    title: "Customer Terms & Conditions",
    linkLabel: "Terms & Conditions",
    intro:
      "These terms and conditions act as the legal agreement for all customers accessing the Petal Express PH web platform.",
    sections: [
      {
        heading: "Introduction & Acceptance of Terms",
        body: "Customers acknowledge that by using the service, they agree to abide by the specified usage and purchasing policies.",
      },
      {
        heading: "Service Eligibility",
        body: "Use of the Petal Express PH Reservation and its delivery services is strictly limited to customers residing within Southern Luzon. Orders placed for delivery outside of this region will not be fulfilled.",
      },
      {
        heading: "Ordering and Payment Protocols",
        body: "Orders are only confirmed upon validation of payment proof (screenshot and reference number).",
      },
      {
        heading: "Cancellation and Modification",
        body: "Cancellation requests are prohibited within the 3-day window preceding a scheduled event.",
      },
      {
        heading: "Account Security and Responsibilities",
        body: "Users are responsible for their account credentials and must comply with system security protocols, including account lockout procedures after failed attempts.",
      },
      {
        heading: "Electronic Communications",
        body: "Customers grant consent for the system to use the EmailAPI for order receipts, event notifications, and OTP verification during registration and reset flows.",
      },
      {
        heading: "Product Customization Disclaimer",
        body: "Custom orders involve manual creation, and final results may vary based on flower and filler availability.",
      },
    ],
  },
  [TERMS_SCOPE.INTERNAL]: {
    key: TERMS_SCOPE.INTERNAL,
    title: "Internal Operations Terms & Conditions (IT, Owner, Staff)",
    linkLabel: "Terms & Conditions",
    intro:
      "These terms and conditions govern the behavior and responsibilities of IT, Owner, and Staff with administrative system access.",
    sections: [
      {
        heading: "Role-Based Access Control (RBAC)",
        body: "IT and Owners maintain full CRUD capabilities, while Staff roles are limited to operational viewing and POS order processing.",
      },
      {
        heading: "Administrative Security & Auth",
        body: "Secure login practices are mandatory, including MFA (OTP) and strict limits on failed login attempts to prevent account hijacking.",
      },
      {
        heading: "POS and Inventory Integrity",
        body: "Staff must maintain accurate stock availability. Failure to properly process orders may result in discrepancies between the POS and inventory.",
      },
      {
        heading: "CMS and Content Governance",
        body: "IT and Owner actors must perform regular audits on published content. Unauthorized or erroneous changes must be corrected immediately to prevent misinformation.",
      },
      {
        heading: "Schedule and Fulfillment Management",
        body: "Staff must monitor event schedules accurately to ensure customers are correctly notified of pop-up dates and delivery timelines.",
      },
      {
        heading: "Data Confidentiality",
        body: "Sharing administrative credentials is prohibited, and customer data collected during registration and checkout must be protected at all times.",
      },
    ],
  },
};

export const getTermsConfig = (scope = TERMS_SCOPE.CUSTOMER) =>
  TERMS_CONFIG[scope] || TERMS_CONFIG[TERMS_SCOPE.CUSTOMER];
