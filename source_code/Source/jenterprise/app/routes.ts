import {
    type RouteConfig,
    route,
    index,
    layout,
    prefix,
} from "@react-router/dev/routes";

export default [
    index("./src/pages/Home/HomePage.tsx"), // Root route ("/")

    layout("./src/layout/authLayout.tsx", [
        route("login", "./src/pages/Authenticate/LoginPage.tsx"),
        route("logout", "./src/pages/Authenticate/LogoutPage.tsx"),
        route("register", "./src/pages/Authenticate/RegisterPage.tsx"),
    ]),

    layout("./src/layout/mainLayout.tsx", [
        // Tour Pages
        route("tours", "./src/pages/Tour/TourListPage.tsx"),
        route("tours/:id", "./src/pages/Tour/TourDetailPage.tsx"),
        route("dashboard", "./src/pages/Dashboard/DashBoardPage.tsx"),
        // Account's pages
        route("account/:accountId", "./src/pages/Account/AccountInfoPage.tsx"),
        route("about", "./src/pages/About/AboutPage.tsx"),
        // Support pages
        route("privacypolicy", "./src/pages/XXX/PrivacyPolicyPage.tsx"),
        route("termofuse", "./src/pages/XXX/TermOfUsePage.tsx"),
        route("help", "./src/pages/XXX/HelpPage.tsx"),
        route("personaldatapolicy", "./src/pages/XXX/PersonalDataPolicyPage.tsx"),
    ]),

    route("*", "./src/pages/NotFoundPage.tsx")
] satisfies RouteConfig;
