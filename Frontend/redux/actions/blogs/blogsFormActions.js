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

  doCreate: (values) => async (dispatch) => {
    try {
      dispatch({
        type: "BLOGS_FORM_CREATE_STARTED",
      });

      axios.post("/blog-posts", values).then((res) => {
        dispatch({
          type: "BLOGS_FORM_CREATE_SUCCESS",
        });

        toast.success("blogs created");
        if (typeof window !== 'undefined') { window.location.href = "/admin/blogs" }
      });
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: "BLOGS_FORM_CREATE_ERROR",
      });
    }
  },

  doUpdate: (id, values, isProfile) => async (dispatch, getState) => {
    try {
      dispatch({
        type: "BLOGS_FORM_UPDATE_STARTED",
      });

      await axios.put(`/blog-posts/${id}`, values);

      dispatch(doInit());

      dispatch({
        type: "BLOGS_FORM_UPDATE_SUCCESS",
      });

      if (isProfile) {
        toast.success("Profile updated");
      } else {
        toast.success("blogs updated");
        if (typeof window !== 'undefined') { window.location.href = "/admin/blogs" }
      }
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: "BLOGS_FORM_UPDATE_ERROR",
      });
    }
  },
};

export default actions;
