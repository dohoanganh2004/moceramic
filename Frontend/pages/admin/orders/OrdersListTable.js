import React, { Component } from "react";
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
import formatCurrency from "utils/formatCurrency";

const STATUS_OPTIONS = ["pending", "confirmed", "processing", "shipping", "delivered", "cancelled"];

class OrdersListTable extends Component {
  state = {
    rows: [],
    totalSize: 0,
    page: 1,
    sizePerPage: 10,
    sortName: "createdAt",
    sortOrder: "desc",
    searchText: "",
    status: "",
    modalOpen: false,
    idToDelete: null,
    updatingStatusIds: [],
  };

  componentDidMount() {
    this.fetchRows();
  }

  fetchRows = () => {
    const { page, sizePerPage, sortName, sortOrder, searchText, status } = this.state;
    axios
      .get("/order/search", {
        params: {
          search: searchText || undefined,
          status: status || undefined,
          sortBy: sortName,
          sortDir: sortOrder,
          page: page - 1,
          size: sizePerPage,
        },
      })
      .then((res) => {
        this.setState({ rows: res.data.content, totalSize: res.data.totalElements });
      })
      .catch(() => toast.error("Could not load orders"));
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

  handleStatusFilterChange = (e) => {
    this.setState({ status: e.target.value, page: 1 }, this.fetchRows);
  };

  handleRowStatusChange = (orderId, newStatus) => {
    const previousRows = this.state.rows;
    this.setState((prev) => ({
      updatingStatusIds: [...prev.updatingStatusIds, orderId],
      rows: prev.rows.map((r) => (r.id === orderId ? { ...r, status: newStatus } : r)),
    }));

    axios
      .patch(`/order/${orderId}/status`, { status: newStatus })
      .then(() => toast.success("Order status updated"))
      .catch(() => {
        toast.error("Could not update order status");
        this.setState({ rows: previousRows });
      })
      .finally(() => {
        this.setState((prev) => ({
          updatingStatusIds: prev.updatingStatusIds.filter((id) => id !== orderId),
        }));
      });
  };

  handleDelete() {
    const id = this.state.idToDelete;
    axios
      .delete(`/order/${id}`)
      .then(() => {
        this.closeModal();
        this.fetchRows();
      })
      .catch(() => {
        toast.error("Could not delete this order");
        this.closeModal();
      });
  }

  openModal(id) {
    this.setState({ modalOpen: true, idToDelete: id });
  }

  closeModal() {
    this.setState({ modalOpen: false, idToDelete: null });
  }

  statusFormatter = (cell, row) => {
    const isUpdating = this.state.updatingStatusIds.includes(row.id);
    return (
      <Input
        type="select"
        bsSize="sm"
        value={cell}
        disabled={isUpdating}
        onChange={(e) => this.handleRowStatusChange(row.id, e.target.value)}
        style={{ minWidth: 140 }}
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </Input>
    );
  };

  actionFormatter = (cell) => {
    return (
      <div>
        <Button
          color="default"
          size="xs"
          onClick={() => this.props.router.push(`/admin/orders/${cell}`)}
        >
          View
        </Button>
        &nbsp;&nbsp;
        <Button
          color="info"
          size="xs"
          onClick={() =>
            this.props.router.push(`/admin/orders/edit/${cell}`)
          }
        >
          Edit
        </Button>
        &nbsp;&nbsp;
        <Button color="danger" size="xs" onClick={() => this.openModal(cell)}>
          Delete
        </Button>
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
    const { rows, totalSize, page, sizePerPage, status } = this.state;

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
        <Widget title={<h4>Orders</h4>} collapse close>
          <div className="d-flex justify-content-end mb-3">
            <Input type="select" value={status} onChange={this.handleStatusFilterChange} style={{ width: 200 }}>
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Input>
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
            <TableHeaderColumn
              dataField="createdAt"
              dataSort
              dataFormat={(cell) => cell && cell.toString().slice(0, 19).replace("T", " ")}
            >
              <span className="fs-sm">Order date</span>
            </TableHeaderColumn>

            <TableHeaderColumn dataField="orderCode" dataSort>
              <span className="fs-sm">Order Code</span>
            </TableHeaderColumn>

            <TableHeaderColumn dataField="userName">
              <span className="fs-sm">Customer</span>
            </TableHeaderColumn>

            <TableHeaderColumn dataField="totalAmount" dataSort dataFormat={(cell) => formatCurrency(cell)}>
              <span className="fs-sm">Total</span>
            </TableHeaderColumn>

            <TableHeaderColumn dataField="status" dataSort dataFormat={this.statusFormatter}>
              <span className="fs-sm">Status</span>
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

export default withRouter(OrdersListTable);
