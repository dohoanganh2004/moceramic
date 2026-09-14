import React, { Component } from "react";
import Link from 'next/link'
import { withRouter } from 'next/router';
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
} from "reactstrap";

import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";

import Widget from "components/admin/Widget";

class CategoriesListTable extends Component {
  state = {
    rows: [],
    totalSize: 0,
    page: 1,
    sizePerPage: 10,
    sortName: "sortOrder",
    sortOrder: "asc",
    searchText: "",
    modalOpen: false,
    idToDelete: null,
  };

  componentDidMount() {
    this.fetchRows();
  }

  fetchRows = () => {
    const { page, sizePerPage, sortName, sortOrder, searchText } = this.state;
    axios
      .get("/categories/search", {
        params: {
          search: searchText || undefined,
          sortBy: sortName,
          sortDir: sortOrder,
          page: page - 1,
          size: sizePerPage,
        },
      })
      .then((res) => {
        this.setState({ rows: res.data.content, totalSize: res.data.totalElements });
      })
      .catch(() => toast.error("Could not load categories"));
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

  handleDelete() {
    const id = this.state.idToDelete;
    axios
      .delete(`/categories/${id}`)
      .then(() => {
        this.closeModal();
        this.fetchRows();
      })
      .catch(() => {
        toast.error("Could not delete this category");
        this.closeModal();
      });
  }

  openModal(id) {
    this.setState({ modalOpen: true, idToDelete: id });
  }

  closeModal() {
    this.setState({ modalOpen: false, idToDelete: null });
  }

  actionFormatter = (cell) => {
    return (
      <div>
        <Button
          color="default"
          size="xs"
          onClick={() =>
            this.props.router.push(`/admin/categories/${cell}`)
          }
        >
          View
        </Button>
        &nbsp;&nbsp;
        <Button
          color="info"
          size="xs"
          onClick={() =>
            this.props.router.push(`/admin/categories/edit/${cell}`)
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
    const { rows, totalSize, page, sizePerPage } = this.state;
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
        <Widget title={<h4>Categories</h4>} collapse close>
          <Link href="/admin/categories/new">
            <button className="btn btn-primary" type="button">
              New
            </button>
          </Link>
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

            <TableHeaderColumn dataField="slug" dataSort>
              <span className="fs-sm">Slug</span>
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

export default withRouter(CategoriesListTable);
