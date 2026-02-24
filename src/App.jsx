import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Dashboard from './retailer/pages/Dashboard';
import RetailerLayout from './retailer/components/RetailerLayout';
import Travel from './retailer/pages/Travel';
import Utility from './retailer/pages/Utility';
import AEPS from './retailer/pages/AEPS';
import CMS from './retailer/pages/CMS';
import AllServices from './retailer/pages/AllServices';
import Reports from './retailer/pages/Reports';
import Plans from './retailer/pages/Plans';
import MATM from './retailer/pages/MATM';
import Admin from './Admin';
import AdminLogin from './AdminLogin';
import Home from './Home';
import RetailerDetails from './components/admin/RetailerDetails';
import './App.css';

import { LanguageProvider } from './context/LanguageContext';

// ─── Distributor Panel ────────────────────────────────────────────────────────
import DistributorLayout from './distributor/components/DistributorLayout';
import DistributorDashboard from './distributor/pages/DistributorDashboard';

// Retailers
import Retailers from './distributor/pages/Retailers';

// Transactions
import { DistributorReceipt, RetailerReceipt } from './distributor/pages/Receipts';
import AddMoney from './distributor/pages/AddMoney';

// Reports
import {
  RetailerBalance, PaymentRequest, PurchaseReport, ChargeReport,
  CommissionReport, AepsReport, DmtReport, BbpsReport, CmsReport
} from './distributor/pages/Reports';

// Plans, Invoice
import PlansRates from './distributor/pages/PlansRates';
import Invoice from './distributor/pages/Invoice';

// Accounts
import { MyLedger, RetailerLedger, AccountsCommission } from './distributor/pages/Accounts';

// Promotions
import { PromotionsList, PromotionAssets } from './distributor/pages/Promotions';

// Support
import { SupportLeads, EcollectComplaints, RetailerComplaints, TrainingVideos } from './distributor/pages/Support';

// Old Reports
import OldReports from './distributor/pages/OldReports';

// Share / Workflow (simple pages)
import DistributorPlaceholder from './distributor/pages/DistributorPlaceholder';
import DistributorPlans from './distributor/pages/DistributorPlans';

// ── SuperAdmin Panel ────────────────────────────────────────────────────────
import SuperAdminLayout from './superadmin/components/SuperAdminLayout';
import SuperAdminDashboard from './superadmin/pages/SuperAdminDashboard';
import SuperAdminDistributors from './superadmin/pages/Distributors';
import SuperAdminRetailers from './superadmin/pages/Retailers';
import SuperAdminAddMoney from './superadmin/pages/AddMoney';
import { SuperAdminReceipt, RetailerReceipt as SuperAdminRetailerReceipt } from './superadmin/pages/Receipts';
import {
  RetailerBalance as SuperAdminRetailerBalance,
  PaymentRequest as SuperAdminPaymentRequest,
  PurchaseReport as SuperAdminPurchaseReport,
  ChargeReport as SuperAdminChargeReport,
  CommissionReport as SuperAdminCommissionReport,
  AepsReport as SuperAdminAepsReport,
  DmtReport as SuperAdminDmtReport,
  BbpsReport as SuperAdminBbpsReport,
  CmsReport as SuperAdminCmsReport
} from './superadmin/pages/Reports';
import SuperAdminPlansRates from './superadmin/pages/PlansRates';
import SuperAdminInvoice from './superadmin/pages/Invoice';
import {
  MyLedger as SuperAdminMyLedger,
  RetailerLedger as SuperAdminRetailerLedger,
  AccountsCommission as SuperAdminAccountsCommission
} from './superadmin/pages/Accounts';
import { PromotionsList as SuperAdminPromotionsList, PromotionAssets as SuperAdminPromotionAssets } from './superadmin/pages/Promotions';
import {
  SupportLeads as SuperAdminSupportLeads,
  EcollectComplaints as SuperAdminEcollectComplaints,
  RetailerComplaints as SuperAdminRetailerComplaints,
  TrainingVideos as SuperAdminTrainingVideos
} from './superadmin/pages/Support';
import SuperAdminOldReports from './superadmin/pages/OldReports';
import SuperAdminPlaceholder from './superadmin/pages/SuperAdminPlaceholder';
import SuperAdminPlans from './superadmin/pages/SuperAdminPlans';
import SuperAdminApprovals from './superadmin/pages/Approvals';
import SuperAdminSettings from './superadmin/pages/SuperAdminSettings';

