import React from "react";
import { Container, Row, Col, Table, Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import Head from "next/head";
import Link from "next/link";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import s from "pages/account/Account.module.scss";
import formatCurrency from "utils/formatCurrency";
import getErrorMessage from "utils/getErrorMessage";
import CustomOrderStatusBadge from "components/e-commerce/CustomOrderStatusBadge";

// Matches the backend's requireStillEditable() check (CustomOrderServiceImp) -
// once staff has started acting on a request it can no longer be self-edited
// or cancelled, so the buttons are hidden past this point rather than letting
// the click fail on the server.
const isEditable = (status) => status === "requested";

const Index = () => {
  const currentUser = useSelector((store) => store.auth.currentUser);
  const [requests, setRequests] = React.useState([]);
  const [loaded, setLoaded] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState(null);
  const [deleting, setDeleting] = React.useState(false);

  const fetchRequests = () => {
    axios
      .get("/custom-orders/my")
      .then((res) => setRequests(res.data || []))
      .catch(() => setRequests([]))
      .finally(() => setLoaded(true));
  };

  React.useEffect(() => {
    if (!currentUser) return;
    fetchRequests();
  }, [currentUser]);

  const confirmDelete = () => {
    setDeleting(true);
    axios
      .delete(`/custom-orders/my/${deleteId}`)
      .then(() => {
        toast.info("Custom order request cancelled");
        setDeleteId(null);
        fetchRequests();
      })
      .catch((err) => toast.error(getErrorMessage(err, "Could not cancel this request")))
      .finally(() => setDeleting(false));
  };

  return (
    <>
      <Head>
        <title>My Custom Orders</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Container className={"mb-5"} style={{ marginTop: 32 }}>
        <Row>
          <Col xl={12} lg={12} xs={12}>
            <div className={"d-flex justify-content-between align-items-center mb-4"}>
              <h3 className={"fw-bold mb-0"}>My Custom Orders</h3>
              <Link href={"/custom-order"}>
                <a className={"btn btn-primary text-uppercase fw-bold"}>+ New Request</a>
              </Link>
            </div>
            {!currentUser ? (
              <p>Please log in to view your custom order requests.</p>
            ) : !loaded ? null : requests.length === 0 ? (
              <p className={"text-muted"}>
                You haven't submitted any custom order requests yet.{" "}
                <Link href={"/custom-order"}>
                  <a className={"text-primary fw-bold"}>Request one now</a>
                </Link>
              </p>
            ) : (
              <div style={{ overflow: "auto" }}>
                <Table className={s.accountTable} borderless>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #D9D9D9" }}>
                      <th className={"bg-transparent text-dark px-0"}>Date</th>
                      <th className={"bg-transparent text-dark px-0"}>Request</th>
                      <th className={"bg-transparent text-dark px-0"}>Quantity</th>
                      <th className={"bg-transparent text-dark px-0"}>Status</th>
                      <th className={"bg-transparent text-dark px-0"}>Quoted Price</th>
                      <th className={"bg-transparent text-dark px-0"}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r.id}>
                        <td className={"px-0 pt-4"}>
                          <p className={"text-muted mb-0"}>
                            {r.createdAt && r.createdAt.toString().slice(0, 10)}
                          </p>
                        </td>
                        <td className={"px-0 pt-4"}>
                          <Link href={`/custom-order/my-request/${r.id}`}>
                            <a className={"text-dark"}>
                              <h6 className={"fw-bold mb-0"}>#{r.id}</h6>
                              <p className={"text-muted mb-0"} style={{ fontSize: 13, maxWidth: 320 }}>
                                {(r.description || "").slice(0, 80)}
                                {(r.description || "").length > 80 ? "…" : ""}
                              </p>
                            </a>
                          </Link>
                        </td>
                        <td className={"px-0 pt-4"}>{r.quantity}</td>
                        <td className={"px-0 pt-4"}>
                          <CustomOrderStatusBadge status={r.status} />
                        </td>
                        <td className={"px-0 pt-4"}>
                          <h6 className={"fw-bold mb-0"}>
                            {r.quotedPrice ? formatCurrency(r.quotedPrice) : "-"}
                          </h6>
                        </td>
                        <td className={"px-0 pt-4"}>
                          {isEditable(r.status) ? (
                            <>
                              <Link href={`/custom-order/my-request/${r.id}/edit`}>
                                <a className={"text-primary fw-bold mr-3"} style={{ fontSize: 13 }}>
                                  Edit
                                </a>
                              </Link>
                              <button
                                type="button"
                                className={"bg-transparent border-0 p-0 text-danger fw-bold"}
                                style={{ fontSize: 13 }}
                                onClick={() => setDeleteId(r.id)}
                              >
                                Delete
                              </button>
                            </>
                          ) : (
                            <span className={"text-muted"} style={{ fontSize: 13 }}>-</span>
                          )}
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

      <Modal isOpen={!!deleteId} toggle={() => setDeleteId(null)}>
        <ModalHeader toggle={() => setDeleteId(null)}>Cancel this request?</ModalHeader>
        <ModalBody>
          This will permanently delete custom order request #{deleteId}. This can't be undone.
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setDeleteId(null)} disabled={deleting}>
            Keep it
          </Button>
          <Button color="danger" onClick={confirmDelete} disabled={deleting}>
            {deleting ? "Cancelling..." : "Yes, cancel request"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default Index;
