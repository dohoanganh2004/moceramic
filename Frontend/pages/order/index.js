import React from "react";
import { Container, Row, Col, Button, FormGroup, Label, Input } from "reactstrap";
import Link from "next/link";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import s from "./Order.module.scss";
import Widget from "components/admin/Widget";
import resolveAssetUrl from "utils/resolveAssetUrl";
import { formatVND } from "utils/formatCurrency";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Head from "next/head";
import AddressSelector from "components/e-commerce/AddressSelector";

const BUY_NOW_STORAGE_KEY = "buyNowItem";

const PAYMENT_METHODS = [
  { value: "cod", label: "Cash on Delivery", icon: "la-money-bill" },
  { value: "bank_transfer", label: "Bank Transfer", icon: "la-university" },
  { value: "vnpay", label: "VNPay", icon: "la-wallet" },
  { value: "momo", label: "Momo", icon: "la-mobile" },
  { value: "stripe", label: "Credit Card (Stripe)", icon: "la-credit-card" },
];

const Index = () => {
  const currentUser = useSelector((store) => store.auth.currentUser);
  const router = useRouter();
  const [item, setItem] = React.useState(null);
  const [itemLoaded, setItemLoaded] = React.useState(false);
  const [addresses, setAddresses] = React.useState([]);
  const [selectedAddressId, setSelectedAddressId] = React.useState(null);
  const [voucherCode, setVoucherCode] = React.useState("");
  const [note, setNote] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState("cod");
  const [placing, setPlacing] = React.useState(false);

  const fetchAddresses = () => {
    axios.get("/address").then((res) => {
      setAddresses(res.data || []);
      const def = (res.data || []).find((a) => a.isDefault) || (res.data || [])[0];
      if (def) setSelectedAddressId(def.id);
    }).catch(() => setAddresses([]));
  };

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = JSON.parse(sessionStorage.getItem(BUY_NOW_STORAGE_KEY));
        if (stored && stored.variantId && stored.quantity) {
          setItem(stored);
        }
      } catch (e) {
        // ignore malformed storage
      }
      setItemLoaded(true);
    }
  }, []);

  React.useEffect(() => {
    if (!currentUser) return;
    fetchAddresses();
  }, [currentUser]);

  const lineTotal = item ? item.unitPrice * item.quantity : 0;

  const changeQuantity = (delta) => {
    setItem((prev) => {
      if (!prev) return prev;
      const nextQuantity = Math.max(1, prev.quantity + delta);
      return { ...prev, quantity: nextQuantity };
    });
  };

  const placeOrder = () => {
    if (!selectedAddressId) {
      toast.error("Please choose a shipping address");
      return;
    }
    if (!item) {
      toast.error("No item selected to buy");
      return;
    }
    setPlacing(true);
    axios
      .post("/order", {
        shippingAddressId: selectedAddressId,
        voucherCode: voucherCode || null,
        note: note || null,
        paymentMethod,
        items: [{ variantId: item.variantId, quantity: item.quantity }],
      })
      .then((res) => {
        sessionStorage.removeItem(BUY_NOW_STORAGE_KEY);
        toast.info("Order placed successfully");
        router.push(`/order/my-order/${res.data.id}`);
      })
      .catch((err) => {
        const message = (err.response && err.response.data && err.response.data.message) || "Could not place your order";
        toast.error(message);
      })
      .finally(() => setPlacing(false));
  };

  return (
    <Container className={"mb-5"} style={{ marginTop: 32 }}>
      <Head>
        <title>Order</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="description" content="Beautifully designed web application template built with React and Bootstrap to create modern apps and speed up development" />
        <meta charSet="utf-8" />
      </Head>
      <ToastContainer />
      {!currentUser ? (
        <Row>
          <Col sm={12}>
            <section className={`${s.loginSection} py-5`}>
              <p className={"mb-0 mr-2"}>Please log in to place an order.</p>
              <Link href={"/login"} className={"text-primary fw-bold"}>
                Click here to Login
              </Link>
            </section>
          </Col>
        </Row>
      ) : !itemLoaded ? null : !item ? (
        <Row>
          <Col sm={12}>
            <section className={`${s.loginSection} py-5`}>
              <p className={"mb-0 mr-2"}>No item selected to buy.</p>
              <Link href={"/shop"} className={"text-primary fw-bold"}>
                Go back to Shop
              </Link>
            </section>
          </Col>
        </Row>
      ) : (
        <>
          <Row className={"mb-4"}>
            <Col sm={12}>
              <h3 className={"fw-bold mb-1"}>Checkout</h3>
              <p className={"text-muted mb-0"}>Choose a shipping address and review your order below.</p>
            </Col>
          </Row>
          <Row>
            <Col lg={7} xs={12} className={"mb-4 mb-lg-0"}>
              <Widget title={<h5 className={"fw-bold mb-0"}>Order Summary</h5>}>
                <div className={s.productRow}>
                  <div className={"d-flex align-items-center"} style={{ gap: 16 }}>
                    <img
                      src={resolveAssetUrl(item.imageUrl)}
                      className={s.productImg}
                      alt={item.productName}
                    />
                    <div>
                      <p className={"mb-0 fw-bold"}>{item.productName}</p>
                      <p className={"mb-0 text-muted"} style={{ fontSize: 13 }}>
                        {item.variantSnapshot}
                      </p>
                    </div>
                  </div>
                  <p className={"mb-0 fw-bold text-nowrap"}>{formatVND(lineTotal)}</p>
                </div>

                <div className={s.qtyRow}>
                  <p className={"mb-0 fw-bold"}>Quantity</p>
                  <div className={s.qtyControl}>
                    <button type="button" className={s.qtyBtn} onClick={() => changeQuantity(-1)}>
                      -
                    </button>
                    <p className={s.qtyValue}>{item.quantity}</p>
                    <button type="button" className={s.qtyBtn} onClick={() => changeQuantity(1)}>
                      +
                    </button>
                  </div>
                </div>

                <span className={s.sectionLabel}>Payment Method</span>
                <div className={s.paymentGrid}>
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      type="button"
                      key={m.value}
                      className={`${s.paymentOption} ${paymentMethod === m.value ? s.paymentOptionActive : ""}`}
                      onClick={() => setPaymentMethod(m.value)}
                    >
                      <i className={`la ${m.icon}`} />
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>

                <FormGroup>
                  <Label className="fw-bold">Voucher Code</Label>
                  <Input
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    placeholder={"Enter a voucher code (optional)"}
                  />
                </FormGroup>

                <div className={s.summaryTotals}>
                  <div className={"d-flex justify-content-between"}>
                    <p className={"mb-0 text-muted"}>Subtotal</p>
                    <p className={"mb-0"}>{formatVND(lineTotal)}</p>
                  </div>
                  {voucherCode ? (
                    <div className={"d-flex justify-content-between mt-1"}>
                      <p className={"mb-0 text-muted"}>Voucher</p>
                      <p className={"mb-0 text-muted"} style={{ fontSize: 13 }}>Applied at checkout</p>
                    </div>
                  ) : null}
                  <div className={s.totalRow}>
                    <span>Total</span>
                    <span className={"text-primary"}>{formatVND(lineTotal)}</span>
                  </div>
                </div>

                <Button
                  color={"primary"}
                  className={"text-uppercase mt-4 fw-bold w-100"}
                  onClick={placeOrder}
                  disabled={placing}
                >
                  {placing ? "Placing Order..." : "Place Order"}
                </Button>
              </Widget>
            </Col>
            <Col lg={5} xs={12}>
              <Widget className={"mb-4"}>
                <AddressSelector
                  addresses={addresses}
                  selectedAddressId={selectedAddressId}
                  onSelect={setSelectedAddressId}
                  onAddressAdded={(newAddress) => {
                    fetchAddresses();
                    setSelectedAddressId(newAddress.id);
                  }}
                />
              </Widget>

              <Widget title={<h5 className={"fw-bold mb-0"}>Order Note</h5>}>
                <Input
                  type="textarea"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={"Any notes for your order (optional)"}
                  style={{ height: 100 }}
                />
              </Widget>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default Index;
