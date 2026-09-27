import React from "react";
import {
  Container,
  Row,
  Col,
  Button,
  FormGroup,
  Label,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import Link from "next/link";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import s from "./Billing.module.scss";
import Widget from "components/admin/Widget";
import resolveAssetUrl from "utils/resolveAssetUrl";
import { formatVND } from "utils/formatCurrency";
import axios from "axios";
import { toast } from "react-toastify";
import Head from "next/head";
import AddressSelector from "components/e-commerce/AddressSelector";

const PAYMENT_METHODS = [
  { value: "cod", label: "Cash on Delivery (COD)", description: "Pay with cash when your order arrives.", icon: "la-money-bill" },
  { value: "bank_transfer", label: "Bank Transfer", description: "Transfer the total amount to our bank account.", icon: "la-university" },
];

const BANK_TRANSFER_INFO = {
  bankName: "Vietcombank",
  accountName: "CONG TY TNHH MOCERAMIC",
  accountNumber: "0123456789",
};

const CHECKOUT_ITEM_IDS_KEY = "checkoutItemIds";

const Index = () => {
  const currentUser = useSelector((store) => store.auth.currentUser);
  const router = useRouter();
  const [cart, setCart] = React.useState(null);
  const [checkoutItemIds, setCheckoutItemIds] = React.useState(null);
  const [addresses, setAddresses] = React.useState([]);
  const [selectedAddressId, setSelectedAddressId] = React.useState(null);
  const [voucherCode, setVoucherCode] = React.useState("");
  const [note, setNote] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState("cod");
  const [placing, setPlacing] = React.useState(false);
  const [placedOrder, setPlacedOrder] = React.useState(null);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = JSON.parse(sessionStorage.getItem(CHECKOUT_ITEM_IDS_KEY));
      if (Array.isArray(stored)) setCheckoutItemIds(stored);
    } catch (e) {
      // ignore malformed value
    }
  }, []);

  const fetchCart = () => {
    axios.get("/cart").then((res) => setCart(res.data)).catch(() => setCart(null));
  };

  const fetchAddresses = () => {
    axios.get("/address").then((res) => {
      setAddresses(res.data || []);
      const def = (res.data || []).find((a) => a.isDefault) || (res.data || [])[0];
      if (def) setSelectedAddressId(def.id);
    }).catch(() => setAddresses([]));
  };

  React.useEffect(() => {
    if (!currentUser) return;
    fetchCart();
    fetchAddresses();
  }, [currentUser]);

  const allItems = (cart && cart.items) || [];
  // A selection from the cart page narrows checkout to just those items;
  // visiting /billing directly (no selection stored) falls back to the whole cart.
  const checkoutItems = checkoutItemIds
    ? allItems.filter((item) => checkoutItemIds.includes(item.id))
    : allItems;
  const checkoutSubtotal = checkoutItems.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0);

  const placeOrder = () => {
    if (!selectedAddressId) {
      toast.error("Please choose a shipping address");
      return;
    }
    if (checkoutItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    setPlacing(true);
    const items = checkoutItems.map((item) => ({ variantId: item.variantId, quantity: item.quantity }));
    axios
      .post("/order", {
        shippingAddressId: selectedAddressId,
        voucherCode: voucherCode || null,
        note: note || null,
        paymentMethod,
        items,
      })
      .then((res) => {
        return Promise.all(
          checkoutItems.map((item) => axios.delete(`/cart/items/${item.id}`).catch(() => {}))
        ).then(() => res);
      })
      .then((res) => {
        if (typeof window !== "undefined") sessionStorage.removeItem(CHECKOUT_ITEM_IDS_KEY);
        toast.info("Order placed successfully");
        if (paymentMethod === "bank_transfer") {
          setPlacedOrder(res.data);
        } else {
          router.push(`/order/my-order/${res.data.id}`);
        }
      })
      .catch((err) => {
        const message = (err.response && err.response.data && err.response.data.message) || "Could not place your order";
        toast.error(message);
      })
      .finally(() => setPlacing(false));
  };

  const closeBankTransferModal = () => {
    const orderId = placedOrder && placedOrder.id;
    setPlacedOrder(null);
    router.push(orderId ? `/order/my-order/${orderId}` : "/order/my-order");
  };

  return (
    <Container className={"mb-5"} style={{ marginTop: 32 }}>
      <Head>
        <title>Checkout</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="description" content="Beautifully designed web application template built with React and Bootstrap to create modern apps and speed up development" />
        <meta charSet="utf-8" />
      </Head>
      {!currentUser ? (
        <Row>
          <Col sm={12}>
            <section className={`${s.loginSection} py-5`}>
              <p className={"mb-0 mr-2"}>Please log in to check out.</p>
              <Link href={"/login"} className={"text-primary fw-bold"}>
                Click here to Login
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
                {!cart || checkoutItems.length === 0 ? (
                  <p className={"text-muted mb-0"}>Your cart is empty.</p>
                ) : (
                  <>
                    <div className={s.itemsList}>
                      {checkoutItems.map((item) => (
                        <div key={item.id} className={s.itemRow}>
                          <div className={"d-flex align-items-center"} style={{ gap: 14 }}>
                            <img src={resolveAssetUrl(item.imageUrl)} className={s.itemImg} alt={item.productName} />
                            <div>
                              <p className={"mb-0 fw-bold"}>{item.productName}</p>
                              <p className={"mb-0 text-muted"} style={{ fontSize: 13 }}>
                                {item.variantSnapshot} &times; {item.quantity}
                              </p>
                            </div>
                          </div>
                          <p className={"mb-0 fw-bold text-nowrap"}>{formatVND(item.lineTotal)}</p>
                        </div>
                      ))}
                    </div>

                    <span className={s.sectionLabel}>Payment Method</span>
                    {PAYMENT_METHODS.map((pm) => (
                      <div
                        key={pm.value}
                        className={`${s.paymentOption} ${paymentMethod === pm.value ? s.paymentOptionActive : ""}`}
                        onClick={() => setPaymentMethod(pm.value)}
                      >
                        <i className={`la ${pm.icon}`} />
                        <div>
                          <h6 className={"fw-bold mb-0"}>{pm.label}</h6>
                          <p className={"text-muted mb-0"} style={{ fontSize: 13 }}>{pm.description}</p>
                        </div>
                      </div>
                    ))}

                    <FormGroup className={"mt-3"}>
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
                        <p className={"mb-0"}>{formatVND(checkoutSubtotal)}</p>
                      </div>
                      {voucherCode ? (
                        <div className={"d-flex justify-content-between mt-1"}>
                          <p className={"mb-0 text-muted"}>Voucher</p>
                          <p className={"mb-0 text-muted"} style={{ fontSize: 13 }}>Applied at checkout</p>
                        </div>
                      ) : null}
                      <div className={s.totalRow}>
                        <span>Total</span>
                        <span className={"text-primary"}>{formatVND(checkoutSubtotal)}</span>
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
                  </>
                )}
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

      <Modal isOpen={!!placedOrder} toggle={closeBankTransferModal}>
        <ModalHeader toggle={closeBankTransferModal}>Complete your bank transfer</ModalHeader>
        <ModalBody>
          {placedOrder && (
            <>
              <p>
                Your order <strong>{placedOrder.orderCode}</strong> has been placed. Please transfer{" "}
                <strong>{formatVND(placedOrder.totalAmount)}</strong> using the details below, using your order code as the transfer note.
              </p>
              <div className={s.bankInfo}>
                <p><strong>Bank:</strong> {BANK_TRANSFER_INFO.bankName}</p>
                <p><strong>Account Name:</strong> {BANK_TRANSFER_INFO.accountName}</p>
                <p><strong>Account Number:</strong> {BANK_TRANSFER_INFO.accountNumber}</p>
                <p><strong>Transfer Note:</strong> {placedOrder.orderCode}</p>
              </div>
              <p className={"text-muted mt-3 mb-0"} style={{ fontSize: 13 }}>
                We will confirm your payment and start processing your order once the transfer is received.
              </p>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={closeBankTransferModal}>Continue Shopping</Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default Index;
