import { lazy } from "react";

import { Authenticated, Refine } from "@refinedev/core";
import {
  ErrorComponent,
  useNotificationProvider,
  ThemedLayout,
  RefineSnackbarProvider,
  RefineThemes,
} from "@refinedev/mui";

import { Box, ThemeProvider } from "@mui/material";
import GlobalStyles from "@mui/material/GlobalStyles";
import CssBaseline from "@mui/material/CssBaseline";

import routerProvider, {
  CatchAllNavigate,
  NavigateToResource,
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router";

import { BrowserRouter, Routes, Route, Outlet } from "react-router";

import { useTranslation } from "react-i18next";

import PetsIcon from "@mui/icons-material/Pets";
import DynamicFeedIcon from "@mui/icons-material/DynamicFeed";
import AttractionsIcon from "@mui/icons-material/Attractions";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";

import { authProvider } from "./authProvider";
import { ColorModeContextProvider } from "./contexts";
import { Header, Title } from "./components";
import { dataProvider } from "./dataProvider";
import { UserShow } from "./pages/users/show";
import { PasswordOnlyLogin } from "./pages/auth";

const UserList = lazy(() => import("./pages/users/list"));
const PromoCatList = lazy(() => import("./pages/promo-cats/list"));
const ScheduledPostList = lazy(() => import("./pages/scheduled-posts/list"));
const ScheduledPostShow = lazy(() => import("./pages/scheduled-posts/show"));
const ScheduledPostCreate = lazy(
  () => import("./pages/scheduled-posts/create")
);
const ScheduledPostEdit = lazy(() => import("./pages/scheduled-posts/edit"));

const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const i18nProvider = {
    translate: (key: string, params: object) => t(key, params),
    changeLocale: (lang: string) => i18n.changeLanguage(lang),
    getLocale: () => i18n.language,
  };
  {
    /* <ThemeProvider theme={RefineThemes.PurpleDark}>
      
    </ThemeProvider> */
  }
  return (
    <BrowserRouter>
      <ColorModeContextProvider>
        <CssBaseline />
        <GlobalStyles styles={{ html: { WebkitFontSmoothing: "auto" } }} />
        <RefineSnackbarProvider>
          <ThemeProvider theme={RefineThemes.PurpleDark}>
            <Refine
              routerProvider={routerProvider}
              dataProvider={dataProvider}
              authProvider={authProvider}
              i18nProvider={i18nProvider}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                breadcrumb: false,
              }}
              notificationProvider={useNotificationProvider}
              resources={[
                {
                  name: "dashboard",
                  meta: {
                    hide: true,
                  },
                },
                {
                  name: "users",
                  list: "/users",
                  show: "/users/:id",
                  meta: {
                    icon: <AccountCircleOutlinedIcon />,
                  },
                },
                {
                  name: "promo-cats",
                  list: "/promo-cats",
                  meta: {
                    icon: <PetsIcon />,
                  },
                },
                {
                  name: "scheduled-posts",
                  list: "/scheduled-posts",
                  show: "/scheduled-posts/:id",
                  create: "/scheduled-posts/create",
                  edit: "/scheduled-posts/:id/edit",
                  meta: {
                    icon: <DynamicFeedIcon />,
                  },
                },
                {
                  name: "wheel-of-fortune",
                  list: "wheel-of-fortune",
                  meta: {
                    icon: <AttractionsIcon />,
                  },
                },
              ]}
            >
              <Routes>
                <Route
                  path="/"
                  element={
                    <Authenticated
                      key="root-redirect"
                      fallback={<CatchAllNavigate to="/login" />}
                    >
                      <NavigateToResource resource="users" />
                    </Authenticated>
                  }
                />
                <Route
                  element={
                    <Authenticated
                      key="authenticated-routes"
                      fallback={<CatchAllNavigate to="/login" />}
                    >
                      <ThemedLayout Header={Header} Title={Title}>
                        <CssBaseline />
                        <Box
                          sx={{
                            maxWidth: "1200px",
                            marginLeft: "auto",
                            marginRight: "auto",
                          }}
                        >
                          <Outlet />
                        </Box>
                      </ThemedLayout>
                    </Authenticated>
                  }
                >
                  <Route
                    path="/users"
                    element={
                      <UserList>
                        <Outlet />
                      </UserList>
                    }
                  >
                    <Route path=":id" element={<UserShow />} />
                  </Route>

                  <Route
                    path="/scheduled-posts"
                    element={
                      <ScheduledPostList>
                        <Outlet />
                      </ScheduledPostList>
                    }
                  >
                    <Route path="create" element={<ScheduledPostCreate />} />
                    <Route path=":id" element={<ScheduledPostShow />} />
                    <Route path=":id/edit" element={<ScheduledPostEdit />} />
                  </Route>

                  <Route
                    path="/promo-cats"
                    element={
                      <PromoCatList>
                        <Outlet />
                      </PromoCatList>
                    }
                  >
                    {/* <Route path="create" element={<ScheduledPostCreate />} /> */}
                  </Route>

                  <Route
                    path="/wheel-of-fortune"
                    element={
                      <>
                        <Outlet />
                      </>
                    }
                  >
                    {/* <Route path="create" element={<ScheduledPostCreate />} /> */}
                  </Route>
                </Route>

                <Route
                  element={
                    <Authenticated key="auth-pages" fallback={<Outlet />}>
                      <NavigateToResource resource="users" />
                    </Authenticated>
                  }
                >
                  <Route path="/login" element={<PasswordOnlyLogin />} />
                </Route>

                <Route
                  element={
                    <Authenticated key="catch-all">
                      <ThemedLayout Header={Header} Title={Title}>
                        <Outlet />
                      </ThemedLayout>
                    </Authenticated>
                  }
                >
                  <Route path="*" element={<ErrorComponent />} />
                </Route>
              </Routes>

              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
          </ThemeProvider>
        </RefineSnackbarProvider>
      </ColorModeContextProvider>
    </BrowserRouter>
  );
};

export default App;
