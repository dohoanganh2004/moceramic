const productsFields = {
  id: { type: "id", label: "ID" },
  category: { type: "relation_one", label: "Category", required: true },
  name: { type: "string", label: "Name", required: true },
  slug: { type: "string", label: "Slug", required: true },
  description: { type: "string", label: "Description" },
  careInstructions: { type: "string", label: "Care Instructions" },
  material: { type: "string", label: "Material" },
  origin: { type: "string", label: "Origin" },
  basePrice: { type: "decimal", label: "Base Price", required: true },
  status: { type: "string", label: "Status" },
};

export default productsFields;
