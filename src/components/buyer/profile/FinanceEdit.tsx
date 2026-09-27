// "use client";

// ipreferences.maximum_purchase_priceport { useState } from "react";

// import type {
//   FundingSource,
//   LenderApprovalStatus,
//   FinancialVerificationStatus,
// } from "@/lib/api/finance";

// import "./FinanceEdit.css";

// interface FinanceFormData {
//   fundingSource: FundingSource | "";
//   reportedCashAvailable: string;
//   verifiedCashAvailable: string;
//   financingAmountRequested: string;
//   financingAmountApproved: string;
//   lenderName: string;
//   lenderApprovalStatus: LenderApprovalStatus | "";
//   financialVerificationStatus: FinancialVerificationStatus | "";
// }

// interface FinanceEditProps {
//   onBack: () => void;
//   disabled?: boolean;
// }

// const initialFormData: FinanceFormData = {
//   fundingSource: "",
//   reportedCashAvailable: "",
//   verifiedCashAvailable: "",
//   financingAmountRequested: "",
//   financingAmountApproved: "",
//   lenderName: "",
//   lenderApprovalStatus: "",
//   financialVerificationStatus: "",
// };

// const fundingSourceOptions: {
//   value: FundingSource;
//   label: string;
// }[] = [
//   {
//     value: "all_cash",
//     label: "All Cash",
//   },
//   {
//     value: "sba_7a",
//     label: "SBA 7(a)",
//   },
//   {
//     value: "conventional",
//     label: "Conventional",
//   },
//   {
//     value: "investor_capital",
//     label: "Investor Capital",
//   },
//   {
//     value: "seller_financing",
//     label: "Seller Financing",
//   },
// ];

// const lenderApprovalOptions: {
//   value: LenderApprovalStatus;
//   label: string;
// }[] = [
//   {
//     value: "pending",
//     label: "Pending",
//   },
//   {
//     value: "approved",
//     label: "Approved",
//   },
//   {
//     value: "denied",
//     label: "Denied",
//   },
//   {
//     value: "expired",
//     label: "Expired",
//   },
// ];

// const verificationStatusOptions: {
//   value: FinancialVerificationStatus;
//   label: string;
// }[] = [
//   {
//     value: "unverified",
//     label: "Unverified",
//   },
//   {
//     value: "pending",
//     label: "Pending",
//   },
//   {
//     value: "verified",
//     label: "Verified",
//   },
//   {
//     value: "rejected",
//     label: "Rejected",
//   },
// ];

// export default function FinanceEdit({
//   onBack,
//   disabled = false,
// }: FinanceEditProps) {
//   const [formData, setFormData] =
//     useState<FinanceFormData>(initialFormData);

//   const [errors, setErrors] = useState<
//     Partial<Record<keyof FinanceFormData, string>>
//   >({});

//   const updateField = <K extends keyof FinanceFormData>(
//     field: K,
//     value: FinanceFormData[K],
//   ) => {
//     setFormData((previous) => ({
//       ...previous,
//       [field]: value,
//     }));

//     setErrors((previous) => ({
//       ...previous,
//       [field]: undefined,
//     }));
//   };

//   const validateNonNegativeNumber = (
//     field: keyof FinanceFormData,
//     value: string,
//   ) => {
//     if (!value.trim()) {
//       return;
//     }

//     const numericValue = Number(value);

//     if (!Number.isFinite(numericValue)) {
//       setErrors((previous) => ({
//         ...previous,
//         [field]: "Please enter a valid number.",
//       }));

//       return;
//     }

//     if (numericValue < 0) {
//       setErrors((previous) => ({
//         ...previous,
//         [field]: "Please enter a value of 0 or greater.",
//       }));

//       return;
//     }

//     setErrors((previous) => ({
//       ...previous,
//       [field]: undefined,
//     }));
//   };

//   const validateLenderName = (value: string) => {
//     if (value.length > 255) {
//       setErrors((previous) => ({
//         ...previous,
//         lenderName:
//           "Lender name must be 255 characters or less.",
//       }));

