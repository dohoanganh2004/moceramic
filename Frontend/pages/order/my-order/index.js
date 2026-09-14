import React from "react";
import { Container, Row, Col, Table } from "reactstrap";
import Head from 'next/head';
import { useSelector } from 'react-redux'
import Link from "next/link";
import axios from "axios";
import s from "pages/account/Account.module.scss";
import product from "public/images/e-commerce/account/products.svg";
import formatCurrency from "utils/formatCurrency";

const Index = () => {
  const currentUser = useSelector((store) => store.auth.currentUser);
  const [orders, setOrders] = React.useState([]);

  React.useEffect(() => {
    if (currentUser) {
      axios.get("/order/user/id").then((res) => setOrders(res.data || [])).catch(() => setOrders([]));
    }
  }, [currentUser]);

  return (
    <>
      <Head>
        <title>My Orders</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="description" content="Beautifully designed web application template built with React and Bootstrap to create modern apps and speed up development" />
        <meta charSet="utf-8" />
      </Head>
      <Container className={"mb-5"} style={{ marginTop: 32 }}>
        <Row>
          <Col xl={12} lg={12} xs={12}>
            <h3 className={"fw-bold mb-4"}>My Orders</h3>
            {!currentUser ? (
              <p>Please log in to view your orders.</p>
            ) : orders.length === 0 ? (
              <p className={"text-muted"}>You have no orders yet.</p>
            ) : (
              <div style={{ overflow: "auto" }}>
                <Table className={s.accountTable} borderless>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #D9D9D9" }}>
                      <th className={"bg-transparent text-dark px-0"}>Date</th>
                      <th className={"bg-transparent text-dark px-0"}>Order</th>
                      <th className={"bg-transparent text-dark px-0"}>Status</th>
                      <th className={"bg-transparent text-dark px-0"}>Payment</th>
                      <th className={"bg-transparent text-dark px-0"}>Tracking</th>
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
                          <Link href={`/order/my-order/${order.id}`}>
                            <a className={"d-flex align-items-center text-dark"}>
                              <img src={product} width={60} className={"mr-4"} />
                              <div>
                                <h5 className={"fw-bold mb-0"}>{order.orderCode || `#${order.id}`}</h5>
                              </div>
                            </a>
                          </Link>
                        </td>
                        <td className={"px-0 pt-4"}>
                          <h6 className={"text-muted mb-0 text-capitalize"}>{order.status}</h6>
                        </td>
                        <td className={"px-0 pt-4"}>
                          {order.payments && order.payments.length > 0 ? (
                            <>
                              <span
                                className={`badge ${order.payments[0].status === "paid" ? "bg-success" : order.payments[0].status === "failed" ? "bg-danger" : "bg-secondary"}`}
                              >
                                {order.payments[0].status}
                              </span>
                              <p className={"text-muted mb-0 mt-1 text-capitalize"} style={{ fontSize: 12 }}>
                                {order.payments[0].method && order.payments[0].method.replace("_", " ")}
                              </p>
                            </>
                          ) : (
                            <span className={"text-muted"}>-</span>
                          )}
                        </td>
                        <td className={"px-0 pt-4"}>
                          {order.shipments && order.shipments.length > 0 ? (
                            <>
                              <h6 className={"mb-0 text-capitalize"}>{order.shipments[0].status}</h6>
                              {order.shipments[0].trackingCode ? (
                                <p className={"text-muted mb-0"} style={{ fontSize: 12 }}>
                                  {order.shipments[0].carrier ? `${order.shipments[0].carrier}: ` : ""}
                                  {order.shipments[0].trackingCode}
                                </p>
                              ) : null}
                            </>
                          ) : (
                            <span className={"text-muted"}>-</span>
                          )}
                        </td>
                        <td className={"px-0 pt-4"}>
                          <h6 className={"fw-bold mb-0"}>{formatCurrency(order.totalAmount)}</h6>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Index;
