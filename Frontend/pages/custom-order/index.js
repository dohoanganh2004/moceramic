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
import { todayStr } from "utils/date";

const Index = () => {
  const currentUser = useSelector((store) => store.auth.currentUser);
  const router = useRouter();
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [desiredCompletionDate, setDesiredCompletionDate] = useState('');
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

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
      .post("/public/custom-orders", formData)
      .then(() => {
        toast.success("Your custom order request has been submitted. We will contact you soon!");
        setContactName('');
        setContactEmail('');
        setContactPhone('');
        setDescription('');
        setQuantity('1');
        setDesiredCompletionDate('');
        setFiles([]);
        // Guest submissions aren't linked to an account, so there's nothing to
        // show them at /custom-order/my-request - only redirect logged-in users.
        if (currentUser) {
          router.push("/custom-order/my-request");
        }
      })
      .catch((err) => toast.error(getErrorMessage(err, "Could not submit your request. Please try again.")))
      .finally(() => setSubmitting(false));
  };

  return (
    <>
      <Head>
        <title>Custom Order</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Container>
        <Row className={"mb-5"} style={{ marginTop: 32 }}>
          <Col lg={8} className="mx-auto">
            <div className={"d-flex justify-content-between align-items-start mb-4"}>
              <div>
                <h2 className={"fw-bold"}>Request a Custom Order</h2>
                <h6 className={"text-muted"}>
                  Tell us what you'd like us to make, and we'll get back to you with a quote.
                </h6>
              </div>
              {currentUser ? (
                <Link href={"/custom-order/my-request"}>
                  <a className={"text-primary fw-bold text-nowrap ml-3"}>My Requests &rarr;</a>
                </Link>
              ) : null}
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
              <FormGroup>
                <Label className="fw-bold text-muted">Reference Images (optional)</Label>
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
                  {submitting ? <Spinner size="sm" /> : "submit request"}
                </Button>
              </FormGroup>
            </Form>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Index;
