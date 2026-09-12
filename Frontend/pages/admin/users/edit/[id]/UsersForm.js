import React, { Component } from "react";
import { FormGroup, Label, Input } from "reactstrap";
import Loader from "components/admin/Loader";
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
  state = { fullName: "", email: "", phone: "", roleId: 1, isActive: true, loaded: false };

  componentDidUpdate(prevProps) {
    if (!prevProps.record && this.props.record && !this.state.loaded) {
      const r = this.props.record;
      this.setState({
        fullName: r.fullName || "",
        email: r.email || "",
        phone: r.phone || "",
        roleId: r.roleID || r.roleId || 1,
        isActive: r.isActive !== false,
        loaded: true,
      });
    }
  }

  setField = (field, value) => this.setState({ [field]: value });

  handleSubmit = (e) => {
    e.preventDefault();
    const { fullName, email, phone, roleId, isActive } = this.state;
    this.props.onSubmit(this.props.record.id, {
      fullName,
      email,
      phone,
      roleId: Number(roleId),
      isActive,
    });
  };

  render() {
    const { saveLoading, findLoading, record } = this.props;
    const { fullName, email, phone, roleId, isActive } = this.state;

    if (findLoading || !record) {
      return <Loader />;
    }

    return (
      <Widget title={<h4>Edit user</h4>} collapse close>
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
