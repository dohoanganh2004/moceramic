import React from "react";
import Head from "next/head";
import axios from "axios";
import { toast } from "react-toastify";
import { Button, FormGroup, Label, Input, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import Widget from "components/admin/Widget";

const Index = () => {
  const [permissions, setPermissions] = React.useState([]);
  const [roles, setRoles] = React.useState([]);
  const [grants, setGrants] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [savingRoleId, setSavingRoleId] = React.useState(null);
  const [newCode, setNewCode] = React.useState("");
  const [newDescription, setNewDescription] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [idToDelete, setIdToDelete] = React.useState(null);

  const fetchAll = () => {
    setLoading(true);
    return Promise.all([axios.get("/permissions"), axios.get("/roles")])
      .then(([permissionsRes, rolesRes]) => {
        setPermissions(permissionsRes.data || []);
        const rolesData = (rolesRes.data || []).filter((r) => r.name !== "customer");
        setRoles(rolesData);
        return Promise.all(
          rolesData.map((role) => axios.get(`/roles/${role.id}/permissions`))
        ).then((results) => {
          const nextGrants = {};
          rolesData.forEach((role, index) => {
            nextGrants[role.id] = new Set(results[index].data || []);
          });
          setGrants(nextGrants);
        });
      })
      .catch(() => toast.error("Could not load permissions"))
      .finally(() => setLoading(false));
  };

  React.useEffect(() => {
    fetchAll();
  }, []);

  const toggle = (roleId, permissionId) => {
    setGrants((prev) => {
      const next = new Set(prev[roleId]);
      if (next.has(permissionId)) {
        next.delete(permissionId);
      } else {
        next.add(permissionId);
      }
      return { ...prev, [roleId]: next };
    });
  };

  const saveRole = (roleId) => {
    setSavingRoleId(roleId);
    axios
      .put(`/roles/${roleId}/permissions`, { permissionIds: Array.from(grants[roleId] || []) })
      .then(() => toast.success("Permissions updated"))
      .catch(() => toast.error("Could not save permissions"))
      .finally(() => setSavingRoleId(null));
  };

  const createPermission = () => {
    if (!newCode.trim()) {
      toast.error("Please enter a permission code");
      return;
    }
    setCreating(true);
    axios
      .post("/permissions", { code: newCode.trim(), description: newDescription.trim() || null })
      .then(() => {
        toast.success("Permission created");
        setNewCode("");
        setNewDescription("");
        fetchAll();
      })
      .catch((err) => {
        const message = (err.response && err.response.data && err.response.data.message) || "Could not create permission";
        toast.error(message);
      })
      .finally(() => setCreating(false));
  };

  const confirmDelete = () => {
    const id = idToDelete;
    axios
      .delete(`/permissions/${id}`)
      .then(() => {
        toast.success("Permission deleted");
        setIdToDelete(null);
        fetchAll();
      })
      .catch(() => {
        toast.error("Could not delete permission");
        setIdToDelete(null);
      });
  };

  return (
    <div>
      <Head><title>Permissions</title></Head>
      <Widget title={<h4>Role Permissions</h4>} collapse close>
        <p className="text-muted" style={{ fontSize: 13 }}>
          Chọn module mỗi role được thấy/dùng trong khu vực quản trị. Role <strong>admin</strong> luôn có đủ mọi quyền.
          Thay đổi có hiệu lực trong tối đa 15 phút với người đang đăng nhập (khi access token của họ tự làm mới), hoặc ngay khi họ đăng nhập lại.
        </p>

        <div className="d-flex align-items-end mb-4" style={{ gap: 12, flexWrap: "wrap" }}>
          <FormGroup className="mb-0">
            <Label className="fw-bold">New permission code</Label>
            <Input value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="e.g. reports" style={{ width: 200 }} />
          </FormGroup>
          <FormGroup className="mb-0">
            <Label className="fw-bold">Description</Label>
            <Input value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="e.g. Reports" style={{ width: 240 }} />
          </FormGroup>
          <Button color="primary" disabled={creating} onClick={createPermission}>
            {creating ? "Adding..." : "+ Add Permission"}
          </Button>
        </div>
        <p className="text-muted mb-4" style={{ fontSize: 12 }}>
          Lưu ý: thêm permission ở đây chỉ tạo ra "quyền" để gán cho role — cần sửa code (`Sidebar.js`) để gắn permission đó với một mục menu thật sự thì mới có tác dụng.
        </p>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Module</th>
                  {roles.map((role) => (
                    <th key={role.id} className="text-center text-capitalize">{role.name.replace("_", " ")}</th>
                  ))}
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((permission) => (
                  <tr key={permission.id}>
                    <td>{permission.description || permission.code}</td>
                    {roles.map((role) => {
                      const isAdminRole = role.name === "admin";
                      const checked = isAdminRole || (grants[role.id] && grants[role.id].has(permission.id));
                      return (
                        <td key={role.id} className="text-center">
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={isAdminRole}
                            onChange={() => toggle(role.id, permission.id)}
                          />
                        </td>
                      );
                    })}
                    <td className="text-center">
                      <Button color="danger" size="xs" onClick={() => setIdToDelete(permission.id)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td />
                  {roles.map((role) => (
                    <td key={role.id} className="text-center">
                      {role.name === "admin" ? null : (
                        <Button
                          color="primary"
                          size="sm"
                          disabled={savingRoleId === role.id}
                          onClick={() => saveRole(role.id)}
                        >
                          {savingRoleId === role.id ? "Saving..." : "Save"}
                        </Button>
                      )}
                    </td>
                  ))}
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Widget>

      <Modal size="sm" isOpen={!!idToDelete} toggle={() => setIdToDelete(null)}>
        <ModalHeader toggle={() => setIdToDelete(null)}>Confirm delete</ModalHeader>
        <ModalBody className="bg-white">
          Xoá permission này sẽ tự động gỡ nó khỏi mọi role đang có. Bạn chắc chắn?
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setIdToDelete(null)}>Cancel</Button>
          <Button color="primary" onClick={confirmDelete}>Delete</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default Index;
