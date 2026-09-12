import React, { Component } from "react";
import { Table, Button } from "reactstrap";
import Loader from "components/admin/Loader";
import Widget from "components/admin/Widget";
import axios from "axios";
import { toast } from "react-toastify";

class OrdersView extends Component {
  cancelOrder = () => {
    const { record } = this.props;
    axios
      .patch(`/order/${record.id}/cancel`, {})
      .then(() => {
        toast.success("Order cancelled");
        this.props.onRefetch();
      })
      .catch(() => toast.error("Could not cancel this order"));
  };

  render() {
    const { findLoading, record } = this.props;

    if (findLoading || !record) {
      return <Loader />;
    }

    const canCancel = record.status !== "cancelled" && record.status !== "delivered";

    return (
      <Widget title={<h4>Order {record.orderCode || `#${record.id}`}</h4>} collapse close>
        <Table borderless size="sm">
          <tbody>
            <tr><td className="fw-bold">Customer</td><td>{record.userName}</td></tr>
            <tr><td className="fw-bold">Status</td><td className="text-capitalize">{record.status}</td></tr>
            <tr><td className="fw-bold">Shipping Address</td><td>{record.shippingSnapshot}</td></tr>
            <tr><td className="fw-bold">Subtotal</td><td>${record.subtotal}</td></tr>
            <tr><td className="fw-bold">Discount</td><td>${record.discountAmount}</td></tr>
            <tr><td className="fw-bold">Shipping Fee</td><td>${record.shippingFee}</td></tr>
            <tr><td className="fw-bold">Total</td><td>${record.totalAmount}</td></tr>
            <tr><td className="fw-bold">Voucher</td><td>{record.voucherCode || "-"}</td></tr>
            <tr><td className="fw-bold">Note</td><td>{record.note || "-"}</td></tr>
          </tbody>
        </Table>

        <h6 className="fw-bold mt-4">Items</h6>
        <Table bordered size="sm">
          <thead>
            <tr><th>Product</th><th>Variant</th><th>Unit Price</th><th>Qty</th><th>Subtotal</th></tr>
          </thead>
          <tbody>
            {(record.items || []).map((item) => (
              <tr key={item.id}>
                <td>{item.productNameSnapshot}</td>
                <td>{item.variantSnapshot}</td>
                <td>${item.unitPrice}</td>
                <td>{item.quantity}</td>
                <td>${item.subtotal}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        <h6 className="fw-bold mt-4">Status History</h6>
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

        <div className="form-buttons">
          {canCancel ? (
            <Button color="danger" onClick={this.cancelOrder}>Cancel Order</Button>
          ) : null}{" "}
          <Button color="light" onClick={() => this.props.onCancel()}>Back to list</Button>
        </div>
      </Widget>
    );
  }
}

export default OrdersView;