//       return;
//     }

//     setErrors((previous) => ({
//       ...previous,
//       lenderName: undefined,
//     }));
//   };

//   return (
//     <section className="finance-edit">
//       <div className="finance-edit__fields">

//         {/* Funding Source */}
//         <div className="select-field">
//           <label htmlFor="funding-source">
//             Funding Source
//           </label>

//           <select
//             id="funding-source"
//             value={formData.fundingSource}
//             disabled={disabled}
//             onChange={(event) =>
//               updateField(
//                 "fundingSource",
//                 event.target.value as FundingSource | "",
//               )
//             }
//           >
//             <option value="">
//               Select funding source
//             </option>

//             {fundingSourceOptions.map((option) => (
//               <option
//                 key={option.value}
//                 value={option.value}
//               >
//                 {option.label}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Reported Cash Available */}
//         <div className="field">
//           <label htmlFor="reported-cash">
//             Reported Cash Available
//           </label>

//           <input
//             id="reported-cash"
//             type="number"
//             min="0"
//             step="0.01"
//             value={formData.reportedCashAvailable}
//             disabled={disabled}
//             onChange={(event) => {
//               updateField(
//                 "reportedCashAvailable",
//                 event.target.value,
//               );

//               validateNonNegativeNumber(
//                 "reportedCashAvailable",
//                 event.target.value,
//               );
//             }}
//           />

//           {errors.reportedCashAvailable && (
//             <span className="field-error">
//               {errors.reportedCashAvailable}
//             </span>
//           )}
//         </div>

//         {/* Verified Cash Available */}
//         <div className="field">
//           <label htmlFor="verified-cash">
//             Verified Cash Available
//           </label>

//           <input
//             id="verified-cash"
//             type="number"
//             min="0"
//             step="0.01"
//             value={formData.verifiedCashAvailable}
//             disabled={disabled}
//             onChange={(event) => {
//               updateField(
//                 "verifiedCashAvailable",
//                 event.target.value,
//               );

//               validateNonNegativeNumber(
//                 "verifiedCashAvailable",
//                 event.target.value,
//               );
//             }}
//           />

//           {errors.verifiedCashAvailable && (
//             <span className="field-error">
//               {errors.verifiedCashAvailable}
//             </span>
//           )}
//         </div>

//         {/* Financing Amount Requested */}
//         <div className="field">
//           <label htmlFor="financing-requested">
//             Financing Amount Requested
//           </label>

//           <input
//             id="financing-requested"
//             type="number"
//             min="0"
//             step="0.01"
//             value={formData.financingAmountRequested}
//             disabled={disabled}
//             onChange={(event) => {
//               updateField(
//                 "financingAmountRequested",
//                 event.target.value,
//               );

//               validateNonNegativeNumber(
//                 "financingAmountRequested",
//                 event.target.value,
//               );
//             }}
//           />

//           {errors.financingAmountRequested && (
//             <span className="field-error">
//               {errors.financingAmountRequested}
//             </span>
//           )}
//         </div>

//         {/* Financing Amount Approved */}
//         <div className="field">
//           <label htmlFor="financing-approved">
//             Financing Amount Approved
//           </label>

//           <input
//             id="financing-approved"
//             type="number"
//             min="0"
//             step="0.01"
//             value={formData.financingAmountApproved}
//             disabled={disabled}
//             onChange={(event) => {
//               updateField(
//                 "financingAmountApproved",
//                 event.target.value,
//               );

//               validateNonNegativeNumber(
//                 "financingAmountApproved",
//                 event.target.value,
//               );
//             }}
//           />

//           {errors.financingAmountApproved && (
//             <span className="field-error">
//               {errors.financingAmountApproved}
//             </span>
//           )}
//         </div>

//         {/* Lender Name */}
//         <div className="field">
//           <label htmlFor="lender-name">
//             Lender Name
//           </label>

//           <input
//             id="lender-name"
//             type="text"
//             maxLength={255}
//             value={formData.lenderName}
//             disabled={disabled}
//             onChange={(event) => {
//               updateField(
//                 "lenderName",
//                 event.target.value,
//               );

