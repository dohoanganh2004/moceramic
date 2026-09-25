import React, { Component } from "react";
import { FormGroup, Label, Input, Button } from "reactstrap";
import Loader from "components/admin/Loader";
import Widget from "components/admin/Widget";
import slugify from "utils/slugify";

class BlogsForm extends Component {
  fileInputRef = React.createRef();

  // Track whether the user has manually edited the slug.
  slugEdited = false;

  state = {
    title: "",
    slug: "",
    content: "",
    thumbnail: null,       // File object
    previewUrl: null,      // Object URL for preview
  };

  componentWillUnmount() {
    // Clean up the object URL when the component is removed.
    if (this.state.previewUrl) URL.revokeObjectURL(this.state.previewUrl);
  }

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

  setThumbnail = (file) => {
    if (this.state.previewUrl) URL.revokeObjectURL(this.state.previewUrl);
    const previewUrl = file ? URL.createObjectURL(file) : null;
    this.setState({ thumbnail: file || null, previewUrl });
    // Reset input so the same file can be re-selected after removal.
    if (!file && this.fileInputRef.current) this.fileInputRef.current.value = "";
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { title, slug, content, thumbnail } = this.state;
    const dto = { title, slug, content };
    this.props.onSubmit(null, { dto, thumbnail });
  };

  title = () => "Add blog post";

  render() {
    const { saveLoading, findLoading } = this.props;

    if (findLoading) return <Loader />;

    const { title, slug, content, thumbnail, previewUrl } = this.state;

    return (
      <Widget title={<h4>{this.title()}</h4>} collapse close>
        <form onSubmit={this.handleSubmit}>

          <FormGroup>
            <Label className="fw-bold" htmlFor="blog-title">Title*</Label>
            <Input
              id="blog-title"
              value={title}
              onChange={(e) => this.setTitle(e.target.value)}
              required
              autoFocus
            />
          </FormGroup>

          <FormGroup>
            <Label className="fw-bold" htmlFor="blog-slug">Slug*</Label>
            <Input
              id="blog-slug"
              value={slug}
              onChange={(e) => this.setSlug(e.target.value)}
              placeholder="auto-generated-from-title"
              required
            />
            <small className="text-muted">Auto-generated from title. Edit manually to override.</small>
          </FormGroup>

          <FormGroup>
            <Label className="fw-bold" htmlFor="blog-thumbnail">Thumbnail</Label>
            <Input
              id="blog-thumbnail"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              innerRef={this.fileInputRef}
              onChange={(e) => this.setThumbnail(e.target.files[0] || null)}
            />
            {previewUrl && (
              <div className="mt-2" style={{ position: "relative", display: "inline-block" }}>
                <img
                  src={previewUrl}
                  alt="Thumbnail preview"
                  style={{ width: 200, height: 120, objectFit: "cover", borderRadius: 4, border: "1px solid #d9d9d9" }}
                />
                <button
                  type="button"
                  onClick={() => this.setThumbnail(null)}
                  aria-label="Remove thumbnail"
                  style={{
                    position: "absolute", top: -8, right: -8,
                    width: 22, height: 22, borderRadius: "50%",
                    background: "#dc3545", color: "#fff",
                    border: "none", fontSize: 13, lineHeight: "20px",
                    padding: 0, cursor: "pointer",
                  }}
                >×</button>
              </div>
            )}
          </FormGroup>

          <FormGroup>
            <Label className="fw-bold" htmlFor="blog-content">Content (HTML)*</Label>
            <Input
              id="blog-content"
              type="textarea"
              rows={10}
              value={content}
              onChange={(e) => this.setState({ content: e.target.value })}
              required
            />
          </FormGroup>

          <div className="form-buttons">
            <button className="btn btn-primary" disabled={saveLoading} type="submit">
              Save
            </button>{" "}
            <button
              className="btn btn-light"
              type="button"
              disabled={saveLoading}
              onClick={() => {
                this.slugEdited = false;
                this.setThumbnail(null);
                this.setState({ title: "", slug: "", content: "" });
              }}
            >
              Reset
            </button>{" "}
            <button
              className="btn btn-light"
              type="button"
              disabled={saveLoading}
              onClick={() => this.props.onCancel()}
            >
              Cancel
            </button>
          </div>

        </form>
      </Widget>
    );
  }
}

export default BlogsForm;
