import React from "react";
import { Row, Col, Button, FormGroup, Label, Input } from "reactstrap";
import Head from 'next/head';
import { useSelector, useDispatch } from 'react-redux'
import axios from "axios";
import { toast } from "react-toastify";
import { doInit } from "redux/actions/auth";
import Widget from "components/admin/Widget";
import Loader from "components/admin/Loader";
import avatarPlaceholder from "public/images/e-commerce/account/avatar.svg";
import resolveAssetUrl from "utils/resolveAssetUrl";
import s from "./MyProfile.module.scss";

const Index = () => {
  const currentUser = useSelector((store) => store.auth.currentUser);
  const dispatch = useDispatch();
  const fileInputRef = React.useRef(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false);
  const [profile, setProfile] = React.useState(null);
  const [fullName, setFullName] = React.useState("");
  const [phone, setPhone] = React.useState("");

  React.useEffect(() => {
    if (!currentUser) return;
    axios
      .get("/users/me")
      .then((res) => {
        setProfile(res.data);
        setFullName(res.data.fullName || "");
        setPhone(res.data.phone || "");
      })
      .catch(() => toast.error("Could not load your profile"))
      .finally(() => setLoading(false));
  }, [currentUser]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    axios
      .put("/users/me", { fullName, phone, avatarUrl: profile && profile.avatarUrl })
      .then((res) => {
        toast.success("Profile updated");
        setProfile(res.data);
        dispatch(doInit());
      })
      .catch((err) => {
        const message = (err.response && err.response.data && err.response.data.message) || "Could not update your profile";
        toast.error(message);
      })
      .finally(() => setSaving(false));
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleAvatarChange = (e) => {
    // React pools SyntheticEvents - e.target is nulled out again as soon as this
    // handler returns, so it's gone by the time the async .finally() below runs.
    // Keep a plain reference to the actual DOM node instead of touching e.target there.
    const inputEl = e.target;
    const file = inputEl.files && inputEl.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      inputEl.value = "";
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    setUploadingAvatar(true);
    axios
      .put("/users/me/avatar", formData, { headers: { "Content-Type": "multipart/form-data" } })
      .then((res) => {
        toast.success("Avatar updated");
        setProfile(res.data);
        dispatch(doInit());
      })
      .catch((err) => {
        const message = (err.response && err.response.data && err.response.data.message) || "Could not update your avatar";
        toast.error(message);
      })
      .finally(() => {
        setUploadingAvatar(false);
        inputEl.value = "";
      });
  };

  return (
    <>
      <Head>
        <title>My Profile</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta charSet="utf-8" />
      </Head>
      <div>
        <h1 className="page-title">My Profile</h1>
        {!currentUser ? (
          <p>Please log in to view your profile.</p>
        ) : loading || !profile ? (
          <p className={"text-muted"}>Loading...</p>
        ) : (
          <Row>
            <Col lg={4} md={5} xs={12} className={"mb-4"}>
              <Widget title={<h4>Profile</h4>}>
                <div className={"d-flex flex-column align-items-center text-center"}>
                  <div className={s.avatarWrap} onClick={handleAvatarClick}>
                    <img
                      src={profile.avatarUrl ? resolveAssetUrl(profile.avatarUrl) : avatarPlaceholder}
                      alt={"avatar"}
                      className={s.avatarImg}
                    />
                    <div className={s.avatarOverlay}>
                      {uploadingAvatar ? <Loader size={24} /> : <i className="la la-camera" />}
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type={"file"}
                    accept={"image/*"}
                    className={"d-none"}
                    onChange={handleAvatarChange}
                  />
                  <Button
                    color={"link"}
                    className={"fw-bold p-0 mt-2"}
                    onClick={handleAvatarClick}
                    disabled={uploadingAvatar}
                  >
                    Change Photo
                  </Button>
                  <h5 className={"fw-bold mt-4 mb-0"}>{profile.fullName}</h5>
                  <p className={"text-muted mb-2"}>{profile.email}</p>
                  <span className={"badge bg-secondary text-uppercase"} style={{ fontSize: 11, letterSpacing: 0.5 }}>
                    {profile.roleName}
                  </span>
                  <hr className={"w-100"} />
                  <p className={"text-muted mb-0"} style={{ fontSize: 13 }}>
                    Member since {profile.createdAt && profile.createdAt.toString().slice(0, 10)}
                  </p>
                </div>
              </Widget>
            </Col>
            <Col lg={8} md={7} xs={12}>
              <Widget title={<h4>Account Details</h4>}>
                <form onSubmit={handleSubmit}>
                  <FormGroup>
                    <Label className="fw-bold">Email</Label>
                    <Input value={profile.email} disabled />
                  </FormGroup>
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <Label className="fw-bold">Full Name*</Label>
                        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label className="fw-bold">Phone</Label>
                        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Button color="primary" type="submit" disabled={saving} className="fw-bold">
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </form>
              </Widget>
            </Col>
          </Row>
        )}
      </div>
    </>
  );
};

export default Index;