//               validateLenderName(
//                 event.target.value,
//               );
//             }}
//           />

//           {errors.lenderName && (
//             <span className="field-error">
//               {errors.lenderName}
//             </span>
//           )}
//         </div>

//         {/* Lender Approval Status */}
//         <div className="radio-section">
//           <label>Lender Approval Status</label>

//           <div className="radio-grid">
//             {lenderApprovalOptions.map((option) => (
//               <label
//                 key={option.value}
//                 className="radio-option"
//               >
//                 <input
//                   type="radio"
//                   name="lenderApprovalStatus"
//                   value={option.value}
//                   checked={
//                     formData.lenderApprovalStatus ===
//                     option.value
//                   }
//                   disabled={disabled}
//                   onChange={() =>
//                     updateField(
//                       "lenderApprovalStatus",
//                       option.value,
//                     )
//                   }
//                 />

//                 <span>{option.label}</span>
//               </label>
//             ))}
//           </div>
//         </div>

//         {/* Financial Verification Status */}
//         <div className="radio-section">
//           <label>
//             Financial Verification Status
//           </label>

//           <div className="radio-grid">
//             {verificationStatusOptions.map(
//               (option) => (
//                 <label
//                   key={option.value}
//                   className="radio-option"
//                 >
//                   <input
//                     type="radio"
//                     name="financialVerificationStatus"
//                     value={option.value}
//                     checked={
//                       formData.financialVerificationStatus ===
//                       option.value
//                     }
//                     disabled={disabled}
//                     onChange={() =>
//                       updateField(
//                         "financialVerificationStatus",
//                         option.value,
//                       )
//                     }
//                   />

//                   <span>{option.label}</span>
//                 </label>
//               ),
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Validation / backend error area */}
//       {Object.values(errors).some(Boolean) && (
//         <div
//           className="finance-edit__error"
//           role="alert"
//         >
//           Please correct the highlighted fields.
//         </div>
//       )}

//       {/* Back navigation */}
//       <div className="finance-edit__navigation">
//         <button
//           type="button"
//           onClick={onBack}
//           disabled={disabled}
//           aria-label="Back to Acquisition Preferences"
//         >
//           ←
//         </button>
//       </div>
//     </section>
//   );
// }


"use client";

import "./FinanceEdit.css";

interface FinanceEditProps {
  mode?: "edit" | "onboarding";
  purchasePrice: string;
  onPurchasePriceChange: (value: string) => void;
  onBack: () => void;
  onContinue?: () => void;
  disabled?: boolean;
}

export default function FinanceEdit({
  mode = "edit",
  purchasePrice,
  onPurchasePriceChange,
  onBack,
  onContinue,
  disabled = false,
}: FinanceEditProps) {
  const handlePurchasePriceChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    onPurchasePriceChange(event.target.value);
  };

  return (
    <section className="finance-edit">
      <div className="finance-edit__fields">
        <div className="field">
          <label htmlFor="purchase-price">
            Purchase Price
          </label>

          <input
            id="purchase-price"
            type="number"
            min="0"
            step="0.01"
            value={purchasePrice}
            disabled={disabled}
            onChange={handlePurchasePriceChange}
            placeholder="Enter purchase price"
          />
        </div>
      </div>

      <div className="finance-edit__navigation">
      <button
        type="button"
        onClick={onBack}
        disabled={disabled}
        aria-label="Back to Acquisition Preferences"
      >
        ←
      </button>

      {mode === "onboarding" ? (
        <button
          type="button"
          className="finance-edit__continue-button"
          onClick={onContinue}
          disabled={disabled}
        >
          Save & Continue
          <span aria-hidden="true">→</span>
        </button>
      ) : (
        <button
          type="button"
          className="finance-edit__next-button"
          onClick={onContinue}
          disabled={disabled}
          aria-label="Save finance information"
        >
          →
        </button>
      )}
    </div>
    </section>
  );
}