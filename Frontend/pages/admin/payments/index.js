import React, { Component } from "react";
import Head from 'next/head';
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
  FormGroup,
  Label,
} from "reactstrap";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import Widget from "components/admin/Widget";
import formatCurrency from "utils/formatCurrency";

const STATUSES = ["pending", "paid", "failed", "refunded"];
const METHODS = ["cod", "bank_transfer", "vnpay", "momo", "stripe"];

class Index extends Component {
  state = {
    rows: [],
    totalSize: 0,
    page: 1,
    sizePerPage: 10,
    sortName: "createdAt",
    sortOrder: "desc",
    searchText: "",
    status: "",
    method: "",
    modalOpen: false,
    idToDelete: null,
    editRecord: null,
    editStatus: "",
    editTransactionRef: "",
    saving: false,
  };

  componentDidMount() {
    this.fetchRows();
  }

  fetchRows = () => {
    const { page, sizePerPage, sortName, sortOrder, searchText, status, method } = this.state;
    axios
      .get("/payments/search", {
        params: {
          search: searchText || undefined,
          status: status || undefined,
          method: method || undefined,
          sortBy: sortName,
          sortDir: sortOrder,
          page: page - 1,
          size: sizePerPage,
        },
      })
      .then((res) => {
        this.setState({ rows: res.data.content, totalSize: res.data.totalElements });
      })
      .catch(() => toast.error("Could not load payments"));
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

  handleMethodFilterChange = (e) => {
    this.setState({ method: e.target.value, page: 1 }, this.fetchRows);
  };

  handleDelete = () => {
    const id = this.state.idToDelete;
    axios
      .delete(`/payments/${id}`)
      .then(() => {
        this.closeModal();
        this.fetchRows();
      })
      .catch(() => {
        toast.error("Could not delete this payment");
        this.closeModal();
      });
  };

  openModal = (id) => this.setState({ modalOpen: true, idToDelete: id });
  closeModal = () => this.setState({ modalOpen: false, idToDelete: null });

  openEdit = (row) =>
    this.setState({
      editRecord: row,
      editStatus: row.status,
      editTransactionRef: row.transactionRef || "",
    });
  closeEdit = () => this.setState({ editRecord: null });

  handleSave = () => {
    const { editRecord, editStatus, editTransactionRef } = this.state;
    this.setState({ saving: true });
    axios
      .patch(`/payments/${editRecord.id}/status`, {
        status: editStatus,
        transactionRef: editTransactionRef || null,
      })
      .then(() => {
        toast.success("Payment updated");
        this.closeEdit();
        this.fetchRows();
      })
      .catch(() => toast.error("Could not update this payment"))
      .finally(() => this.setState({ saving: false }));
  };

  dateFormatter = (cell) => (cell ? cell.toString().slice(0, 19).replace("T", " ") : "-");

  statusFormatter = (cell) => {
    const colors = {
      pending: "secondary",
      paid: "success",
      failed: "danger",
      refunded: "warning",
    };
    return <span className={`badge bg-${colors[cell] || "secondary"} text-capitalize`}>{cell}</span>;
  };

  methodFormatter = (cell) => <span className="text-capitalize">{cell && cell.replace("_", " ")}</span>;

  actionFormatter = (cell, row) => (
    <div>
      <Button color="info" size="xs" onClick={() => this.openEdit(row)}>
        Edit
      </Button>{" "}
      <Button color="danger" size="xs" onClick={() => this.openModal(cell)}>
        Delete
      </Button>
    </div>
  );

  renderSizePerPageDropDown = (props) => {
    const limits = [];
    props.sizePerPageList.forEach((limit) => {
      limits.push(
        <DropdownItem key={limit} onClick={() => props.changeSizePerPage(limit)}>
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
    const { rows, totalSize, page, sizePerPage, status, method, modalOpen, editRecord, editStatus, editTransactionRef, saving } = this.state;
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
        <Head><title>Payments</title></Head>
        <Widget title={<h4>Payments</h4>} collapse close>
          <div className="d-flex justify-content-end align-items-center mb-3" style={{ flexWrap: "wrap", gap: 8 }}>
            <Input type="select" value={method} onChange={this.handleMethodFilterChange} style={{ width: 180 }}>
              <option value="">All methods</option>
              {METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </Input>
            <Input type="select" value={status} onChange={this.handleStatusFilterChange} style={{ width: 180 }}>
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Input>
          </div>
          <div style={{ overflowX: "auto" }}>
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
            <TableHeaderColumn dataField="orderCode" dataSort>
              <span className="fs-sm">Order</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="method" dataFormat={this.methodFormatter}>
              <span className="fs-sm">Method</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="amount" dataSort dataFormat={(cell) => formatCurrency(cell)}>
              <span className="fs-sm">Amount</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="status" dataSort dataFormat={this.statusFormatter}>
              <span className="fs-sm">Status</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="transactionRef">
              <span className="fs-sm">Transaction Ref</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="paidAt" dataFormat={this.dateFormatter}>
              <span className="fs-sm">Paid At</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="createdAt" dataSort dataFormat={this.dateFormatter}>
              <span className="fs-sm">Created</span>
            </TableHeaderColumn>
            <TableHeaderColumn isKey dataField="id" dataFormat={this.actionFormatter}>
              <span className="fs-sm">Actions</span>
            </TableHeaderColumn>
          </BootstrapTable>
          </div>
        </Widget>

        <Modal size="sm" isOpen={modalOpen} toggle={this.closeModal}>
          <ModalHeader toggle={this.closeModal}>Confirm delete</ModalHeader>
          <ModalBody className="bg-white">Are you sure you want to delete this payment?</ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={this.closeModal}>Cancel</Button>
            <Button color="primary" onClick={this.handleDelete}>Delete</Button>
          </ModalFooter>
        </Modal>

        <Modal isOpen={!!editRecord} toggle={this.closeEdit}>
          <ModalHeader toggle={this.closeEdit}>Edit Payment for {editRecord && editRecord.orderCode}</ModalHeader>
          <ModalBody className="bg-white">
            {editRecord && (
              <div>
                <p><strong>Method:</strong> <span className="text-capitalize">{editRecord.method && editRecord.method.replace("_", " ")}</span></p>
                <p><strong>Amount:</strong> {formatCurrency(editRecord.amount)}</p>
                <FormGroup>
                  <Label className="fw-bold">Status</Label>
                  <Input type="select" value={editStatus} onChange={(e) => this.setState({ editStatus: e.target.value })}>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </Input>
                </FormGroup>
                <FormGroup>
                  <Label className="fw-bold">Transaction Ref</Label>
                  <Input type="text" value={editTransactionRef} onChange={(e) => this.setState({ editTransactionRef: e.target.value })} />
                </FormGroup>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={this.closeEdit}>Cancel</Button>
            <Button color="primary" disabled={saving} onClick={this.handleSave}>Save</Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default Index;
