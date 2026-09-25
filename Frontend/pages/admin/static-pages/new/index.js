import React, { Component } from "react";
import Head from 'next/head';
import { FormGroup, Label, Input } from "reactstrap";
import { withRouter } from "next/router";
import axios from "axios";
import { toast } from "react-toastify";
import Widget from "components/admin/Widget";
import slugify from "utils/slugify";

class Index extends Component {
  slugEdited = false;

  state = { title: "", slug: "", content: "" };

  setTitle = (value) => {
    this.setState((prev) => ({
      title: value,
      slug: this.slugEdited ? prev.slug : slugify(value),
    }));
  };

  setSlug = (value) => {
    this.slugEdited = true;
    this.setState({ slug: value });
  };

  setField = (field, value) => this.setState({ [field]: value });

  handleSubmit = (e) => {
    e.preventDefault();
    const { title, slug, content } = this.state;
    axios
      .post("/static-pages", { title, slug, content })
      .then(() => {
        toast.success("Page created");
        this.props.router.push("/admin/static-pages");
      })
      .catch(() => toast.error("Could not create this page"));
  };

  render() {
    const { title, slug, content } = this.state;

    return (
      <React.Fragment>
        <Head><title>New Static Page</title></Head>
        <Widget title={<h4>Add static page</h4>} collapse close>
          <form onSubmit={this.handleSubmit}>
            <FormGroup>
              <Label className="fw-bold">Title*</Label>
              <Input value={title} onChange={(e) => this.setTitle(e.target.value)} required />
            </FormGroup>
            <FormGroup>
              <Label className="fw-bold">Slug*</Label>
              <Input value={slug} onChange={(e) => this.setSlug(e.target.value)} placeholder="auto-generated-from-title" required />
              <small className="text-muted">Auto-generated from title. Edit manually to override.</small>
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
