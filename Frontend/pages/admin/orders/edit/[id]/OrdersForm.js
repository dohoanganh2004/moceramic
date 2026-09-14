import React, { Component } from "react";
import { FormGroup, Label, Input, Table } from "reactstrap";
import Loader from "components/admin/Loader";
import Widget from "components/admin/Widget";
import formatCurrency from "utils/formatCurrency";

const STATUS_OPTIONS = ["pending", "confirmed", "processing", "shipping", "delivered", "cancelled"];

class OrdersForm extends Component {
  state = { status: "", note: "" };

  componentDidUpdate(prevProps) {
    if (!prevProps.record && this.props.record && !this.state.status) {
      this.setState({ status: this.props.record.status });
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.onSubmit(this.props.record.id, { status: this.state.status, note: this.state.note || null });
  };

  render() {
    const { saveLoading, findLoading, record } = this.props;
    const { status, note } = this.state;

    if (findLoading || !record) {
      return <Loader />;
    }

    return (
      <Widget title={<h4>Order {record.orderCode || `#${record.id}`}</h4>} collapse close>
        <Table borderless size="sm" style={{ tableLayout: "fixed", width: "100%" }}>
          <tbody>
            <tr><td className="fw-bold" style={{ width: 140 }}>Customer</td><td>{record.userName}</td></tr>
            <tr><td className="fw-bold">Shipping Address</td><td>{record.shippingSnapshot}</td></tr>
            <tr><td className="fw-bold">Subtotal</td><td>{formatCurrency(record.subtotal)}</td></tr>
            <tr><td className="fw-bold">Discount</td><td>{formatCurrency(record.discountAmount)}</td></tr>
            <tr><td className="fw-bold">Total</td><td>{formatCurrency(record.totalAmount)}</td></tr>
            <tr><td className="fw-bold">Voucher</td><td>{record.voucherCode || "-"}</td></tr>
            <tr><td className="fw-bold">Note</td><td>{record.note || "-"}</td></tr>
          </tbody>
        </Table>

        <h6 className="fw-bold mt-4">Items</h6>
        <div style={{ overflowX: "auto" }}>
        <Table bordered size="sm">
          <thead>
            <tr><th>Product</th><th>Variant</th><th>Unit Price</th><th>Qty</th><th>Subtotal</th></tr>
          </thead>
          <tbody>
            {(record.items || []).map((item) => (
              <tr key={item.id}>
                <td>{item.productNameSnapshot}</td>
                <td>{item.variantSnapshot}</td>
                <td>{formatCurrency(item.unitPrice)}</td>
                <td>{item.quantity}</td>
                <td>{formatCurrency(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        </div>

        <form onSubmit={this.handleSubmit} className="mt-4">
          <FormGroup>
            <Label className="fw-bold">Status</Label>
            <Input type="select" value={status} onChange={(e) => this.setState({ status: e.target.value })}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Input>
          </FormGroup>
          <FormGroup>
            <Label className="fw-bold">Note</Label>
            <Input type="textarea" value={note} onChange={(e) => this.setState({ note: e.target.value })} />
          </FormGroup>
          <div className="form-buttons">
            <button className="btn btn-primary" disabled={saveLoading} type="submit">
              Update Status
            </button>{" "}
            <button className="btn btn-light" type="button" disabled={saveLoading} onClick={() => this.props.onCancel()}>
              Cancel
            </button>
          </div>
        </form>

        <h6 className="fw-bold mt-4">Status History</h6>
        <div style={{ overflowX: "auto" }}>
        <Table bordered size="sm">
          <thead>
            <tr><th>Status</th><th>Note</th><th>Changed By</th><th>When</th></tr>
          </thead>
          <tbody>
            {(record.statusHistory || []).map((h) => (
              <tr key={h.id}>
                <td>{h.status}</td>
                <td>{h.note}</td>
                <td>{h.changedByName}</td>
                <td>{h.createdAt && h.createdAt.toString().slice(0, 19).replace("T", " ")}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        </div>
      </Widget>
    );
  }
}

export default OrdersForm;
