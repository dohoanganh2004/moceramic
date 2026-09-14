import React, { Component } from "react";
import { Table, Button, Input, FormGroup, Label } from "reactstrap";
import Loader from "components/admin/Loader";
import Widget from "components/admin/Widget";
import axios from "axios";
import { toast } from "react-toastify";
import formatCurrency from "utils/formatCurrency";

const SHIPMENT_STATUSES = ["pending", "preparing", "shipped", "in_transit", "delivered", "returned", "cancelled"];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];
const PAYMENT_METHODS = ["cod", "bank_transfer", "vnpay", "momo", "stripe"];

class OrdersView extends Component {
  state = {
    shipCarrier: "",
    shipTrackingCode: "",
    shipStatus: "pending",
    shipShippingFee: "",
    shipEstimatedDelivery: "",
    shipSaving: false,
    payMethod: "cod",
    payAmount: "",
    payStatus: "pending",
    payTransactionRef: "",
    paySaving: false,
  };

  componentDidMount() {
    this.syncShipmentForm();
    this.syncPaymentForm();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.record !== this.props.record) {
      this.syncShipmentForm();
      this.syncPaymentForm();
    }
  }

  syncShipmentForm = () => {
    const shipment = this.getShipment();
    if (shipment) {
      this.setState({
        shipCarrier: shipment.carrier || "",
        shipTrackingCode: shipment.trackingCode || "",
        shipStatus: shipment.status || "pending",
        shipShippingFee: shipment.shippingFee != null ? shipment.shippingFee : "",
        shipEstimatedDelivery: shipment.estimatedDelivery || "",
      });
    }
  };

  syncPaymentForm = () => {
    const payment = this.getPayment();
    const { record } = this.props;
    if (payment) {
      this.setState({
        payMethod: payment.method || "cod",
        payAmount: payment.amount != null ? payment.amount : "",
        payStatus: payment.status || "pending",
        payTransactionRef: payment.transactionRef || "",
      });
    } else if (record) {
      this.setState({ payAmount: record.totalAmount != null ? record.totalAmount : "" });
    }
  };

  getShipment = () => {
    const { record } = this.props;
    return record && record.shipments && record.shipments.length > 0 ? record.shipments[0] : null;
  };

  getPayment = () => {
    const { record } = this.props;
    return record && record.payments && record.payments.length > 0 ? record.payments[0] : null;
  };

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

  saveShipment = () => {
    const { record } = this.props;
    const { shipCarrier, shipTrackingCode, shipStatus, shipShippingFee, shipEstimatedDelivery } = this.state;
    const shipment = this.getShipment();
    const payload = {
      orderId: record.id,
      carrier: shipCarrier,
      trackingCode: shipTrackingCode,
      status: shipStatus,
      shippingFee: shipShippingFee === "" ? 0 : Number(shipShippingFee),
      estimatedDelivery: shipEstimatedDelivery || null,
    };
    this.setState({ shipSaving: true });
    const request = shipment
      ? axios.put(`/shipments/${shipment.id}`, payload)
      : axios.post(`/shipments`, payload);
    request
      .then(() => {
        toast.success("Shipment saved");
        this.props.onRefetch();
      })
      .catch(() => toast.error("Could not save shipment"))
      .finally(() => this.setState({ shipSaving: false }));
  };

  savePayment = () => {
    const { record } = this.props;
    const { payMethod, payAmount, payStatus, payTransactionRef } = this.state;
    const payment = this.getPayment();
    this.setState({ paySaving: true });

    const request = payment
      ? axios.patch(`/payments/${payment.id}/status`, {
          status: payStatus,
          transactionRef: payTransactionRef || null,
        })
      : axios.post(`/payments`, {
          orderId: record.id,
          method: payMethod,
          amount: payAmount === "" ? 0 : Number(payAmount),
          status: payStatus,
          transactionRef: payTransactionRef || null,
        });

    request
      .then(() => {
        toast.success("Payment saved");
        this.props.onRefetch();
      })
      .catch(() => toast.error("Could not save payment"))
      .finally(() => this.setState({ paySaving: false }));
  };

  render() {
    const { findLoading, record } = this.props;

    if (findLoading || !record) {
      return <Loader />;
    }

    const canCancel = record.status !== "cancelled" && record.status !== "delivered";
    const shipment = this.getShipment();
    const payment = this.getPayment();
    const { shipCarrier, shipTrackingCode, shipStatus, shipShippingFee, shipEstimatedDelivery, shipSaving,
            payMethod, payAmount, payStatus, payTransactionRef, paySaving } = this.state;

    return (
      <Widget title={<h4>Order {record.orderCode || `#${record.id}`}</h4>} collapse close>
        <Table borderless size="sm" style={{ tableLayout: "fixed", width: "100%" }}>
          <tbody>
            <tr><td className="fw-bold" style={{ width: 140 }}>Customer</td><td>{record.userName}</td></tr>
            <tr><td className="fw-bold">Status</td><td className="text-capitalize">{record.status}</td></tr>
            <tr><td className="fw-bold">Shipping Address</td><td>{record.shippingSnapshot}</td></tr>
            <tr><td className="fw-bold">Subtotal</td><td>{formatCurrency(record.subtotal)}</td></tr>
            <tr><td className="fw-bold">Discount</td><td>{formatCurrency(record.discountAmount)}</td></tr>
            <tr><td className="fw-bold">Shipping Fee</td><td>{formatCurrency(record.shippingFee)}</td></tr>
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

        <h6 className="fw-bold mt-4">Payment</h6>
        <div className="d-flex" style={{ gap: 16, flexWrap: "wrap" }}>
          <FormGroup style={{ minWidth: 160 }}>
            <Label className="fw-bold">Method</Label>
            <Input
              type="select"
              value={payMethod}
              disabled={!!payment}
              onChange={(e) => this.setState({ payMethod: e.target.value })}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </Input>
          </FormGroup>
          <FormGroup style={{ minWidth: 140 }}>
            <Label className="fw-bold">Amount</Label>
            <Input
              type="number"
              value={payAmount}
              disabled={!!payment}
              onChange={(e) => this.setState({ payAmount: e.target.value })}
            />
          </FormGroup>
          <FormGroup style={{ minWidth: 160 }}>
            <Label className="fw-bold">Status</Label>
            <Input type="select" value={payStatus} onChange={(e) => this.setState({ payStatus: e.target.value })}>
              {PAYMENT_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Input>
          </FormGroup>
          <FormGroup style={{ minWidth: 180 }}>
            <Label className="fw-bold">Transaction Ref</Label>
            <Input type="text" value={payTransactionRef} onChange={(e) => this.setState({ payTransactionRef: e.target.value })} />
          </FormGroup>
        </div>
        {payment && payment.paidAt && (
          <p className="text-muted mb-2">Paid at: {payment.paidAt.toString().slice(0, 19).replace("T", " ")}</p>
        )}
        <div className="mb-4">
          <Button color="primary" disabled={paySaving} onClick={this.savePayment}>
            {payment ? "Update Payment" : "Create Payment"}
          </Button>
        </div>

        <h6 className="fw-bold mt-4">Shipment</h6>
        <div className="d-flex" style={{ gap: 16, flexWrap: "wrap" }}>
          <FormGroup style={{ minWidth: 180 }}>
            <Label className="fw-bold">Carrier</Label>
            <Input type="text" value={shipCarrier} onChange={(e) => this.setState({ shipCarrier: e.target.value })} />
          </FormGroup>
          <FormGroup style={{ minWidth: 180 }}>
            <Label className="fw-bold">Tracking Code</Label>
            <Input type="text" value={shipTrackingCode} onChange={(e) => this.setState({ shipTrackingCode: e.target.value })} />
          </FormGroup>
          <FormGroup style={{ minWidth: 160 }}>
            <Label className="fw-bold">Status</Label>
            <Input type="select" value={shipStatus} onChange={(e) => this.setState({ shipStatus: e.target.value })}>
              {SHIPMENT_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Input>
          </FormGroup>
          <FormGroup style={{ minWidth: 140 }}>
            <Label className="fw-bold">Shipping Fee</Label>
            <Input type="number" value={shipShippingFee} onChange={(e) => this.setState({ shipShippingFee: e.target.value })} />
          </FormGroup>
          <FormGroup style={{ minWidth: 160 }}>
            <Label className="fw-bold">Estimated Delivery</Label>
            <Input type="date" value={shipEstimatedDelivery} onChange={(e) => this.setState({ shipEstimatedDelivery: e.target.value })} />
          </FormGroup>
        </div>
        {shipment && shipment.deliveredAt && (
          <p className="text-muted mb-2">Delivered at: {shipment.deliveredAt.toString().slice(0, 19).replace("T", " ")}</p>
        )}
        <div className="mb-4">
          <Button color="primary" disabled={shipSaving} onClick={this.saveShipment}>
            {shipment ? "Update Shipment" : "Create Shipment"}
          </Button>
        </div>

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
