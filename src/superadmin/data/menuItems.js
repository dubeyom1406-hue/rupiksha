import {
    Users, Repeat, FileBarChart, Map, FileText, Wallet, Percent,
    LifeBuoy, History, Monitor, MapPin, Youtube, User, Plus, Share2,
    CheckCircle2, Settings as SettingsIcon
} from 'lucide-react';

export const menuItems = [
    {
        title: "APPROVALS", icon: CheckCircle2, path: "/SuperAdmin/approvals",
    },
    {
        title: "DISTRIBUTORS", icon: Users, path: "/SuperAdmin/distributors",
    },
    {
        title: "RETAILERS", icon: Users, path: "/SuperAdmin/retailers",
        submenu: [
            { title: "Retailer Details", icon: Monitor, path: "/SuperAdmin/retailers/details" },
            { title: "Share Rupiksha APP", icon: Share2, path: "/SuperAdmin/retailers/share" },
            { title: "Retailer Service Workflow", icon: Monitor, path: "/SuperAdmin/retailers/workflow" }
        ]
    },
    {
        title: "TRANSACTIONS", icon: Repeat, path: "/SuperAdmin/transactions",
        submenu: [
            { title: "SuperAdmin Receipt", icon: FileText, path: "/SuperAdmin/transactions/SuperAdmin-receipt" },
            { title: "Retailer Receipt", icon: FileText, path: "/SuperAdmin/transactions/retailer-receipt" },
            { title: "Add Money", icon: Wallet, path: "/SuperAdmin/transactions/add-money" },
            { title: "Axis CDM Card", icon: Monitor, path: "/SuperAdmin/transactions/axis-cdm" },
            { title: "Axis Card Mapping", icon: Percent, path: "/SuperAdmin/transactions/axis-mapping" }
        ]
    },
    {
        title: "REPORTS", icon: FileBarChart, path: "/SuperAdmin/reports",
        submenu: [
            { title: "Retailer Balance", icon: FileText, path: "/SuperAdmin/reports/retailer-balance" },
            { title: "Payment Request", icon: Wallet, path: "/SuperAdmin/reports/payment-request" },
            { title: "Purchase Report", icon: FileBarChart, path: "/SuperAdmin/reports/purchase" },
            { title: "Charge Report", icon: Percent, path: "/SuperAdmin/reports/charges" },
            { title: "Commission Report", icon: FileBarChart, path: "/SuperAdmin/reports/commission" },
            { title: "AEPS Report", icon: Monitor, path: "/SuperAdmin/reports/aeps" },
            { title: "DMT Report", icon: Monitor, path: "/SuperAdmin/reports/dmt" },
            { title: "BBPS Report", icon: Monitor, path: "/SuperAdmin/reports/bbps" },
            { title: "CMS Report", icon: FileText, path: "/SuperAdmin/reports/cms" },
        ]
    },
    { title: "PLAN & RATES", icon: Map, path: "/SuperAdmin/plans" },
    { title: "INVOICE", icon: FileText, path: "/SuperAdmin/invoice" },
    {
        title: "ACCOUNTS", icon: Wallet, path: "/SuperAdmin/accounts",
        submenu: [
            { title: "My Ledger", icon: FileText, path: "/SuperAdmin/accounts/my-ledger" },
            { title: "Retailer Ledger", icon: Monitor, path: "/SuperAdmin/accounts/retailer-ledger" },
            { title: "Commission Reports", icon: FileBarChart, path: "/SuperAdmin/accounts/commission" }
        ]
    },
    {
        title: "PROMOTIONS", icon: Percent, path: "/SuperAdmin/promotions",
        submenu: [
            { title: "Promotions", icon: Plus, path: "/SuperAdmin/promotions/list" },
            { title: "Video / Pdf", icon: Monitor, path: "/SuperAdmin/promotions/assets" }
        ]
    },
    {
        title: "SUPPORT", icon: LifeBuoy, path: "/SuperAdmin/support",
        submenu: [
            { title: "Online New Retailers Lead", icon: MapPin, path: "/SuperAdmin/support/leads" },
            { title: "ECollect/OLP Complaints", icon: Repeat, path: "/SuperAdmin/support/complaints-ecollect" },
            { title: "Retailer Complaint", icon: User, path: "/SuperAdmin/support/retailer-complaints" },
            { title: "Training Videos", icon: Youtube, path: "/SuperAdmin/support/videos" }
        ]
    },
    { title: "OLD FY REPORTS", icon: History, path: "/SuperAdmin/old-reports" },
    { title: "SETTINGS", icon: SettingsIcon, path: "/SuperAdmin/settings" }
];
