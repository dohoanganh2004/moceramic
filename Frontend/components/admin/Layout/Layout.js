import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withRouter } from 'next/router'
import Loader from "components/admin/Loader";
import PageTransition from "components/PageTransition";
import Hammer from "rc-hammerjs";
import Header from "../Header";
import Helper from "../Helper";
import Sidebar from "../Sidebar";
import {
  openSidebar,
  closeSidebar,
  toggleSidebar,
} from "redux/actions/navigation";
import s from "./Layout.module.scss";
import BreadcrumbHistory from "../BreadcrumbHistory";
import { canAccessAdminRoute } from "constants/adminRoutePermissions";

import { SidebarTypes } from "redux/reducers/layout";

class Layout extends React.Component {
  static propTypes = {
    sidebarStatic: PropTypes.bool,
    sidebarOpened: PropTypes.bool,
    dispatch: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = { mounted: false };
    this.handleSwipe = this.handleSwipe.bind(this);
  }

  componentDidMount() {
    // The Redux store is built once per server process and hydrated fresh in the
    // browser, so on a hard navigation the server always renders as "logged out".
    // Deferring the currentUser check until after mount avoids a hydration
    // mismatch that (in React 16) never self-corrects, leaving a blank/no-sidebar
    // page even though the client is actually authenticated.
    this.setState({ mounted: true });
    this.handleResize();
    window.addEventListener("resize", this.handleResize.bind(this));
    this.checkAccess();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.router.pathname !== this.props.router.pathname ||
      prevProps.currentUser !== this.props.currentUser ||
      prevProps.loadingInit !== this.props.loadingInit
    ) {
      this.checkAccess();
    }
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize.bind(this));
  }

  // Nobody without the right permission code can reach a /admin/* section -
  // whether that's a guest, or a logged-in customer/staff member just typing
  // the URL directly (the sidebar only hides links; it was never real access
  // control). Everywhere else is public storefront content, so guests and
  // under-permissioned users alike still get the normal sidebar + page there.
  checkAccess() {
    if (this.props.loadingInit) return;
    const { pathname } = this.props.router;
    if (pathname !== "/403" && !canAccessAdminRoute(pathname, this.props.currentUser)) {
      this.props.router.replace("/403");
    }
  }

  handleResize() {
    if (window.innerWidth <= 768 && this.props.sidebarStatic) {
      this.props.dispatch(toggleSidebar(false));
    }
  }

  handleSwipe(e) {
    if ("ontouchstart" in window) {
      if (e.direction === 4) {
        this.props.dispatch(openSidebar());
        return;
      }

      if (e.direction === 2 && this.props.sidebarOpened) {
        this.props.dispatch(closeSidebar());
        return;
      }
    }
  }

  render() {
    if (!this.state.mounted || this.props.loadingInit) return <Loader />;

    // checkAccess() is already redirecting to /403 - don't flash the protected
    // page's content while that navigation is in flight.
    if (
      this.props.router.pathname !== "/403" &&
      !canAccessAdminRoute(this.props.router.pathname, this.props.currentUser)
    ) {
      return <Loader />;
    }

    return (
      <div
        className={[
          s.root,
          this.props.sidebarStatic ? `${s.sidebarStatic}` : "",
          !this.props.sidebarOpened ? s.sidebarClose : "",
          "sing-dashboard",
          `dashboard-${
            this.props.sidebarType === SidebarTypes.TRANSPARENT
              ? "light"
              : this.props.dashboardTheme
          }`,
        ].join(" ")}
      >
        <Sidebar />
        <div className={s.wrap}>
          <Header />
          <Hammer onSwipe={this.handleSwipe}>
            <main className={s.content}>
              <BreadcrumbHistory url={this.props.router.pathname} />
              <PageTransition routeKey={this.props.router.asPath}>
                {this.props.children}
              </PageTransition>
              <footer className={s.contentFooter}>
                MoCeramic
              </footer>
            </main>
          </Hammer>
        </div>
      </div>
    );
  }
}

function mapStateToProps(store) {
  return {
    sidebarOpened: store.navigation.sidebarOpened,
    sidebarStatic: store.navigation.sidebarStatic,
    dashboardTheme: store.layout.dashboardTheme,
    sidebarType: store.layout.sidebarType,
    currentUser: store.auth.currentUser,
    loadingInit: store.auth.loadingInit,
  };
}

export default withRouter(connect(mapStateToProps)(Layout));
