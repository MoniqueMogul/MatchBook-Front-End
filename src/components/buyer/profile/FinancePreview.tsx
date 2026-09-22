// "use client";

// import "./FinancePreview.css";

// export type FinancePreviewData = {
//   fundingSource?: 
//     | "all_cash"
//     | "sba_7a"
//     | "conventional"
//     | "investor_capital"
//     | "seller_financing"
//     | null;

//   reportedCashAvailable?: number | null;
//   verifiedCashAvailable?: number | null;

//   financingAmountRequested?: number | null;
//   financingAmountApproved?: number | null;

//   lenderName?: string | null;

//   lenderApprovalStatus?:
//     | "pending"
//     | "approved"
//     | "denied"
//     | "expired"
//     | null;

//   financialVerificationStatus?:
//     | "unverified"
//     | "pending"
//     | "verified"
//     | "rejected"
//     | null;
// };

// const fundingSourceLabels: Record<
//   NonNullable<FinancePreviewData["fundingSource"]>,
//   string
// > = {
//   all_cash: "All Cash",
//   sba_7a: "SBA 7(a)",
//   conventional: "Conventional",
//   investor_capital: "Investor Capital",
//   seller_financing: "Seller Financing",
// };

// const lenderApprovalLabels: Record<
//   NonNullable<FinancePreviewData["lenderApprovalStatus"]>,
//   string
// > = {
//   pending: "Pending",
//   approved: "Approved",
//   denied: "Denied",
//   expired: "Expired",
// };

// const verificationLabels: Record<
//   NonNullable<FinancePreviewData["financialVerificationStatus"]>,
//   string
// > = {
//   unverified: "Unverified",
//   pending: "Pending",
//   verified: "Verified",
//   rejected: "Rejected",
// };

// function formatCurrency(value?: number | null) {
//   if (value === null || value === undefined) {
//     return "Not provided";
//   }

//   return new Intl.NumberFormat("en-US", {
//     style: "currency",
//     currency: "USD",
//     maximumFractionDigits: 0,
//   }).format(value);
// }

// function formatValue(value?: string | null) {
//   return value?.trim() ? value : "Not provided";
// }

// export interface FinancePreviewProps {
//   data?: FinancePreviewData;
// }

// export default function FinancePreview({
//   data = {},
// }: FinancePreviewProps) {
//   const fundingSource = data.fundingSource
//     ? fundingSourceLabels[data.fundingSource]
//     : null;

//   const lenderApprovalStatus = data.lenderApprovalStatus
//     ? lenderApprovalLabels[data.lenderApprovalStatus]
//     : null;

//   const verificationStatus = data.financialVerificationStatus
//     ? verificationLabels[data.financialVerificationStatus]
//     : null;

//   return (
//     <section className="finance-preview">
//       {/* Funding */}
//       <section className="finance-preview__section">
//         <h3 className="finance-preview__title">
//           Funding
//         </h3>

//         <div className="finance-preview__pills">
//           <span className="finance-preview__pill">
//             {fundingSource ?? "Not provided"}
//           </span>
//         </div>
//       </section>

//       {/* Available Capital */}
//       <section className="finance-preview__section">
//         <h3 className="finance-preview__title">
//           Available Capital
//         </h3>

//         <div className="finance-preview__details-grid">
//           <div className="finance-preview__detail">
//             <span className="finance-preview__label">
//               Reported Cash Available
//             </span>

//             <span className="finance-preview__value">
//               {formatCurrency(
//                 data.reportedCashAvailable,
//               )}
//             </span>
//           </div>

//           <div className="finance-preview__detail">
//             <span className="finance-preview__label">
//               Verified Cash Available
//             </span>

//             <span className="finance-preview__value">
//               {formatCurrency(
//                 data.verifiedCashAvailable,
//               )}
//             </span>
//           </div>
//         </div>
//       </section>

//       {/* Financing */}
//       <section className="finance-preview__section">
//         <h3 className="finance-preview__title">
//           Financing
//         </h3>

//         <div className="finance-preview__details-grid">
//           <div className="finance-preview__detail">
//             <span className="finance-preview__label">
//               Financing Amount Requested
//             </span>

//             <span className="finance-preview__value">
//               {formatCurrency(
//                 data.financingAmountRequested,
//               )}
//             </span>
//           </div>

//           <div className="finance-preview__detail">
//             <span className="finance-preview__label">
//               Financing Amount Approved
//             </span>

//             <span className="finance-preview__value">
//               {formatCurrency(
//                 data.financingAmountApproved,
//               )}
//             </span>
//           </div>
//         </div>
//       </section>

//       {/* Lender Information */}
//       <section className="finance-preview__section">
//         <h3 className="finance-preview__title">
//           Lender Information
//         </h3>

//         <div className="finance-preview__details-grid">
//           <div className="finance-preview__detail">
//             <span className="finance-preview__label">
//               Lender Name
//             </span>

//             <span className="finance-preview__value">
//               {formatValue(data.lenderName)}
//             </span>
//           </div>

//           <div className="finance-preview__detail">
//             <span className="finance-preview__label">
//               Lender Approval Status
//             </span>

//             <span className="finance-preview__value">
//               {lenderApprovalStatus ?? "Not provided"}
//             </span>
//           </div>
//         </div>
//       </section>

//       {/* Verification */}
//       <section className="finance-preview__section">
//         <h3 className="finance-preview__title">
//           Verification
//         </h3>

//         <div className="finance-preview__details-grid">
//           <div className="finance-preview__detail">
//             <span className="finance-preview__label">
//               Financial Verification Status
//             </span>

//             <span className="finance-preview__value">
//               {verificationStatus ?? "Not provided"}
//             </span>
//           </div>
//         </div>
//       </section>
//     </section>
//   );
// }




"use client";

import "./FinancePreview.css";

export type FinancePreviewData = {
  purchasePrice?: number | null;
};

function formatCurrency(value?: number | null) {
  if (value === null || value === undefined) {
    return "Not provided";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export interface FinancePreviewProps {
  data?: FinancePreviewData;
}

export default function FinancePreview({
  data = {},
}: FinancePreviewProps) {
  return (
    <section className="finance-preview">
      {/* Purchase Price */}
      <section className="finance-preview__section">
        <h3 className="finance-preview__title">
          Purchase Price
        </h3>

        <div className="finance-preview__details-grid">
          <div className="finance-preview__detail">
            <span className="finance-preview__label">
              Purchase Price
            </span>

            <span className="finance-preview__value">
              {formatCurrency(data.purchasePrice)}
            </span>
          </div>
        </div>
      </section>
    </section>
  );
}