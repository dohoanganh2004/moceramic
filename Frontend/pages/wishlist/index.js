import React from "react";
import { Container, Row, Col, Table, Button } from "reactstrap";
import close from "public/images/e-commerce/close.svg";

import InstagramWidget from 'components/e-commerce/Instagram';
import { useSelector } from "react-redux";
import axios from "axios";
import s1 from "./Wishlist.module.scss";
import Head from "next/head";
import { toast } from "react-toastify";
import InfoBlock from "components/e-commerce/InfoBlock";
import resolveAssetUrl from "utils/resolveAssetUrl";
import { formatVND } from "utils/formatCurrency";

const Cart = () => {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const currentUser = useSelector((store) => store.auth.currentUser);

  const fetchWishlist = () => {
    axios
      .get("/wishlist")
      .then((res) => {
        setItems(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  React.useEffect(() => {
    if (currentUser) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const removeFromWishlist = (productId) => {
    axios
      .delete(`/wishlist/${productId}`)
      .then(() => {
        toast.info("Product successfully removed");
        fetchWishlist();
      })
      .catch(() => {
        toast.error("Could not remove item");
      });
  };

  const goToProduct = (productId) => {
    if (typeof window !== "undefined") {
      window.location.href = `/products/${productId}`;
    }
  };

  return (
    <>
      <Head>
        <title>Wishlist</title>
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
      <Container>
        <Row className={"mb-5"} style={{ marginTop: 32 }}>
          <Col xs={12} style={{ overflow: 'auto' }}>
            <h2 className={"fw-bold mt-4 mb-4"}>Wishlist</h2>
            <Table className={s1.wishListTable} borderless>
              <thead>
                <tr style={{ borderBottom: "1px solid #D9D9D9" }}>
                  <th className={"bg-transparent text-dark px-0"}>Product</th>
                  <th className={"bg-transparent text-dark px-0"}>Price</th>
                  <th className={"bg-transparent text-dark px-0"} />
                  <th className={"bg-transparent text-dark px-0"} />
                </tr>
              </thead>
              <tbody>
                {!currentUser ? (
                  <tr>
                    <td>Please log in to see your wishlist.</td>
                  </tr>
                ) : loading ? (
                  <tr>
                    <td>Loading...</td>
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
                            src={resolveAssetUrl(item.productImageUrl)}
                            width={100}
                            className={"mr-4"}
                          />
                          <h5 className={"fw-bold"}>{item.productName}</h5>
                        </div>
                      </td>
                      <td className={"px-0 pt-4"}>
                        <h6 className={"fw-bold mb-0"}>{formatVND(item.basePrice)}</h6>
                      </td>
                      <td className={"px-0 pt-4"}>
                        <Button
                          color={"primary"}
                          outline
                          className={`text-uppercase d-flex align-items-center ${s1.addToCartBtn}`}
                          size={"sm"}
                          onClick={() => goToProduct(item.productId)}
                        >
                          <div className={`mr-2 ${s1.addToCart}`} />
                          view product
                        </Button>
                      </td>
                      <td className={"px-0 pt-4"}>
                        <Button
                          className={"bg-transparent border-0 p-0"}
                          onClick={() => removeFromWishlist(item.productId)}
                        >
                          <img src={close} alt={"close"} />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>
      <InfoBlock />
      <InstagramWidget />
    </>
  );
};

export default Cart;
