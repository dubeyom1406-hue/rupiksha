import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';

// --- Loading Component ---
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-[#f7f9fc]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Module...</p>
    </div>
  </div>
);

// --- Lazy Loads ---
const Login = lazy(() => import('./auth/Login'));
const AdminLogin = lazy(() => import('./auth/AdminLogin'));
const Home = lazy(() => import('./landing/Home'));
const About = lazy(() => import('./landing/About'));
const Contact = lazy(() => import('./landing/Contact'));
const Leadership = lazy(() => import('./landing/Leadership'));

// Retailer
const RetailerLayout = lazy(() => import('./retailer/components/RetailerLayout'));
const Dashboard = lazy(() => import('./retailer/pages/Dashboard'));
const Profile = lazy(() => import('./retailer/pages/Profile'));
const Travel = lazy(() => import('./retailer/pages/Travel'));
const Utility = lazy(() => import('./retailer/pages/Utility'));
const AEPS = lazy(() => import('./retailer/pages/AEPS'));
const CMS = lazy(() => import('./retailer/pages/CMS'));
const AllServices = lazy(() => import('./retailer/pages/AllServices'));
const Reports = lazy(() => import('./retailer/pages/Reports'));
const Plans = lazy(() => import('./retailer/pages/Plans'));
const MATM = lazy(() => import('./retailer/pages/MATM'));
const AddMoneyComponent = lazy(() => import('./retailer/components/banking/AddMoney'));

// Admin Core
const Admin = lazy(() => import('./admin/Admin'));
const RetailerDetails = lazy(() => import('./admin/components/RetailerDetails'));
const DistributorDetails = lazy(() => import('./admin/components/DistributorDetails'));

// Distributor
const DistributorLayout = lazy(() => import('./distributor/components/DistributorLayout'));
const DistributorDashboard = lazy(() => import('./distributor/pages/DistributorDashboard'));
const Retailers = lazy(() => import('./distributor/pages/Retailers'));
const DistributorReceipt = lazy(() => import('./distributor/pages/Receipts').then(m => ({ default: m.DistributorReceipt })));
const RetailerReceipt = lazy(() => import('./distributor/pages/Receipts').then(m => ({ default: m.RetailerReceipt })));
const AddMoney = lazy(() => import('./distributor/pages/AddMoney'));
const DistributorPlaceholder = lazy(() => import('./distributor/pages/DistributorPlaceholder'));
const DistributorPlans = lazy(() => import('./distributor/pages/DistributorPlans'));
const PlansRates = lazy(() => import('./distributor/pages/PlansRates'));
const Invoice = lazy(() => import('./distributor/pages/Invoice'));
const OldReports = lazy(() => import('./distributor/pages/OldReports'));

// Distributor Reports
const RetailerBalance = lazy(() => import('./distributor/pages/Reports').then(m => ({ default: m.RetailerBalance })));
const PaymentRequest = lazy(() => import('./distributor/pages/Reports').then(m => ({ default: m.PaymentRequest })));
const PurchaseReport = lazy(() => import('./distributor/pages/Reports').then(m => ({ default: m.PurchaseReport })));
const ChargeReport = lazy(() => import('./distributor/pages/Reports').then(m => ({ default: m.ChargeReport })));
const CommissionReport = lazy(() => import('./distributor/pages/Reports').then(m => ({ default: m.CommissionReport })));
const AepsReport = lazy(() => import('./distributor/pages/Reports').then(m => ({ default: m.AepsReport })));
const DmtReport = lazy(() => import('./distributor/pages/Reports').then(m => ({ default: m.DmtReport })));
const BbpsReport = lazy(() => import('./distributor/pages/Reports').then(m => ({ default: m.BbpsReport })));
const CmsReport = lazy(() => import('./distributor/pages/Reports').then(m => ({ default: m.CmsReport })));

// Distributor Accounts
const MyLedger = lazy(() => import('./distributor/pages/Accounts').then(m => ({ default: m.MyLedger })));
const RetailerLedger = lazy(() => import('./distributor/pages/Accounts').then(m => ({ default: m.RetailerLedger })));
const AccountsCommission = lazy(() => import('./distributor/pages/Accounts').then(m => ({ default: m.AccountsCommission })));

// Distributor Promotions
const PromotionsList = lazy(() => import('./distributor/pages/Promotions').then(m => ({ default: m.PromotionsList })));
const PromotionAssets = lazy(() => import('./distributor/pages/Promotions').then(m => ({ default: m.PromotionAssets })));

// Distributor Support
const SupportLeads = lazy(() => import('./distributor/pages/Support').then(m => ({ default: m.SupportLeads })));
const EcollectComplaints = lazy(() => import('./distributor/pages/Support').then(m => ({ default: m.EcollectComplaints })));
const RetailerComplaints = lazy(() => import('./distributor/pages/Support').then(m => ({ default: m.RetailerComplaints })));
const TrainingVideos = lazy(() => import('./distributor/pages/Support').then(m => ({ default: m.TrainingVideos })));

