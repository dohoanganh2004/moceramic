import React, { Component } from "react";
import { FormGroup, Label, Input } from "reactstrap";
import Loader from "components/admin/Loader";
import Widget from "components/admin/Widget";
import slugify from "utils/slugify";

class BlogsForm extends Component {
  fileInputRef = React.createRef();

  // In edit mode the blog already has a slug — don't overwrite it on load.
  slugEdited = true;

  state = {
    title: "",
    slug: "",
    content: "",
    // File the user just picked (File object). null = keep existing.
    thumbnail: null,
    // Object URL for the newly picked file preview.
    previewUrl: null,
    // URL string already stored on the server (from record.thumbnailUrl).
    existingThumbnailUrl: null,
    // Whether the user explicitly removed the existing thumbnail.
    existingRemoved: false,
  };

  static getDerivedStateFromProps(props, state) {
    // Populate fields when the record first arrives from the store.
    // Only run once (when title is still empty and record has data).
    if (props.record && props.record.title && !state.title) {
      return {
        title: props.record.title || "",
        slug: props.record.slug || "",
        content: props.record.content || "",
        existingThumbnailUrl: props.record.thumbnailUrl || null,
      };
    }
    return null;
  }

  componentWillUnmount() {
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

  // User picks a new file — replaces both new-file state and hides existing.
  setNewThumbnail = (file) => {
    if (this.state.previewUrl) URL.revokeObjectURL(this.state.previewUrl);
    const previewUrl = file ? URL.createObjectURL(file) : null;
    this.setState({ thumbnail: file || null, previewUrl });
    if (!file && this.fileInputRef.current) this.fileInputRef.current.value = "";
  };

  // Remove the newly picked file (revert to showing existing if still present).
  removeNewThumbnail = () => {
    if (this.state.previewUrl) URL.revokeObjectURL(this.state.previewUrl);
    this.setState({ thumbnail: null, previewUrl: null });
    if (this.fileInputRef.current) this.fileInputRef.current.value = "";
  };

  // Remove the existing saved thumbnail entirely.
  removeExistingThumbnail = () => {
    this.setState({ existingThumbnailUrl: null, existingRemoved: true });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { title, slug, content, thumbnail, existingRemoved, existingThumbnailUrl } = this.state;

    const dto = {
      title,
      slug,
      content,
      // If user removed the existing thumbnail and didn't pick a new one, send null.
      // If they kept it (no new file), preserve the existing URL so the backend doesn't clear it.
      thumbnailUrl: existingRemoved && !thumbnail ? null : (existingThumbnailUrl || null),
    };

    this.props.onSubmit(this.props.record.id, { dto, thumbnail });
  };

  render() {
    const { saveLoading, findLoading, isEditing, record } = this.props;

    if (findLoading) return <Loader />;
    if (isEditing && !record) return <Loader />;

    const { title, slug, content, thumbnail, previewUrl, existingThumbnailUrl } = this.state;

    // Show new-file preview if available, otherwise show the existing saved URL.
    const displayUrl = previewUrl || existingThumbnailUrl || null;
    const isExisting = !previewUrl && !!existingThumbnailUrl;

    return (
      <Widget title={<h4>Edit blog post</h4>} collapse close>
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
              onChange={(e) => this.setNewThumbnail(e.target.files[0] || null)}
            />
            {displayUrl && (
              <div className="mt-2" style={{ position: "relative", display: "inline-block" }}>
                <img
                  src={displayUrl}
                  alt="Thumbnail preview"
                  style={{
                    width: 200, height: 120, objectFit: "cover",
                    borderRadius: 4, border: "1px solid #d9d9d9",
                  }}
                />
                {isExisting && (
                  <span style={{
                    position: "absolute", bottom: 4, left: 4,
                    background: "rgba(0,0,0,0.55)", color: "#fff",
                    fontSize: 10, padding: "1px 5px", borderRadius: 2,
                  }}>Current</span>
                )}
                <button
                  type="button"
                  onClick={isExisting ? this.removeExistingThumbnail : this.removeNewThumbnail}
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
