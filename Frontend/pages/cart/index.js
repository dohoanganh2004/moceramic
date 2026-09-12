import React from "react";
import { Container, Row, Col, Table, Button } from "reactstrap";
import Link from "next/link";
import s from "./Cart.module.scss";
import close from "public/images/e-commerce/close.svg";
import { useSelector } from "react-redux";
import axios from "axios";
import Head from "next/head";
import { toast, ToastContainer } from "react-toastify";

const Index = () => {
  const currentUser = useSelector((store) => store.auth.currentUser);
  const [cart, setCart] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const fetchCart = () => {
    axios
      .get("/cart")
      .then((res) => {
        setCart(res.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  React.useEffect(() => {
    if (currentUser) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const updateQuantity = (itemId, quantity) => {
    if (quantity < 1) return;
    axios
      .patch(`/cart/items/${itemId}`, { quantity })
      .then((res) => {
        setCart(res.data);
      })
      .catch(() => {
        toast.error("Could not update quantity");
      });
  };

  const removeItem = (itemId) => {
    axios
      .delete(`/cart/items/${itemId}`)
      .then(() => {
        toast.info("Item removed from cart");
        fetchCart();
      })
      .catch(() => {
        toast.error("Could not remove item");
      });
  };

  const items = (cart && cart.items) || [];
  const totalPrice = (cart && cart.totalAmount) || 0;

  return (
    <Container>
      <Head>
        <title>Cart</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />

        <meta name="description" content="Beautifully designed web application template built with React and Bootstrap to create modern apps and speed up development" />
        <meta name="keywords" content="flatlogic, react templates" />
        <meta name="author" content="Flatlogic LLC." />
        <meta charSet="utf-8" />


        <meta property="og:title" content="Flatlogic - React, Vue, Angular and Bootstrap Templates and Admin Dashboard Themes"/>
        <meta property="og:type" content="website"/>
        <meta property="og:url" content="https://flatlogic-ecommerce.herokuapp.com/"/>
        <meta property="og:image" content="https://flatlogic-ecommerce-backend.herokuapp.com/images/blogs/content_image_six.jpg"/>
        <meta property="og:description" content="Beautifully designed web application template built with React and Bootstrap to create modern apps and speed up development"/>
        <meta name="twitter:card" content="summary_large_image" />

        <meta property="fb:app_id" content="712557339116053" />

        <meta property="og:site_name" content="Flatlogic"/>
        <meta name="twitter:site" content="@flatlogic" />
      </Head>
      <Row className={"mb-5"} style={{ marginTop: 32 }}>
        <ToastContainer />
        <Col xs={12} lg={8}>
          <h2 className={"fw-bold mt-4 mb-5"}>Shopping Cart</h2>
          {!currentUser ? (
            <p>
              Please{" "}
              <Link href="/login">
                <a>log in</a>
              </Link>{" "}
              to see your cart.
            </p>
          ) : (
            <Table borderless>
              <thead>
                <tr style={{ borderBottom: "1px solid #D9D9D9" }}>
                  <th className={"bg-transparent text-dark px-0"}>Product</th>
                  <th className={"bg-transparent text-dark px-0"}>Quantity</th>
                  <th className={"bg-transparent text-dark px-0"}>Price</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td>
                      <p className={"mt-3"}>Loading...</p>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td>
                      <h5 className={"fw-bold mt-3"}>No items</h5>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr className={"mt-2"} key={item.id}>
                      <td className={"px-0 pt-4"}>
                        <div className={"d-flex align-items-center"}>
                          <img
                            src={item.imageUrl}
                            width={100}
                            className={"mr-4"}
                          />
                          <div>
                            <h6 className={"text-muted"}>
                              {item.variantSnapshot}
                            </h6>
                            <h5 className={"fw-bold"}>{item.productName}</h5>
                          </div>
                        </div>
                      </td>
                      <td className={"px-0 pt-4"}>
                        <div className={"d-flex align-items-center"}>
                          <Button
                            className={`${s.quantityBtn} bg-transparent border-0 p-1 fw-bold mr-3`}
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <p className={"fw-bold mb-0"}>{item.quantity}</p>
                          <Button
                            className={`${s.quantityBtn} bg-transparent border-0 p-1 fw-bold ml-3`}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </td>
                      <td className={"px-0 pt-4"}>
                        <h6 className={"fw-bold mb-0"}>{item.lineTotal}$</h6>
                      </td>
                      <td className={"px-0 pt-4"}>
                        <Button
                          className={"bg-transparent border-0 p-0"}
                          onClick={() => removeItem(item.id)}
                        >
                          <img src={close} alt={"close"} />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Col>
        <Col xs={12} lg={4}>
          <section className={s.cartTotal}>
            <h2 className={"fw-bold mb-5"}>Cart Total</h2>
            <div className={"d-flex"}>
              <h6 className={"fw-bold mr-5 mb-0"}>Subtotal:</h6>
              <h6 className={"fw-bold mb-0"}>{totalPrice}$</h6>
            </div>
            <hr className={"my-4"} />
            <div className={"d-flex"}>
              <h6 className={"fw-bold mr-5 mb-0"}>Shipping:</h6>
              <div>
                <h6 className={"fw-bold mb-3"}>Free Shipping</h6>
                <p className={"mb-0"}>
                  Shipping options will be updated during checkout.
                </p>
              </div>
            </div>
            <hr className={"my-4"} />
            <div className={"d-flex"}>
              <h5 className={"fw-bold"} style={{ marginRight: 63 }}>
                Total:
              </h5>
              <h5 className={"fw-bold"}>{totalPrice}$</h5>
            </div>
            <Link href={"/billing"}>
              <Button
                color={"primary"}
                className={`${s.checkOutBtn} text-uppercase mt-auto fw-bold`}
              >
                Check out
              </Button>
            </Link>
          </section>
        </Col>
      </Row>
    </Container>
  );
};

export default Index;
