import React from "react";
import { Container, Row, Col, Input, Button, Modal } from "reactstrap";
import Checkbox from "react-custom-checkbox";
import InputRange from "react-input-range";
import Link from "next/link";
import {useDispatch, useSelector} from "react-redux";
import s from "./Shop.module.scss";

import InfoBlock from 'components/e-commerce/InfoBlock';
import filter from "public/images/e-commerce/filter.svg";
import relevant from "public/images/e-commerce/relevant.svg";
import axios from "axios";
import { toast } from "react-toastify";
import Head from "next/head";
import InstagramWidget from 'components/e-commerce/Instagram';
import arrowRight from "../../public/images/e-commerce/home/arrow-right.svg";
import rating from "../../public/images/e-commerce/details/stars.svg";
import productsListActions from "../../redux/actions/products/productsListActions";
import useWishlist from "hooks/useWishlist";
import { emitCartUpdated } from "utils/cartEvents";
import resolveAssetUrl from "utils/resolveAssetUrl";
import { formatVND } from "utils/formatCurrency";

let categoriesList = [];

const Index = () => {
  const [quantity, setQuantity] = React.useState(1);
  const dispatchStore = useDispatch()
  const [rangeValue, setRangeValue] = React.useState({
    min: 0,
    max: 1000,
  });
  const openReducer = (state, action) => {
    switch (action.type) {
      case "open0":
        return {
          ...state,

          open0: !state.open0,
        };
      case "open1":
        return {
          ...state,
          open1: !state.open1,
        };
      case "open2":
        return {
          ...state,

          open2: !state.open2,
        };
      case "open3":
        return {
          ...state,

          open3: !state.open3,
        };
      case "open4":
        return {
          ...state,

          open4: !state.open4,
        };
      case "open5":
        return {
          ...state,

          open5: !state.open5,
        };
      case "open6":
        return {
          ...state,

          open6: !state.open6,
        };
      case "open7":
        return {
          ...state,

          open7: !state.open6,
        };
      case "open8":
        return {
          ...state,

          open8: !state.open8,
        };
    }
  };
  const [width, setWidth] = React.useState(1440);
  const [products, setProducts] = React.useState([]);
  const [showFilter, setShowFilter] = React.useState(false);
  const [allProducts, setAllProducts] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const [openState, dispatch] = React.useReducer(openReducer, {
    open0: false,
    open1: false,
    open2: false,
    open3: false,
    open4: false,
    open5: false,
    open6: false,
    open7: false,
    open8: false,
  });
  const currentUser = useSelector((store) => store.auth.currentUser);
  const { wishlistIds, toggleWishlist } = useWishlist(currentUser);
  React.useEffect(() => {
    window.addEventListener("resize", () => {
      setWidth(window.innerWidth);
    });
    axios.get("/products").then((res) => {
      setAllProducts(res.data);
      setProducts([...res.data]);
    });
    axios.get("/categories").then((res) => setCategories(res.data || [])).catch(() => setCategories([]));
  }, []);

  const addToCart = (product, quantity = 1) => {
    if (!currentUser) {
      toast.info("Please log in to add items to your cart");
      if (typeof window !== "undefined") { window.location.href = "/login"; }
      return;
    }
    const variantId = product && product.variants && product.variants[0] && product.variants[0].id;
    if (!variantId) {
      toast.error("This product is not available for purchase right now");
      return;
    }
    axios
      .post(`/cart/items`, { variantId, quantity })
      .then((res) => {
        emitCartUpdated(res.data.totalItems);
        toast.info("Product successfully added to your cart");
      })
      .catch(() => {
        toast.error("Could not add this item to your cart");
      });
  };

  const buyNow = (product, quantity = 1) => {
    if (!currentUser) {
      toast.info("Please log in to buy this item");
      if (typeof window !== "undefined") { window.location.href = "/login"; }
      return;
    }
    const variant = product && product.variants && product.variants[0];
    if (!variant) {
      toast.error("This product is not available for purchase right now");
      return;
    }
    if (typeof window !== "undefined") {
      sessionStorage.setItem("buyNowItem", JSON.stringify({
        productId: product.id,
        productName: product.name,
        imageUrl: resolveAssetUrl(product.images?.[0]?.imageUrl),
        variantId: variant.id,
        variantSnapshot: [variant.colorGlaze, variant.size].filter(Boolean).join(' / '),
        unitPrice: variant.price || product.basePrice || 0,
        quantity,
      }));
      window.location.href = "/order";
    }
  };

  const filterByCategory = (category) => {
    let count = 0;
    categoriesList.push(category);
    categoriesList.forEach((item) => {
      if (item === category) count += 1;
    });
    categoriesList = categoriesList.filter((item) => {
      if (categoriesList.length === 1) {
        return true;
      }
      if (count === 1 && item === category) return true;
      return item !== category;
    });
    // Category filtering by query string isn't supported by the API - filter
    // the already-fetched product list client-side instead.
    if (categoriesList.length === 0) {
      setProducts([...allProducts]);
      return;
    }
    setProducts(
      allProducts.filter((p) => categoriesList.includes(String(p.categoryId)))
    );
  };

  return (
    <>
      <Head>
        <title>Shop</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />

        <meta name="description" content="Beautifully designed web application template built with React and Bootstrap to create modern apps and speed up development" />
        <meta name="keywords" content="flatlogic, react templates" />
        <meta name="author" content="MoCeramic" />
        <meta charSet="utf-8" />


        <meta property="og:title" content="MoCeramic - Handcrafted Ceramics"/>
        <meta property="og:type" content="website"/>
        <meta property="og:url" content="https://flatlogic-ecommerce.herokuapp.com/"/>
        <meta property="og:image" content="https://flatlogic-ecommerce-backend.herokuapp.com/images/blogs/content_image_six.jpg"/>
        <meta property="og:description" content="Beautifully designed web application template built with React and Bootstrap to create modern apps and speed up development"/>
        <meta name="twitter:card" content="summary_large_image" />

        <meta property="fb:app_id" content="712557339116053" />

        <meta property="og:site_name" content="MoCeramic"/>
        <meta name="twitter:site" content="@flatlogic" />
      </Head>
      <Container className={"mb-5"} style={{ marginTop: 32 }}>
        <Row>
          <Col sm={3} className={`${s.filterColumn} ${showFilter ? s.showFilter : ''}`}>
            <div className={s.filterTitle}><h5 className={"fw-bold mb-5 text-uppercase"}>Categories</h5><span onClick={() => setShowFilter(false)}>✕</span></div>
            {categories.length === 0 ? (
              <p className={"text-muted"}>No categories yet.</p>
            ) : (
              categories.map((cat, i) => (
                <div className={`d-flex align-items-center ${i > 0 ? "mt-2" : ""}`} key={cat.id}>
                  <Checkbox
                    borderColor={"#232323"}
                    borderWidth={1}
                    borderRadius={2}
                    icon={
                      <div
                        style={{
                          backgroundColor: "#bd744c",
                          borderRadius: 2,
                          padding: 4,
                        }}
                      />
                    }
                    size={16}
                    label={<p className={"d-inline-block ml-1 mb-0"}>{cat.name}</p>}
                    onChange={() => filterByCategory(String(cat.id))}
                    style={{ marginTop: -1 }}
                  />
                </div>
              ))
            )}
            <h5 className={"fw-bold mb-5 mt-5 text-uppercase"}>Price</h5>
            <p>Price Range: {formatVND(0)} - {formatVND(1500)}</p>
            <InputRange
              maxValue={1500}
              minValue={0}
              formatLabel={(rangeValue) => formatVND(rangeValue)}
              value={rangeValue}
              onChange={(value) => setRangeValue(value)}
            />

          </Col>
          <Col sm={width <= 768 ? 12 : 9}>
            {!(width <= 768) ? (
              <div
                className={"d-flex justify-content-between align-items-center"}
                style={{ marginBottom: 50 }}
              >
                <h6>
                  Showing{" "}
                  <span className={"fw-bold text-primary"}>
                    {products.length}
                  </span>{" "}
                  of <span className={"fw-bold text-primary"}>{allProducts.length}</span> Products
                </h6>
                <div className={"d-flex align-items-center"}>
                  <h6 className={"text-nowrap mr-3 mb-0"}>Sort by:</h6>
                  <Input type={"select"} style={{ height: 50, width: 180 }}>
                    <option>Most Popular</option>
                    <option>Newest</option>
                    <option>Price: low to high</option>
                    <option>Price: high to low</option>
                  </Input>
                </div>
              </div>
            ) : (
              <>
                <div className={"d-flex justify-content-between"}>
                  <Button
                    className={"text-dark bg-transparent border-0"}
                    style={{ padding: "14px 0 22px 0" }}
                    onClick={() => setShowFilter(true)}
                  >
                    <img src={filter} /> Filters
                  </Button>
                  <Button
                    className={"text-dark bg-transparent border-0"}
                    style={{ padding: "14px 0 22px 0" }}
                  >
                    <img src={relevant} /> Relevant
                  </Button>
                </div>
                <hr style={{ marginTop: 0, marginBottom: "2rem" }} />
              </>
            )}
            <Row>
              {products.map((item, index) => (
                <Col md={6} lg={4} xs={12} className={`mb-4 ${s.product}`} key={index}>
                  <Modal
                    isOpen={openState[`open${index}`]}
                    toggle={() => dispatch({ type: `open${index}` })}
                  >
                    <div className={s.modalWidndow}>
                      <div className={s.image}>
                        <img
                          src={resolveAssetUrl(item.images?.[0]?.imageUrl)}
                          width={"100%"}
                          height={"100%"}
                        />
                      </div>
                      <div
                        className={
                          `${s.content} p-4 d-flex flex-column justify-content-between`
                        }
                      
                      >
                        <Link href={`/products/${item.id}`}>
                          <a className={"fw-semi-bold"}>
                            More about product
                            <img
                              src={arrowRight}
                              alt={"arrow"}
                              className={"ml-2"}
                            />
                          </a>
                        </Link>
                        <h6 className={`text-muted`}>
                          {item.categoryName}
                        </h6>
                        <h4 className={"fw-bold"}>{item.name}</h4>
                        <div className={"d-flex align-items-center"}>
                          <img src={rating} />
                          <p className={"text-primary ml-3 mb-0"}>12 reviews</p>
                        </div>
                        <p>
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit. In ut ullamcorper leo, eget euismod orci. Cum
                          sociis natoque penatibus et magnis dis parturient
                          montes, nascetur ridiculus mus. Vestibulum ultricies
                          aliquam.
                        </p>
                        <div className={"d-flex"}>
                          <div
                            className={
                              "d-flex flex-column mr-5 justify-content-between"
                            }
                          >
                            <h6 className={"fw-bold text-muted text-uppercase"}>
                              Quantity
                            </h6>
                            <div className={"d-flex align-items-center"}>
                              <Button
                                className={`bg-transparent border-0 p-1 fw-bold mr-3 ${s.quantityBtn}`}
                                onClick={() => {
                                  if (quantity === 1) return;
                                  setQuantity((prevState) => prevState - 1);
                                }}
                              >
                                -
                              </Button>
                              <p className={"fw-bold mb-0"}>{quantity}</p>
                              <Button
                                className={`bg-transparent border-0 p-1 fw-bold ml-3 ${s.quantityBtn}`}
                                onClick={() => {
                                  if (quantity < 1) return;
                                  setQuantity((prevState) => prevState + 1);
                                }}
                              >
                                +
                              </Button>
                            </div>
                          </div>
                          <div
                            className={
                              "d-flex flex-column justify-content-between"
                            }
                          >
                            <h6 className={"fw-bold text-muted text-uppercase"}>
                              Price
                            </h6>
                            <h6 className={"fw-bold"}>{formatVND(item.basePrice)}</h6>
                          </div>
                        </div>
                        <div className={"d-flex mt-5"}>
                          <Button
                            outline
                            color={"primary"}
                            className={"flex-fill mr-4 text-uppercase fw-bold"}
                            style={{ width: "50%" }}
                            onClick={() => {
                              addToCart(item, quantity);
                            }}
                          >
                            Add to Cart
                          </Button>
                          <Button
                            color={"primary"}
                            className={"flex-fill text-uppercase fw-bold"}
                            style={{ width: "50%" }}
                            onClick={() => {
                              buyNow(item, quantity);
                            }}
                          >
                            Buy now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Modal>
                  <div style={{ position: "relative" }}>
                    <Link href={`/products/${item.id}`}>
                      <a>
                        <div
                          style={{
                            backgroundImage: `url(${resolveAssetUrl(item.images?.[0]?.imageUrl)})`
                          }}
                          className={s.productImage}
                        />
                      </a>
                    </Link>
                    <div
                      className={`d-flex flex-column justify-content-center ${s.product__actions}`}
                      style={{
                        position: "absolute",
                        height: "100%",
                        top: 0,
                        right: 15,
                      }}
                    >
                      <Button
                        className={"p-0 bg-transparent border-0"}
                        onClick={() => {
                          toggleWishlist(item.id);
                        }}
                      >
                        <div
                          className={`mb-4 ${s.product__actions__heart} ${
                            wishlistIds.has(item.id) ? s.product__actions__heart_active : ""
                          }`}
                        />
                      </Button>
                      <Button
                        className={"p-0 bg-transparent border-0"}
                        onClick={() => {
                          dispatch({ type: `open${index}` });
                        }}
                      >
                        <div className={`mb-4 ${s.product__actions__max}`} />
                      </Button>
                      <Button
                        className={"p-0 bg-transparent border-0"}
                        onClick={() => {
                          addToCart(item);
                        }}
                      >
                        <div className={`mb-4 ${s.product__actions__cart}`} />
                      </Button>
                    </div>
                  </div>
                  <div className={s.productInfo}>
                    <div>
                      <Link href={`/category/${item.categoryId}`}>
                        <a className={"mt-3 text-muted mb-0  d-inline-block"} >
                        {item.categoryName}
                        </a>
                      </Link>
                      <Link href={`/products/${item.id}`}>
                        <a>
                          <h6
                            className={"fw-bold font-size-base mt-1"}
                            style={{ fontSize: 16 }}
                          >
                            {item.name}
                          </h6>
                        </a>
                      </Link>
                      <h6 style={{ fontSize: 16 }}>{formatVND(item.basePrice)}</h6>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </Container>
      <InfoBlock />
      <InstagramWidget />
    </>
  );
};

export async function getServerSideProps(context) {
  // const res = await axios.get("/products");
  // const products = res.data.rows;

  return {
    props: {}, // will be passed to the page component as props
  };
}

export default Index;
