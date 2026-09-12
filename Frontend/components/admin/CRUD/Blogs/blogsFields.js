const blogsFields = {
  id: { type: "id", label: "ID" },
  title: { type: "string", label: "Title", required: true },
  slug: { type: "string", label: "Slug", required: true },
  thumbnailUrl: { type: "string", label: "Thumbnail URL" },
  content: { type: "string", label: "Content (HTML)", required: true },
  status: { type: "string", label: "Status" },
};

export default blogsFields;
