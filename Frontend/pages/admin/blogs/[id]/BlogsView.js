import React, { Component } from "react";
import { Table, Button } from "reactstrap";
import Loader from "components/admin/Loader";
import Widget from "components/admin/Widget";
import axios from "axios";
import { toast } from "react-toastify";

class BlogsView extends Component {
  togglePublish = () => {
    const { record } = this.props;
    const action = record.status === "published" ? "unpublish" : "publish";
    axios
      .patch(`/blog-posts/${record.id}/${action}`)
      .then(() => {
        toast.success(`Post ${action}ed`);
        this.props.onRefetch();
      })
      .catch(() => toast.error(`Could not ${action} this post`));
  };

  render() {
    const { findLoading, record } = this.props;

    if (findLoading || !record) {
      return <Loader />;
    }

    return (
      <Widget title={<h4>{record.title}</h4>} collapse close>
        <Table borderless size="sm">
          <tbody>
            <tr><td className="fw-bold">Slug</td><td>{record.slug}</td></tr>
            <tr><td className="fw-bold">Author</td><td>{record.authorName}</td></tr>
            <tr><td className="fw-bold">Status</td><td>{record.status}</td></tr>
            <tr><td className="fw-bold">Published At</td><td>{record.publishedAt ? record.publishedAt.toString().slice(0, 19).replace("T", " ") : "-"}</td></tr>
            <tr><td className="fw-bold">Thumbnail</td><td>{record.thumbnailUrl ? <img src={record.thumbnailUrl} width={120} /> : "-"}</td></tr>
          </tbody>
        </Table>
        <h6 className="fw-bold mt-3">Content</h6>
        <div dangerouslySetInnerHTML={{ __html: record.content }} />

        <div className="form-buttons mt-4">
          <Button color="primary" onClick={this.togglePublish}>
            {record.status === "published" ? "Unpublish" : "Publish"}
          </Button>{" "}
          <Button color="light" onClick={() => this.props.onCancel()}>Back to list</Button>
        </div>
      </Widget>
    );
  }
}

export default BlogsView;
