import { useContext, useState } from "react";
import { ShoppingBag, X } from "lucide-react";
import { AuthContext } from "../Provider/AuthProvider";
import { api } from "../lib/api";
import useResource from "../hooks/useResource";
import {
  PageTitle,
  ProductCard,
  Empty,
  Loading,
  ErrorState,
  Notice,
  BackToMarket,
} from "../ui/shared";
export default function MyWishlist() {
  const { user } = useContext(AuthContext);
  const { data, loading, error, reload } = useResource(
    `/wishlist/${encodeURIComponent(user.email)}`,
  );
  const [busy, setBusy] = useState(""),
    [message, setMessage] = useState(""),
    [failure, setFailure] = useState("");
  async function action(item, remove = false) {
    setBusy(item._id);
    setFailure("");
    setMessage("");
    try {
      if (remove) {
        await api(`/wishlist/${item._id}`, { method: "DELETE" });
        reload();
      } else {
        const result = await api("/cart", {
          method: "POST",
          body: { productId: item.productId },
        });
        setMessage(
          result.duplicate
            ? `Your bag now holds ${result.quantity ?? 1} of these.`
            : "Added to your shopping bag.",
        );
      }
    } catch (err) {
      setFailure(err.message);
    } finally {
      setBusy("");
    }
  }
  return (
    <>
      <title>Saved finds — ComunityBazar</title>
      <PageTitle
        eyebrow="WORTH ANOTHER LOOK"
        title="Your saved finds."
        description="A little collection of things that caught your eye."
      />
      <Notice message={message} onClose={() => setMessage("")} />
      <Notice message={failure} tone="error" />
      {loading ? (
        <Loading cards />
      ) : error ? (
        <ErrorState message={error} retry={reload} />
      ) : !data?.length ? (
        <Empty
          title="Keep your favorites close"
          text="Save a listing with the heart button and find it here whenever you’re ready."
          action={<BackToMarket />}
        />
      ) : (
        <div className="product-grid">
          {data.map((item) => (
            <ProductCard
              key={item._id}
              saveable={false}
              item={{ ...item, _id: item.productId }}
              footer={
                <div className="card-actions">
                  <button
                    className="button secondary small"
                    disabled={!!busy}
                    onClick={() => action(item)}
                  >
                    <ShoppingBag size={14} />
                    Add to bag
                  </button>
                  <button
                    className="icon-button"
                    aria-label={`Unsave ${item.name}`}
                    disabled={!!busy}
                    onClick={() => action(item, true)}
                  >
                    <X size={17} />
                  </button>
                </div>
              }
            />
          ))}
        </div>
      )}
    </>
  );
}
