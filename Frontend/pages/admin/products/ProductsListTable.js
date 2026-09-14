import { withRouter } from "next/router"
import React, { Component } from "react";
import Link from 'next/link'
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

class ProductsListTable extends Component {
  state = {
    rows: [],
    totalSize: 0,
    page: 1,
    sizePerPage: 10,
    sortName: "createdAt",
    sortOrder: "desc",
    searchText: "",
    categoryId: "",
    status: "",
    categories: [],
    modalOpen: false,
    idToDelete: null,
  };

  componentDidMount() {
    axios.get("/categories").then((res) => this.setState({ categories: res.data || [] })).catch(() => {});
    this.fetchRows();
  }

  fetchRows = () => {
    const { page, sizePerPage, sortName, sortOrder, searchText, categoryId, status } = this.state;
    axios
      .get("/products/search", {
        params: {
          search: searchText || undefined,
          categoryId: categoryId || undefined,
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
      .catch(() => toast.error("Could not load products"));
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

  handleCategoryFilterChange = (e) => {
    this.setState({ categoryId: e.target.value, page: 1 }, this.fetchRows);
  };

  handleStatusFilterChange = (e) => {
    this.setState({ status: e.target.value, page: 1 }, this.fetchRows);
  };

  handleDelete() {
    const id = this.state.idToDelete;
    axios
      .delete(`/products/${id}`)
      .then(() => {
        this.closeModal();
        this.fetchRows();
      })
      .catch(() => {
        toast.error("Could not delete this product");
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
          onClick={() => this.props.router.push(`/admin/products/${cell}`)}
        >
          View
        </Button>
        &nbsp;&nbsp;
        <Button
          color="info"
          size="xs"
          onClick={() =>
            this.props.router.push(`/admin/products/edit/${cell}`)
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
    const { rows, totalSize, page, sizePerPage, categories, categoryId, status } = this.state;
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
        <Widget title={<h4>Products</h4>} collapse close>
          <div className="d-flex justify-content-between align-items-center mb-3" style={{ flexWrap: "wrap", gap: 8 }}>
            <Link href="/admin/products/new">
              <button className="btn btn-primary" type="button">
                New
              </button>
            </Link>
            <div className="d-flex" style={{ gap: 8 }}>
              <Input type="select" value={categoryId} onChange={this.handleCategoryFilterChange} style={{ width: 200 }}>
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Input>
              <Input type="select" value={status} onChange={this.handleStatusFilterChange} style={{ width: 160 }}>
                <option value="">All statuses</option>
                <option value="active">active</option>
                <option value="inactive">inactive</option>
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
            <TableHeaderColumn
              dataField="images"
              dataFormat={(cell) => (cell && cell[0] ? <img src={cell[0].imageUrl} width={60} height={60} style={{ objectFit: "cover" }} /> : null)}
            >
              <span className="fs-sm">Image</span>
            </TableHeaderColumn>

            <TableHeaderColumn dataField="name" dataSort>
              <span className="fs-sm">Name</span>
            </TableHeaderColumn>

            <TableHeaderColumn dataField="basePrice" dataSort dataFormat={(cell) => formatCurrency(cell)}>
              <span className="fs-sm">Price</span>
            </TableHeaderColumn>

            <TableHeaderColumn dataField="categoryName">
              <span className="fs-sm">Category</span>
            </TableHeaderColumn>

            <TableHeaderColumn dataField="status" dataSort>
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

export default withRouter(ProductsListTable);
