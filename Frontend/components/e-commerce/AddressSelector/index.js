import React from "react";
import { Button, Form, FormGroup, Label, Input } from "reactstrap";
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

const AddressSelector = ({ addresses, selectedAddressId, onSelect, onAddressAdded }) => {
  const [showNewAddress, setShowNewAddress] = React.useState(false);
  const [addressForm, setAddressForm] = React.useState(emptyAddressForm);

  const saveNewAddress = () => {
    axios
      .post("/address/create", addressForm)
      .then((res) => {
        toast.info("Address added");
        setShowNewAddress(false);
        setAddressForm(emptyAddressForm);
        onAddressAdded(res.data);
      })
      .catch(() => toast.error("Could not save this address"));
  };

  return (
    <>
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
        <Form className={"mb-4"}>
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
            onClick={() => onSelect(addr.id)}
          >
            <Input
              type="radio"
              checked={selectedAddressId === addr.id}
              onChange={() => onSelect(addr.id)}
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
    </>
  );
};

export default AddressSelector;
