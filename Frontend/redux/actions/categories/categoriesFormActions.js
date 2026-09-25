import axios from "axios";
import Errors from "../../../components/admin/FormItems/error/errors";
import { doInit } from "redux/actions/auth";
import { toast } from "react-toastify";

const actions = {
  doNew: () => {
    return {
      type: "CATEGORIES_FORM_RESET",
    };
  },

  doFind: (id) => async (dispatch) => {
    try {
      dispatch({
        type: "CATEGORIES_FORM_FIND_STARTED",
      });

      axios.get(`/categories/${id}`).then((res) => {
        const record = res.data;

        dispatch({
          type: "CATEGORIES_FORM_FIND_SUCCESS",
          payload: record,
        });
      });
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: "CATEGORIES_FORM_FIND_ERROR",
      });

      if (typeof window !== 'undefined') { window.location.href = "/admin/categories" }
    }
  },

  doCreate: ({ dto, image }) => async (dispatch) => {
    try {
      dispatch({ type: "CATEGORIES_FORM_CREATE_STARTED" });

      const formData = new FormData();
      formData.append("data", new Blob([JSON.stringify(dto)], { type: "application/json" }));
      if (image) formData.append("image", image);

      axios.post("/categories", formData).then(() => {
        dispatch({ type: "CATEGORIES_FORM_CREATE_SUCCESS" });
        toast.success("Category created");
        if (typeof window !== 'undefined') { window.location.href = "/admin/categories" }
      });
    } catch (error) {
      Errors.handle(error);
      dispatch({ type: "CATEGORIES_FORM_CREATE_ERROR" });
    }
  },

  doUpdate: (id, { dto, image }, isProfile) => async (dispatch, getState) => {
    try {
      dispatch({ type: "CATEGORIES_FORM_UPDATE_STARTED" });

      const formData = new FormData();
      formData.append("data", new Blob([JSON.stringify(dto)], { type: "application/json" }));
      if (image) formData.append("image", image);

      await axios.put(`/categories/${id}`, formData);

      dispatch(doInit());
      dispatch({ type: "CATEGORIES_FORM_UPDATE_SUCCESS" });

      toast.success("Category updated");
      if (typeof window !== 'undefined') { window.location.href = "/admin/categories" }
    } catch (error) {
      Errors.handle(error);
      dispatch({ type: "CATEGORIES_FORM_UPDATE_ERROR" });
    }
  },
};

export default actions;
