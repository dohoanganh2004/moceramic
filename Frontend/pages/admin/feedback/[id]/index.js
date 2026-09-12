import React, { Component } from "react";
import { withRouter } from "next/router";
import Head from "next/head";
import Widget from "components/admin/Widget";

class Index extends Component {
  componentDidMount() {
    this.props.router.push("/admin/feedback");
  }

  render() {
    return (
      <React.Fragment>
        <Head>
          <title>Reviews</title>
        </Head>
        <Widget title={<h4>Reviews</h4>} collapse close>
          <p>Redirecting to the reviews list...</p>
        </Widget>
      </React.Fragment>
    );
  }
}

export default withRouter(Index);