// SuperAdmin
const SuperAdminLayout = lazy(() => import('./superadmin/components/SuperAdminLayout'));
const SuperAdminDashboard = lazy(() => import('./superadmin/pages/SuperAdminDashboard'));
const SuperAdminDistributors = lazy(() => import('./superadmin/pages/Distributors'));
const SuperAdminRetailers = lazy(() => import('./superadmin/pages/Retailers'));
const SuperAdminAddMoney = lazy(() => import('./superadmin/pages/AddMoney'));
const SuperAdminReceipt = lazy(() => import('./superadmin/pages/Receipts').then(m => ({ default: m.SuperAdminReceipt })));
const SuperAdminRetailerReceipt = lazy(() => import('./superadmin/pages/Receipts').then(m => ({ default: m.RetailerReceipt })));
const SuperAdminApprovals = lazy(() => import('./superadmin/pages/Approvals'));
const SuperAdminSettings = lazy(() => import('./superadmin/pages/SuperAdminSettings'));
const SuperAdminPlaceholder = lazy(() => import('./superadmin/pages/SuperAdminPlaceholder'));
const SuperAdminPlans = lazy(() => import('./superadmin/pages/SuperAdminPlans'));
const SuperAdminPlansRates = lazy(() => import('./superadmin/pages/PlansRates'));
const SuperAdminInvoice = lazy(() => import('./superadmin/pages/Invoice'));
const SuperAdminOldReports = lazy(() => import('./superadmin/pages/OldReports'));

// SuperAdmin Reports
const SARetailerBalance = lazy(() => import('./superadmin/pages/Reports').then(m => ({ default: m.RetailerBalance })));
const SAPaymentRequest = lazy(() => import('./superadmin/pages/Reports').then(m => ({ default: m.PaymentRequest })));
const SAPurchaseReport = lazy(() => import('./superadmin/pages/Reports').then(m => ({ default: m.PurchaseReport })));
const SAChargeReport = lazy(() => import('./superadmin/pages/Reports').then(m => ({ default: m.ChargeReport })));
const SACommissionReport = lazy(() => import('./superadmin/pages/Reports').then(m => ({ default: m.CommissionReport })));
const SAAepsReport = lazy(() => import('./superadmin/pages/Reports').then(m => ({ default: m.AepsReport })));
const SADmtReport = lazy(() => import('./superadmin/pages/Reports').then(m => ({ default: m.DmtReport })));
const SABbpsReport = lazy(() => import('./superadmin/pages/Reports').then(m => ({ default: m.BbpsReport })));
const SACmsReport = lazy(() => import('./superadmin/pages/Reports').then(m => ({ default: m.CmsReport })));

// SuperAdmin Accounts
const SAMyLedger = lazy(() => import('./superadmin/pages/Accounts').then(m => ({ default: m.MyLedger })));
const SARetailerLedger = lazy(() => import('./superadmin/pages/Accounts').then(m => ({ default: m.RetailerLedger })));
const SAAccountsCommission = lazy(() => import('./superadmin/pages/Accounts').then(m => ({ default: m.AccountsCommission })));

// SuperAdmin Promotions
const SAPromotionsList = lazy(() => import('./superadmin/pages/Promotions').then(m => ({ default: m.PromotionsList })));
const SAPromotionAssets = lazy(() => import('./superadmin/pages/Promotions').then(m => ({ default: m.PromotionAssets })));

