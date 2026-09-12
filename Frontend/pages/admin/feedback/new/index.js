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
          <p>Reviews are submitted by customers on product pages and cannot be created from the admin panel.</p>
        </Widget>
      </React.Fragment>
    );
  }
}

export default withRouter(Index);
