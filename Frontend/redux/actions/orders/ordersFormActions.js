import axios from "axios";
import Errors from "../../../components/admin/FormItems/error/errors";
import { toast } from "react-toastify";

const actions = {
  doNew: () => {
    return {
      type: "ORDERS_FORM_RESET",
    };
  },

  doFind: (id) => async (dispatch) => {
    try {
      dispatch({
        type: "ORDERS_FORM_FIND_STARTED",
      });

      axios.get(`/order/${id}`).then((res) => {
        const record = res.data;
        
        dispatch({
          type: "ORDERS_FORM_FIND_SUCCESS",
          payload: record,
        });
      });
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: "ORDERS_FORM_FIND_ERROR",
      });

      if (typeof window !== 'undefined') { window.location.href = "/admin/orders" }
    }
  },

  doCreate: (values) => async (dispatch) => {
    try {
      dispatch({
        type: "ORDERS_FORM_CREATE_STARTED",
      });

      axios.post("/orders", { data: values }).then((res) => {
        dispatch({
          type: "ORDERS_FORM_CREATE_SUCCESS",
        });

        toast.success("orders created");
        if (typeof window !== 'undefined') { window.location.href = "/admin/orders" }
      });
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: "ORDERS_FORM_CREATE_ERROR",
      });
    }
  },

  doUpdate: (id, values) => async (dispatch, getState) => {
    try {
      dispatch({
        type: "ORDERS_FORM_UPDATE_STARTED",
      });

      await axios.patch(`/order/${id}/status`, values);

      dispatch({
        type: "ORDERS_FORM_UPDATE_SUCCESS",
      });

      toast.success("Order status updated");
      dispatch(actions.doFind(id));
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: "ORDERS_FORM_UPDATE_ERROR",
      });
    }
  },
};

export default actions;
