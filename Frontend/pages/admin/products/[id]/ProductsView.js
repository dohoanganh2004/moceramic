import React, { Component } from "react";
import { Button, Table, Input } from "reactstrap";
import Loader from "components/admin/Loader";
import Widget from "components/admin/Widget";
import ImagePreviewGrid from "components/ImagePreviewGrid";
import formatCurrency from "utils/formatCurrency";
import axios from "axios";
import { toast } from "react-toastify";
import s from './ProductsView.module.scss';

class ProductsView extends Component {
  state = {
    newFile: null,
    editingVariantId: null,
    variantDraft: {},
  };

  addImage = () => {
    const { record } = this.props;
    const { newFile } = this.state;
    if (!newFile) return;
    const formData = new FormData();
    formData.append("file", newFile);
    axios
      .post(`/products/${record.id}/images`, formData)
      .then(() => {
        toast.success("Image added");
        this.setState({ newFile: null });
        this.props.onRefetch();
      })
      .catch(() => toast.error("Could not add image"));
  };

  deleteImage = (imageId) => {
    const { record } = this.props;
    axios
      .delete(`/products/${record.id}/images/${imageId}`)
      .then(() => {
        toast.success("Image removed");
        this.props.onRefetch();
      })
      .catch(() => toast.error("Could not remove image"));
  };

  startEditVariant = (variant) => {
    this.setState({ editingVariantId: variant.id, variantDraft: { ...variant } });
  };

  cancelEditVariant = () => this.setState({ editingVariantId: null, variantDraft: {} });

  setVariantDraftField = (field, value) => {
    this.setState({ variantDraft: { ...this.state.variantDraft, [field]: value } });
  };

  saveVariant = () => {
    const { record } = this.props;
    const { editingVariantId, variantDraft } = this.state;
    const dto = {
      sku: variantDraft.sku,
      colorGlaze: variantDraft.colorGlaze,
      size: variantDraft.size,
      price: Number(variantDraft.price),
      weightGrams: variantDraft.weightGrams ? Number(variantDraft.weightGrams) : null,
      dimensions: variantDraft.dimensions,
      quantityOnHand: variantDraft.quantityOnHand !== "" && variantDraft.quantityOnHand != null ? Number(variantDraft.quantityOnHand) : null,
    };
    axios
      .put(`/products/${record.id}/variants/${editingVariantId}`, dto)
      .then(() => {
        toast.success("Variant updated");
        this.setState({ editingVariantId: null, variantDraft: {} });
        this.props.onRefetch();
      })
      .catch(() => toast.error("Could not update variant"));
  };

  deleteVariant = (variantId) => {
    const { record } = this.props;
    axios
      .delete(`/products/${record.id}/variants/${variantId}`)
      .then(() => {
        toast.success("Variant removed");
        this.props.onRefetch();
      })
      .catch(() => toast.error("Could not remove variant"));
  };

