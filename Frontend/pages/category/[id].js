import React from "react";
import {
  Container,
  Row,
  Col,
  Input,
  Button,
  Modal,
} from "reactstrap";
import Link from "next/link";
import { useSelector } from "react-redux";
import s from "./Shop.module.scss";

import InfoBlock from 'components/e-commerce/InfoBlock';
import InstagramWidget from 'components/e-commerce/Instagram';
import filter from "public/images/e-commerce/filter.svg";
import relevant from "public/images/e-commerce/relevant.svg";
import axios from "axios";
import { toast } from "react-toastify";
import Head from "next/head";
import { useRouter } from "next/router";
import useWishlist from "hooks/useWishlist";
import { emitCartUpdated } from "utils/cartEvents";
import resolveAssetUrl from "utils/resolveAssetUrl";
import { formatVND } from "utils/formatCurrency";

let categoriesList = [];

const Index = ({ categoryId, categoryData }) => {
  const router = useRouter();
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
  const {categoryName} = router.query
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
      axios.get(`/products`).then((res) => {
          const byCategory = res.data.filter((p) => String(p.categoryId) === String(categoryId));
          setAllProducts(byCategory);
          setProducts(byCategory);
      })
      axios.get("/categories").then((res) => setCategories(res.data || [])).catch(() => setCategories([]));
  }, [categoryId]);



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


  const filterByCategory = (category) => {
    let count = 0;
    categoriesList.push(category)
    categoriesList.forEach(item => {
      if (item === category) count += 1;
    })
    categoriesList = categoriesList.filter(item => {
      if (categoriesList.length === 1) {
        return true
      }
      if (count === 1 && item === category) return true;
      return item !== category
    })
    if (categoriesList.length === 0) {
      setProducts([...allProducts]);
      return;
    }
    setProducts(
      allProducts.filter((p) => categoriesList.includes(String(p.categoryId)))
    );
  }
  return (
    <>
      <Head>
        <title>{categoryName} Category</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />

        <meta name="description" content={`${categoryData.meta_description || 'Beautifully designed web application template built with React and Bootstrap to create modern apps and speed up development'}`}  />
        <meta name="keywords" content={`${categoryData.keywords || "flatlogic, react templates"}`} />
        <meta name="author" content={`${categoryData.meta_author || "MoCeramic"}`} />
        <meta charSet="utf-8" />


        <meta property="og:title" content={`${categoryData.meta_og_title || "MoCeramic - Handcrafted Ceramics"}`} />
        <meta property="og:type" content="website"/>
        <meta property="og:url" content={`${categoryData.meta_og_url || "https://flatlogic-ecommerce.herokuapp.com/"}`} />
        <meta property="og:image" content={`${categoryData.meta_og_image || "https://flatlogic-ecommerce-backend.herokuapp.com/images/blogs/content_image_six.jpg"}`} />
        <meta property="og:description" content={`${categoryData.meta_description || 'Beautifully designed web application template built with React and Bootstrap to create modern apps and speed up development'}`} />
        <meta name="twitter:card" content="summary_large_image" />

        <meta property="fb:app_id" content={`${categoryData.meta_fb_id || "712557339116053"}`} />

        <meta property="og:site_name" content={`${categoryData.meta_og_sitename || "MoCeramic"}`} />
        <meta name="twitter:site" content={`${categoryData.post_twitter || "@flatlogic"}`} />
      </Head>
      <Container className={"mb-5"} style={{ marginTop: 21 }}>
        <Row>
          <Col sm={3} className={`${s.filterColumn} ${showFilter ? s.showFilter : ''}`}>
          <div className={s.filterTitle}><h5 className={"fw-bold mb-5 text-uppercase"}>Categories</h5><span onClick={() => setShowFilter(false)}>✕</span></div>
            {categories.length === 0 ? (
              <p className={"text-muted"}>No categories yet.</p>
            ) : (
              categories.map((cat, i) => (
                <div className={`d-flex align-items-center ${i > 0 ? "mt-2" : ""}`} key={cat.id}>
                  <input type={"checkbox"} onClick={() => filterByCategory(String(cat.id))}/>
                  <p className={"d-inline-block ml-2 mb-0"}>{cat.name}</p>
                </div>
              ))
            )}
            <h5
                className={"fw-bold mb-5 mt-5 text-uppercase"}
            >
              Price
            </h5>
            <p>Price Range: {formatVND(0)} - {formatVND(1000)}</p>
            <input
                type="range"
                min="0"
                max="1400"
                defaultValue={"1000"}
                className={"w-100"}
            />
          </Col>
          <Col sm={width <= 768 ? 12 : 9}>
            {!(width <= 768) ? (
              <div
                className={"d-flex justify-content-between align-items-center"}
                style={{ marginBottom: 50, marginTop: 33 }}
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
                  <Input type={"select"} style={{ height: 50, width: 160 }}>
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
              {products.map((c, index) => {
                return (
                  <Col xs={12} md={6} sm={6} lg={4} className={`mb-4 ${s.product}`}>
                    <Modal
                      isOpen={openState[`open${index}`]}
                      toggle={() => dispatch({ type: `open${index}` })}
                    >
                      <img src={resolveAssetUrl(c.images?.[0]?.imageUrl)} />
                    </Modal>
                    <div style={{ position: "relative" }}>
                      <Link href={`/products/${c.id}`}>
                        <a>
                        <img
                          src={resolveAssetUrl(c.images?.[0]?.imageUrl)}
                          className={"img-fluid"}
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
                            toggleWishlist(c.id);
                          }}
                        >
                          <div
                            className={`mb-4 ${s.product__actions__heart} ${
                              wishlistIds.has(c.id) ? s.product__actions__heart_active : ""
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
                            addToCart(c);
                          }}
                        >
                          <div className={`mb-4 ${s.product__actions__cart}`} />
                        </Button>
                      </div>
                    </div>
                    <p className={"mt-3 text-muted mb-0"}>
                      {c.categoryName}
                    </p>
                    <Link href={`/products/${c.id}`}>
                      <a>
                      <h6
                        className={"fw-bold font-size-base mt-1"}
                        style={{ fontSize: 16 }}
                      >
                        {c.name}
                      </h6>
                      </a>
                    </Link>
                    <h6 style={{ fontSize: 16 }}>{formatVND(c.basePrice)}</h6>
                  </Col>
                );
              })}
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
  try {
    const res = await axios.get(`/categories/${context.query.id}`);
    return {
      props: { categoryId: context.query.id, categoryData: res.data },
    };
  } catch (error) {
    return {
      props: { categoryId: context.query.id, categoryData: {} },
    };
  }
}

export default Index;
