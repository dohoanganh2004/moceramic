import React, { Component } from "react";
import Widget from "components/admin/Widget";

class OrdersForm extends Component {
  render() {
    return (
      <Widget title={<h4>Create Order</h4>} collapse close>
        <p>
          Orders are created by customers at checkout. There is no admin flow
          for creating an order on a customer's behalf.
        </p>
        <button className="btn btn-light" type="button" onClick={() => this.props.onCancel()}>
          Back to Orders
        </button>
      </Widget>
    );
  }
}

export default OrdersForm;
