import React, { useState, useEffect } from "react";
import { Container, Row, Col, Input } from "reactstrap";
import axios from 'axios';
import Link from "next/link";
import resolveAssetUrl from "utils/resolveAssetUrl";
import InstagramWidget from 'components/e-commerce/Instagram';

import Head from "next/head";
import s from './Blog.module.scss';


const Index = () => {
  const [blogs, setBlogs] = useState([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    axios.get("/public/blog-posts", { params: { size: 50 } }).then((res) => {
      setBlogs(res.data.content || []);
    }).catch(e => console.log(e));
  }, []);

  const excerptOf = (html, length = 150) => {
    if (!html) return "";
    const text = html.replace(/<[^>]*>/g, "");
    return text.length > length ? text.slice(0, length) + "..." : text;
  };

  const keyword = searchText.trim().toLowerCase();
  const visibleBlogs = keyword
    ? blogs.filter((post) => `${post.title} ${excerptOf(post.content, 10000)}`.toLowerCase().includes(keyword))
    : blogs;
  const recentPosts = blogs.slice(0, 3);

  return (
    <>
      <Head>
        <title>Blog</title>
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
      <Container className={"mb-5"} style={{ marginTop: 32 }}>
        <Row>
          <Col xs={12} lg={8}>
            <h3 className="fw-bold mb-5">Blog</h3>
            {visibleBlogs.length === 0 ? (
              <p className={"text-muted"}>{keyword ? "No posts match your search." : "No posts yet."}</p>
            ) : (
              visibleBlogs.map((post) => (
                <div className={s.blogPost} key={post.id}>
                  <div>
                    {post.thumbnailUrl ? (
                      <Link href={`/blog/article/${post.slug}`}>
                        <a className={s.blogPostImgWrap}>
                          <img src={resolveAssetUrl(post.thumbnailUrl)} alt={post.title} className="mb-4 img-fluid" />
                        </a>
                      </Link>
                    ) : null}
                    <h6 className={`${s.author_name}`}>{post.authorName}</h6>
                    <Link href={`/blog/article/${post.slug}`}>
                      <a className={`text-dark ${s.post_title}`}>
                        <h4 className="fw-bold">{post.title}</h4>
                      </a>
                    </Link>
                    <p className={`${s.post_epigraph}`}>{excerptOf(post.content)} </p>
                    <p className={`${s.post_date}`}>{post.createdAt && post.createdAt.toString().slice(0, 10)}</p>
                  </div>
                </div>
              ))
            )}
          </Col>
          <Col xs={12} lg={4}>
            <h3 className="fw-bold mb-4">Search</h3>
            <Input
              type="search"
              name="text"
              id="exampleEmail"
              className="w-100 blog-search"
              placeholder={"Search in blog"}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <hr className={"my-5"} />
            <h3 className={"fw-bold mb-5"}>Recent Posts</h3>
            {recentPosts.length === 0 ? (
              <p className={"text-muted"}>No posts yet.</p>
            ) : (
              <Row>
                {recentPosts.map((post) => (
                  <Col xs={12} className={"mb-4 d-flex flex-column"} key={post.id}>
                    {post.thumbnailUrl ? (
                      <Link href={`/blog/article/${post.slug}`}>
                        <a>
                          <img src={resolveAssetUrl(post.thumbnailUrl)} className={"img-fluid"} alt={post.title} />
                        </a>
                      </Link>
                    ) : null}
                    <p className={"mt-3 text-muted mb-0"}>
                      {post.createdAt && post.createdAt.toString().slice(0, 10)}
                    </p>
                    <Link href={`/blog/article/${post.slug}`}>
                      <a>
                        <h6
                          className={"fw-bold font-size-base mt-1"}
                          style={{ fontSize: 16, color: "#232323" }}
                        >
                          {post.title}
                        </h6>
                      </a>
                    </Link>
                    <Link href={`/blog/article/${post.slug}`}>
                      <a>
                        <h6 style={{ fontSize: 16 }} className={"fw-bold text-primary"}>
                          Read More
                        </h6>
                      </a>
                    </Link>
                  </Col>
                ))}
              </Row>
            )}
          </Col>
        </Row>
      </Container>
      <InstagramWidget />
    </>
  );
};

export async function getServerSideProps(context) {
  // const res = await axios.get("/products");
  // const products = res.data.rows;

  return {
    props: {  }, // will be passed to the page component as props
  };
}

export default Index;
