import React from "react";
import axios from "axios";
import Link from 'next/link';
import { Container, Row, Col } from "reactstrap";
import s from "./Article.module.scss";
import Head from "next/head";

const Id = ({ post }) => {
  if (!post) {
    return (
      <Container className={"mt-5 mb-5"}>
        <h3>Post not found</h3>
        <Link href="/blog">
          <a>Back to blog</a>
        </Link>
      </Container>
    );
  }

  return (
    <>
      <Head>
        <title>{post.title}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="description" content="Beautifully designed web application template built with React and Bootstrap to create modern apps and speed up development" />
        <meta charSet="utf-8" />
      </Head>
      {post.thumbnailUrl && (
        <img
          src={post.thumbnailUrl}
          alt={"header"}
          className={`${s.heroImage}`}
        />
      )}
      <Container className={"mb-5 mt-5 d-flex flex-column align-items-center"}>
        <Row style={{ maxWidth: 700 }}>
          <Col md={12}>
            <h1 className={`${s.title} fw-bold mb-0`}>{post.title}</h1>
            <blockquote
              className={"d-flex"}
              style={{ marginTop: 35, marginBottom: 40 }}
            >
              <div className={"d-flex flex-column"}>
                <p className={`${s.author_name} text-uppercase fw-bold text-primary mb-0`}>
                  By {post.authorName}
                  {post.publishedAt ? ` · ${post.publishedAt.toString().slice(0, 10)}` : ""}
                </p>
              </div>
            </blockquote>
          </Col>
        </Row>
        <Row style={{ maxWidth: 700 }} className={"mt-3"}>
          <Col md={12}>
            <div
              className={s.paragraph}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </Col>
        </Row>
      </Container>
      <Container style={{ marginTop: 80, marginBottom: 80 }}>
        <h3 className={"text-center fw-bold mb-4"}>More From Our Blog</h3>
        <Row className={"justify-content-center mb-2"}>
          <Col sm={8} className={"text-center"}>
            <Link href="/blog">
              <a className={"fw-bold text-primary"}>Browse all posts</a>
            </Link>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export async function getServerSideProps(context) {
  try {
    const res = await axios.get(`/public/blog-posts/${context.query.id}`);
    return {
      props: { post: res.data },
    };
  } catch (error) {
    return {
      props: { post: null },
    };
  }
}

export default Id;
