# Fees Redesign Task Tracker

## Status: Implementation Complete

- [x] Create SQL Migration
    - [x] `institution_settings` table
    - [x] `fee_breakdown` column (JSONB)
    - [x] Trigger for `total_fees`
- [x] Create UPI Utilities
    - [x] `upiUtils.ts` (URI generation, Settings fetch)
- [x] Design & Implement `UPIPaymentSheet`
    - [x] QR Code display
    - [x] Transaction ID submission
- [x] Redesign Admin Interface
    - [x] `FeesDashboard.tsx` (Metrics + Settings)
    - [x] `FeesManagement.tsx` (Premium List View)
    - [x] `FeeDetailsModal.tsx` (Dynamic Breakdown Editor)
- [x] Redesign Student Interface
    - [x] `StudentFeeDetails.tsx` (Premium Hub + UPI Integration)
- [x] Update Shared Components
    - [x] `ReceiptGenerator.tsx` (Breakdown support)
    - [x] `PaymentForm.tsx` (Standardized cleanup)
- [x] Database Types Integration
    - [x] Update `types.ts` for new schema
- [ ] Final Verification (User)
