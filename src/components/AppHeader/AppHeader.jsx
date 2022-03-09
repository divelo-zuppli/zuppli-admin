import React, { useContext } from "react";
import {
  Header,
  HeaderContainer,
  HeaderName,
  HeaderNavigation,
  HeaderMenuButton,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
  SkipToContent,
  SideNav,
  SideNavItems,
  HeaderSideNavItems,
  HeaderMenu,
} from "carbon-components-react";
import { Link } from "react-router-dom";
import {
  Notification20,
  UserAvatar20,
  Logout20
} from "@carbon/icons-react";

import authService from "../../modules/auth/auth.service";

import { GlobalContext } from "../../App.jsx";

const AppHeader = () => {
  const ctx = useContext(GlobalContext);

  const { user } = ctx;

  const handleLogoutClick = async (event) => {
    event.preventDefault();
    await authService.logout();
  }


  return (
    <HeaderContainer
      render={({ isSideNavExpanded, onClickSideNavExpand }) => (
        <Header aria-label="Carbon Tutorial">
          <SkipToContent />
          <HeaderMenuButton
            aria-label="Open menu"
            onClick={onClickSideNavExpand}
            isActive={isSideNavExpanded}
          />
          <HeaderName element={Link} to={user ? "/home" : "/"} prefix="Zuppli">
            Admin
          </HeaderName>

          {
            user &&
            <HeaderNavigation aria-label="Admin web">
              <HeaderMenu aria-label="Admin's web screens" menuLinkName="Screens">
                <HeaderMenuItem element={Link} to="/categories">Categories</HeaderMenuItem>
                <HeaderMenuItem element={Link} to="/references">References</HeaderMenuItem>
                <HeaderMenuItem element={Link} to="/users">Users</HeaderMenuItem>
                <HeaderMenuItem href="#">Roles</HeaderMenuItem>
              </HeaderMenu>
            </HeaderNavigation>
          }

          {
            user &&
            <SideNav
              aria-label="Side navigation"
              expanded={isSideNavExpanded}
              isPersistent={false}>
              <SideNavItems>
                <HeaderSideNavItems>
                  <HeaderMenuItem element={Link} to="/categories">Categories</HeaderMenuItem>
                  <HeaderMenuItem element={Link} to="/references">References</HeaderMenuItem>
                  <HeaderMenuItem element={Link} to="/users">Users</HeaderMenuItem>
                  <HeaderMenuItem href="#">Roles</HeaderMenuItem>
                </HeaderSideNavItems>
              </SideNavItems>
            </SideNav>
          }

          {
            user &&
            <HeaderGlobalBar>
              <HeaderGlobalAction aria-label="Notifications">
                <Notification20 />
              </HeaderGlobalAction>
              <HeaderGlobalAction aria-label="User profile">
                <UserAvatar20 />
              </HeaderGlobalAction>
              <HeaderGlobalAction aria-label="Log out" onClick={handleLogoutClick}>
                <Logout20 />
              </HeaderGlobalAction>
            </HeaderGlobalBar>
          }
        </Header>
      )}
    />);
};

export default AppHeader;