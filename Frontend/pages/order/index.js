import React from "react";
import { Container, Row, Col, Button, FormGroup, Label, Input } from "reactstrap";
import Link from "next/link";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import s from "./Order.module.scss";
import resolveAssetUrl from "utils/resolveAssetUrl";
import { formatVND } from "utils/formatCurrency";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Head from "next/head";
import AddressSelector from "components/e-commerce/AddressSelector";

const BUY_NOW_STORAGE_KEY = "buyNowItem";

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
            <section className={`${s.loginSection} py-4`}>
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
            <section className={"py-4"}>
              <p className={"mb-0 mr-2"}>No item selected to buy.</p>
              <Link href={"/shop"} className={"text-primary fw-bold"}>
                Go back to Shop
              </Link>
            </section>
          </Col>
        </Row>
      ) : (
        <>
          <Row className={"my-5"}>
            <Col sm={12}>
              <h3 className={"fw-bold"}>Order</h3>
              <p>Choose a shipping address and review your order below.</p>
            </Col>
          </Row>
          <Row className={"mt-3"}>
            <Col lg={7} xs={12}>
              <section className={s.paymentInfo}>
                <h3 className={"fw-bold mb-4"}>Order Summary</h3>
                <div className={"d-flex justify-content-between align-items-center mb-3"}>
                  <div className={"d-flex align-items-center"}>
                    <img src={resolveAssetUrl(item.imageUrl)} width={56} className={"mr-3"} alt={item.productName} />
                    <div>
                      <p className={"mb-0 fw-bold"}>{item.productName}</p>
                      <p className={"mb-0 text-muted"} style={{ fontSize: 13 }}>
                        {item.variantSnapshot}
                      </p>
                    </div>
                  </div>
                  <p className={"mb-0 fw-bold"}>{formatVND(lineTotal)}</p>
                </div>
                <div className={"d-flex justify-content-between align-items-center mb-3"}>
                  <p className={"mb-0 fw-bold"}>Quantity</p>
                  <div
                    className={"d-flex align-items-center"}
                    style={{ border: "1px solid #D9D9D9", borderRadius: 6 }}
                  >
                    <Button
                      className={"bg-transparent border-0 fw-bold"}
                      style={{ width: 36, height: 36 }}
                      onClick={() => changeQuantity(-1)}
                    >
                      -
                    </Button>
                    <p className={"fw-bold mb-0"} style={{ minWidth: 24, textAlign: "center" }}>
                      {item.quantity}
                    </p>
                    <Button
                      className={"bg-transparent border-0 fw-bold"}
                      style={{ width: 36, height: 36 }}
                      onClick={() => changeQuantity(1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <hr />
                <FormGroup>
                  <Label className="fw-bold">Payment Method</Label>
                  <Input
                    type="select"
                    className={s.paymentSelect}
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="cod">Cash on Delivery (COD)</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="vnpay">VNPay</option>
                    <option value="momo">Momo</option>
                    <option value="stripe">Credit Card (Stripe)</option>
                  </Input>
                </FormGroup>
                <FormGroup>
                  <Label className="fw-bold">Voucher Code</Label>
                  <Input
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    placeholder={"Enter a voucher code (optional)"}
                  />
                </FormGroup>
                <div className={"d-flex justify-content-between mb-2"}>
                  <p className={"mb-0 text-muted"}>Subtotal</p>
                  <p className={"mb-0 fw-bold"}>{formatVND(lineTotal)}</p>
                </div>
                <Button
                  color={"primary"}
                  className={"text-uppercase mt-3 fw-bold w-100"}
                  onClick={placeOrder}
                  disabled={placing}
                >
                  {placing ? "Placing Order..." : "Place Order"}
                </Button>
              </section>
            </Col>
            <Col lg={5} xs={12}>
              <AddressSelector
                addresses={addresses}
                selectedAddressId={selectedAddressId}
                onSelect={setSelectedAddressId}
                onAddressAdded={(newAddress) => {
                  fetchAddresses();
                  setSelectedAddressId(newAddress.id);
                }}
              />

              <FormGroup className={"mt-4"}>
                <Label className="fw-bold">Order Note</Label>
                <Input
                  type="textarea"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={"Any notes for your order (optional)"}
                />
              </FormGroup>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default Index;
