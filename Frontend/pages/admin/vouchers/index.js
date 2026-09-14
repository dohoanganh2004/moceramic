import React, { Component } from "react";
import Head from 'next/head';
import Link from 'next/link';
import axios from "axios";
import { toast } from "react-toastify";
import { withRouter } from "next/router";
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

class Index extends Component {
  state = {
    rows: [],
    totalSize: 0,
    page: 1,
    sizePerPage: 10,
    sortName: "createdAt",
    sortOrder: "desc",
    searchText: "",
    discountType: "",
    isActive: "",
    modalOpen: false,
    idToDelete: null,
  };

  componentDidMount() {
    this.fetchRows();
  }

  fetchRows = () => {
    const { page, sizePerPage, sortName, sortOrder, searchText, discountType, isActive } = this.state;
    axios
      .get("/vouchers/search", {
        params: {
          search: searchText || undefined,
          discountType: discountType || undefined,
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
      .catch(() => toast.error("Could not load vouchers"));
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

  handleTypeFilterChange = (e) => {
    this.setState({ discountType: e.target.value, page: 1 }, this.fetchRows);
  };

  handleActiveFilterChange = (e) => {
    this.setState({ isActive: e.target.value, page: 1 }, this.fetchRows);
  };

  handleDelete = () => {
    const id = this.state.idToDelete;
    axios
      .delete(`/vouchers/${id}`)
      .then(() => {
        this.closeModal();
        this.fetchRows();
      })
      .catch(() => {
        toast.error("Could not delete this voucher");
        this.closeModal();
      });
  };

  openModal = (id) => this.setState({ modalOpen: true, idToDelete: id });
  closeModal = () => this.setState({ modalOpen: false, idToDelete: null });

  discountFormatter = (cell, row) => {
    return row.discountType === "percentage" ? `${cell}%` : formatCurrency(cell);
  };

  dateFormatter = (cell) => (cell ? cell.toString().slice(0, 10) : "-");

  actionFormatter = (cell) => (
    <div>
      <Button color="info" size="xs" onClick={() => this.props.router.push(`/admin/vouchers/edit/${cell}`)}>
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
    const { rows, totalSize, page, sizePerPage, discountType, isActive, modalOpen } = this.state;
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
        <Head><title>Vouchers List</title></Head>
        <Widget title={<h4>Vouchers</h4>} collapse close>
          <div className="d-flex justify-content-between align-items-center mb-3" style={{ flexWrap: "wrap", gap: 8 }}>
            <Link href="/admin/vouchers/new">
              <button className="btn btn-primary" type="button">New</button>
            </Link>
            <div className="d-flex" style={{ gap: 8 }}>
              <Input type="select" value={discountType} onChange={this.handleTypeFilterChange} style={{ width: 160 }}>
                <option value="">All types</option>
                <option value="percentage">percentage</option>
                <option value="fixed">fixed</option>
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
            <TableHeaderColumn dataField="code" dataSort>
              <span className="fs-sm">Code</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="discountType">
              <span className="fs-sm">Type</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="discountValue" dataSort dataFormat={this.discountFormatter}>
              <span className="fs-sm">Value</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="startDate" dataSort dataFormat={this.dateFormatter}>
              <span className="fs-sm">Start</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="endDate" dataSort dataFormat={this.dateFormatter}>
              <span className="fs-sm">End</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="usedCount" dataSort>
              <span className="fs-sm">Used</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="isActive" dataFormat={(cell) => (cell ? "Yes" : "No")}>
              <span className="fs-sm">Active</span>
            </TableHeaderColumn>
            <TableHeaderColumn isKey dataField="id" dataFormat={this.actionFormatter}>
              <span className="fs-sm">Actions</span>
            </TableHeaderColumn>
          </BootstrapTable>
        </Widget>

        <Modal size="sm" isOpen={modalOpen} toggle={this.closeModal}>
          <ModalHeader toggle={this.closeModal}>Confirm delete</ModalHeader>
          <ModalBody className="bg-white">Are you sure you want to delete this voucher?</ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={this.closeModal}>Cancel</Button>
            <Button color="primary" onClick={this.handleDelete}>Delete</Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default withRouter(Index);
