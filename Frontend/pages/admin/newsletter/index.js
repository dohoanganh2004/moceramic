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
    sortName: "subscribedAt",
    sortOrder: "desc",
    searchText: "",
    isActive: "",
    modalOpen: false,
    idToDelete: null,
  };

  componentDidMount() {
    this.fetchRows();
  }

  fetchRows = () => {
    const { page, sizePerPage, sortName, sortOrder, searchText, isActive } = this.state;
    axios
      .get("/newsletter-subscribers/search", {
        params: {
          search: searchText || undefined,
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
      .catch(() => toast.error("Could not load newsletter subscribers"));
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

  handleActiveFilterChange = (e) => {
    this.setState({ isActive: e.target.value, page: 1 }, this.fetchRows);
  };

  handleDelete = () => {
    const id = this.state.idToDelete;
    axios
      .delete(`/newsletter-subscribers/${id}`)
      .then(() => {
        toast.success("Subscriber removed");
        this.closeModal();
        this.fetchRows();
      })
      .catch(() => {
        toast.error("Could not remove this subscriber");
        this.closeModal();
      });
  };

  openModal = (id) => this.setState({ modalOpen: true, idToDelete: id });
  closeModal = () => this.setState({ modalOpen: false, idToDelete: null });

  exportCsv = () => {
    const { rows } = this.state;
    if (rows.length === 0) {
      toast.info("No subscribers on this page to export");
      return;
    }
    const header = "Email,Subscribed At,Active\n";
    const csvRows = rows
      .map((r) => `${r.email},${r.subscribedAt || ""},${r.isActive ? "Yes" : "No"}`)
      .join("\n");
    const blob = new Blob([header + csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "newsletter-subscribers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  dateFormatter = (cell) => (cell ? cell.toString().slice(0, 19).replace("T", " ") : "-");

  activeFormatter = (cell) => (
    <span className={`badge bg-${cell ? "success" : "secondary"}`}>{cell ? "Active" : "Inactive"}</span>
  );

  actionFormatter = (cell) => (
    <div>
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
    const { rows, totalSize, page, sizePerPage, isActive, modalOpen } = this.state;
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
        <Head><title>Newsletter Subscribers</title></Head>
        <Widget title={<h4>Newsletter Subscribers</h4>} collapse close>
          <div className="d-flex justify-content-between align-items-center mb-3" style={{ flexWrap: "wrap", gap: 8 }}>
            <Button color="primary" type="button" onClick={this.exportCsv}>
              Export CSV (current page)
            </Button>
            <Input type="select" value={isActive} onChange={this.handleActiveFilterChange} style={{ width: 160 }}>
              <option value="">All subscribers</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
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
            <TableHeaderColumn dataField="email" dataSort>
              <span className="fs-sm">Email</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="isActive" dataSort dataFormat={this.activeFormatter}>
              <span className="fs-sm">Status</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="subscribedAt" dataSort dataFormat={this.dateFormatter}>
              <span className="fs-sm">Subscribed At</span>
            </TableHeaderColumn>
            <TableHeaderColumn isKey dataField="id" dataFormat={this.actionFormatter}>
              <span className="fs-sm">Actions</span>
            </TableHeaderColumn>
          </BootstrapTable>
          </div>
        </Widget>

        <Modal size="sm" isOpen={modalOpen} toggle={this.closeModal}>
          <ModalHeader toggle={this.closeModal}>Confirm delete</ModalHeader>
          <ModalBody className="bg-white">Are you sure you want to remove this subscriber?</ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={this.closeModal}>Cancel</Button>
            <Button color="primary" onClick={this.handleDelete}>Delete</Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default Index;
