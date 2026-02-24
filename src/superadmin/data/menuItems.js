import {
    Users, Repeat, FileBarChart, Map, FileText, Wallet, Percent,
    LifeBuoy, History, Monitor, MapPin, Youtube, User, Plus, Share2,
    CheckCircle2, Settings as SettingsIcon
} from 'lucide-react';

export const menuItems = [
    {
        title: "APPROVALS", icon: CheckCircle2, path: "/superadmin/approvals",
    },
    {
        title: "DISTRIBUTORS", icon: Users, path: "/superadmin/distributors",
    },
    {
        title: "RETAILERS", icon: Users, path: "/superadmin/retailers",
        submenu: [
            { title: "Retailer Details", icon: Monitor, path: "/superadmin/retailers/details" },
            { title: "Share Rupiksha APP", icon: Share2, path: "/superadmin/retailers/share" },
            { title: "Retailer Service Workflow", icon: Monitor, path: "/superadmin/retailers/workflow" }
        ]
    },
    {
        title: "TRANSACTIONS", icon: Repeat, path: "/superadmin/transactions",
        submenu: [
            { title: "SuperAdmin Receipt", icon: FileText, path: "/superadmin/transactions/superadmin-receipt" },
            { title: "Retailer Receipt", icon: FileText, path: "/superadmin/transactions/retailer-receipt" },
            { title: "Add Money", icon: Wallet, path: "/superadmin/transactions/add-money" },
            { title: "Axis CDM Card", icon: Monitor, path: "/superadmin/transactions/axis-cdm" },
            { title: "Axis Card Mapping", icon: Percent, path: "/superadmin/transactions/axis-mapping" }
        ]
    },
    {
        title: "REPORTS", icon: FileBarChart, path: "/superadmin/reports",
        submenu: [
            { title: "Retailer Balance", icon: FileText, path: "/superadmin/reports/retailer-balance" },
            { title: "Payment Request", icon: Wallet, path: "/superadmin/reports/payment-request" },
            { title: "Purchase Report", icon: FileBarChart, path: "/superadmin/reports/purchase" },
            { title: "Charge Report", icon: Percent, path: "/superadmin/reports/charges" },
            { title: "Commission Report", icon: FileBarChart, path: "/superadmin/reports/commission" },
            { title: "AEPS Report", icon: Monitor, path: "/superadmin/reports/aeps" },
            { title: "DMT Report", icon: Monitor, path: "/superadmin/reports/dmt" },
            { title: "BBPS Report", icon: Monitor, path: "/superadmin/reports/bbps" },
            { title: "CMS Report", icon: FileText, path: "/superadmin/reports/cms" },
        ]
    },
    { title: "PLAN & RATES", icon: Map, path: "/superadmin/plans" },
    { title: "INVOICE", icon: FileText, path: "/superadmin/invoice" },
    {
        title: "ACCOUNTS", icon: Wallet, path: "/superadmin/accounts",
        submenu: [
            { title: "My Ledger", icon: FileText, path: "/superadmin/accounts/my-ledger" },
            { title: "Retailer Ledger", icon: Monitor, path: "/superadmin/accounts/retailer-ledger" },
            { title: "Commission Reports", icon: FileBarChart, path: "/superadmin/accounts/commission" }
        ]
    },
    {
        title: "PROMOTIONS", icon: Percent, path: "/superadmin/promotions",
        submenu: [
            { title: "Promotions", icon: Plus, path: "/superadmin/promotions/list" },
            { title: "Video / Pdf", icon: Monitor, path: "/superadmin/promotions/assets" }
        ]
    },
    {
        title: "SUPPORT", icon: LifeBuoy, path: "/superadmin/support",
        submenu: [
            { title: "Online New Retailers Lead", icon: MapPin, path: "/superadmin/support/leads" },
            { title: "ECollect/OLP Complaints", icon: Repeat, path: "/superadmin/support/complaints-ecollect" },
            { title: "Retailer Complaint", icon: User, path: "/superadmin/support/retailer-complaints" },
            { title: "Training Videos", icon: Youtube, path: "/superadmin/support/videos" }
        ]
    },
    { title: "OLD FY REPORTS", icon: History, path: "/superadmin/old-reports" },
    { title: "SETTINGS", icon: SettingsIcon, path: "/superadmin/settings" }
];
