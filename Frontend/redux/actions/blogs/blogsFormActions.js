import axios from "axios";
import Errors from "../../../components/admin/FormItems/error/errors";
import { doInit } from "redux/actions/auth";
import { toast } from "react-toastify";

const actions = {
  doNew: () => {
    return {
      type: "BLOGS_FORM_RESET",
    };
  },

  doFind: (id) => async (dispatch) => {
    try {
      dispatch({
        type: "BLOGS_FORM_FIND_STARTED",
      });

      axios.get(`/blog-posts/${id}`).then((res) => {
        const record = res.data;

        dispatch({
          type: "BLOGS_FORM_FIND_SUCCESS",
          payload: record,
        });
      });
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: "BLOGS_FORM_FIND_ERROR",
      });

      if (typeof window !== 'undefined') { window.location.href = "/admin/blogs" }
    }
  },

  doCreate: ({ dto, thumbnail }) => async (dispatch) => {
    try {
      dispatch({
        type: "BLOGS_FORM_CREATE_STARTED",
      });

      const formData = new FormData();
      formData.append("data", new Blob([JSON.stringify(dto)], { type: "application/json" }));
      if (thumbnail) formData.append("thumbnail", thumbnail);

      axios.post("/blog-posts", formData).then((res) => {
        dispatch({
          type: "BLOGS_FORM_CREATE_SUCCESS",
        });

        toast.success("Blog post created");
        if (typeof window !== 'undefined') { window.location.href = "/admin/blogs" }
      });
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: "BLOGS_FORM_CREATE_ERROR",
      });
    }
  },

  doUpdate: (id, { dto, thumbnail }, isProfile) => async (dispatch, getState) => {
    try {
      dispatch({
        type: "BLOGS_FORM_UPDATE_STARTED",
      });

      const formData = new FormData();
      formData.append("data", new Blob([JSON.stringify(dto)], { type: "application/json" }));
      if (thumbnail) formData.append("thumbnail", thumbnail);

      await axios.put(`/blog-posts/${id}`, formData);

      dispatch(doInit());

      dispatch({
        type: "BLOGS_FORM_UPDATE_SUCCESS",
      });

      toast.success("Blog post updated");
      if (typeof window !== 'undefined') { window.location.href = "/admin/blogs" }
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: "BLOGS_FORM_UPDATE_ERROR",
      });
    }
  },
};

export default actions;
