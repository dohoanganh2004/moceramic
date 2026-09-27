import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withRouter } from "next/router";
import s from "./Sidebar.module.scss";
import LinksGroup from "./LinksGroup/LinksGroup";
import {
  openSidebar,
  closeSidebar,
  changeActiveSidebarItem,
} from "redux/actions/navigation";
import isScreen from "core/screenHelper";
import { logoutUser } from "redux/actions/auth";
import Brand from "components/Brand";

import HomeIcon from "public/images/e-commerce/sidebar/home";
import DownloadIcon from "public/images/e-commerce/sidebar/download";
import BarIcon from "public/images/e-commerce/sidebar/bar";
import FileIcon from "public/images/e-commerce/sidebar/file";
import GiftIcon from "public/images/e-commerce/sidebar/gift";
import PersonIcon from "public/images/e-commerce/sidebar/person";
import PricetagIcon from "public/images/e-commerce/sidebar/pricetag";
import SettingsIcon from "public/images/e-commerce/sidebar/settings";
import ShoppingIcon from "public/images/e-commerce/sidebar/shopping";

// Staff/admin sections. Which ones a given user sees is driven by the
// `permissions` codes embedded in their JWT (managed by an admin at
// /admin/permissions) rather than a hard-coded role check, so changing a
// role's permissions there takes effect without a frontend deploy. "customer"
// is handled separately below since customers get their own storefront-facing
// links instead of any of these back-office sections.
const STAFF_NAV_ITEMS = [
  { header: "Orders", link: "/admin/orders", icon: DownloadIcon, code: "orders" },
  { header: "Shipments", link: "/admin/shipments", icon: ShoppingIcon, code: "shipments" },
  { header: "Custom Orders", link: "/admin/custom-orders", icon: GiftIcon, code: "custom_orders" },
  { header: "Payments", link: "/admin/payments", icon: PricetagIcon, code: "payments" },
  { header: "Vouchers", link: "/admin/vouchers", icon: DownloadIcon, code: "vouchers" },
  { header: "Products", link: "/admin/products", icon: PricetagIcon, code: "products" },
  { header: "Inventory", link: "/admin/inventory", icon: BarIcon, code: "inventory" },
  { header: "Categories", link: "/admin/categories", icon: BarIcon, code: "categories" },
  { header: "Blog", link: "/admin/blogs", icon: DownloadIcon, code: "blog" },
  { header: "Static Pages", link: "/admin/static-pages", icon: DownloadIcon, code: "static_pages" },
  { header: "Contact Messages", link: "/admin/contact-messages", icon: FileIcon, code: "contact_messages" },
  { header: "Newsletter", link: "/admin/newsletter", icon: PersonIcon, code: "newsletter" },
  { header: "Feedback", link: "/admin/feedback", icon: DownloadIcon, code: "feedback" },
  { header: "Users", link: "/admin/users", icon: PersonIcon, code: "users" },
];

const CUSTOMER_NAV_ITEMS = [
  { header: "Shop", link: "/shop", icon: ShoppingIcon },
  { header: "Blog", link: "/blog", icon: FileIcon },
  { header: "Cart", link: "/cart", icon: PricetagIcon },
  { header: "My Orders", link: "/order/my-order", icon: DownloadIcon },
  { header: "Custom Orders", link: "/custom-order/my-request", icon: BarIcon },
  { header: "Wishlist", link: "/wishlist", icon: GiftIcon },
];

// Guests (not logged in) get the same persistent sidebar too, scoped to the
// links they can actually use without an account.
const GUEST_NAV_ITEMS = [
  { header: "Shop", link: "/shop", icon: ShoppingIcon },
  { header: "Blog", link: "/blog", icon: FileIcon },
  { header: "Cart", link: "/cart", icon: PricetagIcon },
  { header: "Login", link: "/login", icon: PersonIcon },
];

// Sub-items under the collapsible "My Account" group, for every logged-in role.
const MY_ACCOUNT_CHILDREN = [
  { header: "Profile", link: "/account/my-profile", index: "my-account/profile" },
  { header: "Address", link: "/account/address", index: "my-account/address" },
  { header: "Change Password", link: "/account/change-password", index: "my-account/password" },
];

