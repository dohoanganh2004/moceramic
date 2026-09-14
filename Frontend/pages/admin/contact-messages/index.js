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
} from "reactstrap";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import Widget from "components/admin/Widget";

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
    modalOpen: false,
    idToDelete: null,
    viewRecord: null,
  };

  componentDidMount() {
    this.fetchRows();
  }

  fetchRows = () => {
    const { page, sizePerPage, sortName, sortOrder, searchText, status } = this.state;
    axios
      .get("/contact-messages/search", {
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
      .catch(() => toast.error("Could not load contact messages"));
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

  handleDelete = () => {
    const id = this.state.idToDelete;
    axios
      .delete(`/contact-messages/${id}`)
      .then(() => {
        this.closeModal();
        this.fetchRows();
      })
      .catch(() => {
        toast.error("Could not delete this message");
        this.closeModal();
      });
  };

  handleStatusChange = (id, newStatus) => {
    axios
      .patch(`/contact-messages/${id}/status`, { status: newStatus })
      .then(() => {
        toast.success("Status updated");
        this.fetchRows();
        this.setState((prev) => ({
          viewRecord: prev.viewRecord && prev.viewRecord.id === id ? { ...prev.viewRecord, status: newStatus } : prev.viewRecord,
        }));
      })
      .catch(() => toast.error("Could not update status"));
  };

  openModal = (id) => this.setState({ modalOpen: true, idToDelete: id });
  closeModal = () => this.setState({ modalOpen: false, idToDelete: null });

  openView = (row) => this.setState({ viewRecord: row });
  closeView = () => this.setState({ viewRecord: null });

  dateFormatter = (cell) => (cell ? cell.toString().slice(0, 19).replace("T", " ") : "-");

  statusFormatter = (cell) => {
    const colors = { new: "primary", read: "info", replied: "success", closed: "secondary" };
    return <span className={`badge bg-${colors[cell] || "secondary"} text-capitalize`}>{cell}</span>;
  };

  actionFormatter = (cell, row) => (
    <div>
      <Button color="info" size="xs" onClick={() => this.openView(row)}>
        View
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
    const { rows, totalSize, page, sizePerPage, status, modalOpen, viewRecord } = this.state;
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
        <Head><title>Contact Messages</title></Head>
        <Widget title={<h4>Contact Messages</h4>} collapse close>
          <div className="d-flex justify-content-end align-items-center mb-3" style={{ flexWrap: "wrap", gap: 8 }}>
            <Input type="select" value={status} onChange={this.handleStatusFilterChange} style={{ width: 160 }}>
              <option value="">All statuses</option>
              <option value="new">new</option>
              <option value="read">read</option>
              <option value="replied">replied</option>
              <option value="closed">closed</option>
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
            <TableHeaderColumn dataField="name" dataSort>
              <span className="fs-sm">Name</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="email" dataSort>
              <span className="fs-sm">Email</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="subject">
              <span className="fs-sm">Subject</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="status" dataSort dataFormat={this.statusFormatter}>
              <span className="fs-sm">Status</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="createdAt" dataSort dataFormat={this.dateFormatter}>
              <span className="fs-sm">Received</span>
            </TableHeaderColumn>
            <TableHeaderColumn isKey dataField="id" dataFormat={this.actionFormatter}>
              <span className="fs-sm">Actions</span>
            </TableHeaderColumn>
          </BootstrapTable>
          </div>
        </Widget>

        <Modal size="sm" isOpen={modalOpen} toggle={this.closeModal}>
          <ModalHeader toggle={this.closeModal}>Confirm delete</ModalHeader>
          <ModalBody className="bg-white">Are you sure you want to delete this message?</ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={this.closeModal}>Cancel</Button>
            <Button color="primary" onClick={this.handleDelete}>Delete</Button>
          </ModalFooter>
        </Modal>

        <Modal isOpen={!!viewRecord} toggle={this.closeView}>
          <ModalHeader toggle={this.closeView}>Message from {viewRecord && viewRecord.name}</ModalHeader>
          <ModalBody className="bg-white">
            {viewRecord && (
              <div>
                <p><strong>Email:</strong> {viewRecord.email}</p>
                <p><strong>Phone:</strong> {viewRecord.phone || "-"}</p>
                <p><strong>Subject:</strong> {viewRecord.subject || "-"}</p>
                <p><strong>Message:</strong></p>
                <p style={{ whiteSpace: "pre-wrap" }}>{viewRecord.message}</p>
                <p><strong>Received:</strong> {this.dateFormatter(viewRecord.createdAt)}</p>
                <div>
                  <strong>Status:</strong>{" "}
                  <Input
                    type="select"
                    value={viewRecord.status}
                    style={{ display: "inline-block", width: 160 }}
                    onChange={(e) => this.handleStatusChange(viewRecord.id, e.target.value)}
                  >
                    <option value="new">new</option>
                    <option value="read">read</option>
                    <option value="replied">replied</option>
                    <option value="closed">closed</option>
                  </Input>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={this.closeView}>Close</Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default Index;
