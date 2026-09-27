import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "next/router";
import Link from 'next/link'
import { connect } from "react-redux";
import {
  Container,
  Button,
  Col,
  Row,
  FormGroup,
  Label,
  Input,
  Form,
} from "reactstrap";
import Head from 'next/head';
import { loginUser } from "redux/actions/auth";
import jwt from "jsonwebtoken";
import Brand from "components/Brand";
import eye from 'public/images/e-commerce/login/eye.png';
import eyeOff from 'public/images/e-commerce/login/eye-off.png';

import s from './Login.module.scss';

class Login extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    viewPassword: false,
  };

  static isAuthenticated() {
    const token = typeof window !== "undefined" && localStorage.getItem("token");
    if (!token) return;
    const date = new Date().getTime() / 1000;
    const data = jwt.decode(token);
    if (!data) return;
    return date < data.exp;
  }

  constructor(props) {
    super(props);

    this.state = {
      phoneNumber: "",
      password: "",
      rememberMe: true,
    };

    this.doLogin = this.doLogin.bind(this);
    this.googleLogin = this.googleLogin.bind(this);
    this.microsoftLogin = this.microsoftLogin.bind(this);
    this.changePhoneNumber = this.changePhoneNumber.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.signUp = this.signUp.bind(this);
  }

  changePhoneNumber(event) {
    this.setState({ phoneNumber: event.target.value });
  }

  changePassword(event) {
    this.setState({ password: event.target.value });
  }

  doLogin(e) {
    e.preventDefault();
    this.props.dispatch(
      loginUser({
        phoneNumber: this.state.phoneNumber,
        password: this.state.password,
        rememberMe: this.state.rememberMe,
      })
    );
  }

  googleLogin() {
    this.props.dispatch(loginUser({ social: "google" }));
  }

  microsoftLogin() {
    this.props.dispatch(loginUser({ social: "microsoft" }));
  }

  componentDidMount() {
    // const params = new URLSearchParams(this.props.location.search);
    // const token = params.get("token");
    // if (token) {
    //   this.props.dispatch(receiveToken(token));
    //   this.props.dispatch(doInit());
    // }
  }

  signUp() {
    this.props.router.push("/register");
  }

  render() {

    return (
      <>
        <Head>
          <title>Login | MoCeramic</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />

          <meta name="description" content={'Beautifully designed web application template built with React and Bootstrap to create modern apps and speed up development'}  />
          <meta name="keywords" content={"flatlogic, react templates"} />
          <meta name="author" content={"MoCeramic"} />
          <meta charSet="utf-8" />


          <meta property="og:title" content={"MoCeramic - Handcrafted Ceramics"} />
          <meta property="og:type" content="website"/>
          <meta property="og:url" content={"https://flatlogic-ecommerce.herokuapp.com/"} />
          <meta property="og:image" content={"https://flatlogic-ecommerce-backend.herokuapp.com/images/blogs/content_image_six.jpg"} />
          <meta property="og:description" content={'Beautifully designed web application template built with React and Bootstrap to create modern apps and speed up development'} />
          <meta name="twitter:card" content="summary_large_image" />

          <meta property="fb:app_id" content={"712557339116053"} />

          <meta property="og:site_name" content={"MoCeramic"} />
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
                    <Brand size={32} style={{ marginBottom: 120, fontSize: 26, cursor: "pointer" }} />
                  </Link>
                  <h5 className={"fw-bold mb-5"}>Login</h5>
                  <Form className={"w-100"} onSubmit={this.doLogin}>
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
                    <FormGroup check>
                      <Label check>
                        <Input
                          type="checkbox"
                          checked={this.state.rememberMe}
                          onChange={() => this.setState((prev) => ({ rememberMe: !prev.rememberMe }))}
                        />{" "}
                        Remember me
                      </Label>
                    </FormGroup>
                    <div
                      className={
                        "d-flex justify-content-between align-items-center mt-5"
                      }
                    >
                      <Link href={"/register"} className={"fw-bold text-primary"}>
                        Create an account
                      </Link>
                      <Button
                        color={"primary"}
                        className={`${s.button} fw-bold text-uppercase`}
                      >
                        Login
                      </Button>
                    </div>
                  </Form>
                  <footer className={`d-flex justify-content-between ${s.footer}`}>
                    <Link href={"#"} className={"fw-bold text-dark"}>
                      Terms & Conditions
                    </Link>
                    <Link href={"#"} className={"fw-bold text-dark"}>
                      Privacy Policy
                    </Link>
                    <Link href={"/forgot"} className={"fw-bold text-dark"}>
                        Forgot password
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
    isAuthenticated: state.auth.isAuthenticated,
    errorMessage: state.auth.errorMessage,
  };
}

export default withRouter(connect(mapStateToProps)(Login));