  render() {
    const { findLoading, record } = this.props;
    const { editingVariantId, variantDraft, newFile } = this.state;

    if (findLoading || !record) {
      return <Loader />;
    }

    return (
      <Widget className={s.root} title={<h4>{record.name}</h4>} collapse close>
        <Table borderless size="sm" style={{ tableLayout: "fixed", width: "100%" }}>
          <tbody>
            <tr><td className="fw-bold" style={{ width: 140 }}>Category</td><td>{record.categoryName}</td></tr>
            <tr><td className="fw-bold">Slug</td><td>{record.slug}</td></tr>
            <tr><td className="fw-bold">Base Price</td><td>{formatCurrency(record.basePrice)}</td></tr>
            <tr><td className="fw-bold">Material</td><td>{record.material}</td></tr>
            <tr><td className="fw-bold">Origin</td><td>{record.origin}</td></tr>
            <tr><td className="fw-bold">Status</td><td>{record.status}</td></tr>
            <tr><td className="fw-bold">Description</td><td>{record.description}</td></tr>
            <tr><td className="fw-bold">Care Instructions</td><td>{record.careInstructions}</td></tr>
          </tbody>
        </Table>

        <hr />
        <h5 className="fw-bold">Images</h5>
        <div className="d-flex flex-wrap mb-3" style={{ gap: 12 }}>
          {(record.images || []).map((img) => (
            <div key={img.id} className="text-center">
              <img src={img.imageUrl} width={100} height={100} style={{ objectFit: "cover" }} />
              <div>{img.isPrimary ? <span className="text-primary" style={{ fontSize: 11 }}>primary</span> : null}</div>
              <Button color="danger" size="sm" onClick={() => this.deleteImage(img.id)}>Delete</Button>
            </div>
          ))}
        </div>
        <div className="d-flex align-items-center" style={{ gap: 8 }}>
          <Input type="file" accept="image/*" onChange={(e) => this.setState({ newFile: (e.target.files || [])[0] || null })} style={{ maxWidth: 300 }} />
          <Button color="primary" size="sm" disabled={!newFile} onClick={this.addImage}>Add Image</Button>
        </div>
        <ImagePreviewGrid
          files={newFile ? [newFile] : []}
          onRemove={() => this.setState({ newFile: null })}
        />

        <hr />
        <h5 className="fw-bold">Variants</h5>
        <p className="text-muted mb-2" style={{ fontSize: 12 }}>
          Products with 0 stock across all variants are hidden from the storefront until restocked.
        </p>
        <div style={{ overflowX: "auto" }}>
        <Table bordered size="sm">
          <thead>
            <tr>
              <th>SKU</th><th>Color/Glaze</th><th>Size</th><th>Price</th><th>Weight (g)</th><th>Dimensions</th><th>Stock</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(record.variants || []).map((v) => (
              <tr key={v.id}>
                {editingVariantId === v.id ? (
                  <>
                    <td><Input value={variantDraft.sku} onChange={(e) => this.setVariantDraftField("sku", e.target.value)} /></td>
                    <td><Input value={variantDraft.colorGlaze || ""} onChange={(e) => this.setVariantDraftField("colorGlaze", e.target.value)} /></td>
                    <td><Input value={variantDraft.size || ""} onChange={(e) => this.setVariantDraftField("size", e.target.value)} /></td>
                    <td><Input type="number" step="0.01" value={variantDraft.price} onChange={(e) => this.setVariantDraftField("price", e.target.value)} /></td>
                    <td><Input type="number" value={variantDraft.weightGrams || ""} onChange={(e) => this.setVariantDraftField("weightGrams", e.target.value)} /></td>
                    <td><Input value={variantDraft.dimensions || ""} onChange={(e) => this.setVariantDraftField("dimensions", e.target.value)} /></td>
                    <td><Input type="number" min="0" value={variantDraft.quantityOnHand != null ? variantDraft.quantityOnHand : ""} onChange={(e) => this.setVariantDraftField("quantityOnHand", e.target.value)} style={{ width: 80 }} /></td>
                    <td>
                      <Button color="primary" size="sm" onClick={this.saveVariant}>Save</Button>{" "}
                      <Button color="light" size="sm" onClick={this.cancelEditVariant}>Cancel</Button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{v.sku}</td>
                    <td>{v.colorGlaze}</td>
                    <td>{v.size}</td>
                    <td>{formatCurrency(v.price)}</td>
                    <td>{v.weightGrams}</td>
                    <td>{v.dimensions}</td>
                    <td>
                      {v.quantityOnHand > 0 ? (
                        <span className="text-success fw-bold">{v.quantityOnHand}</span>
                      ) : (
                        <span className="text-danger fw-bold">0</span>
                      )}
                      {v.quantityReserved > 0 ? (
                        <span className="text-muted" style={{ fontSize: 11 }}> ({v.quantityReserved} reserved)</span>
                      ) : null}
                    </td>
                    <td>
                      <Button color="info" size="sm" onClick={() => this.startEditVariant(v)}>Edit</Button>{" "}
                      <Button color="danger" size="sm" onClick={() => this.deleteVariant(v.id)}>Delete</Button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
        </div>

        <Button color="light" onClick={() => this.props.onCancel()}>Back to list</Button>
      </Widget>
    );
  }
}

export default ProductsView;
