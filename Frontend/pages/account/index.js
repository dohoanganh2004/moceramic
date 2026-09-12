import React from "react";
import { Container, Row, Col, Button, Table, Modal, ModalBody, ModalHeader, Input, Label, FormGroup } from "reactstrap";
import Head from 'next/head';
import { useSelector } from 'react-redux'
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import s from "./Account.module.scss";
import product from "public/images/e-commerce/account/products.svg";
import settings from "public/images/e-commerce/account/settings.svg";
import avatar from "public/images/e-commerce/account/avatar.svg";
import edit from "public/images/e-commerce/account/edit.svg";

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
  const [orders, setOrders] = React.useState([]);
  const [addresses, setAddresses] = React.useState([]);
  const [addressModalOpen, setAddressModalOpen] = React.useState(false);
  const [editingAddressId, setEditingAddressId] = React.useState(null);
  const [addressForm, setAddressForm] = React.useState(emptyAddressForm);

  const fetchOrders = () => {
    axios.get("/order/user/id").then((res) => setOrders(res.data || [])).catch(() => setOrders([]));
  };

  const fetchAddresses = () => {
    axios.get("/address").then((res) => setAddresses(res.data || [])).catch(() => setAddresses([]));
  };

  React.useEffect(() => {
    if (currentUser) {
      fetchOrders();
      fetchAddresses();
    }
  }, [currentUser]);

  const openAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm(emptyAddressForm);
    setAddressModalOpen(true);
  };

  const openEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      recipientName: addr.recipientName || "",
      phone: addr.phone || "",
      addressLine: addr.addressLine || "",
      ward: addr.ward || "",
      district: addr.district || "",
      city: addr.city || "",
      country: addr.country || "Việt Nam",
    });
    setAddressModalOpen(true);
  };

  const saveAddress = () => {
    const request = editingAddressId
      ? axios.put(`/address/update/${editingAddressId}`, addressForm)
      : axios.post("/address/create", addressForm);
    request
      .then(() => {
        toast.info(editingAddressId ? "Address updated" : "Address added");
        setAddressModalOpen(false);
        fetchAddresses();
      })
      .catch(() => toast.error("Could not save this address"));
  };

  const deleteAddress = (id) => {
    axios
      .delete(`/address/${id}`)
      .then(() => {
        toast.info("Address removed");
        fetchAddresses();
      })
      .catch(() => toast.error("Could not remove this address"));
  };

  const setDefaultAddress = (id) => {
    axios
      .patch(`/address/${id}/default`)
      .then(() => {
        fetchAddresses();
      })
      .catch(() => toast.error("Could not update default address"));
  };

  return (
    <>
      <Head>
        <title>Account</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="description" content="Beautifully designed web application template built with React and Bootstrap to create modern apps and speed up development" />
        <meta charSet="utf-8" />
      </Head>
      <ToastContainer />
      <Container className={"mb-5"} style={{ marginTop: 32 }}>
        <Row>
          <Col xl={8} lg={8} xs={12}>
            <h3 className={"fw-bold mb-4"}>My Account</h3>
            {!currentUser ? (
              <p>Please log in to view your account.</p>
            ) : (
              <Row className={"mt-3"}>
                <Col xl={12} lg={12} xs={12} style={{ overflow: "auto" }}>
                  <h3 className={"fw-bold mb-4"}>My Orders</h3>
                  {orders.length === 0 ? (
                    <p className={"text-muted"}>You have no orders yet.</p>
                  ) : (
                    <Table className={s.accountTable} borderless>
                      <thead>
                        <tr style={{ borderBottom: "1px solid #D9D9D9" }}>
                          <th className={"bg-transparent text-dark px-0"}>Date</th>
                          <th className={"bg-transparent text-dark px-0"}>Order</th>
                          <th className={"bg-transparent text-dark px-0"}>Status</th>
                          <th className={"bg-transparent text-dark px-0"}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr className={"mt-2"} key={order.id}>
                            <td className={"px-0 pt-4"}>
                              <p className={"text-muted"}>
                                {order.createdAt && order.createdAt.toString().slice(0, 10)}
                              </p>
                            </td>
                            <td className={"px-0 pt-4"}>
                              <div className={"d-flex align-items-center"}>
                                <img src={product} width={60} className={"mr-4"} />
                                <div>
                                  <h5 className={"fw-bold mb-0"}>{order.orderCode || `#${order.id}`}</h5>
                                </div>
                              </div>
                            </td>
                            <td className={"px-0 pt-4"}>
                              <h6 className={"text-muted mb-0 text-capitalize"}>{order.status}</h6>
                            </td>
                            <td className={"px-0 pt-4"}>
                              <h6 className={"fw-bold mb-0"}>${order.totalAmount}</h6>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Col>
              </Row>
            )}
          </Col>
          <Col xl={4} lg={4} xs={12}>
            <section className={s.profile}>
              <Button className={"bg-transparent border-0 p-0"}>
                <img src={settings} alt={"settings"} className={s.settingsIcon} />
              </Button>
              <img src={avatar} alt={"avatar"} />
              <h5 className={"text-primary fw-bold mt-4"}>{currentUser ? currentUser.fullName : "Guest"}</h5>
              <p className={"text-muted"}>{currentUser ? currentUser.email : ""}</p>
              <hr />
              <div className={"w-100 mt-3"}>
                <div className={"d-flex justify-content-between align-items-center mb-3"}>
                  <h6 className={"fw-bold mb-0"}>Addresses</h6>
                  <Button
                    className={"bg-transparent border-0 p-0 text-primary fw-bold"}
                    onClick={openAddAddress}
                    disabled={!currentUser}
                  >
                    + Add
                  </Button>
                </div>
                {addresses.length === 0 ? (
                  <p className={"text-muted"}>No saved addresses.</p>
                ) : (
                  addresses.map((addr) => (
                    <div key={addr.id} className={"d-flex justify-content-between align-items-start mb-3"}>
                      <div style={{ width: 190 }}>
                        <h6 className={"fw-bold mb-0"}>
                          {addr.recipientName}
                          {addr.isDefault ? (
                            <span className={"text-primary ml-2"} style={{ fontSize: 11 }}>(default)</span>
                          ) : null}
                        </h6>
                        <p className={"text-muted mb-1"} style={{ fontSize: 13 }}>{addr.phone}</p>
                        <p className={"text-muted mb-1"} style={{ fontSize: 13 }}>
                          {[addr.addressLine, addr.ward, addr.district, addr.city, addr.country].filter(Boolean).join(", ")}
                        </p>
                        {!addr.isDefault ? (
                          <Button
                            className={"bg-transparent border-0 p-0 text-primary"}
                            style={{ fontSize: 12 }}
                            onClick={() => setDefaultAddress(addr.id)}
                          >
                            Set as default
                          </Button>
                        ) : null}
                      </div>
                      <div className={"d-flex flex-column align-items-end"}>
                        <Button className={"bg-transparent border-0 p-0 mb-2"} onClick={() => openEditAddress(addr)}>
                          <img src={edit} alt={"edit"} />
                        </Button>
                        <Button
                          className={"bg-transparent border-0 p-0 text-muted"}
                          style={{ fontSize: 12 }}
                          onClick={() => deleteAddress(addr.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </Col>
        </Row>
      </Container>
      <Modal isOpen={addressModalOpen} toggle={() => setAddressModalOpen((v) => !v)}>
        <ModalHeader toggle={() => setAddressModalOpen((v) => !v)}>
          {editingAddressId ? "Edit Address" : "Add Address"}
        </ModalHeader>
        <ModalBody>
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
          <Button color="primary" className="fw-bold text-uppercase w-100" onClick={saveAddress}>
            Save Address
          </Button>
        </ModalBody>
      </Modal>
    </>
  );
};

export default Index;
