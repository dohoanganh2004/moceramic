import React from "react";
import { Container, Row, Col, Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import Widget from "components/admin/Widget";
import CustomOrderStatusBadge from "components/e-commerce/CustomOrderStatusBadge";
import resolveAssetUrl from "utils/resolveAssetUrl";
import formatCurrency from "utils/formatCurrency";
import getErrorMessage from "utils/getErrorMessage";

const isEditable = (status) => status === "requested";

const Index = () => {
  const router = useRouter();
  const { id } = router.query;
  const currentUser = useSelector((store) => store.auth.currentUser);
  const [request, setRequest] = React.useState(null);
  const [notFound, setNotFound] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    if (!currentUser || !id) return;
    axios
      .get(`/custom-orders/my/${id}`)
      .then((res) => setRequest(res.data))
      .catch(() => setNotFound(true));
  }, [currentUser, id]);

  const confirmDelete = () => {
    setDeleting(true);
    axios
      .delete(`/custom-orders/my/${id}`)
      .then(() => {
        toast.info("Custom order request cancelled");
        router.push("/custom-order/my-request");
      })
      .catch((err) => {
        toast.error(getErrorMessage(err, "Could not cancel this request"));
        setDeleting(false);
        setDeleteOpen(false);
      });
  };

  return (
    <>
      <Head>
        <title>Custom Order Request</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Container className={"mb-5"} style={{ marginTop: 32 }}>
        <Row>
          <Col xl={8} lg={10} xs={12} className="mx-auto">
            <Link href={"/custom-order/my-request"}>
              <a className={"text-primary fw-bold d-inline-block mb-4"}>&larr; Back to My Custom Orders</a>
            </Link>
            {!currentUser ? (
              <p>Please log in to view this request.</p>
            ) : notFound ? (
              <p className={"text-muted"}>This request could not be found.</p>
            ) : !request ? null : (
              <Widget>
                <div className={"d-flex justify-content-between align-items-start mb-4"}>
                  <div>
                    <h3 className={"fw-bold mb-1"}>Request #{request.id}</h3>
                    <p className={"text-muted mb-0"}>
                      Submitted {request.createdAt && request.createdAt.toString().slice(0, 10)}
                    </p>
                  </div>
                  <div className={"d-flex align-items-center"} style={{ gap: 12 }}>
                    <CustomOrderStatusBadge status={request.status} />
                    {isEditable(request.status) ? (
                      <>
                        <Link href={`/custom-order/my-request/${request.id}/edit`}>
                          <a className={"text-primary fw-bold"} style={{ fontSize: 13 }}>Edit</a>
                        </Link>
                        <button
                          type="button"
                          className={"bg-transparent border-0 p-0 text-danger fw-bold"}
                          style={{ fontSize: 13 }}
                          onClick={() => setDeleteOpen(true)}
                        >
                          Delete
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>

                <Row>
                  <Col md={6}>
                    <p className={"text-muted mb-1"} style={{ fontSize: 12 }}>QUANTITY</p>
                    <p className={"fw-bold"}>{request.quantity}</p>
                  </Col>
                  <Col md={6}>
                    <p className={"text-muted mb-1"} style={{ fontSize: 12 }}>DESIRED COMPLETION DATE</p>
                    <p className={"fw-bold"}>{request.desiredCompletionDate || "-"}</p>
                  </Col>
                </Row>

                <p className={"text-muted mb-1"} style={{ fontSize: 12 }}>DESCRIPTION</p>
                <p style={{ whiteSpace: "pre-wrap" }}>{request.description}</p>

                {request.attachmentUrls && request.attachmentUrls.length > 0 ? (
                  <>
                    <p className={"text-muted mb-2"} style={{ fontSize: 12 }}>REFERENCE IMAGES</p>
                    <div className={"d-flex flex-wrap mb-4"} style={{ gap: 10 }}>
                      {request.attachmentUrls.map((url) => (
                        <a key={url} href={resolveAssetUrl(url)} target="_blank" rel="noopener noreferrer">
                          <img
                            src={resolveAssetUrl(url)}
                            alt="reference"
                            style={{ width: 96, height: 96, objectFit: "cover", borderRadius: 6 }}
                          />
                        </a>
                      ))}
                    </div>
                  </>
                ) : null}

                <hr />

                {request.status === "requested" || request.status === "reviewing" ? (
                  <p className={"text-muted mb-0"}>
                    We're reviewing your request and will follow up with a quote soon.
                  </p>
                ) : (
                  <Row>
                    <Col md={6}>
                      <p className={"text-muted mb-1"} style={{ fontSize: 12 }}>QUOTED PRICE</p>
                      <p className={"fw-bold"}>
                        {request.quotedPrice ? formatCurrency(request.quotedPrice) : "Not quoted yet"}
                      </p>
                    </Col>
                    {request.adminNote ? (
                      <Col md={6}>
                        <p className={"text-muted mb-1"} style={{ fontSize: 12 }}>NOTE FROM OUR TEAM</p>
                        <p>{request.adminNote}</p>
                      </Col>
                    ) : null}
                  </Row>
                )}
              </Widget>
            )}
          </Col>
        </Row>
      </Container>

      <Modal isOpen={deleteOpen} toggle={() => setDeleteOpen(false)}>
        <ModalHeader toggle={() => setDeleteOpen(false)}>Cancel this request?</ModalHeader>
        <ModalBody>This will permanently delete this custom order request. This can't be undone.</ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setDeleteOpen(false)} disabled={deleting}>
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
