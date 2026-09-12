import React, { Component } from "react";
import Head from 'next/head';
import { FormGroup, Label, Input } from "reactstrap";
import { withRouter } from "next/router";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "components/admin/Loader";
import Widget from "components/admin/Widget";

class Index extends Component {
  state = { title: "", slug: "", content: "", loaded: false };

  componentDidMount() {
    axios.get(`/static-pages/${this.props.router.query.id}`).then((res) => {
      this.setState({ title: res.data.title, slug: res.data.slug, content: res.data.content, loaded: true });
    });
  }

  setField = (field, value) => this.setState({ [field]: value });

  handleSubmit = (e) => {
    e.preventDefault();
    const { title, slug, content } = this.state;
    axios
      .put(`/static-pages/${this.props.router.query.id}`, { title, slug, content })
      .then(() => {
        toast.success("Page updated");
        this.props.router.push("/admin/static-pages");
      })
      .catch(() => toast.error("Could not update this page"));
  };

  render() {
    const { title, slug, content, loaded } = this.state;

    if (!loaded) {
      return <Loader />;
    }

    return (
      <React.Fragment>
        <Head><title>Edit Static Page</title></Head>
        <Widget title={<h4>Edit static page</h4>} collapse close>
          <form onSubmit={this.handleSubmit}>
            <FormGroup>
              <Label className="fw-bold">Title*</Label>
              <Input value={title} onChange={(e) => this.setField("title", e.target.value)} required />
            </FormGroup>
            <FormGroup>
              <Label className="fw-bold">Slug*</Label>
              <Input value={slug} onChange={(e) => this.setField("slug", e.target.value)} required />
            </FormGroup>
            <FormGroup>
              <Label className="fw-bold">Content (HTML)*</Label>
              <Input type="textarea" style={{ height: 300 }} value={content} onChange={(e) => this.setField("content", e.target.value)} required />
            </FormGroup>
            <div className="form-buttons">
              <button className="btn btn-primary" type="submit">Save</button>{" "}
              <button className="btn btn-light" type="button" onClick={() => this.props.router.push("/admin/static-pages")}>Cancel</button>
            </div>
          </form>
        </Widget>
      </React.Fragment>
    );
  }
}

export default withRouter(Index);
