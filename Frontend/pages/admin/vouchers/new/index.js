import React, { Component } from "react";
import Head from 'next/head';
import { FormGroup, Label, Input } from "reactstrap";
import { withRouter } from "next/router";
import axios from "axios";
import { toast } from "react-toastify";
import Widget from "components/admin/Widget";

class Index extends Component {
  state = {
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    minOrderAmount: "",
    maxDiscountAmount: "",
    startDate: "",
    endDate: "",
    usageLimit: "",
    isActive: true,
  };

  setField = (field, value) => this.setState({ [field]: value });

  handleSubmit = (e) => {
    e.preventDefault();
    const { code, description, discountType, discountValue, minOrderAmount, maxDiscountAmount, startDate, endDate, usageLimit, isActive } = this.state;
    axios
      .post("/vouchers", {
        code: code.toUpperCase(),
        description: description || null,
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : null,
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        isActive,
      })
      .then(() => {
        toast.success("Voucher created");
        this.props.router.push("/admin/vouchers");
      })
      .catch((err) => {
        const message = (err.response && err.response.data && err.response.data.message) || "Could not create this voucher";
        toast.error(message);
      });
  };

  render() {
    const { code, description, discountType, discountValue, minOrderAmount, maxDiscountAmount, startDate, endDate, usageLimit, isActive } = this.state;

    return (
      <React.Fragment>
        <Head><title>New Voucher</title></Head>
        <Widget title={<h4>Add voucher</h4>} collapse close>
          <form onSubmit={this.handleSubmit}>
            <FormGroup>
              <Label className="fw-bold">Code*</Label>
              <Input value={code} onChange={(e) => this.setField("code", e.target.value)} placeholder="SUMMER2026" required />
            </FormGroup>
            <FormGroup>
              <Label className="fw-bold">Description</Label>
              <Input type="textarea" value={description} onChange={(e) => this.setField("description", e.target.value)} />
            </FormGroup>
            <FormGroup className="d-flex" style={{ gap: 16 }}>
              <div className="flex-fill">
                <Label className="fw-bold">Discount Type*</Label>
                <Input type="select" value={discountType} onChange={(e) => this.setField("discountType", e.target.value)}>
                  <option value="percentage">percentage</option>
                  <option value="fixed">fixed</option>
                </Input>
              </div>
              <div className="flex-fill">
                <Label className="fw-bold">Discount Value*</Label>
                <Input type="number" step="0.01" value={discountValue} onChange={(e) => this.setField("discountValue", e.target.value)} required />
              </div>
            </FormGroup>
            <FormGroup className="d-flex" style={{ gap: 16 }}>
              <div className="flex-fill">
                <Label className="fw-bold">Min Order Amount</Label>
                <Input type="number" step="0.01" value={minOrderAmount} onChange={(e) => this.setField("minOrderAmount", e.target.value)} />
              </div>
              <div className="flex-fill">
                <Label className="fw-bold">Max Discount Amount</Label>
                <Input type="number" step="0.01" value={maxDiscountAmount} onChange={(e) => this.setField("maxDiscountAmount", e.target.value)} />
              </div>
            </FormGroup>
            <FormGroup className="d-flex" style={{ gap: 16 }}>
              <div className="flex-fill">
                <Label className="fw-bold">Start Date</Label>
                <Input type="date" value={startDate} onChange={(e) => this.setField("startDate", e.target.value)} />
              </div>
              <div className="flex-fill">
                <Label className="fw-bold">End Date</Label>
                <Input type="date" value={endDate} onChange={(e) => this.setField("endDate", e.target.value)} />
              </div>
            </FormGroup>
            <FormGroup>
              <Label className="fw-bold">Usage Limit</Label>
              <Input type="number" value={usageLimit} onChange={(e) => this.setField("usageLimit", e.target.value)} placeholder="Leave blank for unlimited" />
            </FormGroup>
            <FormGroup check className="mb-3">
              <Label check>
                <Input type="checkbox" checked={isActive} onChange={(e) => this.setField("isActive", e.target.checked)} /> Active
              </Label>
            </FormGroup>
            <div className="form-buttons">
              <button className="btn btn-primary" type="submit">Save</button>{" "}
              <button className="btn btn-light" type="button" onClick={() => this.props.router.push("/admin/vouchers")}>Cancel</button>
            </div>
          </form>
        </Widget>
      </React.Fragment>
    );
  }
}

export default withRouter(Index);
