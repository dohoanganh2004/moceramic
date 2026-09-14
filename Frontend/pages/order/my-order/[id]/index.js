import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Container, Row, Col, Table } from "reactstrap";
import Head from "next/head";
import axios from "axios";
import { toast } from "react-toastify";
import formatCurrency from "utils/formatCurrency";
import s from "./OrderTracking.module.scss";

const STEPS = [
  { key: "pending", label: "Đặt hàng thành công" },
  { key: "confirmed", label: "Đã xác nhận" },
  { key: "processing", label: "Đang chuẩn bị hàng" },
  { key: "shipping", label: "Đang giao hàng" },
  { key: "delivered", label: "Giao hàng thành công" },
];

const formatDateTime = (value) =>
  value ? value.toString().slice(0, 16).replace("T", " ") : "";

const OrderDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!id) return;
    setLoading(true);
    axios
      .get(`/order/${id}`)
      .then((res) => setOrder(res.data))
      .catch(() => toast.error("Không thể tải thông tin đơn hàng"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Container className={"mb-5"} style={{ marginTop: 32 }}>
        <p className={"text-muted"}>Đang tải...</p>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className={"mb-5"} style={{ marginTop: 32 }}>
        <p className={"text-muted"}>Không tìm thấy đơn hàng.</p>
      </Container>
    );
  }

  const isCancelled = order.status === "cancelled";
  const currentStepIndex = STEPS.findIndex((step) => step.key === order.status);
  const historyByStatus = {};
  (order.statusHistory || []).forEach((h) => {
    if (!historyByStatus[h.status]) historyByStatus[h.status] = h;
  });
  const shipment = order.shipments && order.shipments.length > 0 ? order.shipments[0] : null;
  const payment = order.payments && order.payments.length > 0 ? order.payments[0] : null;

  return (
    <>
      <Head>
        <title>{`Order ${order.orderCode || `#${order.id}`}`}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta charSet="utf-8" />
      </Head>
      <Container className={"mb-5"} style={{ marginTop: 32 }}>
        <Link href="/order/my-order">
          <a className={"text-muted"}>&larr; Back to My Orders</a>
        </Link>

        <div className={"d-flex justify-content-between align-items-center flex-wrap mt-3 mb-4"}>
          <h3 className={"fw-bold mb-0"}>Order {order.orderCode || `#${order.id}`}</h3>
          <span className={"text-muted"}>Placed on {formatDateTime(order.createdAt)}</span>
        </div>

        {isCancelled ? (
          <div className={s.cancelledBanner}>
            <span className={s.cancelledIcon}>&times;</span>
            <div>
              <h5 className={"fw-bold mb-1"}>Order Cancelled</h5>
              {historyByStatus.cancelled ? (
                <p className={"text-muted mb-0"}>{formatDateTime(historyByStatus.cancelled.createdAt)}</p>
              ) : null}
            </div>
          </div>
        ) : (
          <div className={s.tracker}>
            {STEPS.map((step, index) => {
              const isDone = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const hist = isDone ? historyByStatus[step.key] : null;
              return (
                <div
                  key={step.key}
                  className={`${s.step} ${isDone ? s.done : ""} ${isCurrent ? s.current : ""}`}
                >
                  <div className={s.stepLine} />
                  <div className={s.stepCircle}>{isDone ? "✓" : index + 1}</div>
                  <div className={s.stepLabel}>{step.label}</div>
                  <div className={s.stepDate}>{hist ? formatDateTime(hist.createdAt) : ""}</div>
                </div>
              );
            })}
          </div>
        )}

        {shipment ? (
          <div className={s.infoCard}>
            <h6 className={"fw-bold"}>Shipping</h6>
            <p className={"mb-1 text-capitalize"}>Status: {shipment.status}</p>
            {shipment.carrier ? <p className={"mb-1"}>Carrier: {shipment.carrier}</p> : null}
            {shipment.trackingCode ? <p className={"mb-1"}>Tracking code: {shipment.trackingCode}</p> : null}
            {shipment.estimatedDelivery ? (
              <p className={"mb-0"}>Estimated delivery: {shipment.estimatedDelivery}</p>
            ) : null}
          </div>
        ) : null}

        <Row className={"mt-4"}>
          <Col lg={8}>
            <h6 className={"fw-bold mb-3"}>Items</h6>
            <Table borderless>
              <tbody>
                {(order.items || []).map((item) => (
                  <tr key={item.id}>
                    <td>
                      <h6 className={"fw-bold mb-0"}>{item.productNameSnapshot}</h6>
                      <p className={"text-muted mb-0"} style={{ fontSize: 13 }}>
                        {item.variantSnapshot}
                      </p>
                    </td>
                    <td className={"text-muted"}>x{item.quantity}</td>
                    <td className={"text-right"}>{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
          <Col lg={4}>
            <div className={s.infoCard}>
              <h6 className={"fw-bold"}>Summary</h6>
              <div className={"d-flex justify-content-between"}>
                <span className={"text-muted"}>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className={"d-flex justify-content-between"}>
                <span className={"text-muted"}>Discount</span>
                <span>-{formatCurrency(order.discountAmount)}</span>
              </div>
              <div className={"d-flex justify-content-between"}>
                <span className={"text-muted"}>Shipping fee</span>
                <span>{formatCurrency(order.shippingFee)}</span>
              </div>
              <hr />
              <div className={"d-flex justify-content-between"}>
                <strong>Total</strong>
                <strong>{formatCurrency(order.totalAmount)}</strong>
              </div>
              {payment ? (
                <p className={"text-muted mt-3 mb-0 text-capitalize"}>
                  Payment: {payment.method && payment.method.replace("_", " ")} ({payment.status})
                </p>
              ) : null}
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default OrderDetailPage;
