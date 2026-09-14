import React, { Component } from "react";
import { Table } from "reactstrap";
import Loader from "components/admin/Loader";
import Widget from "components/admin/Widget";
import s from './UsersForm.module.scss';

class UsersView extends Component {
  render() {
    const { findLoading, record } = this.props;

    if (findLoading || !record) {
      return <Loader />;
    }

    return (
      <Widget className={s.root} title={<h4>{record.fullName}</h4>} collapse close>
        <Table borderless size="sm" style={{ tableLayout: "fixed", width: "100%" }}>
          <tbody>
            <tr><td className="fw-bold" style={{ width: 140 }}>Email</td><td style={{ wordBreak: "break-all" }}>{record.email}</td></tr>
            <tr><td className="fw-bold">Phone</td><td>{record.phone}</td></tr>
            <tr><td className="fw-bold">Role</td><td>{record.roleName}</td></tr>
            <tr><td className="fw-bold">Active</td><td>{record.isActive ? "Yes" : "No"}</td></tr>
            <tr><td className="fw-bold">Sign-in Provider</td><td>{record.oauthProvider || "Local"}</td></tr>
            <tr><td className="fw-bold">Joined</td><td>{record.createdAt && record.createdAt.toString().slice(0, 19).replace("T", " ")}</td></tr>
          </tbody>
        </Table>
      </Widget>
    );
  }
}

export default UsersView;
