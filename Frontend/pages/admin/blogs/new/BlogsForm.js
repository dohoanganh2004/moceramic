import { Formik } from "formik";
import React, { Component } from "react";
import Loader from "components/admin/Loader";

import InputFormItem from "components/admin/FormItems/items/InputFormItem";
import TextAreaFormItem from "components/admin/FormItems/items/TextAreaFormItem";

import blogsFields from "components/admin/CRUD/Blogs/blogsFields";
import IniValues from "components/admin/FormItems/iniValues";
import PreparedValues from "components/admin/FormItems/preparedValues";
import FormValidations from "components/admin/FormItems/formValidations";
import Widget from "components/admin/Widget";

class BlogsForm extends Component {
  iniValues = () => {
    return IniValues(blogsFields, this.props.record || {});
  };

  formValidations = () => {
    return FormValidations(blogsFields, this.props.record || {});
  };

  handleSubmit = (values) => {
    const { id, status, ...data } = PreparedValues(blogsFields, values || {});
    this.props.onSubmit(id, data);
  };

  title = () => (this.props.isEditing ? "Edit blog post" : "Add blog post");

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
                <InputFormItem name={"title"} schema={blogsFields} autoFocus />

                <InputFormItem name={"slug"} schema={blogsFields} />

                <InputFormItem name={"thumbnailUrl"} schema={blogsFields} />

                <TextAreaFormItem name={"content"} schema={blogsFields} />

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
                    onClick={form.handleReset}
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

export default BlogsForm;
