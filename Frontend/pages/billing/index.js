import React from "react";
import {
  Container,
  Row,
  Col,
  Button,
  FormGroup,
  Label,
  Input,
  Form,
} from "reactstrap";
import Link from "next/link";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import s from "./Billing.module.scss";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Head from "next/head";

const emptyAddressForm = {
  recipientName: "",
  phone: "",
  addressLine: "",
  ward: "",
  district: "",
  city: "",
  country: "Việt Nam",
};

const Index = () => {
  const currentUser = useSelector((store) => store.auth.currentUser);
  const router = useRouter();
  const [cart, setCart] = React.useState(null);
  const [addresses, setAddresses] = React.useState([]);
  const [selectedAddressId, setSelectedAddressId] = React.useState(null);
  const [showNewAddress, setShowNewAddress] = React.useState(false);
  const [addressForm, setAddressForm] = React.useState(emptyAddressForm);
  const [voucherCode, setVoucherCode] = React.useState("");
  const [note, setNote] = React.useState("");
  const [placing, setPlacing] = React.useState(false);

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

  const saveNewAddress = () => {
    axios
      .post("/address/create", addressForm)
      .then((res) => {
        toast.info("Address added");
        setShowNewAddress(false);
        setAddressForm(emptyAddressForm);
        fetchAddresses();
        setSelectedAddressId(res.data.id);
      })
      .catch(() => toast.error("Could not save this address"));
  };

  const placeOrder = () => {
    if (!selectedAddressId) {
      toast.error("Please choose a shipping address");
      return;
    }
    if (!cart || !cart.items || cart.items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    setPlacing(true);
    const items = cart.items.map((item) => ({ variantId: item.variantId, quantity: item.quantity }));
    axios
      .post("/order", {
        shippingAddressId: selectedAddressId,
        voucherCode: voucherCode || null,
        note: note || null,
        items,
      })
      .then((res) => {
        return Promise.all(
          cart.items.map((item) => axios.delete(`/cart/items/${item.id}`).catch(() => {}))
        ).then(() => res);
      })
      .then((res) => {
        toast.info("Order placed successfully");
        router.push(`/products`);
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
        <title>Checkout</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="description" content="Beautifully designed web application template built with React and Bootstrap to create modern apps and speed up development" />
        <meta charSet="utf-8" />
      </Head>
      <ToastContainer />
      {!currentUser ? (
        <Row>
          <Col sm={12}>
            <section className={`${s.loginSection} py-4`}>
              <p className={"mb-0 mr-2"}>Please log in to check out.</p>
              <Link href={"/login"} className={"text-primary fw-bold"}>
                Click here to Login
              </Link>
            </section>
          </Col>
        </Row>
      ) : (
        <>
          <Row className={"my-5"}>
            <Col sm={12}>
              <h3 className={"fw-bold"}>Checkout</h3>
              <p>Choose a shipping address and review your order below.</p>
            </Col>
          </Row>
          <Row className={"mt-3"}>
            <Col lg={7} xs={12}>
              <div className={"d-flex justify-content-between align-items-center mb-4"}>
                <h4 className={"fw-bold mb-0"}>Shipping Address</h4>
                <Button
                  className={"bg-transparent border-0 p-0 text-primary fw-bold"}
                  onClick={() => setShowNewAddress((v) => !v)}
                >
                  {showNewAddress ? "Cancel" : "+ Add New Address"}
                </Button>
              </div>
              {showNewAddress ? (
                <Form className={`${s.form} mb-4`}>
                  <FormGroup>
                    <Label className="fw-bold">Recipient Name*</Label>
                    <Input
                      value={addressForm.recipientName}
                      onChange={(e) => setAddressForm({ ...addressForm, recipientName: e.target.value })}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label className="fw-bold">Phone*</Label>
                    <Input
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label className="fw-bold">Address Line*</Label>
                    <Input
                      value={addressForm.addressLine}
                      onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })}
                    />
                  </FormGroup>
                  <FormGroup className="d-flex">
                    <div className="flex-fill mr-3">
                      <Label className="fw-bold">Ward</Label>
                      <Input
                        value={addressForm.ward}
                        onChange={(e) => setAddressForm({ ...addressForm, ward: e.target.value })}
                      />
                    </div>
                    <div className="flex-fill">
                      <Label className="fw-bold">District</Label>
                      <Input
                        value={addressForm.district}
                        onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                      />
                    </div>
                  </FormGroup>
                  <FormGroup className="d-flex">
                    <div className="flex-fill mr-3">
                      <Label className="fw-bold">City*</Label>
                      <Input
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      />
                    </div>
                    <div className="flex-fill">
                      <Label className="fw-bold">Country</Label>
                      <Input
                        value={addressForm.country}
                        onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                      />
                    </div>
                  </FormGroup>
                  <Button color="primary" className="fw-bold text-uppercase" onClick={saveNewAddress}>
                    Save Address
                  </Button>
                </Form>
              ) : addresses.length === 0 ? (
                <p className={"text-muted"}>You have no saved addresses yet. Add one to continue.</p>
              ) : (
                addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={"d-flex align-items-start mb-3 p-3"}
                    style={{
                      border: selectedAddressId === addr.id ? "2px solid #bd744c" : "1px solid #D9D9D9",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                    onClick={() => setSelectedAddressId(addr.id)}
                  >
                    <Input
                      type="radio"
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className={"mr-3 mt-1"}
                    />
                    <div>
                      <h6 className={"fw-bold mb-0"}>
                        {addr.recipientName}
                        {addr.isDefault ? (
                          <span className={"text-primary ml-2"} style={{ fontSize: 11 }}>(default)</span>
                        ) : null}
                      </h6>
                      <p className={"text-muted mb-1"}>{addr.phone}</p>
                      <p className={"text-muted mb-0"}>
                        {[addr.addressLine, addr.ward, addr.district, addr.city, addr.country].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  </div>
                ))
              )}

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
            <Col lg={5} xs={12}>
              <section className={s.paymentInfo}>
                <h3 className={"fw-bold mb-4"}>Order Summary</h3>
                {!cart || !cart.items || cart.items.length === 0 ? (
                  <p className={"text-muted"}>Your cart is empty.</p>
                ) : (
                  <>
                    {cart.items.map((item) => (
                      <div key={item.id} className={"d-flex justify-content-between align-items-center mb-3"}>
                        <div className={"d-flex align-items-center"}>
                          <img src={item.imageUrl} width={56} className={"mr-3"} alt={item.productName} />
                          <div>
                            <p className={"mb-0 fw-bold"}>{item.productName}</p>
                            <p className={"mb-0 text-muted"} style={{ fontSize: 13 }}>
                              {item.variantSnapshot} × {item.quantity}
                            </p>
                          </div>
                        </div>
                        <p className={"mb-0 fw-bold"}>${item.lineTotal}</p>
                      </div>
                    ))}
                    <hr />
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
                      <p className={"mb-0 fw-bold"}>${cart.totalAmount}</p>
                    </div>
                    <Button
                      color={"primary"}
                      className={`${s.checkOutBtn} text-uppercase mt-3 fw-bold w-100`}
                      onClick={placeOrder}
                      disabled={placing}
                    >
                      {placing ? "Placing Order..." : "Place Order"}
                    </Button>
                  </>
                )}
              </section>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default Index;
