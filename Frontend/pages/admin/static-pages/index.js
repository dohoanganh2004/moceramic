import React, { Component } from "react";
import Head from 'next/head';
import Link from 'next/link';
import axios from "axios";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import { withRouter } from "next/router";
import Widget from "components/admin/Widget";

class Index extends Component {
  state = { rows: [], modalOpen: false, idToDelete: null };

  fetchRows = () => {
    axios.get("/static-pages").then((res) => this.setState({ rows: res.data || [] })).catch(() => this.setState({ rows: [] }));
  };

  componentDidMount() {
    this.fetchRows();
  }

  openModal = (id) => this.setState({ modalOpen: true, idToDelete: id });
  closeModal = () => this.setState({ modalOpen: false, idToDelete: null });

  handleDelete = () => {
    axios.delete(`/static-pages/${this.state.idToDelete}`).then(() => {
      this.closeModal();
      this.fetchRows();
    });
  };

  actionFormatter = (cell) => (
    <div>
      <Button color="info" size="xs" onClick={() => this.props.router.push(`/admin/static-pages/edit/${cell}`)}>
        Edit
      </Button>{" "}
      <Button color="danger" size="xs" onClick={() => this.openModal(cell)}>
        Delete
      </Button>
    </div>
  );

  render() {
    const { rows, modalOpen } = this.state;

    return (
      <div>
        <Head><title>Static Pages</title></Head>
        <Widget title={<h4>Static Pages</h4>} collapse close>
          <Link href="/admin/static-pages/new">
            <button className="btn btn-primary" type="button">New</button>
          </Link>
          <BootstrapTable
            bordered={false}
            data={rows}
            version="4"
            pagination
            search
            tableContainerClass={`table-responsive table-striped table-hover`}
          >
            <TableHeaderColumn dataField="title" dataSort>
              <span className="fs-sm">Title</span>
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

        <Modal size="sm" isOpen={modalOpen} toggle={this.closeModal}>
          <ModalHeader toggle={this.closeModal}>Confirm delete</ModalHeader>
          <ModalBody className="bg-white">Are you sure you want to delete this page?</ModalBody>
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
