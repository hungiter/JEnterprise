import {
    type RouteConfig,
    route,
    index,
    layout,
    prefix,
} from "@react-router/dev/routes";

export default [
    index("./src/pages/Home/HomePage.tsx"), // Root route ("/")
    // index("./src/pages/Tour/TourListPage.tsx"), // Root route ("/")
    // Access denied page
    route("access-denied", "./src/pages/AccessDeniedPage.tsx"),

    layout("./src/layout/mainLayout.tsx", [
        // Tour Pages
        route("tours", "./src/pages/Tour/TourListPage.tsx"),
        route("tours/:tourCode", "./src/pages/Tour/TourDetailPage.tsx"),
        route("dashboard", "./src/pages/Dashboard/DashBoardPage.tsx"),
        // Account's pages
        route("account/:accountId", "./src/pages/Account/AccountInfoPage.tsx"),
        route("about", "./src/pages/About/AboutPage.tsx"),
        // Payment pags
        route("payment-result", "./src/pages/Payment/PaymentResultPage.tsx"),
        // Support pages
        route("privacypolicy", "./src/pages/XXX/PrivacyPolicyPage.tsx"),
        route("termofuse", "./src/pages/XXX/TermOfUsePage.tsx"),
        route("help", "./src/pages/XXX/HelpPage.tsx"),
        route("personaldatapolicy", "./src/pages/XXX/PersonalDataPolicyPage.tsx"),
    ]),

    // Admin layout with separate header
    layout("./src/layout/adminLayout.tsx", [
        route("admin", "./src/pages/Admin/AdminDashboardPage.tsx"),
        route("admin/users", "./src/pages/Admin/UserManagementPage.tsx"),
        route("admin/users/add", "./src/pages/Admin/AddUserPage.tsx"),
        route("admin/tours", "./src/pages/Admin/TourManagementPage.tsx"),
        route("admin/tours/add", "./src/pages/Admin/AddTourPage.tsx"),
        // Add more admin routes here as needed
        // route("admin/settings", "./src/pages/Admin/SettingsPage.tsx"),
    ]),

    route("*", "./src/pages/NotFoundPage.tsx")
] satisfies RouteConfig;
