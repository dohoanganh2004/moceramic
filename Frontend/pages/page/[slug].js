import React from "react";
import axios from "axios";
import Link from 'next/link';
import { Container } from "reactstrap";
import Head from "next/head";

const Page = ({ page }) => {
  if (!page) {
    return (
      <Container className={"mt-5 mb-5"}>
        <h3>Page not found</h3>
        <Link href="/">
          <a>Back to home</a>
        </Link>
      </Container>
    );
  }

  return (
    <>
      <Head>
        <title>{page.title}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta charSet="utf-8" />
      </Head>
      <Container className={"mt-5 mb-5"} style={{ maxWidth: 800 }}>
        <h2 className="fw-bold mb-4">{page.title}</h2>
        <div dangerouslySetInnerHTML={{ __html: page.content }} />
      </Container>
    </>
  );
};

export async function getServerSideProps(context) {
  try {
    const res = await axios.get(`/public/static-pages/${context.query.slug}`);
    return { props: { page: res.data } };
  } catch (error) {
    return { props: { page: null } };
  }
}

export default Page;
