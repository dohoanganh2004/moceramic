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

const STATUSES = ["requested", "reviewing", "quoted", "accepted", "in_progress", "completed", "cancelled"];

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
    editStatus: "",
    editQuotedPrice: "",
    editAdminNote: "",
    saving: false,
  };

  componentDidMount() {
    this.fetchRows();
  }

  fetchRows = () => {
    const { page, sizePerPage, sortName, sortOrder, searchText, status } = this.state;
    axios
      .get("/custom-orders/search", {
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
      .catch(() => toast.error("Could not load custom orders"));
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
      .delete(`/custom-orders/${id}`)
      .then(() => {
        this.closeModal();
        this.fetchRows();
      })
      .catch(() => {
        toast.error("Could not delete this request");
        this.closeModal();
      });
  };

  openModal = (id) => this.setState({ modalOpen: true, idToDelete: id });
  closeModal = () => this.setState({ modalOpen: false, idToDelete: null });

  openView = (row) =>
    this.setState({
      viewRecord: row,
      editStatus: row.status,
      editQuotedPrice: row.quotedPrice != null ? row.quotedPrice : "",
      editAdminNote: row.adminNote || "",
    });
  closeView = () => this.setState({ viewRecord: null });

  handleSave = () => {
    const { viewRecord, editStatus, editQuotedPrice, editAdminNote } = this.state;
    this.setState({ saving: true });
    axios
      .patch(`/custom-orders/${viewRecord.id}`, {
        status: editStatus,
        quotedPrice: editQuotedPrice === "" ? null : Number(editQuotedPrice),
        adminNote: editAdminNote,
      })
      .then(() => {
        toast.success("Custom order updated");
        this.closeView();
        this.fetchRows();
      })
      .catch(() => toast.error("Could not update this request"))
      .finally(() => this.setState({ saving: false }));
  };

  dateFormatter = (cell) => (cell ? cell.toString().slice(0, 19).replace("T", " ") : "-");

  statusFormatter = (cell) => {
    const colors = {
      requested: "secondary",
      reviewing: "info",
      quoted: "primary",
      accepted: "success",
      in_progress: "warning",
      completed: "success",
      cancelled: "danger",
    };
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
    const { rows, totalSize, page, sizePerPage, status, modalOpen, viewRecord, editStatus, editQuotedPrice, editAdminNote, saving } = this.state;
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
        <Head><title>Custom Orders</title></Head>
        <Widget title={<h4>Custom Order Requests</h4>} collapse close>
          <div className="d-flex justify-content-end align-items-center mb-3" style={{ flexWrap: "wrap", gap: 8 }}>
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
            <TableHeaderColumn dataField="contactName" dataSort>
              <span className="fs-sm">Contact</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="contactEmail">
              <span className="fs-sm">Email</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="quantity" dataSort>
              <span className="fs-sm">Qty</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="status" dataSort dataFormat={this.statusFormatter}>
              <span className="fs-sm">Status</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="quotedPrice" dataFormat={(cell) => (cell != null ? formatCurrency(cell) : "-")}>
              <span className="fs-sm">Quoted Price</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="createdAt" dataSort dataFormat={this.dateFormatter}>
              <span className="fs-sm">Submitted</span>
            </TableHeaderColumn>
            <TableHeaderColumn isKey dataField="id" dataFormat={this.actionFormatter}>
              <span className="fs-sm">Actions</span>
            </TableHeaderColumn>
          </BootstrapTable>
          </div>
        </Widget>

        <Modal size="sm" isOpen={modalOpen} toggle={this.closeModal}>
          <ModalHeader toggle={this.closeModal}>Confirm delete</ModalHeader>
          <ModalBody className="bg-white">Are you sure you want to delete this custom order request?</ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={this.closeModal}>Cancel</Button>
            <Button color="primary" onClick={this.handleDelete}>Delete</Button>
          </ModalFooter>
        </Modal>

        <Modal isOpen={!!viewRecord} toggle={this.closeView}>
          <ModalHeader toggle={this.closeView}>Custom Order from {viewRecord && viewRecord.contactName}</ModalHeader>
          <ModalBody className="bg-white">
            {viewRecord && (
              <div>
                <p><strong>Contact:</strong> {viewRecord.contactName} — {viewRecord.contactEmail} — {viewRecord.contactPhone}</p>
                <p><strong>Quantity:</strong> {viewRecord.quantity}</p>
                <p><strong>Desired completion:</strong> {viewRecord.desiredCompletionDate || "-"}</p>
                <p><strong>Description:</strong></p>
                <p style={{ whiteSpace: "pre-wrap" }}>{viewRecord.description}</p>
                {viewRecord.attachmentUrls && viewRecord.attachmentUrls.length > 0 && (
                  <div className="mb-3">
                    <strong>Attachments:</strong>
                    <div className="d-flex" style={{ gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                      {viewRecord.attachmentUrls.map((url) => (
                        <a key={url} href={url} target="_blank" rel="noreferrer">
                          <img src={url} alt="attachment" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 4 }} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                <FormGroup>
                  <Label className="fw-bold">Status</Label>
                  <Input type="select" value={editStatus} onChange={(e) => this.setState({ editStatus: e.target.value })}>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </Input>
                </FormGroup>
                <FormGroup>
                  <Label className="fw-bold">Quoted Price</Label>
                  <Input
                    type="number"
                    value={editQuotedPrice}
                    onChange={(e) => this.setState({ editQuotedPrice: e.target.value })}
                  />
                </FormGroup>
                <FormGroup>
                  <Label className="fw-bold">Admin Note</Label>
                  <Input
                    type="textarea"
                    value={editAdminNote}
                    onChange={(e) => this.setState({ editAdminNote: e.target.value })}
                  />
                </FormGroup>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={this.closeView}>Cancel</Button>
            <Button color="primary" disabled={saving} onClick={this.handleSave}>Save</Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default Index;
