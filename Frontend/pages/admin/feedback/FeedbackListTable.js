import React, { Component } from "react";
import axios from "axios";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import Widget from "components/admin/Widget";

class FeedbackListTable extends Component {
  state = { rows: [] };

  componentDidMount() {
    axios.get("/reviews").then((res) => this.setState({ rows: res.data || [] })).catch(() => this.setState({ rows: [] }));
  }

  render() {
    const { rows } = this.state;

    return (
      <div>
        <Widget title={<h4>Reviews</h4>} collapse close>
          <p className="text-muted">
            Reviews are submitted by customers on product pages and cannot be created or edited from the admin panel.
          </p>
          <BootstrapTable
            bordered={false}
            data={rows}
            version="4"
            pagination
            search
            tableContainerClass={`table-responsive table-striped table-hover`}
          >
            <TableHeaderColumn dataField="productName" dataSort>
              <span className="fs-sm">Product</span>
            </TableHeaderColumn>

            <TableHeaderColumn dataField="userName" dataSort>
              <span className="fs-sm">Customer</span>
            </TableHeaderColumn>

            <TableHeaderColumn dataField="rating" dataSort>
              <span className="fs-sm">Rating</span>
            </TableHeaderColumn>

            <TableHeaderColumn dataField="comment">
              <span className="fs-sm">Comment</span>
            </TableHeaderColumn>

            <TableHeaderColumn
              dataField="verifiedPurchase"
              dataSort
              dataFormat={(cell) => (cell ? "Yes" : "No")}
            >
              <span className="fs-sm">Verified Purchase</span>
            </TableHeaderColumn>

            <TableHeaderColumn
              isKey
              dataField="createdAt"
              dataSort
              dataFormat={(cell) => cell && cell.toString().slice(0, 19).replace("T", " ")}
            >
              <span className="fs-sm">Date</span>
            </TableHeaderColumn>
          </BootstrapTable>
        </Widget>
      </div>
    );
  }
}

export default FeedbackListTable;
