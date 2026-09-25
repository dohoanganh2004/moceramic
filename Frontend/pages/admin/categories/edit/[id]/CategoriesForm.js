import React, { Component } from "react";
import { FormGroup, Label, Input } from "reactstrap";
import Loader from "components/admin/Loader";
import Widget from "components/admin/Widget";
import slugify from "utils/slugify";

class CategoriesForm extends Component {
  fileInputRef = React.createRef();
  // Existing record already has a slug — don't auto-overwrite on load.
  slugEdited = true;

  state = {
    name: "",
    slug: "",
    description: "",
    sortOrder: "",
    parentId: "",
    image: null,         // newly picked File
    previewUrl: null,    // object URL for new file
    existingImageUrl: null,
    existingRemoved: false,
  };

  static getDerivedStateFromProps(props, state) {
    if (props.record && props.record.name && !state.name) {
      return {
        name: props.record.name || "",
        slug: props.record.slug || "",
        description: props.record.description || "",
        sortOrder: props.record.sortOrder != null ? String(props.record.sortOrder) : "",
        parentId: props.record.parentId != null ? String(props.record.parentId) : "",
        existingImageUrl: props.record.imageUrl || null,
      };
    }
    return null;
  }

  componentWillUnmount() {
    if (this.state.previewUrl) URL.revokeObjectURL(this.state.previewUrl);
  }

  setName = (value) => {
    this.setState((prev) => ({
      name: value,
      slug: this.slugEdited ? prev.slug : slugify(value),
    }));
  };

  setSlug = (value) => {
    this.slugEdited = true;
    this.setState({ slug: value });
  };

  setNewImage = (file) => {
    if (this.state.previewUrl) URL.revokeObjectURL(this.state.previewUrl);
    const previewUrl = file ? URL.createObjectURL(file) : null;
    this.setState({ image: file || null, previewUrl });
    if (!file && this.fileInputRef.current) this.fileInputRef.current.value = "";
  };

  removeNewImage = () => {
    if (this.state.previewUrl) URL.revokeObjectURL(this.state.previewUrl);
    this.setState({ image: null, previewUrl: null });
    if (this.fileInputRef.current) this.fileInputRef.current.value = "";
  };

  removeExistingImage = () => {
    this.setState({ existingImageUrl: null, existingRemoved: true });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { name, slug, description, sortOrder, parentId, image, existingRemoved, existingImageUrl } = this.state;
    const dto = {
      name,
      slug,
      description: description || null,
      sortOrder: sortOrder !== "" ? Number(sortOrder) : 0,
      parentId: parentId !== "" ? Number(parentId) : null,
      imageUrl: existingRemoved && !image ? null : (existingImageUrl || null),
    };
    this.props.onSubmit(this.props.record.id, { dto, image });
  };

  render() {
    const { saveLoading, findLoading, isEditing, record } = this.props;
    if (findLoading) return <Loader />;
    if (isEditing && !record) return <Loader />;

    const { name, slug, description, sortOrder, parentId, previewUrl, existingImageUrl } = this.state;

    const displayUrl = previewUrl || existingImageUrl || null;
    const isExisting = !previewUrl && !!existingImageUrl;

    return (
      <Widget title={<h4>Edit category</h4>} collapse close>
        <form onSubmit={this.handleSubmit}>

          <FormGroup>
            <Label className="fw-bold" htmlFor="cat-name">Name*</Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => this.setName(e.target.value)}
              required
              autoFocus
            />
          </FormGroup>

          <FormGroup>
            <Label className="fw-bold" htmlFor="cat-slug">Slug*</Label>
            <Input
              id="cat-slug"
              value={slug}
              onChange={(e) => this.setSlug(e.target.value)}
              placeholder="auto-generated-from-name"
              required
            />
            <small className="text-muted">Auto-generated from name. Edit manually to override.</small>
          </FormGroup>

          <FormGroup>
            <Label className="fw-bold" htmlFor="cat-desc">Description</Label>
            <Input
              id="cat-desc"
              type="textarea"
              value={description}
              onChange={(e) => this.setState({ description: e.target.value })}
            />
          </FormGroup>

          <FormGroup>
            <Label className="fw-bold" htmlFor="cat-image">Image</Label>
            <Input
              id="cat-image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              innerRef={this.fileInputRef}
              onChange={(e) => this.setNewImage(e.target.files[0] || null)}
            />
            {displayUrl && (
              <div className="mt-2" style={{ position: "relative", display: "inline-block" }}>
                <img
                  src={displayUrl}
                  alt="Category image preview"
                  style={{ width: 160, height: 100, objectFit: "cover", borderRadius: 4, border: "1px solid #d9d9d9" }}
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
                  onClick={isExisting ? this.removeExistingImage : this.removeNewImage}
                  aria-label="Remove image"
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
            <Label className="fw-bold" htmlFor="cat-sort">Sort Order</Label>
            <Input
              id="cat-sort"
              type="number"
              min="0"
              value={sortOrder}
              onChange={(e) => this.setState({ sortOrder: e.target.value })}
            />
          </FormGroup>

          <FormGroup>
            <Label className="fw-bold" htmlFor="cat-parent">Parent Category ID</Label>
            <Input
              id="cat-parent"
              type="number"
              min="1"
              value={parentId}
              onChange={(e) => this.setState({ parentId: e.target.value })}
              placeholder="Leave empty for root category"
            />
          </FormGroup>

          <div className="form-buttons">
            <button className="btn btn-primary" disabled={saveLoading} type="submit">Save</button>{" "}
            <button
              className="btn btn-light"
              type="button"
              disabled={saveLoading}
              onClick={() => this.props.onCancel()}
            >Cancel</button>
          </div>

        </form>
      </Widget>
    );
  }
}

export default CategoriesForm;