class Sidebar extends React.Component {
  static propTypes = {
    sidebarStatic: PropTypes.bool,
    sidebarOpened: PropTypes.bool,
    dispatch: PropTypes.func.isRequired,
    activeItem: PropTypes.string,
    router: PropTypes.shape({
      pathname: PropTypes.string,
    }).isRequired,
  };

  static defaultProps = {
    sidebarStatic: false,
    sidebarOpened: true,
    activeItem: "",
  };

  constructor(props) {
    super(props);

    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.doLogout = this.doLogout.bind(this);
  }

  onMouseEnter() {
    if (!this.props.sidebarStatic && (isScreen("lg") || isScreen("xl"))) {
      const paths = this.props.router.pathname.split("/");
      paths.pop();
      this.props.dispatch(openSidebar());
      this.props.dispatch(changeActiveSidebarItem(paths.join("/")));
    }
  }

  onMouseLeave() {
    if (!this.props.sidebarStatic && (isScreen("lg") || isScreen("xl"))) {
      this.props.dispatch(closeSidebar());
      this.props.dispatch(changeActiveSidebarItem(null));
    }
  }

  doLogout() {
    this.props.dispatch(logoutUser());
  }

  renderLink = ({ header, link, icon: Icon }) => (
    <LinksGroup
      key={header}
      onActiveSidebarItemChange={(activeItem) =>
        this.props.dispatch(changeActiveSidebarItem(activeItem))
      }
      activeItem={this.props.activeItem}
      header={header}
      link={link}
      isHeader
      iconType="node"
      iconName={<Icon />}
    />
  );

  render() {
    const { currentUser } = this.props;
    const role = currentUser && currentUser.role;
    const isCustomer = role === "customer";
    const isAdmin = role === "admin";
    const permissions = (currentUser && currentUser.permissions) || [];

    return (
      <div
        className={`${
          !this.props.sidebarOpened && !this.props.sidebarStatic
            ? s.sidebarClose
            : ""
        } ${s.sidebarWrapper}`}
      >
        <nav
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
          className={s.root}
        >
          <header className={s.logo}>
            <span className={`${s.logoStyle} mx-1`}>
              <Brand size={26} />
            </span>
          </header>
          <ul className={s.nav}>
            <LinksGroup
                onActiveSidebarItemChange={(activeItem) =>
                    this.props.dispatch(changeActiveSidebarItem(activeItem))
                }
                activeItem={this.props.activeItem}
                header="Home"
                link={`${!currentUser ? '/' : isCustomer ? '/home' : '/admin/dashboard'}`}
                isHeader
                iconType="node"
                iconName={<HomeIcon />}
            />

            {!currentUser && GUEST_NAV_ITEMS.map(this.renderLink)}

            {currentUser && isCustomer &&
              CUSTOMER_NAV_ITEMS.map(this.renderLink)}

            {currentUser && !isCustomer &&
              STAFF_NAV_ITEMS.filter((item) => permissions.includes(item.code)).map(this.renderLink)}

            {currentUser && isAdmin && (
            <LinksGroup
                onActiveSidebarItemChange={(activeItem) =>
                    this.props.dispatch(changeActiveSidebarItem(activeItem))
                }
                activeItem={this.props.activeItem}
                header="Permissions"
                link="/admin/permissions"
                isHeader
                iconType="node"
                iconName={<SettingsIcon />}
            />
            )}

            {currentUser && (
            <LinksGroup
                onActiveSidebarItemChange={(activeItem) =>
                    this.props.dispatch(changeActiveSidebarItem(activeItem))
                }
                activeItem={this.props.activeItem}
                header="My Account"
                link="my-account"
                index="my-account"
                isHeader
                iconType="node"
                iconName={<FileIcon />}
                childrenLinks={MY_ACCOUNT_CHILDREN}
            />
            )}
          </ul>
        </nav>
      </div>
    );
  }
}

function mapStateToProps(store) {
  return {
    sidebarOpened: store.navigation.sidebarOpened,
    sidebarStatic: store.navigation.sidebarStatic,
    activeItem: store.navigation.activeItem,
    currentUser: store.auth.currentUser,
  };
}

export default withRouter(connect(mapStateToProps)(Sidebar));
