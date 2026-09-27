import React from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Modal,
  ModalBody,
  Input,
} from "reactstrap";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import Link from "next/link";
import { useSelector } from "react-redux";
import productRight from "public/images/e-commerce/details/1-right.png";
import productCenter from "public/images/e-commerce/details/1-center.png";
import productLeft from "public/images/e-commerce/details/1-left.png";
import person2 from "public/images/e-commerce/details/person2.jpg";
import s from "./Product.module.scss";
import { emitCartUpdated } from "utils/cartEvents";
import resolveAssetUrl from "utils/resolveAssetUrl";
import { formatVND } from "utils/formatCurrency";

import InfoBlock from 'components/e-commerce/InfoBlock';
import closeIcon from "public/images/e-commerce/details/close.svg";
import preloaderImg from 'public/images/e-commerce/preloader.gif';
import InstagramWidget from 'components/e-commerce/Instagram';
import ImagePreviewGrid from 'components/ImagePreviewGrid';
import axios from "axios";
import Head from "next/head";
import ReactImageMagnify from 'react-image-magnify';

const Star = ({ selected = false, onClick = (f) => f }) => (
  <div
    className={selected ? `${s.star} ${s.selected}` : `${s.star}`}
    onClick={onClick}
  ></div>
);

const Id = ({ product }) => {
  const [isOpen, setOpen] = React.useState(false);
  const [width, setWidth] = React.useState(1440);
  const currentUser = useSelector((state) => state.auth.currentUser);
  const [reviews, setReviews] = React.useState([]);
  const [starsSelected, setStarsSelected] = React.useState(0);
  const [reviewComment, setReviewComment] = React.useState('');
  const [reviewFiles, setReviewFiles] = React.useState([]);
  const [selectedVariantId, setSelectedVariantId] = React.useState(
    product && product.variants && product.variants[0] ? product.variants[0].id : null
  );
  const [quantity, setQuantity] = React.useState(1);
  const [fetching, setFetching] = React.useState(true);
  const [activeImageIndex, setActiveImageIndex] = React.useState(0);
  const thumbStripRef = React.useRef(null);
  const router = useRouter();

  React.useEffect(() => {
    if (!product) {
      setFetching(false);
      return;
    }
    setActiveImageIndex(0);
    axios
      .get(`/products/${product.id}/reviews`)
      .then((res) => setReviews(res.data || []))
      .catch(() => setReviews([]));
    typeof window !== "undefined" &&
      window.addEventListener("resize", () => {
        setWidth(window.innerWidth);
      });
    typeof window !== "undefined" &&
      window.setTimeout(() => {
        setFetching(false);
      }, 300);
  }, [product && product.id]);

  React.useEffect(() => {
    if (!product) return;
    const variant = (product.variants || []).find((v) => v.id === selectedVariantId);
    if (!variant) return;
    const available = Math.max(0, (variant.quantityOnHand || 0) - (variant.quantityReserved || 0));
    setQuantity((prevQuantity) => (available > 0 ? Math.min(prevQuantity, available) : 1));
  }, [selectedVariantId]);

  if (!product) {
    return (
      <Container className={"mt-5 mb-5"}>
        <h3>Product not found</h3>
        <Link href="/shop">
          <a>Back to shop</a>
        </Link>
      </Container>
    );
  }

  const images =
    product.images && product.images.length
      ? [...product.images].sort((a, b) => {
          if (a.isPrimary && !b.isPrimary) return -1;
          if (!a.isPrimary && b.isPrimary) return 1;
          return (a.sortOrder || 0) - (b.sortOrder || 0);
        })
      : [];
  const activeImage = images[activeImageIndex] || images[0];
  const mainImage = resolveAssetUrl(activeImage && activeImage.imageUrl);
  const scrollThumbs = (direction) => {
    if (thumbStripRef.current) {
      thumbStripRef.current.scrollBy({ left: direction * 176, behavior: "smooth" });
    }
  };
  const variants = product.variants || [];
  const selectedVariant = variants.find((v) => v.id === selectedVariantId);
  const availableQty = selectedVariant
    ? Math.max(0, (selectedVariant.quantityOnHand || 0) - (selectedVariant.quantityReserved || 0))
    : 0;
  const isOutOfStock = !!selectedVariant && availableQty <= 0;
  const unitPrice = Number(
    (selectedVariant && selectedVariant.price) || product.basePrice || 0
  );
  const totalPrice = (unitPrice * quantity).toFixed(2);

  const addToCart = () => {
    if (!currentUser) {
      toast.info("Please log in to add items to your cart");
      if (typeof window !== "undefined") { window.location.href = "/login"; }
      return;
    }
    if (!selectedVariantId) {
      toast.error("This product is not available for purchase right now");
      return;
    }
    if (isOutOfStock) {
      toast.error("This item is out of stock");
      return;
    }
    axios
      .post(`/cart/items`, { variantId: selectedVariantId, quantity })
      .then((res) => {
        emitCartUpdated(res.data.totalItems);
        toast.info("Product successfully added to your cart");
      })
      .catch(() => {
        toast.error("Could not add this item to your cart");
      });
  };

  const buyNow = () => {
    if (!currentUser) {
      toast.info("Please log in to buy this item");
      if (typeof window !== "undefined") { window.location.href = "/login"; }
      return;
    }
    if (!selectedVariantId) {
      toast.error("This product is not available for purchase right now");
      return;
    }
    if (isOutOfStock) {
      toast.error("This item is out of stock");
      return;
    }
    if (typeof window !== "undefined") {
      sessionStorage.setItem("buyNowItem", JSON.stringify({
        productId: product.id,
        productName: product.name,
        imageUrl: mainImage,
        variantId: selectedVariantId,
        variantSnapshot: [selectedVariant && selectedVariant.colorGlaze, selectedVariant && selectedVariant.size].filter(Boolean).join(' / '),
        unitPrice,
        quantity,
      }));
      window.location.href = "/order";
    }
  };

  const addToWishlist = () => {
    if (!currentUser) {
      toast.info("Please log in to add items to your wishlist");
      if (typeof window !== "undefined") { window.location.href = "/login"; }
      return;
    }
    axios
      .post(`/wishlist`, { productId: product.id })
      .then(() => {
        toast.info("Product successfully added to your wishlist");
      })
      .catch(() => {
        toast.error("Could not add this item to your wishlist");
      });
  };

  const submitReview = () => {
    if (!currentUser) {
      toast.info("Please log in to leave a review");
      return;
    }
    if (!starsSelected) {
      toast.error("Please select a rating");
      return;
    }
    const formData = new FormData();
    formData.append(
      "data",
      new Blob([JSON.stringify({ rating: starsSelected, comment: reviewComment })], {
        type: "application/json",
      })
    );
    reviewFiles.forEach((file) => formData.append("files", file));
    axios
      .post(`/products/${product.id}/reviews`, formData)
      .then((res) => {
        setReviews((prev) => [res.data, ...prev]);
        setOpen(false);
        setStarsSelected(0);
        setReviewComment('');
        setReviewFiles([]);
        toast.info("Thank you for your review");
      })
      .catch(() => {
        toast.error("Could not submit your review");
      });
  };

  return (
    <>
      <Head>
        <title>{product.name}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="description" content="Beautifully designed web application template built with React and Bootstrap to create modern apps and speed up development" />
        <meta charSet="utf-8" />
      </Head>
      <Container>
        {fetching ? (
          <div style={{ height: 480 }} className={"d-flex justify-content-center align-items-center"}>
            <img src={preloaderImg} alt={"fetching"} />
          </div>
        ) : (
          <Row className={"mb-5"} style={{ marginTop: 32 }}>
            <Col xs={12} lg={6} className={"d-flex flex-column"}>
              {mainImage ? (
                <ReactImageMagnify
                  key={(activeImage && activeImage.id) || activeImageIndex}
                  {...{
                    smallImage: {
                      alt: product.name,
                      isFluidWidth: true,
                      src: mainImage,
                    },
                    largeImage: {
                      src: mainImage,
                      width: 1200,
                      height: 1200,
                    },
                  }}
                  enlargedImagePosition={"over"}
                />
              ) : (
                <div style={{ width: "100%", height: 400, background: "#f2f2f2" }} />
              )}
              {images.length > 1 ? (
                <div className={`d-flex align-items-center mt-3 ${s.thumbRow}`}>
                  <button
                    type="button"
                    className={s.thumbNav}
                    aria-label="Previous images"
                    onClick={() => scrollThumbs(-1)}
                  >
                    <i className="la la-angle-left" />
                  </button>
                  <div className={s.thumbStrip} ref={thumbStripRef}>
                    {images.map((img, i) => (
                      <button
                        key={img.id || i}
                        type="button"
                        className={`${s.thumb} ${i === activeImageIndex ? s.thumbActive : ""}`}
                        onClick={() => setActiveImageIndex(i)}
                      >
                        <img src={resolveAssetUrl(img.imageUrl)} alt={product.name} />
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className={s.thumbNav}
                    aria-label="Next images"
                    onClick={() => scrollThumbs(1)}
                  >
                    <i className="la la-angle-right" />
                  </button>
                </div>
              ) : null}
            </Col>
            <Col
              xs={12}
              lg={6}
              className={"d-flex flex-column justify-content-between"}
            >
              <div className={"d-flex flex-column justify-content-between"} style={{ height: 320 }}>
                <h6 className={`text-muted ${s.detailCategory}`}>{product.categoryName}</h6>
                <h4 className={"fw-bold"}>{product.name}</h4>
                <div className={"d-flex align-items-center"}>
                  <p className={"text-primary mb-0"}>{reviews.length} reviews</p>
                </div>
                <p>{product.description}</p>
                {variants.length > 1 ? (
                  <Input
                    type={"select"}
                    value={selectedVariantId || ''}
                    onChange={(e) => setSelectedVariantId(Number(e.target.value))}
                    style={{ maxWidth: 260 }}
                  >
                    {variants.map((v) => {
                      const vAvailable = Math.max(0, (v.quantityOnHand || 0) - (v.quantityReserved || 0));
                      const label = [v.colorGlaze, v.size].filter(Boolean).join(' / ') || v.sku;
                      return (
                        <option key={v.id} value={v.id}>
                          {vAvailable <= 0 ? `${label} (Out of Stock)` : label}
                        </option>
                      );
                    })}
                  </Input>
                ) : null}
                {isOutOfStock ? (
                  <span className={"text-danger fw-bold text-uppercase"} style={{ fontSize: 13 }}>
                    Out of Stock
                  </span>
                ) : null}
                <div className={"d-flex"}>
                  <div className={"d-flex flex-column mr-5 justify-content-between"}>
                    <h6 className={"fw-bold text-muted text-uppercase"}>Quantity</h6>
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
                        disabled={isOutOfStock}
                        onClick={() => {
                          setQuantity((prevState) =>
                            selectedVariant && prevState >= availableQty ? prevState : prevState + 1
                          );
                        }}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  <div className={"d-flex flex-column justify-content-between"}>
                    <h6 className={"fw-bold text-muted text-uppercase"}>Price</h6>
                    <h6 className={"fw-bold"}>{formatVND(totalPrice)}</h6>
                  </div>
                </div>
              </div>
              <div className={`${s.buttonsWrapper} d-flex`}>
                <Button
                  outline
                  color={"primary"}
                  className={"flex-fill mr-3 text-uppercase fw-bold"}
                  disabled={isOutOfStock}
                  onClick={addToCart}
                >
                  {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </Button>
                <Button
                  color={"primary"}
                  className={"flex-fill mr-3 text-uppercase fw-bold"}
                  disabled={isOutOfStock}
                  onClick={buyNow}
                >
                  Buy Now
                </Button>
                <Button
                  outline
                  color={"primary"}
                  className={"flex-fill text-uppercase fw-bold"}
                  onClick={addToWishlist}
                >
                  Add to Wishlist
                </Button>
              </div>
            </Col>
          </Row>
        )}
        <hr />
        <Row className={"mt-5 mb-5"}>
          <Modal
            isOpen={isOpen}
            toggle={() => setOpen((prevState) => !prevState)}
            style={{ width: 920 }}
          >
            <div className={"p-5"}>
              <div style={{ position: "absolute", top: 0, right: 0 }}>
                <Button
                  className={"border-0 bg-transparent"}
                  style={{ padding: "15px 15px" }}
                  onClick={() => setOpen((prevState) => !prevState)}
                >
                  <img src={closeIcon} alt={'closeIcon'} />
                </Button>
              </div>
              <ModalBody>
                <h3 className={"fw-bold mb-5"}>Leave Your Review</h3>
                <div className={"d-flex align-items-center my-4"}>
                  <h6 className={"fw-bold mr-4 mb-0"}>Rate Product</h6>
                  <div className={s.starRating}>
                    {[1, 2, 3, 4, 5].map((n, i) => (
                      <Star
                        key={i}
                        selected={i < starsSelected}
                        onClick={() => setStarsSelected(i + 1)}
                      />
                    ))}
                  </div>
                </div>
                <Input
                  type="textarea"
                  name="text"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-100"
                  style={{ height: 155 }}
                  placeholder={"Add your comment"}
                />
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  className="w-100 mt-3"
                  onChange={(e) => setReviewFiles(Array.from(e.target.files || []))}
                />
                <ImagePreviewGrid
                  files={reviewFiles}
                  onRemove={(index) => setReviewFiles((prev) => prev.filter((_, i) => i !== index))}
                />
                <div className={"d-flex justify-content-center"}>
                  <Button
                    color={"primary fw-bold text-uppercase"}
                    style={{ marginTop: 48 }}
                    onClick={submitReview}
                  >
                    LEAVE REVIEW
                  </Button>
                </div>
              </ModalBody>
            </div>
          </Modal>
          <Col sm={12} className={"d-flex justify-content-between"}>
            <h4 className={"fw-bold"}>Reviews:</h4>
            <Button
              className={`bg-transparent border-0 fw-bold text-primary p-0 ${s.leaveFeedbackBtn}`}
              onClick={() => setOpen(true)}
            >
              + Leave Review
            </Button>
          </Col>
          {reviews.length === 0 ? (
            <Col sm={12} className={"mt-4"}>
              <p className={"text-muted"}>No reviews yet.</p>
            </Col>
          ) : (
            reviews.map((item) => (
              <Col sm={12} className={"d-flex mt-5"} key={item.id}>
                <img
                  src={item.userAvatarUrl || person2}
                  style={{ borderRadius: 65, width: 65, height: 65, objectFit: "cover" }}
                  className={`mr-5 ${s.reviewImg}`}
                  alt={"img"}
                />
                <div className={`d-flex flex-column justify-content-between align-items-start`} style={{ width: "100%" }}>
                  <div className={`d-flex justify-content-between w-100 ${s.reviewMargin}`}>
                    <h6 className={"fw-bold mb-0"}>
                      {item.userName}
                      {item.verifiedPurchase ? (
                        <span className={"text-primary fw-normal ml-2"} style={{ fontSize: 12 }}>Verified purchase</span>
                      ) : null}
                    </h6>
                    <p className={"text-muted mb-0"}>
                      {item.createdAt && item.createdAt.toString().slice(0, 10)}
                    </p>
                  </div>
                  <div className={s.starRating}>
                    {[1, 2, 3, 4, 5].map((n, i) => (
                      <Star key={i} selected={i < item.rating} onClick={null} />
                    ))}
                  </div>
                  <p className={"mb-0"}>{item.comment}</p>
                  {item.imageUrls && item.imageUrls.length > 0 ? (
                    <div className={"d-flex mt-2"}>
                      {item.imageUrls.map((url, i) => (
                        <img key={i} src={resolveAssetUrl(url)} width={70} height={70} style={{ objectFit: "cover", marginRight: 8 }} alt={"review"} />
                      ))}
                    </div>
                  ) : null}
                </div>
              </Col>
            ))
          )}
        </Row>
      </Container>
      <InfoBlock />
      <InstagramWidget />
    </>
  );
};

export async function getServerSideProps(context) {
  try {
    const res = await axios.get(`/products/${context.query.id}`);
    return {
      props: { product: res.data },
    };
  } catch (error) {
    return {
      props: { product: null },
    };
  }
}

export default Id;
