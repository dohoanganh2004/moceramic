import React, { Component } from "react";
import Link from 'next/link'
import { withRouter } from "next/router"
import axios from "axios";
import { toast } from "react-toastify";

import {
  Dropdown,
  DropdownMenu,
  DropdownToggle,
  DropdownItem,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "reactstrap";

import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";

import Widget from "components/admin/Widget";

const ROLE_OPTIONS = [
  { value: 1, label: "customer" },
  { value: 2, label: "admin" },
  { value: 3, label: "sales_staff" },
  { value: 4, label: "warehouse_staff" },
  { value: 5, label: "accountant" },
  { value: 6, label: "marketing" },
];

class UsersListTable extends Component {
  state = {
    rows: [],
    totalSize: 0,
    page: 1,
    sizePerPage: 10,
    sortName: "createdAt",
    sortOrder: "desc",
    searchText: "",
    roleId: "",
    isActive: "",
    modalOpen: false,
    idToDelete: null,
  };

  componentDidMount() {
    this.fetchRows();
  }

  fetchRows = () => {
    const { page, sizePerPage, sortName, sortOrder, searchText, roleId, isActive } = this.state;
    axios
      .get("/users/search", {
        params: {
          search: searchText || undefined,
          roleId: roleId || undefined,
          isActive: isActive === "" ? undefined : isActive === "true",
          sortBy: sortName,
          sortDir: sortOrder,
          page: page - 1,
          size: sizePerPage,
        },
      })
      .then((res) => {
        this.setState({ rows: res.data.content, totalSize: res.data.totalElements });
      })
      .catch(() => toast.error("Could not load users"));
  };

  handlePageChange = (page, sizePerPage) => {
    this.setState({ page, sizePerPage }, this.fetchRows);
  };

  handleSortChange = (sortName, sortOrder) => {
    this.setState({ sortName, sortOrder, page: 1 }, this.fetchRows);
  };

  handleSearchChange = (searchText) => {
    this.setState({ searchText, page: 1 }, this.fetchRows);
  };

  handleRoleFilterChange = (e) => {
    this.setState({ roleId: e.target.value, page: 1 }, this.fetchRows);
  };

  handleActiveFilterChange = (e) => {
    this.setState({ isActive: e.target.value, page: 1 }, this.fetchRows);
  };

  handleDelete() {
    const id = this.state.idToDelete;
    axios
      .delete(`/users/${id}`)
      .then(() => {
        this.closeModal();
        this.fetchRows();
      })
      .catch(() => {
        toast.error("Could not delete this user");
        this.closeModal();
      });
  }

  openModal(id) {
    this.setState({ modalOpen: true, idToDelete: id });
  }

  closeModal() {
    this.setState({ modalOpen: false, idToDelete: null });
  }

  actionFormatter = (cell, row) => {
    const isAdmin = row.roleName === "admin";
    return (
      <div>
        <Button
          color="default"
          size="xs"
          onClick={() => this.props.router.push(`/admin/users/${cell}`)}
        >
          View
        </Button>
        &nbsp;&nbsp;
        <Button
          color="info"
          size="xs"
          onClick={() => this.props.router.push(`/admin/users/edit/${cell}`)}
        >
          Edit
        </Button>
        {!isAdmin && (
          <>
            &nbsp;&nbsp;
            <Button color="danger" size="xs" onClick={() => this.openModal(cell)}>
              Delete
            </Button>
          </>
        )}
      </div>
    );
  };

  renderSizePerPageDropDown = (props) => {
    const limits = [];
    props.sizePerPageList.forEach((limit) => {
      limits.push(
        <DropdownItem
          key={limit}
          onClick={() => props.changeSizePerPage(limit)}
        >
          {limit}
        </DropdownItem>
      );
    });

    return (
      <Dropdown isOpen={props.open} toggle={props.toggleDropDown} modifiers={{ flip: { enabled: false } }}>
        <DropdownToggle color="default" caret>
          {props.currSizePerPage}
        </DropdownToggle>
        <DropdownMenu>{limits}</DropdownMenu>
      </Dropdown>
    );
  };

  render() {
    const { rows, totalSize, page, sizePerPage, roleId, isActive } = this.state;

    const options = {
      page,
      sizePerPage,
      paginationSize: 5,
      sizePerPageList: [10, 25, 50],
      sizePerPageDropDown: this.renderSizePerPageDropDown,
      onPageChange: this.handlePageChange,
      onSortChange: this.handleSortChange,
      onSearchChange: this.handleSearchChange,
    };

    return (
      <div>
        <Widget title={<h4>Users</h4>} collapse close>
          <div className="d-flex justify-content-between align-items-center mb-3" style={{ flexWrap: "wrap", gap: 8 }}>
            <Link href="/admin/users/new">
              <button className="btn btn-primary" type="button">
                New
              </button>
            </Link>
            <div className="d-flex" style={{ gap: 8 }}>
              <Input type="select" value={roleId} onChange={this.handleRoleFilterChange} style={{ width: 180 }}>
                <option value="">All roles</option>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </Input>
              <Input type="select" value={isActive} onChange={this.handleActiveFilterChange} style={{ width: 180 }}>
                <option value="">Active/Inactive</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Input>
            </div>
          </div>
          <BootstrapTable
            bordered={false}
            data={rows}
            version="4"
            remote
            fetchInfo={{ dataTotalSize: totalSize }}
            pagination
            options={options}
            search
            tableContainerClass={`table-responsive table-striped table-hover`}
          >
            <TableHeaderColumn dataField="fullName" dataSort>
              <span className="fs-sm">Full Name</span>
            </TableHeaderColumn>

            <TableHeaderColumn dataField="email" dataSort>
              <span className="fs-sm">E-mail</span>
            </TableHeaderColumn>

            <TableHeaderColumn dataField="phone">
              <span className="fs-sm">Phone</span>
            </TableHeaderColumn>

            <TableHeaderColumn dataField="roleName">
              <span className="fs-sm">Role</span>
            </TableHeaderColumn>

            <TableHeaderColumn
              dataField="isActive"
              dataFormat={(cell) => (cell ? "Yes" : "No")}
            >
              <span className="fs-sm">Active</span>
            </TableHeaderColumn>

            <TableHeaderColumn
              isKey
              dataField="id"
              dataFormat={this.actionFormatter}
            >
              <span className="fs-sm">Actions</span>
            </TableHeaderColumn>
          </BootstrapTable>
        </Widget>

        <Modal
          size="sm"
          isOpen={this.state.modalOpen}
          toggle={() => this.closeModal()}
        >
          <ModalHeader toggle={() => this.closeModal()}>
            Confirm delete
          </ModalHeader>
          <ModalBody className="bg-white">
            Are you sure you want to delete this item?
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => this.closeModal()}>
              Cancel
            </Button>
            <Button color="primary" onClick={() => this.handleDelete()}>
              Delete
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default withRouter(UsersListTable);
