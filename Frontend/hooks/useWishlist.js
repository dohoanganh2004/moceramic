import React from "react";
import axios from "axios";
import { toast } from "react-toastify";

const useWishlist = (currentUser) => {
  const [wishlistIds, setWishlistIds] = React.useState(new Set());

  const fetchWishlist = React.useCallback(() => {
    if (!currentUser) {
      setWishlistIds(new Set());
      return;
    }
    axios
      .get("/wishlist")
      .then((res) => {
        setWishlistIds(new Set(res.data.map((item) => item.productId)));
      })
      .catch(() => {});
  }, [currentUser]);

  React.useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = (productId) => {
    if (!currentUser) {
      toast.info("Please log in to add items to your wishlist");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return;
    }

    const isWishlisted = wishlistIds.has(productId);
    const request = isWishlisted
      ? axios.delete(`/wishlist/${productId}`)
      : axios.post(`/wishlist`, { productId });

    request
      .then(() => {
        setWishlistIds((prev) => {
          const next = new Set(prev);
          if (isWishlisted) {
            next.delete(productId);
          } else {
            next.add(productId);
          }
          return next;
        });
        toast.info(
          isWishlisted
            ? "Product removed from your wishlist"
            : "Product successfully added to your wishlist"
        );
      })
      .catch(() => {
        toast.error(
          isWishlisted
            ? "Could not remove this item from your wishlist"
            : "Could not add this item to your wishlist"
        );
      });
  };

  return { wishlistIds, toggleWishlist };
};

export default useWishlist;
