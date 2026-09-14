import React from "react";
import { Row, Col, Button, Modal, ModalBody, ModalHeader, Input, Label, FormGroup } from "reactstrap";
import Head from 'next/head';
import { useSelector } from 'react-redux'
import Widget from "components/admin/Widget";
import edit from "public/images/e-commerce/account/edit.svg";
import axios from "axios";
import { toast } from "react-toastify";

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
  const [addresses, setAddresses] = React.useState([]);
  const [addressModalOpen, setAddressModalOpen] = React.useState(false);
  const [editingAddressId, setEditingAddressId] = React.useState(null);
  const [addressForm, setAddressForm] = React.useState(emptyAddressForm);

  const fetchAddresses = () => {
    axios.get("/address").then((res) => setAddresses(res.data || [])).catch(() => setAddresses([]));
  };

  React.useEffect(() => {
    if (currentUser) {
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
        <title>Address</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta charSet="utf-8" />
      </Head>
      <div>
        <h1 className="page-title">Address</h1>
        {!currentUser ? (
          <p>Please log in to manage your addresses.</p>
        ) : (
          <Row>
            <Col lg={8} xs={12}>
              <Widget title={<h4>Saved Addresses</h4>}>
                <div className={"d-flex justify-content-end mb-3"}>
                  <Button color={"primary"} size={"sm"} className={"fw-bold"} onClick={openAddAddress}>
                    + Add Address
                  </Button>
                </div>
                {addresses.length === 0 ? (
                  <p className={"text-muted"}>No saved addresses.</p>
                ) : (
                  addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={"d-flex justify-content-between align-items-start mb-3 pb-3"}
                      style={{ borderBottom: "1px solid #eee" }}
                    >
                      <div>
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
              </Widget>
            </Col>
          </Row>
        )}
      </div>
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