import AddMoneyComponent from './retailer/components/banking/AddMoney';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          {/* ── Shared Landing & Portal Selector ── */}
          <Route path="/" element={<Home />} />
          <Route path="/portal" element={<Login />} />
          <Route path="/login" element={<Login />} />

          {/* ── Retailer Panel (A Panel) ── */}
          <Route element={<RetailerLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/utility" element={<Utility />} />
            <Route path="/aeps" element={<AEPS />} />
            <Route path="/cms" element={<CMS />} />
            <Route path="/all-services" element={<AllServices />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/matm" element={<MATM />} />
            <Route path="/add-money" element={<AddMoneyComponent />} />
          </Route>

          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/retailer/:username" element={<RetailerDetails />} />

          {/* ── Distributor Plan Selection ── */}
          <Route path="/distributor-plans" element={<DistributorPlans />} />

          {/* ── Distributor Panel (B Panel) ── */}
          <Route path="/distributor" element={<DistributorLayout />}>
            <Route index element={<DistributorDashboard />} />

            {/* Retailers */}
            <Route path="retailers" element={<Retailers />} />
            <Route path="retailers/details" element={<Retailers />} />
            <Route path="retailers/share" element={<DistributorPlaceholder title="Share Rupiksha App" />} />
            <Route path="retailers/workflow" element={<DistributorPlaceholder title="Retailer Service Workflow" />} />

            {/* Transactions */}
            <Route path="transactions" element={<DistributorReceipt />} />
            <Route path="transactions/distributor-receipt" element={<DistributorReceipt />} />
            <Route path="transactions/retailer-receipt" element={<RetailerReceipt />} />
            <Route path="transactions/add-money" element={<AddMoney />} />
            <Route path="transactions/axis-cdm" element={<DistributorPlaceholder title="Axis CDM Card" />} />
            <Route path="transactions/axis-mapping" element={<DistributorPlaceholder title="Axis Card Mapping" />} />

            {/* Reports */}
            <Route path="reports" element={<CommissionReport />} />
            <Route path="reports/retailer-balance" element={<RetailerBalance />} />
            <Route path="reports/payment-request" element={<PaymentRequest />} />
            <Route path="reports/purchase" element={<PurchaseReport />} />
            <Route path="reports/charges" element={<ChargeReport />} />
            <Route path="reports/commission" element={<CommissionReport />} />
            <Route path="reports/aeps" element={<AepsReport />} />
            <Route path="reports/dmt" element={<DmtReport />} />
            <Route path="reports/bbps" element={<BbpsReport />} />
            <Route path="reports/cms" element={<CmsReport />} />

            {/* Plans & Invoice */}
            <Route path="plans" element={<PlansRates />} />
            <Route path="invoice" element={<Invoice />} />

            {/* Accounts */}
            <Route path="accounts" element={<MyLedger />} />
            <Route path="accounts/my-ledger" element={<MyLedger />} />
            <Route path="accounts/retailer-ledger" element={<RetailerLedger />} />
            <Route path="accounts/commission" element={<AccountsCommission />} />

            {/* Promotions */}
            <Route path="promotions" element={<PromotionsList />} />
            <Route path="promotions/list" element={<PromotionsList />} />
            <Route path="promotions/assets" element={<PromotionAssets />} />

            {/* Support */}
            <Route path="support" element={<TrainingVideos />} />
            <Route path="support/leads" element={<SupportLeads />} />
            <Route path="support/complaints-ecollect" element={<EcollectComplaints />} />
            <Route path="support/retailer-complaints" element={<RetailerComplaints />} />
            <Route path="support/videos" element={<TrainingVideos />} />

            {/* Old Reports */}
            <Route path="old-reports" element={<OldReports />} />

            {/* Catch-all */}
            <Route path="*" element={<DistributorPlaceholder title="Page Not Found" />} />
          </Route>

          {/* ── SuperAdmin Plan Selection (standalone, before panel) ── */}
          <Route path="/superadmin-plans" element={<SuperAdminPlans />} />

          {/* ── SuperAdmin Panel (Master Panel) ── */}
          <Route path="/superadmin" element={<SuperAdminLayout />}>
            <Route index element={<SuperAdminDashboard />} />

            {/* Distributors & Retailers */}
            <Route path="distributors" element={<SuperAdminDistributors />} />
            <Route path="retailers" element={<SuperAdminRetailers />} />
            <Route path="retailers/details" element={<SuperAdminRetailers />} />
            <Route path="retailers/share" element={<SuperAdminPlaceholder title="Share Rupiksha App" />} />
            <Route path="retailers/workflow" element={<SuperAdminPlaceholder title="Retailer Service Workflow" />} />
            <Route path="approvals" element={<SuperAdminApprovals />} />

            {/* Transactions */}
            <Route path="transactions" element={<SuperAdminReceipt />} />
            <Route path="transactions/superadmin-receipt" element={<SuperAdminReceipt />} />
            <Route path="transactions/retailer-receipt" element={<SuperAdminRetailerReceipt />} />
            <Route path="transactions/add-money" element={<SuperAdminAddMoney />} />
            <Route path="transactions/axis-cdm" element={<SuperAdminPlaceholder title="Axis CDM Card" />} />
            <Route path="transactions/axis-mapping" element={<SuperAdminPlaceholder title="Axis Card Mapping" />} />

            {/* Reports */}
            <Route path="reports" element={<SuperAdminCommissionReport />} />
            <Route path="reports/retailer-balance" element={<SuperAdminRetailerBalance />} />
            <Route path="reports/payment-request" element={<SuperAdminPaymentRequest />} />
            <Route path="reports/purchase" element={<SuperAdminPurchaseReport />} />
            <Route path="reports/charges" element={<SuperAdminChargeReport />} />
            <Route path="reports/commission" element={<SuperAdminCommissionReport />} />
            <Route path="reports/aeps" element={<SuperAdminAepsReport />} />
            <Route path="reports/dmt" element={<SuperAdminDmtReport />} />
            <Route path="reports/bbps" element={<SuperAdminBbpsReport />} />
            <Route path="reports/cms" element={<SuperAdminCmsReport />} />

            {/* Plans & Invoice */}
            <Route path="plans" element={<SuperAdminPlansRates />} />
            <Route path="invoice" element={<SuperAdminInvoice />} />

            {/* Accounts */}
            <Route path="accounts" element={<SuperAdminMyLedger />} />
            <Route path="accounts/my-ledger" element={<SuperAdminMyLedger />} />
            <Route path="accounts/retailer-ledger" element={<SuperAdminRetailerLedger />} />
            <Route path="accounts/commission" element={<SuperAdminAccountsCommission />} />

            {/* Promotions */}
            <Route path="promotions" element={<SuperAdminPromotionsList />} />
            <Route path="promotions/list" element={<SuperAdminPromotionsList />} />
            <Route path="promotions/assets" element={<SuperAdminPromotionAssets />} />

            {/* Support */}
            <Route path="support" element={<SuperAdminTrainingVideos />} />
            <Route path="support/leads" element={<SuperAdminSupportLeads />} />
            <Route path="support/complaints-ecollect" element={<SuperAdminEcollectComplaints />} />
            <Route path="support/retailer-complaints" element={<SuperAdminRetailerComplaints />} />
            <Route path="support/videos" element={<SuperAdminTrainingVideos />} />

            {/* Old Reports */}
            <Route path="old-reports" element={<SuperAdminOldReports />} />
            <Route path="settings" element={<SuperAdminSettings />} />

            {/* Catch-all */}
            <Route path="*" element={<SuperAdminPlaceholder title="Page Not Found" />} />
          </Route>
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;
