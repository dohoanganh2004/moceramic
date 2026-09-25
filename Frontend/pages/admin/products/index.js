import React, { Component } from "react";
import ProductsListTable from "./ProductsListTable";
import Head from 'next/head';


class Index extends Component {
  render() {
    return (
      <div>
        <Head>
          <title>Products List</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />

          <meta name="description" content="Beautifully designed web application template built with React and Bootstrap to create modern apps and speed up development" />
          <meta name="keywords" content="flatlogic, react templates" />
          <meta name="author" content="MoCeramic" />
          <meta charSet="utf-8" />


          <meta property="og:title" content="MoCeramic - Handcrafted Ceramics"/>
          <meta property="og:type" content="website"/>
          <meta property="og:url" content="https://flatlogic-ecommerce.herokuapp.com/"/>
          <meta property="og:image" content="https://flatlogic-ecommerce-backend.herokuapp.com/images/blogs/content_image_six.jpg"/>
          <meta property="og:description" content="Beautifully designed web application template built with React and Bootstrap to create modern apps and speed up development"/>
          <meta name="twitter:card" content="summary_large_image" />

          <meta property="fb:app_id" content="712557339116053" />

          <meta property="og:site_name" content="MoCeramic"/>
          <meta name="twitter:site" content="@flatlogic" />
        </Head>
        <ProductsListTable />
      </div>
    );
  }
}

export async function getServerSideProps(context) {
  // const res = await axios.get("/products");
  // const products = res.data.rows;

  return {
    props: {  }, // will be passed to the page component as props
  };
}

export default Index;