// SuperAdmin Support
const SASupportLeads = lazy(() => import('./superadmin/pages/Support').then(m => ({ default: m.SupportLeads })));
const SAEcollectComplaints = lazy(() => import('./superadmin/pages/Support').then(m => ({ default: m.EcollectComplaints })));
const SARetailerComplaints = lazy(() => import('./superadmin/pages/Support').then(m => ({ default: m.RetailerComplaints })));
const SATrainingVideos = lazy(() => import('./superadmin/pages/Support').then(m => ({ default: m.TrainingVideos })));

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Landing */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/leadership" element={<Leadership />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/portal" element={<Login />} />
              <Route path="/login" element={<Login />} />

              {/* Retailer */}
              <Route element={<RetailerLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/utility" element={<Utility />} />
                <Route path="/aeps" element={<AEPS />} />
                <Route path="/cms" element={<CMS />} />
                <Route path="/all-services" element={<AllServices />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/matm" element={<MATM />} />
                <Route path="/add-money" element={<AddMoneyComponent />} />
              </Route>

              {/* Admin */}
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/retailer/:username" element={<RetailerDetails />} />
              <Route path="/admin/distributor/:id" element={<DistributorDetails />} />

              {/* Distributor */}
              <Route path="/distributor-plans" element={<DistributorPlans />} />
              <Route path="/distributor" element={<DistributorLayout />}>
                <Route index element={<DistributorDashboard />} />
                <Route path="retailers" element={<Retailers />} />
                <Route path="retailers/details" element={<Retailers />} />
                <Route path="retailers/share" element={<DistributorPlaceholder title="Share" />} />
                <Route path="retailers/workflow" element={<DistributorPlaceholder title="Workflow" />} />
                <Route path="transactions" element={<DistributorReceipt />} />
                <Route path="transactions/distributor-receipt" element={<DistributorReceipt />} />
                <Route path="transactions/retailer-receipt" element={<RetailerReceipt />} />
                <Route path="transactions/add-money" element={<AddMoney />} />
                <Route path="transactions/axis-cdm" element={<DistributorPlaceholder title="Axis CDM" />} />
                <Route path="transactions/axis-mapping" element={<DistributorPlaceholder title="Axis Mapping" />} />
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
                <Route path="plans" element={<PlansRates />} />
                <Route path="invoice" element={<Invoice />} />
                <Route path="accounts" element={<MyLedger />} />
                <Route path="accounts/my-ledger" element={<MyLedger />} />
                <Route path="accounts/retailer-ledger" element={<RetailerLedger />} />
                <Route path="accounts/commission" element={<AccountsCommission />} />
                <Route path="promotions" element={<PromotionsList />} />
                <Route path="promotions/list" element={<PromotionsList />} />
                <Route path="promotions/assets" element={<PromotionAssets />} />
                <Route path="support" element={<TrainingVideos />} />
                <Route path="support/leads" element={<SupportLeads />} />
                <Route path="support/complaints-ecollect" element={<EcollectComplaints />} />
                <Route path="support/retailer-complaints" element={<RetailerComplaints />} />
                <Route path="support/videos" element={<TrainingVideos />} />
                <Route path="old-reports" element={<OldReports />} />
                <Route path="*" element={<DistributorPlaceholder title="Not Found" />} />
              </Route>

              {/* SuperAdmin */}
              <Route path="/superadmin-plans" element={<SuperAdminPlans />} />
              <Route path="/superadmin" element={<SuperAdminLayout />}>
                <Route index element={<SuperAdminDashboard />} />
                <Route path="distributors" element={<SuperAdminDistributors />} />
                <Route path="retailers" element={<SuperAdminRetailers />} />
                <Route path="retailers/details" element={<SuperAdminRetailers />} />
                <Route path="retailers/share" element={<SuperAdminPlaceholder title="Share" />} />
                <Route path="retailers/workflow" element={<SuperAdminPlaceholder title="Workflow" />} />
                <Route path="approvals" element={<SuperAdminApprovals />} />
                <Route path="transactions" element={<SuperAdminReceipt />} />
                <Route path="transactions/superadmin-receipt" element={<SuperAdminReceipt />} />
                <Route path="transactions/retailer-receipt" element={<SuperAdminRetailerReceipt />} />
                <Route path="transactions/add-money" element={<SuperAdminAddMoney />} />
                <Route path="transactions/axis-cdm" element={<SuperAdminPlaceholder title="Axis CDM" />} />
                <Route path="transactions/axis-mapping" element={<SuperAdminPlaceholder title="Axis Mapping" />} />
                <Route path="reports" element={<SACommissionReport />} />
                <Route path="reports/retailer-balance" element={<SARetailerBalance />} />
                <Route path="reports/payment-request" element={<SAPaymentRequest />} />
                <Route path="reports/purchase" element={<SAPurchaseReport />} />
                <Route path="reports/charges" element={<SAChargeReport />} />
                <Route path="reports/commission" element={<SACommissionReport />} />
                <Route path="reports/aeps" element={<SAAepsReport />} />
                <Route path="reports/dmt" element={<SADmtReport />} />
                <Route path="reports/bbps" element={<SABbpsReport />} />
                <Route path="reports/cms" element={<SACmsReport />} />
                <Route path="plans" element={<SuperAdminPlansRates />} />
                <Route path="invoice" element={<SuperAdminInvoice />} />
                <Route path="accounts" element={<SAMyLedger />} />
                <Route path="accounts/my-ledger" element={<SAMyLedger />} />
                <Route path="accounts/retailer-ledger" element={<SARetailerLedger />} />
                <Route path="accounts/commission" element={<SAAccountsCommission />} />
                <Route path="promotions" element={<SAPromotionsList />} />
                <Route path="promotions/list" element={<SAPromotionsList />} />
                <Route path="promotions/assets" element={<SAPromotionAssets />} />
                <Route path="support" element={<SATrainingVideos />} />
                <Route path="support/leads" element={<SASupportLeads />} />
                <Route path="support/complaints-ecollect" element={<SAEcollectComplaints />} />
                <Route path="support/retailer-complaints" element={<SARetailerComplaints />} />
                <Route path="support/videos" element={<SATrainingVideos />} />
                <Route path="old-reports" element={<SuperAdminOldReports />} />
                <Route path="settings" element={<SuperAdminSettings />} />
                <Route path="*" element={<SuperAdminPlaceholder title="Not Found" />} />
              </Route>
            </Routes>
          </Suspense>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
