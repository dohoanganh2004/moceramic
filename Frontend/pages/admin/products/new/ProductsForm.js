import React, { Component } from "react";
import { FormGroup, Label, Input, Button } from "reactstrap";
import Loader from "components/admin/Loader";
import Widget from "components/admin/Widget";
import ImagePreviewGrid from "components/ImagePreviewGrid";
import slugify from "utils/slugify";
import axios from "axios";

const emptyVariant = { sku: "", colorGlaze: "", size: "", price: "", weightGrams: "", dimensions: "", quantityOnHand: "" };

class ProductsForm extends Component {
  state = {
    categories: [],
    categoryId: "",
    name: "",
    slug: "",
    description: "",
    careInstructions: "",
    material: "",
    origin: "",
    basePrice: "",
    variants: [{ ...emptyVariant }],
    files: [],
    slugEdited: false,
  };

  componentDidMount() {
    axios.get("/categories").then((res) => this.setState({ categories: res.data || [] })).catch(() => {});
  }

  setField = (field, value) => this.setState({ [field]: value });

  setName = (value) => {
    this.setState((prev) => ({
      name: value,
      slug: prev.slugEdited ? prev.slug : slugify(value),
    }));
  };

  setSlug = (value) => this.setState({ slug: value, slugEdited: true });

  setVariantField = (index, field, value) => {
    const variants = [...this.state.variants];
    variants[index] = { ...variants[index], [field]: value };
    this.setState({ variants });
  };

  addVariantRow = () => this.setState({ variants: [...this.state.variants, { ...emptyVariant }] });

  removeVariantRow = (index) => {
    const variants = this.state.variants.filter((_, i) => i !== index);
    this.setState({ variants: variants.length ? variants : [{ ...emptyVariant }] });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { categoryId, name, slug, description, careInstructions, material, origin, basePrice, variants, files } = this.state;
    const dto = {
      categoryId: Number(categoryId),
      name,
      slug,
      description,
      careInstructions,
      material,
      origin,
      basePrice: Number(basePrice),
      variants: variants
        .filter((v) => v.sku && v.price)
        .map((v) => ({
          sku: v.sku,
          colorGlaze: v.colorGlaze,
          size: v.size,
          price: Number(v.price),
          weightGrams: v.weightGrams ? Number(v.weightGrams) : null,
          dimensions: v.dimensions,
          quantityOnHand: v.quantityOnHand ? Number(v.quantityOnHand) : 0,
        })),
    };
    this.props.onSubmit(null, { dto, files });
  };

