import React from "react";
import { Container, Row, Col, Form, FormGroup, Label, Input, Button } from "reactstrap";
import Link from "next/link";
import Head from "next/head";
import { useSelector, useDispatch } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { logoutUser } from "redux/actions/auth";

const ChangePassword = () => {
  const currentUser = useSelector((store) => store.auth.currentUser);
  const dispatch = useDispatch();
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmNewPassword, setConfirmNewPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error("Mật khẩu mới xác nhận không khớp");
      return;
    }
    setSubmitting(true);
    axios
      .put("/users/me/password", { currentPassword, newPassword, confirmNewPassword })
      .then(() => {
        toast.success("Đổi mật khẩu thành công, vui lòng đăng nhập lại");
        setTimeout(() => dispatch(logoutUser()), 1500);
      })
      .catch((err) => {
        const message = (err.response && err.response.data && err.response.data.message) || "Đổi mật khẩu thất bại";
        toast.error(message);
        setSubmitting(false);
      });
  };

  return (
    <Container>
      <Head>
        <title>Change Password</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <ToastContainer />
      <Row className={"mb-5 justify-content-center"} style={{ marginTop: 32 }}>
        <Col xs={12} md={6} lg={5}>
          <h2 className={"fw-bold mt-4 mb-5"}>Change Password</h2>
          {!currentUser ? (
            <p>
              Please{" "}
              <Link href="/login">
                <a>log in</a>
              </Link>{" "}
              to change your password.
            </p>
          ) : (
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label className="fw-bold">Current Password</Label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label className="fw-bold">New Password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label className="fw-bold">Confirm New Password</Label>
                <Input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </FormGroup>
              <Button color={"primary"} className={"fw-bold text-uppercase mt-3"} disabled={submitting}>
                Save Changes
              </Button>
            </Form>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ChangePassword;
