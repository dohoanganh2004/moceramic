import React from "react";
import PropTypes from "prop-types";
import Link from 'next/link'
import {withRouter} from 'next/router'
import { connect } from "react-redux";
import {
  Container,
  Button,
  Col,
  Row,
  Form,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import { registerUser, authError } from "redux/actions/auth";
import { loginUser } from "redux/actions/auth";
import { toast } from "react-toastify";
import microsoft from "public/images/microsoft.png";
import img from "public/images/e-commerce/register/bg.png";
import logo from "public/images/e-commerce/logo.svg";
import eye from 'public/images/e-commerce/login/eye.png';
import eyeOff from 'public/images/e-commerce/login/eye-off.png';
import Head from 'next/head';

import s from './Register.module.scss';

class Index extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      accepted: false,
      viewPassword: false,
      viewCopyPassword: false,
    };

    this.doRegister = this.doRegister.bind(this);
    this.googleLogin = this.googleLogin.bind(this);
    this.microsoftLogin = this.microsoftLogin.bind(this);
    this.changeFullName = this.changeFullName.bind(this);
    this.changeEmail = this.changeEmail.bind(this);
    this.changePhoneNumber = this.changePhoneNumber.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.changeConfirmPassword = this.changeConfirmPassword.bind(this);
    this.changeAccepted = this.changeAccepted.bind(this);
    this.checkPassword = this.checkPassword.bind(this);
    this.isPasswordValid = this.isPasswordValid.bind(this);
  }

  changeFullName(event) {
    this.setState({ fullName: event.target.value });
  }

  changeEmail(event) {
    this.setState({ email: event.target.value });
  }

  changePhoneNumber(event) {
    this.setState({ phoneNumber: event.target.value });
  }

  changeAccepted(event) {
    this.setState({ accepted: event.target.checked });
  }

  changePassword(event) {
    this.setState({ password: event.target.value });
  }

  changeConfirmPassword(event) {
    this.setState({ confirmPassword: event.target.value });
  }

  checkPassword() {
    if (!this.isPasswordValid()) {
      const message = !this.state.password ? "Password field is empty" : "Passwords are not equal";
      this.props.dispatch(authError(message));
      toast.error(message);
      setTimeout(() => {
        this.props.dispatch(authError());
      }, 3 * 1000);
    }
  }

  isPasswordValid() {
    return (
      this.state.password && this.state.password === this.state.confirmPassword
    );
  }

  doRegister(e) {
    e.preventDefault();
    if (!this.isPasswordValid()) {
      this.checkPassword();
    } else if (!this.state.accepted) {
      const message = "Vui lòng đồng ý với điều khoản sử dụng";
      this.props.dispatch(authError(message));
      toast.error(message);
    } else if (!this.state.phoneNumber) {
      const message = "Vui lòng nhập số điện thoại";
      this.props.dispatch(authError(message));
      toast.error(message);
    } else {
      this.props.dispatch(
        registerUser({
          fullName: this.state.fullName,
          email: this.state.email,
          phoneNumber: this.state.phoneNumber,
          password: this.state.password,
          confirmPassword: this.state.confirmPassword,
          accepted: this.state.accepted,
        })
      );
    }
  }

  googleLogin() {
    this.props.dispatch(loginUser({ social: "google" }));
  }

  microsoftLogin() {
    this.props.dispatch(loginUser({ social: "microsoft" }));
  }

  render() {
    return (
      <>
        <Head>
          <title>Register | Ecommerce</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />

          <meta name="description" content={'Beautifully designed web application template built with React and Bootstrap to create modern apps and speed up development'}  />
          <meta name="keywords" content={"flatlogic, react templates"} />
          <meta name="author" content={"Flatlogic LLC."} />
          <meta charSet="utf-8" />


          <meta property="og:title" content={"Flatlogic - React, Vue, Angular and Bootstrap Templates and Admin Dashboard Themes"} />
          <meta property="og:type" content="website"/>
          <meta property="og:url" content={"https://flatlogic-ecommerce.herokuapp.com/"} />
          <meta property="og:image" content={"https://flatlogic-ecommerce-backend.herokuapp.com/images/blogs/content_image_six.jpg"} />
          <meta property="og:description" content={'Beautifully designed web application template built with React and Bootstrap to create modern apps and speed up development'} />
          <meta name="twitter:card" content="summary_large_image" />

          <meta property="fb:app_id" content={"712557339116053"} />

          <meta property="og:site_name" content={"Flatlogic"} />
          <meta name="twitter:site" content={"@flatlogic"} />
        </Head>
        <Row className={"no-gutters"} style={{ height: "100vh" }}>
          <Col
            xs={12}
            md={6}
            className={
              "d-flex flex-column justify-content-center align-items-center h-100"
            }
          >
            <Container>
              <Row className={"d-flex justify-content-center"}>
                <Col lg={8} xs={"auto"}>
                  <Link href={"/"}>
                    <img src={logo} alt={"logo"} style={{ marginBottom: 120 }} />
                  </Link>
                  <h5 className={"fw-bold mb-5"}>Sign Up</h5>
                  <Form className={"w-100"} onSubmit={this.doRegister}>
                    <FormGroup>
                      <Label for="exampleFullName" className="fw-bold">
                        Full Name
                      </Label>
                      <Input
                        type="text"
                        name="text"
                        id="exampleFullName"
                        className="w-100"
                        placeholder={"Full Name"}
                        value={this.state.fullName}
                        onChange={this.changeFullName}
                        required
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label for="exampleEmail" className="fw-bold">
                        Email
                      </Label>
                      <Input
                        type="email"
                        name="text"
                        id="exampleEmail"
                        className="w-100"
                        placeholder={"Email"}
                        value={this.state.email}
                        onChange={this.changeEmail}
                        required
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label for="examplePhone" className="fw-bold">
                        Phone Number
                      </Label>
                      <Input
                        type="tel"
                        name="text"
                        id="examplePhone"
                        className="w-100"
                        placeholder={"Phone Number"}
                        value={this.state.phoneNumber}
                        onChange={this.changePhoneNumber}
                        required
                      />
                    </FormGroup>
                    <FormGroup className={s.formGroup}>
                      <Label for="exampleEmail" className="fw-bold">
                        Password
                      </Label>
                      <Input
                          type={this.state.viewPassword ? 'text' : 'password'}
                        name="text"
                        id="exampleEmail"
                        className="w-100"
                        placeholder={"Password"}
                        value={this.state.password}
                        onChange={this.changePassword}
                        required
                      />
                      <img className={s.viewPassword} src={this.state.viewPassword ? eye : eyeOff} onClick={() => this.setState({ viewPassword: !this.state.viewPassword })} />
                    </FormGroup>
                    <FormGroup className={s.formGroup}>
                      <Label for="exampleEmail" className="fw-bold">
                        Repeat Password
                      </Label>
                      <Input
                          type={this.state.viewCopyPassword ? 'text' : 'password'}
                        name="text"
                        id="exampleEmail"
                        className="w-100"
                        placeholder={"Password"}
                        value={this.state.confirmPassword}
                        onChange={this.changeConfirmPassword}
                        required
                      />
                      <img className={s.viewPassword} src={this.state.viewCopyPassword ? eye : eyeOff} onClick={() => this.setState({ viewCopyPassword: !this.state.viewCopyPassword })} />
                    </FormGroup>
                    <FormGroup check className={"mb-4"}>
                      <Label check>
                        <Input
                          type="checkbox"
                          checked={this.state.accepted}
                          onChange={this.changeAccepted}
                        />{" "}
                        I agree to the Terms of Service
                      </Label>
                    </FormGroup>
                    <div
                      className={
                        "d-flex justify-content-between align-items-center mt-5"
                      }
                    >
                      <Link href={"/login"} className={"fw-bold text-primary"}>
                        Log In to your account
                      </Link>
                      <Button
                        color={"primary"}
                        className={`fw-bold text-uppercase ${s.button}`}
                      >
                        SIGN UP
                      </Button>
                    </div>
                  </Form>
                  <footer
                    style={{ marginTop: 100 }}
                    className={`d-flex justify-content-between ${s.footer}`}
                  >
                    <Link href={"#"} className={"fw-bold text-dark"}>
                      Terms & Conditions
                    </Link>
                    <Link href={"#"} className={"fw-bold text-dark"}>
                      Privacy Policy
                    </Link>
                    <Link href={"#"} className={"fw-bold text-dark"}>
                      Help
                    </Link>
                  </footer>
                </Col>
              </Row>
            </Container>
          </Col>
          <Col sm={6} className={`d-none d-md-inline-block h-100 ${s.backgroundImage}`} />
        </Row>
      </>
    );
  }
}

export async function getServerSideProps(context) {
  // const res = await axios.get("/products");
  // const products = res.data.rows;

  return {
    props: {  }, // will be passed to the page component as props
  };
}

function mapStateToProps(state) {
  return {
    isFetching: state.auth.isFetching,
    errorMessage: state.auth.errorMessage,
  };
}

export default withRouter(connect(mapStateToProps)(Index));
