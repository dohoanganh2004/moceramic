import React, { Component } from "react";
import UsersForm from "./UsersForm";
import actions from "redux/actions/users/usersFormActions";
import { connect } from "react-redux";
import {withRouter} from "next/router";
import Head from 'next/head';

class Index extends Component {
  state = {
    dispatched: false,
  };

  componentDidMount() {
    const { dispatch, router } = this.props;
    if (this.isEditing()) {
      dispatch(actions.doFind(router.query.id));
    } else {
      dispatch(actions.doNew());
    }
    this.setState({ dispatched: true });
  }

  doSubmit = (id, data) => {
    const { dispatch } = this.props;
    if (this.isEditing()) {
      dispatch(actions.doUpdate(id, data));
    } else {
      dispatch(actions.doCreate(data));
    }
  };

  isEditing = () => {
    const { router } = this.props;
    return !!router.query.id;
  };

  render() {
    return (
      <React.Fragment>
        <Head>
          <title>Edit User</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />

          <meta name="description" content="Beautifully designed web application template built with React and Bootstrap to create modern apps and speed up development" />
          <meta name="keywords" content="flatlogic, react templates" />
          <meta name="author" content="MoCeramic" />
          <meta charSet="utf-8" />


          <meta property="og:title" content="MoCeramic - Handcrafted Ceramics"/>
          <meta property="og:type" content="website"/>
          <meta property="og:url" content="https://flatlogic-ecommerce.herokuapp.com/"/>
          <meta property="og:image" content="https://flatlogic-ecommerce-backend.herokuapp.com/images/blogs/content_image_six.jpg"/>
          <meta property="og:description" content="Beautifully designed web application template built with React and Bootstrap to create modern apps and speed up development"/>
          <meta name="twitter:card" content="summary_large_image" />

          <meta property="fb:app_id" content="712557339116053" />

          <meta property="og:site_name" content="MoCeramic"/>
          <meta name="twitter:site" content="@flatlogic" />
        </Head>
        {this.state.dispatched && (
          <UsersForm
            saveLoading={this.props.saveLoading}
            findLoading={this.props.findLoading}
            record={this.isEditing() ? this.props.record : {}}
            isEditing={this.isEditing()}
            onSubmit={this.doSubmit}
            onCancel={() => this.props.router.push("/admin/users")}
          />
        )}
      </React.Fragment>
    );
  }
}

function mapStateToProps(store) {
  return {
    findLoading: store.users.form.findLoading,
    saveLoading: store.users.form.saveLoading,
    record: store.users.form.record,
  };
}

export async function getServerSideProps(context) {
  // const res = await axios.get("/products");
  // const products = res.data.rows;

  return {
    props: {  }, // will be passed to the page component as props
  };
}

export default withRouter(connect(mapStateToProps)(Index));
