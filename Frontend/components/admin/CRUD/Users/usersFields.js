const usersFields = {
  id: { type: "id", label: "ID" },
  fullName: { type: "string", label: "Full Name", required: true },
  email: { type: "string", label: "E-mail", required: true },
  phone: { type: "string", label: "Phone" },
  password: { type: "string", label: "Password" },
  roleId: {
    type: "enum",
    label: "Role",
    options: [
      { value: 1, label: "customer" },
      { value: 2, label: "admin" },
      { value: 3, label: "sales_staff" },
      { value: 4, label: "warehouse_staff" },
      { value: 5, label: "accountant" },
      { value: 6, label: "marketing" },
    ],
  },
  isActive: { type: "boolean", label: "Active" },
};

export default usersFields;
