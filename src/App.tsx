import { Authenticated, Refine } from "@refinedev/core";
import { KBarProvider } from "@refinedev/kbar";
import {
  ErrorComponent,
  useNotificationProvider,
  ThemedLayout,
  RefineSnackbarProvider,
} from "@refinedev/mui";
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

import PetsIcon from '@mui/icons-material/Pets';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';
import AttractionsIcon from '@mui/icons-material/Attractions';
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";

import { authProvider } from "./authProvider";
import { DashboardPage } from "./pages/dashboard";
import { UserList } from "./pages/users";
import { AuthPage } from "./pages/auth";
import { ColorModeContextProvider } from "./contexts";
import { Header, Title } from "./components";
import { useAutoLoginForDemo } from "./hooks";
import { dataProvider } from "./dataProvider";
import { PromoCatList } from "./pages/promo-cats";
import { UserShow } from "./pages/users/show";
import { ScheduledPostList, ScheduledPostCreate, ScheduledPostShow } from "./pages/scheduled-posts";
import { Box } from "@mui/material";

const App: React.FC = () => {
  // This hook is used to automatically login the user.
  // We use this hook to skip the login page and demonstrate the application more quickly.
  const { loading } = useAutoLoginForDemo();

  const { t, i18n } = useTranslation();
  const i18nProvider = {
    translate: (key: string, params: object) => t(key, params),
    changeLocale: (lang: string) => i18n.changeLanguage(lang),
    getLocale: () => i18n.language,
  };

  if (loading) {
    return null;
  }

  return (
    <BrowserRouter>
      <KBarProvider>
        <ColorModeContextProvider>
          <CssBaseline />
          <GlobalStyles styles={{ html: { WebkitFontSmoothing: "auto" } }} />
          <RefineSnackbarProvider>
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
                  meta: {
                    icon: <DynamicFeedIcon />,
                  },
                },
                {
                  name: "wheel-of-fortune",
                  list: "wheel-of-fortune",
                  meta: {
                    label: "Wheel of Fortune",
                    icon: <AttractionsIcon />,
                  },
                },
              ]}
            >
              <Routes>
                <Route
                  element={
                    <Authenticated
                      key="authenticated-routes"
                      fallback={<CatchAllNavigate to="/login" />}
                    >
                      <ThemedLayout Header={Header} Title={Title}>
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
                  <Route index element={<DashboardPage />} />

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
                      <NavigateToResource resource="dashboard" />
                    </Authenticated>
                  }
                >
                  <Route
                    path="/login"
                    element={
                      <AuthPage
                        type="login"
                        formProps={{
                          defaultValues: {
                            email: "demo@refine.dev",
                            password: "demodemo",
                          },
                        }}
                      />
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <AuthPage
                        type="register"
                        formProps={{
                          defaultValues: {
                            email: "demo@refine.dev",
                            password: "demodemo",
                          },
                        }}
                      />
                    }
                  />
                  <Route
                    path="/forgot-password"
                    element={
                      <AuthPage
                        type="forgotPassword"
                        formProps={{
                          defaultValues: {
                            email: "demo@refine.dev",
                          },
                        }}
                      />
                    }
                  />
                  <Route
                    path="/update-password"
                    element={<AuthPage type="updatePassword" />}
                  />
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
          </RefineSnackbarProvider>
        </ColorModeContextProvider>
      </KBarProvider>
    </BrowserRouter>
  );
};

export default App;
