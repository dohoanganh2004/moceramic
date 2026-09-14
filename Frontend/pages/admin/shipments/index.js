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

const STATUSES = ["pending", "preparing", "shipped", "in_transit", "delivered", "returned", "cancelled"];

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
    editRecord: null,
    editCarrier: "",
    editTrackingCode: "",
    editStatus: "",
    editShippingFee: "",
    editEstimatedDelivery: "",
    saving: false,
  };

  componentDidMount() {
    this.fetchRows();
  }

  fetchRows = () => {
    const { page, sizePerPage, sortName, sortOrder, searchText, status } = this.state;
    axios
      .get("/shipments/search", {
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
      .catch(() => toast.error("Could not load shipments"));
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
      .delete(`/shipments/${id}`)
      .then(() => {
        this.closeModal();
        this.fetchRows();
      })
      .catch(() => {
        toast.error("Could not delete this shipment");
        this.closeModal();
      });
  };

  openModal = (id) => this.setState({ modalOpen: true, idToDelete: id });
  closeModal = () => this.setState({ modalOpen: false, idToDelete: null });

  openEdit = (row) =>
    this.setState({
      editRecord: row,
      editCarrier: row.carrier || "",
      editTrackingCode: row.trackingCode || "",
      editStatus: row.status,
      editShippingFee: row.shippingFee != null ? row.shippingFee : "",
      editEstimatedDelivery: row.estimatedDelivery || "",
    });
  closeEdit = () => this.setState({ editRecord: null });

  handleSave = () => {
    const { editRecord, editCarrier, editTrackingCode, editStatus, editShippingFee, editEstimatedDelivery } = this.state;
    this.setState({ saving: true });
    axios
      .put(`/shipments/${editRecord.id}`, {
        orderId: editRecord.orderId,
        carrier: editCarrier,
        trackingCode: editTrackingCode,
        status: editStatus,
        shippingFee: editShippingFee === "" ? 0 : Number(editShippingFee),
        estimatedDelivery: editEstimatedDelivery || null,
      })
      .then(() => {
        toast.success("Shipment updated");
        this.closeEdit();
        this.fetchRows();
      })
      .catch(() => toast.error("Could not update this shipment"))
      .finally(() => this.setState({ saving: false }));
  };

  dateFormatter = (cell) => (cell ? cell.toString().slice(0, 19).replace("T", " ") : "-");
  dateOnlyFormatter = (cell) => (cell ? cell.toString().slice(0, 10) : "-");

  statusFormatter = (cell) => {
    const colors = {
      pending: "secondary",
      preparing: "info",
      shipped: "primary",
      in_transit: "warning",
      delivered: "success",
      returned: "dark",
      cancelled: "danger",
    };
    return <span className={`badge bg-${colors[cell] || "secondary"} text-capitalize`}>{cell}</span>;
  };

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
    const { rows, totalSize, page, sizePerPage, status, modalOpen, editRecord, editCarrier, editTrackingCode, editStatus, editShippingFee, editEstimatedDelivery, saving } = this.state;
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
        <Head><title>Shipments</title></Head>
        <Widget title={<h4>Shipments</h4>} collapse close>
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
            <TableHeaderColumn dataField="orderCode" dataSort>
              <span className="fs-sm">Order</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="carrier">
              <span className="fs-sm">Carrier</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="trackingCode">
              <span className="fs-sm">Tracking Code</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="status" dataSort dataFormat={this.statusFormatter}>
              <span className="fs-sm">Status</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="shippingFee" dataFormat={(cell) => formatCurrency(cell)}>
              <span className="fs-sm">Fee</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="estimatedDelivery" dataFormat={this.dateOnlyFormatter}>
              <span className="fs-sm">Est. Delivery</span>
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
          <ModalBody className="bg-white">Are you sure you want to delete this shipment?</ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={this.closeModal}>Cancel</Button>
            <Button color="primary" onClick={this.handleDelete}>Delete</Button>
          </ModalFooter>
        </Modal>

        <Modal isOpen={!!editRecord} toggle={this.closeEdit}>
          <ModalHeader toggle={this.closeEdit}>Edit Shipment for {editRecord && editRecord.orderCode}</ModalHeader>
          <ModalBody className="bg-white">
            {editRecord && (
              <div>
                <FormGroup>
                  <Label className="fw-bold">Carrier</Label>
                  <Input type="text" value={editCarrier} onChange={(e) => this.setState({ editCarrier: e.target.value })} />
                </FormGroup>
                <FormGroup>
                  <Label className="fw-bold">Tracking Code</Label>
                  <Input type="text" value={editTrackingCode} onChange={(e) => this.setState({ editTrackingCode: e.target.value })} />
                </FormGroup>
                <FormGroup>
                  <Label className="fw-bold">Status</Label>
                  <Input type="select" value={editStatus} onChange={(e) => this.setState({ editStatus: e.target.value })}>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </Input>
                </FormGroup>
                <FormGroup>
                  <Label className="fw-bold">Shipping Fee</Label>
                  <Input type="number" value={editShippingFee} onChange={(e) => this.setState({ editShippingFee: e.target.value })} />
                </FormGroup>
                <FormGroup>
                  <Label className="fw-bold">Estimated Delivery</Label>
                  <Input type="date" value={editEstimatedDelivery} onChange={(e) => this.setState({ editEstimatedDelivery: e.target.value })} />
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
