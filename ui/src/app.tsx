import React from "react";
import APOLLO_CLIENT from "./apollo-client";
import { ApolloProvider } from "@apollo/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import {
  ConfigurationsPage,
  AgentsPage,
  NewConfigurationPage,
  InstallPage,
  AgentPage,
} from "./pages";
import { AgentChangesProvider } from "./contexts/AgentChanges";
import { theme } from "./theme";
import { StyledEngineProvider, ThemeProvider } from "@mui/material";
import { ViewConfiguration } from "./pages/configurations/configuration";
import { NewRawConfigurationPage } from "./pages/configurations/new-raw";
import { SnackbarProvider } from "notistack";
import { ComponentsPage } from "./pages/components";
import { Version } from "./components/Version";

export const App: React.FC = () => {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <ApolloProvider client={APOLLO_CLIENT}>
          <SnackbarProvider>
            <AgentChangesProvider>
              <BrowserRouter>
                <NavBar />

                <div className="content">
                  <Routes>
                    {/* No path at "/", reroute to agents */}
                    <Route path="/" element={<Navigate to="/agents" />} />

                    <Route path="agents">
                      <Route index element={<AgentsPage />} />
                      <Route path="install" element={<InstallPage />} />
                      <Route path=":id" element={<AgentPage />} />
                    </Route>

                    <Route path="configurations">
                      <Route index element={<ConfigurationsPage />} />
                      <Route
                        path="new-raw"
                        element={<NewRawConfigurationPage />}
                      />
                      <Route path="new" element={<NewConfigurationPage />} />
                      <Route path=":name" element={<ViewConfiguration />} />
                    </Route>

                    <Route path="components">
                      <Route index element={<ComponentsPage />} />
                    </Route>
                  </Routes>

                  <footer>
                    <Version />
                  </footer>
                </div>
              </BrowserRouter>
            </AgentChangesProvider>
          </SnackbarProvider>
        </ApolloProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};
