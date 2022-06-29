import {
  AppBar,
  Button,
  Dialog,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Toolbar,
  Typography,
} from "@mui/material";
import React, { SyntheticEvent, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  EmailIcon,
  GridIcon,
  HelpCircleIcon,
  SettingsIcon,
  SlackIcon,
  SlidersIcon,
  SquareIcon,
} from "../Icons";
import { BindPlaneOPLogo } from "../Logos";

import styles from "./nav-bar.module.scss";
import { classes } from "../../utils/styles";

export const NavBar: React.FC = () => {
  const [showLogoutInfo, setShowLogoutInfo] = useState<boolean>(false);
  const [settingsAnchorEl, setAnchorEl] = useState<Element | null>(null);
  const settingsOpen = Boolean(settingsAnchorEl);

  const handleSettingsClick = (event: SyntheticEvent) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <AppBar position="static" classes={{ root: styles["app-bar-root"] }}>
        <Toolbar classes={{ root: styles.toolbar }}>
          <Link to="/">
            <BindPlaneOPLogo
              className={styles.logo}
              aria-label="bindplane-logo"
            />
          </Link>

          <div className={styles["main-nav"]}>
            <NavLink
              className={({ isActive }) =>
                isActive
                  ? classes([styles["nav-link"], styles["active"]])
                  : styles["nav-link"]
              }
              to="/agents"
            >
              <GridIcon className={styles.icon} />
              Agents
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                isActive
                  ? classes([styles["nav-link"], styles["active"]])
                  : styles["nav-link"]
              }
              to="/configurations"
            >
              <SlidersIcon className={styles.icon} />
              Configs
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                isActive
                  ? classes([styles["nav-link"], styles["active"]])
                  : styles["nav-link"]
              }
              to="/components"
            >
              <SquareIcon className={styles.icon} />
              Components
            </NavLink>
          </div>

          <div className={styles["sub-nav"]}>
            <IconButton
              className={styles.button}
              target="_blank"
              color="inherit"
              data-testid="doc-link"
              href="https://docs.bindplane.observiq.com/docs"
            >
              <HelpCircleIcon className={styles.icon} />
            </IconButton>
            <IconButton
              className={styles.button}
              target="_blank"
              color="inherit"
              data-testid="support-link"
              href="mailto:support@observiq.com"
            >
              <EmailIcon className={styles.icon} />
            </IconButton>
            <IconButton
              className={styles.button}
              target="_blank"
              color="inherit"
              data-testid="slack-link"
              href="https://observiq.com/support-bindplaneop/"
            >
              <SlackIcon className={styles.icon} />
            </IconButton>
            <IconButton
              className={styles.button}
              aria-controls={settingsOpen ? "settings-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={settingsOpen ? "true" : undefined}
              color="inherit"
              data-testid="settings-button"
              onClick={handleSettingsClick}
            >
              <SettingsIcon className={styles.icon} />
            </IconButton>
            <Menu
              anchorEl={settingsAnchorEl}
              open={settingsOpen}
              onClose={handleSettingsClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "center",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              MenuListProps={{
                "aria-labelledby": "settings-button   ",
              }}
            >
              <MenuItem onClick={handleSettingsClose}>
                <Button color="inherit" onClick={() => setShowLogoutInfo(true)}>
                  Logout
                </Button>
              </MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>

      <LogoutInfo
        open={showLogoutInfo}
        onClose={() => setShowLogoutInfo(false)}
      />
    </>
  );
};

const LogoutInfo: React.FC<{ open: boolean; onClose: () => void }> = (
  props
) => {
  return (
    <Dialog {...props}>
      <Paper classes={{ root: styles["logout-modal-paper"] }}>
        <Typography variant="h5">Please close your browser.</Typography>
        <br />
        <Typography paragraph>
          BindPlane is using basic authentication. To clear basic authentication
          close the browser.
        </Typography>
      </Paper>
    </Dialog>
  );
};
