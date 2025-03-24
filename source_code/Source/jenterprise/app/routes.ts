import {
  type RouteConfig,
  route,
  index,
  layout,
  prefix,
} from "@react-router/dev/routes";

export default [
  index("./src/routes/home.tsx"), // Root route ("/")

  layout("./src/layout/authLayout.tsx", [
    route("login", "./src/components/auth/login.tsx"),
    route("logout", "./src/components/auth/logout.tsx"),
    route("register", "./src/components/auth/register.tsx"),
  ]),

  layout("./src/layout/mainLayout.tsx", [
    route("tours", "./src/routes/tours.tsx"),
    route("dashboard", "./src/routes/dashboard.tsx"),
    route("account/:accountId", "./src/routes/account.tsx"),
  ]),
] satisfies RouteConfig;
