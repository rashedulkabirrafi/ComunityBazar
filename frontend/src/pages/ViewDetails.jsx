import { useContext, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  MapPin,
  Heart,
  ShoppingBag,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { AuthContext } from "../Provider/AuthProvider";
import { api, money } from "../lib/api";
import useResource from "../hooks/useResource";
import {
  ProductImage,
  Notice,
  Loading,
  ErrorState,
  QuantityPicker,
} from "../ui/shared";
export default function ViewDetails() {
  const { id } = useParams(),
    navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { data: item, loading, error, reload } = useResource(`/listing/${id}`);
  const reviews = useResource(`/reviews/product/${id}`);
  const [busy, setBusy] = useState(""),
    [message, setMessage] = useState(""),
    [failure, setFailure] = useState(""),
    [quantity, setQuantity] = useState(1);
  async function add(type) {
    if (!user) {
      navigate("/Login", { state: `/ViewDetails/${id}` });
      return;
    }
    setBusy(type);
    setFailure("");
    setMessage("");
    try {
      const result = await api(`/${type}`, {
        method: "POST",
        body: { productId: id, ...(type === "cart" ? { quantity } : {}) },
      });
      setMessage(
        result.duplicate
          ? type === "cart"
            ? `Your bag now holds ${result.quantity ?? quantity} of these.`
            : "This find is already in your saved list."
          : type === "cart"
            ? quantity > 1
              ? `Added ${quantity} to your shopping bag.`
              : "Added to your shopping bag."
            : "Saved for another look.",
      );
    } catch (err) {
      setFailure(err.message);
    } finally {
      setBusy("");
    }
  }
  if (loading) return <Loading />;
  if (error)
    return (
      <div className="container section-space">
        <ErrorState message={error} retry={reload} />
      </div>
    );
  return (
    <div className="container detail-page">
      <title>{`${item.name} — ComunityBazar`}</title>
      <div className="breadcrumbs">
        <Link to="/Marketplace">Marketplace</Link>
        <ChevronRight size={12} />
        <Link to={`/Marketplace?category=${encodeURIComponent(item.category)}`}>
          {item.category}
        </Link>
      </div>
      <div className="detail-grid">
        <div className="detail-image">
          <ProductImage src={item.image} alt={item.name} />
        </div>
        <div className="detail-info">
          <p className="eyebrow">A GOOD FIND IN {item.location}</p>
          <span className="status">{item.productType}</span>
          <h1>{item.name}</h1>
          <div className="detail-price">{money(item.price)}</div>
          <div className="detail-meta">
            <span>
              <MapPin size={15} />
              {item.location}
            </span>
            <span>
              {item.stock > 0
                ? `${item.stock} available`
                : "Currently unavailable"}
            </span>
          </div>
          <p className="detail-description">{item.description}</p>
          <Notice message={message} />
          <Notice message={failure} tone="error" />
          {item.stock > 0 && (
            <div className="detail-buy">
              <div className="detail-buy-row">
                <span className="detail-buy-label">Quantity</span>
                <QuantityPicker
                  value={quantity}
                  max={Math.max(1, Math.min(20, item.stock))}
                  disabled={!!busy}
                  label={`quantity of ${item.name}`}
                  onChange={setQuantity}
                />
              </div>
              <div className="detail-buy-row detail-subtotal">
                <span>
                  Subtotal · {quantity} × {money(item.price)}
                </span>
                <strong>{money(item.price * quantity)}</strong>
              </div>
            </div>
          )}
          <div className="detail-buttons">
            <button
              className="button"
              disabled={!!busy || item.stock < 1}
              onClick={() => add("cart")}
            >
              <ShoppingBag size={18} />
              {busy === "cart" ? "Adding…" : "Add to bag"}
            </button>
            <button
              className="button secondary"
              disabled={!!busy || item.stock < 1}
              onClick={() => add("wishlist")}
            >
              <Heart size={18} />
              {busy === "wishlist" ? "Saving…" : "Save"}
            </button>
          </div>
          {message && (
            <Link className="text-link" to="/dashboard/MyCart">
              View your shopping bag →
            </Link>
          )}
          <div className="seller-card">
            <span className="avatar">{item.seller?.[0] || "C"}</span>
            <div>
              <strong>{item.seller}</strong>
              <small>
                Community member
                {item.sellerSince
                  ? ` since ${new Date(item.sellerSince).getFullYear()}`
                  : ""}
              </small>
            </div>
          </div>
          <div className="safety-note">
            <ShieldCheck size={20} />
            <span>
              Meet in a public place, inspect the item, and pay at handover.{" "}
              <Link className="text-link" to="/safety">
                Read our safety guide
              </Link>
            </span>
          </div>
        </div>
      </div>
      <section className="reviews-section">
        <h2>From the community</h2>
        {reviews.loading ? (
          <Loading />
        ) : reviews.error ? (
          <ErrorState message={reviews.error} retry={reviews.reload} />
        ) : reviews.data?.length ? (
          reviews.data.map((review) => (
            <article className="review" key={review._id}>
              <h3>{review.userName}</h3>
              <span
                className="stars"
                aria-label={`${review.rating} out of 5 stars`}
              >
                {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)}
              </span>
              <p>{review.review}</p>
            </article>
          ))
        ) : (
          <p>
            No reviews yet. Reviews can be shared after an order is completed.
          </p>
        )}
      </section>
    </div>
  );
}
