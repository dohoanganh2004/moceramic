import React, { Component } from "react";
import { FormGroup, Label, Input } from "reactstrap";
import Widget from "components/admin/Widget";

const ROLE_OPTIONS = [
  { value: 1, label: "customer" },
  { value: 2, label: "admin" },
  { value: 3, label: "sales_staff" },
  { value: 4, label: "warehouse_staff" },
  { value: 5, label: "accountant" },
  { value: 6, label: "marketing" },
];

class UsersForm extends Component {
  state = {
    fullName: "",
    email: "",
    phone: "",
    password: "",
    roleId: 1,
    isActive: true,
  };

  setField = (field, value) => this.setState({ [field]: value });

  handleSubmit = (e) => {
    e.preventDefault();
    const { fullName, email, phone, password, roleId, isActive } = this.state;
    this.props.onSubmit(null, {
      fullName,
      email,
      phone,
      password,
      roleId: Number(roleId),
      isActive,
    });
  };

  render() {
    const { saveLoading } = this.props;
    const { fullName, email, phone, password, roleId, isActive } = this.state;

    return (
      <Widget title={<h4>Add user</h4>} collapse close>
        <form onSubmit={this.handleSubmit}>
          <FormGroup>
            <Label className="fw-bold">Full Name*</Label>
            <Input value={fullName} onChange={(e) => this.setField("fullName", e.target.value)} required />
          </FormGroup>
          <FormGroup>
            <Label className="fw-bold">Email*</Label>
            <Input type="email" value={email} onChange={(e) => this.setField("email", e.target.value)} required />
          </FormGroup>
          <FormGroup>
            <Label className="fw-bold">Phone</Label>
            <Input value={phone} onChange={(e) => this.setField("phone", e.target.value)} />
          </FormGroup>
          <FormGroup>
            <Label className="fw-bold">Password*</Label>
            <Input type="password" value={password} onChange={(e) => this.setField("password", e.target.value)} required />
          </FormGroup>
          <FormGroup>
            <Label className="fw-bold">Role*</Label>
            <Input type="select" value={roleId} onChange={(e) => this.setField("roleId", e.target.value)}>
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </Input>
          </FormGroup>
          <FormGroup check className="mb-3">
            <Label check>
              <Input type="checkbox" checked={isActive} onChange={(e) => this.setField("isActive", e.target.checked)} /> Active
            </Label>
          </FormGroup>
          <div className="form-buttons">
            <button className="btn btn-primary" disabled={saveLoading} type="submit">
              Save
            </button>{" "}
            <button className="btn btn-light" type="button" disabled={saveLoading} onClick={() => this.props.onCancel()}>
              Cancel
            </button>
          </div>
        </form>
      </Widget>
    );
  }
}

export default UsersForm;
