const categoriesFields = {
  id: { type: "id", label: "ID" },
  name: { type: "string", label: "Name", required: true },
  slug: { type: "string", label: "Slug (lowercase, hyphen-separated)", required: true },
  description: { type: "string", label: "Description" },
  imageUrl: { type: "string", label: "Image URL" },
  sortOrder: { type: "int", label: "Sort Order" },
  parentId: { type: "int", label: "Parent Category ID" },
};

export default categoriesFields;
