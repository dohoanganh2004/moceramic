import { Formik } from "formik";
import React, { Component } from "react";
import Loader from "components/admin/Loader";

import InputFormItem from "components/admin/FormItems/items/InputFormItem";
import TextAreaFormItem from "components/admin/FormItems/items/TextAreaFormItem";

import productsFields from "components/admin/CRUD/Products/productsFields";
import slugify from "utils/slugify";
import IniValues from "components/admin/FormItems/iniValues";
import PreparedValues from "components/admin/FormItems/preparedValues";
import FormValidations from "components/admin/FormItems/formValidations";
import Widget from "components/admin/Widget";

import CategoriesAutocompleteFormItem from "../../../categories/autocomplete/CategoriesAutocompleteFormItem";

class ProductsForm extends Component {
  iniValues = () => {
    const record = this.props.record || {};
    return IniValues(productsFields, {
      ...record,
      category: record.categoryId
        ? { id: record.categoryId, label: record.categoryName }
        : null,
    });
  };

  formValidations = () => {
    return FormValidations(productsFields, this.props.record || {});
  };

  handleSubmit = (values) => {
    const prepared = PreparedValues(productsFields, values || {});
    const { id, category, status, ...rest } = prepared;
    const dto = { ...rest, categoryId: category };
    this.props.onSubmit(this.props.record.id, dto);
  };

  title = () => "Edit product";

  renderForm() {
    const { saveLoading } = this.props;

    return (
      <Widget title={<h4>{this.title()}</h4>} collapse close>
        <Formik
          onSubmit={this.handleSubmit}
          initialValues={this.iniValues()}
          validationSchema={this.formValidations()}
          render={(form) => {
            return (
              <form onSubmit={form.handleSubmit}>
                <CategoriesAutocompleteFormItem
                  name={"category"}
                  schema={productsFields}
                  showCreate={false}
                />

                <InputFormItem
                  name={"name"}
                  schema={productsFields}
                  onValueChange={(value, formInstance) => {
                    if (!formInstance.touched.slug) {
                      formInstance.setFieldValue("slug", slugify(value));
                    }
                  }}
                />

                <InputFormItem name={"slug"} schema={productsFields} hint="Tự tạo từ tên sản phẩm, có thể sửa lại nếu cần." />

                <TextAreaFormItem name={"description"} schema={productsFields} />

                <TextAreaFormItem name={"careInstructions"} schema={productsFields} />

                <InputFormItem name={"material"} schema={productsFields} />

                <InputFormItem name={"origin"} schema={productsFields} />

                <InputFormItem name={"basePrice"} schema={productsFields} />

                <div className="form-buttons">
                  <button
                    className="btn btn-primary"
                    disabled={saveLoading}
                    type="button"
                    onClick={form.handleSubmit}
                  >
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
            );
          }}
        />
      </Widget>
    );
  }

  render() {
    const { isEditing, findLoading, record } = this.props;

    if (findLoading) {
      return <Loader />;
    }

    if (isEditing && !record) {
      return <Loader />;
    }

    return this.renderForm();
  }
}

export default ProductsForm;