  render() {
    const { saveLoading } = this.props;
    const { categories, categoryId, name, slug, description, careInstructions, material, origin, basePrice, variants, files } = this.state;

    return (
      <Widget title={<h4>Add product</h4>} collapse close>
        <form onSubmit={this.handleSubmit}>
          <FormGroup>
            <Label className="fw-bold">Category*</Label>
            <Input type="select" value={categoryId} onChange={(e) => this.setField("categoryId", e.target.value)} required>
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Input>
          </FormGroup>
          <FormGroup>
            <Label className="fw-bold">Name*</Label>
            <Input value={name} onChange={(e) => this.setName(e.target.value)} required />
          </FormGroup>
          <FormGroup>
            <Label className="fw-bold">Slug*</Label>
            <Input value={slug} onChange={(e) => this.setSlug(e.target.value)} placeholder="lowercase-with-hyphens" required />
            <p className="text-muted mt-1 mb-0" style={{ fontSize: 12 }}>Tự tạo từ tên sản phẩm, có thể sửa lại nếu cần.</p>
          </FormGroup>
          <FormGroup>
            <Label className="fw-bold">Description</Label>
            <Input type="textarea" value={description} onChange={(e) => this.setField("description", e.target.value)} />
          </FormGroup>
          <FormGroup>
            <Label className="fw-bold">Care Instructions</Label>
            <Input type="textarea" value={careInstructions} onChange={(e) => this.setField("careInstructions", e.target.value)} />
          </FormGroup>
          <FormGroup className="d-flex">
            <div className="flex-fill mr-3">
              <Label className="fw-bold">Material</Label>
              <Input value={material} onChange={(e) => this.setField("material", e.target.value)} />
            </div>
            <div className="flex-fill">
              <Label className="fw-bold">Origin</Label>
              <Input value={origin} onChange={(e) => this.setField("origin", e.target.value)} />
            </div>
          </FormGroup>
          <FormGroup>
            <Label className="fw-bold">Base Price*</Label>
            <Input type="number" step="0.01" value={basePrice} onChange={(e) => this.setField("basePrice", e.target.value)} required />
          </FormGroup>

          <hr />
          <h5 className="fw-bold">Variants</h5>
          {variants.map((v, i) => (
            <div key={i} className="d-flex align-items-end mb-2" style={{ gap: 8, flexWrap: "wrap" }}>
              <div>
                <Label className="mb-0" style={{ fontSize: 12 }}>SKU*</Label>
                <Input value={v.sku} onChange={(e) => this.setVariantField(i, "sku", e.target.value)} style={{ width: 120 }} />
              </div>
              <div>
                <Label className="mb-0" style={{ fontSize: 12 }}>Color/Glaze</Label>
                <Input value={v.colorGlaze} onChange={(e) => this.setVariantField(i, "colorGlaze", e.target.value)} style={{ width: 120 }} />
              </div>
              <div>
                <Label className="mb-0" style={{ fontSize: 12 }}>Size</Label>
                <Input value={v.size} onChange={(e) => this.setVariantField(i, "size", e.target.value)} style={{ width: 100 }} />
              </div>
              <div>
                <Label className="mb-0" style={{ fontSize: 12 }}>Price*</Label>
                <Input type="number" step="0.01" value={v.price} onChange={(e) => this.setVariantField(i, "price", e.target.value)} style={{ width: 100 }} />
              </div>
              <div>
                <Label className="mb-0" style={{ fontSize: 12 }}>Weight (g)</Label>
                <Input type="number" value={v.weightGrams} onChange={(e) => this.setVariantField(i, "weightGrams", e.target.value)} style={{ width: 100 }} />
              </div>
              <div>
                <Label className="mb-0" style={{ fontSize: 12 }}>Dimensions</Label>
                <Input value={v.dimensions} onChange={(e) => this.setVariantField(i, "dimensions", e.target.value)} style={{ width: 120 }} />
              </div>
              <div>
                <Label className="mb-0" style={{ fontSize: 12 }}>Stock Qty</Label>
                <Input type="number" min="0" value={v.quantityOnHand} onChange={(e) => this.setVariantField(i, "quantityOnHand", e.target.value)} style={{ width: 100 }} />
              </div>
              <Button type="button" color="danger" size="sm" onClick={() => this.removeVariantRow(i)}>Remove</Button>
            </div>
          ))}
          <Button type="button" color="secondary" size="sm" className="mb-1" onClick={this.addVariantRow}>+ Add Variant</Button>
          <p className="text-muted mb-4" style={{ fontSize: 12 }}>
            Products with 0 stock across all variants are hidden from the storefront until restocked.
          </p>

          <hr />
          <FormGroup>
            <Label className="fw-bold">Images</Label>
            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => this.setField("files", Array.from(e.target.files || []))}
            />
            <p className="text-muted mt-1" style={{ fontSize: 12 }}>{files.length} file(s) selected. First image is set as primary.</p>
            <ImagePreviewGrid
              files={files}
              primaryLabel="Primary"
              onRemove={(index) => this.setField("files", files.filter((_, i) => i !== index))}
            />
          </FormGroup>

          <div className="form-buttons">
            <button className="btn btn-primary" disabled={saveLoading} type="submit">
              Save
            </button>{" "}
            <button className="btn btn-light" type="button" disabled={saveLoading} onClick={() => this.props.onCancel()}>
              Cancel
            </button>
          </div>
        </form>
      </Widget>
    );
  }
}

export default ProductsForm;
