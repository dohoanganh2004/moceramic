import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Spinner,
} from "reactstrap";
import axios from "axios";
import { toast } from "react-toastify";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import ImagePreviewGrid from "components/ImagePreviewGrid";
import getErrorMessage from "utils/getErrorMessage";
import resolveAssetUrl from "utils/resolveAssetUrl";
import { todayStr } from "utils/date";

const Index = () => {
  const router = useRouter();
  const { id } = router.query;
  const currentUser = useSelector((store) => store.auth.currentUser);

  const [loaded, setLoaded] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [locked, setLocked] = useState(false); // status moved past "requested" since page load
  const [existingAttachments, setExistingAttachments] = useState([]);

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [desiredCompletionDate, setDesiredCompletionDate] = useState("");
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (!currentUser || !id) return;
    axios
      .get(`/custom-orders/my/${id}`)
      .then((res) => {
        const r = res.data;
        if (r.status !== "requested") {
          setLocked(true);
          return;
        }
        setContactName(r.contactName || "");
        setContactEmail(r.contactEmail || "");
        setContactPhone(r.contactPhone || "");
        setDescription(r.description || "");
        setQuantity(String(r.quantity || "1"));
        setDesiredCompletionDate(r.desiredCompletionDate || "");
        setExistingAttachments(r.attachmentUrls || []);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoaded(true));
  }, [currentUser, id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactPhone || !description || !quantity) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (desiredCompletionDate && desiredCompletionDate < todayStr()) {
      toast.error("Desired completion date cannot be in the past");
      return;
    }

    const formData = new FormData();
    formData.append(
      "data",
      new Blob(
        [
          JSON.stringify({
            contactName,
            contactEmail,
            contactPhone,
            description,
            quantity: Number(quantity),
            desiredCompletionDate: desiredCompletionDate || null,
          }),
        ],
        { type: "application/json" }
      )
    );
    files.forEach((file) => formData.append("files", file));

    setSubmitting(true);
    axios
      .put(`/custom-orders/my/${id}`, formData)
      .then(() => {
        toast.success("Your custom order request has been updated");
        router.push(`/custom-order/my-request/${id}`);
      })
      .catch((err) => toast.error(getErrorMessage(err, "Could not update your request. Please try again.")))
      .finally(() => setSubmitting(false));
  };

  return (
    <>
      <Head>
        <title>Edit Custom Order</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Container>
        <Row className={"mb-5"} style={{ marginTop: 32 }}>
          <Col lg={8} className="mx-auto">
            <Link href={`/custom-order/my-request/${id}`}>
              <a className={"text-primary fw-bold d-inline-block mb-4"}>&larr; Back to Request</a>
            </Link>

            {!currentUser ? (
              <p>Please log in to edit this request.</p>
            ) : notFound ? (
              <p className={"text-muted"}>This request could not be found.</p>
            ) : !loaded ? null : locked ? (
              <p className={"text-muted"}>
                This request is already being processed and can no longer be edited.{" "}
                <Link href={`/custom-order/my-request/${id}`}>
                  <a className={"text-primary fw-bold"}>View it instead</a>
                </Link>
              </p>
            ) : (
              <>
                <div className="mb-4">
                  <h2 className={"fw-bold"}>Edit Custom Order Request</h2>
                  <h6 className={"text-muted"}>You can update this until we start reviewing it.</h6>
                </div>
                <Form onSubmit={handleSubmit}>
                  <FormGroup className="d-flex" style={{ gap: 16 }}>
                    <div className="flex-fill">
                      <Label className="fw-bold text-muted">Your Name *</Label>
                      <Input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} />
                    </div>
                    <div className="flex-fill">
                      <Label className="fw-bold text-muted">Phone *</Label>
                      <Input type="text" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                    </div>
                  </FormGroup>
                  <FormGroup>
                    <Label className="fw-bold text-muted">Email *</Label>
                    <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                  </FormGroup>
                  <FormGroup className="d-flex" style={{ gap: 16 }}>
                    <div className="flex-fill">
                      <Label className="fw-bold text-muted">Quantity *</Label>
                      <Input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                    </div>
                    <div className="flex-fill">
                      <Label className="fw-bold text-muted">Desired Completion Date</Label>
                      <Input
                        type="date"
                        min={todayStr()}
                        value={desiredCompletionDate}
                        onChange={(e) => setDesiredCompletionDate(e.target.value)}
                      />
                    </div>
                  </FormGroup>
                  <FormGroup>
                    <Label className="fw-bold text-muted">Describe what you'd like us to make *</Label>
                    <Input
                      type="textarea"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      style={{ height: 155 }}
                    />
                  </FormGroup>

                  {existingAttachments.length > 0 ? (
                    <FormGroup>
                      <Label className="fw-bold text-muted">Current Reference Images</Label>
                      <div className={"d-flex flex-wrap"} style={{ gap: 10 }}>
                        {existingAttachments.map((url) => (
                          <a key={url} href={resolveAssetUrl(url)} target="_blank" rel="noopener noreferrer">
                            <img
                              src={resolveAssetUrl(url)}
                              alt="reference"
                              style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 6 }}
                            />
                          </a>
                        ))}
                      </div>
                    </FormGroup>
                  ) : null}

                  <FormGroup>
                    <Label className="fw-bold text-muted">Add More Reference Images (optional)</Label>
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setFiles(Array.from(e.target.files || []))}
                    />
                    <ImagePreviewGrid
                      files={files}
                      onRemove={(index) => setFiles((prev) => prev.filter((_, i) => i !== index))}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Button color="primary" className="text-uppercase fw-bold" type="submit" disabled={submitting}>
                      {submitting ? <Spinner size="sm" /> : "save changes"}
                    </Button>
                  </FormGroup>
                </Form>
              </>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Index;
