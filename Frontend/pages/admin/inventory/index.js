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
  Input,
} from "reactstrap";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import Widget from "components/admin/Widget";
import resolveAssetUrl from "utils/resolveAssetUrl";

const LOW_STOCK_THRESHOLD = 5;

class Index extends Component {
  state = {
    rows: [],
    totalSize: 0,
    page: 1,
    sizePerPage: 10,
    searchText: "",
    lowStockOnly: false,
    editingId: null,
    editValue: "",
    saving: false,
  };

  componentDidMount() {
    this.fetchRows();
  }

  fetchRows = () => {
    const { page, sizePerPage, searchText, lowStockOnly } = this.state;
    axios
      .get("/inventory/search", {
        params: {
          search: searchText || undefined,
          lowStockAtMost: lowStockOnly ? LOW_STOCK_THRESHOLD : undefined,
          page: page - 1,
          size: sizePerPage,
        },
      })
      .then((res) => {
        this.setState({ rows: res.data.content, totalSize: res.data.totalElements });
      })
      .catch(() => toast.error("Could not load inventory"));
  };

  handlePageChange = (page, sizePerPage) => {
    this.setState({ page, sizePerPage }, this.fetchRows);
  };

  handleSearchChange = (searchText) => {
    this.setState({ searchText, page: 1 }, this.fetchRows);
  };

  toggleLowStockOnly = () => {
    this.setState((prev) => ({ lowStockOnly: !prev.lowStockOnly, page: 1 }), this.fetchRows);
  };

  startEdit = (row) => {
    this.setState({ editingId: row.id, editValue: String(row.quantityOnHand) });
  };

  cancelEdit = () => {
    this.setState({ editingId: null, editValue: "" });
  };

  saveEdit = (row) => {
    const quantityOnHand = Number(this.state.editValue);
    if (!Number.isInteger(quantityOnHand) || quantityOnHand < 0) {
      toast.error("Enter a valid, non-negative whole number");
      return;
    }
    this.setState({ saving: true });
    axios
      .patch(`/inventory/${row.id}`, { quantityOnHand })
      .then((res) => {
        this.setState((prev) => ({
          rows: prev.rows.map((r) => (r.id === row.id ? res.data : r)),
          editingId: null,
          editValue: "",
        }));
        toast.info("Stock updated");
      })
      .catch(() => toast.error("Could not update stock"))
      .finally(() => this.setState({ saving: false }));
  };

  productFormatter = (cell, row) => (
    <div className="d-flex align-items-center">
      {row.productImageUrl ? (
        <img
          src={resolveAssetUrl(row.productImageUrl)}
          alt={row.productName}
          width={40}
          height={40}
          style={{ objectFit: "cover", borderRadius: 4 }}
          className="mr-2"
        />
      ) : null}
      <div>
        <div className="fw-bold">{row.productName}</div>
        <div className="text-muted fs-sm">{[row.colorGlaze, row.size].filter(Boolean).join(" / ") || row.sku}</div>
      </div>
    </div>
  );

  availableFormatter = (cell) => (
    <span className={cell <= LOW_STOCK_THRESHOLD ? "text-danger fw-bold" : ""}>{cell}</span>
  );

  dateFormatter = (cell) => (cell ? cell.toString().slice(0, 19).replace("T", " ") : "-");

  actionFormatter = (cell, row) => {
    if (this.state.editingId === row.id) {
      return (
        <div className="d-flex align-items-center" style={{ gap: 6 }}>
          <Input
            type="number"
            min="0"
            value={this.state.editValue}
            onChange={(e) => this.setState({ editValue: e.target.value })}
            style={{ width: 90 }}
            disabled={this.state.saving}
          />
          <Button color="primary" size="xs" onClick={() => this.saveEdit(row)} disabled={this.state.saving}>
            Save
          </Button>
          <Button color="secondary" size="xs" onClick={this.cancelEdit} disabled={this.state.saving}>
            Cancel
          </Button>
        </div>
      );
    }
    return (
      <Button color="info" size="xs" onClick={() => this.startEdit(row)}>
        Adjust
      </Button>
    );
  };

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
    const { rows, totalSize, page, sizePerPage, lowStockOnly } = this.state;
    const options = {
      page,
      sizePerPage,
      paginationSize: 5,
      sizePerPageList: [10, 25, 50],
      sizePerPageDropDown: this.renderSizePerPageDropDown,
      onPageChange: this.handlePageChange,
      onSearchChange: this.handleSearchChange,
    };

    return (
      <div>
        <Head><title>Inventory</title></Head>
        <Widget title={<h4>Inventory</h4>} collapse close>
          <div className="d-flex justify-content-between align-items-center mb-3" style={{ flexWrap: "wrap", gap: 8 }}>
            <p className="text-muted mb-0 fs-sm">
              "Available" is on-hand minus quantity already reserved for open orders.
            </p>
            <div className="abc-checkbox d-flex align-items-center">
              <input
                type="checkbox"
                id="lowStockOnly"
                checked={lowStockOnly}
                onChange={this.toggleLowStockOnly}
              />
              <label htmlFor="lowStockOnly" className="mb-0">
                Low stock only (&le; {LOW_STOCK_THRESHOLD} available)
              </label>
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
            <TableHeaderColumn dataField="productName" dataFormat={this.productFormatter}>
              <span className="fs-sm">Product</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="quantityOnHand">
              <span className="fs-sm">On Hand</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="quantityReserved">
              <span className="fs-sm">Reserved</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="quantityAvailable" dataFormat={this.availableFormatter}>
              <span className="fs-sm">Available</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="updatedAt" dataFormat={this.dateFormatter}>
              <span className="fs-sm">Updated</span>
            </TableHeaderColumn>
            <TableHeaderColumn isKey dataField="id" dataFormat={this.actionFormatter}>
              <span className="fs-sm">Actions</span>
            </TableHeaderColumn>
          </BootstrapTable>
        </Widget>
      </div>
    );
  }
}

export default Index;
