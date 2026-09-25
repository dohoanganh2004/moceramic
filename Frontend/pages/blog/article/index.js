// The old template article page was hard-coded demo content. Real articles live at
// /blog/article/[slug]; the bare /blog/article URL just goes back to the blog list.
const BlogArticleRedirect = () => null;

export async function getServerSideProps() {
  return { redirect: { destination: "/blog", permanent: false } };
}

export default BlogArticleRedirect;
