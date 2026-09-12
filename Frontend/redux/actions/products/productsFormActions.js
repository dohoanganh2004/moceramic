import axios from "axios";
import Errors from "../../../components/admin/FormItems/error/errors";
import { doInit } from "redux/actions/auth";
import { toast } from "react-toastify";

const actions = {
  doNew: () => {
    return {
      type: "PRODUCTS_FORM_RESET",
    };
  },

  doFind: (id) => async (dispatch) => {
    try {
      dispatch({
        type: "PRODUCTS_FORM_FIND_STARTED",
      });

      axios.get(`/products/${id}`).then((res) => {
        const record = res.data;

        dispatch({
          type: "PRODUCTS_FORM_FIND_SUCCESS",
          payload: record,
        });
      });
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: "PRODUCTS_FORM_FIND_ERROR",
      });

      if (typeof window !== 'undefined') { window.location.href = "/admin/products" }
    }
  },

  doCreate: ({ dto, files }) => async (dispatch) => {
    try {
      dispatch({
        type: "PRODUCTS_FORM_CREATE_STARTED",
      });

      const formData = new FormData();
      formData.append("data", new Blob([JSON.stringify(dto)], { type: "application/json" }));
      (files || []).forEach((file) => formData.append("files", file));

      axios.post("/products", formData).then((res) => {
        dispatch({
          type: "PRODUCTS_FORM_CREATE_SUCCESS",
        });

        toast.success("Product created");
        if (typeof window !== 'undefined') { window.location.href = "/admin/products" }
      });
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: "PRODUCTS_FORM_CREATE_ERROR",
      });
    }
  },

  doUpdate: (id, values, isProfile) => async (dispatch, getState) => {
    try {
      dispatch({
        type: "PRODUCTS_FORM_UPDATE_STARTED",
      });

      await axios.put(`/products/${id}`, values);

      dispatch(doInit());

      dispatch({
        type: "PRODUCTS_FORM_UPDATE_SUCCESS",
      });

      if (isProfile) {
        toast.success("Profile updated");
      } else {
        toast.success("products updated");
        if (typeof window !== 'undefined') { window.location.href = "/admin/products" }
      }
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: "PRODUCTS_FORM_UPDATE_ERROR",
      });
    }
  },
};

export default actions;
