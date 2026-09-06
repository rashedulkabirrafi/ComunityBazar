import { useContext, useState } from "react";
import { useLocation } from "react-router";
import { Star } from "lucide-react";
import { AuthContext } from "../Provider/AuthProvider";
import { api, money } from "../lib/api";
import useResource from "../hooks/useResource";
import {
  PageTitle,
  ProductImage,
  Empty,
  Loading,
  ErrorState,
  Notice,
  Field,
  Status,
  BackToMarket,
} from "../ui/shared";
export default function Orders({ admin = false }) {
  const { user } = useContext(AuthContext);
  const { data, loading, error, reload } = useResource(
    admin ? "/all-orders" : `/orders/${encodeURIComponent(user.email)}`,
  );
  const location = useLocation();
  const [message, setMessage] = useState(location.state || ""),
    [failure, setFailure] = useState(""),
    [busy, setBusy] = useState(""),
    [review, setReview] = useState(null);
  async function status(order, next) {
    setBusy(order._id);
    setFailure("");
    try {
      await api(`/orders/${order._id}/status`, {
        method: "PATCH",
        body: { status: next },
      });
      reload();
      setMessage("Order status updated.");
    } catch (err) {
      setFailure(err.message);
    } finally {
      setBusy("");
    }
  }
  async function submitReview(e) {
    e.preventDefault();
    setBusy("review");
    setFailure("");
    try {
      await api("/reviews", {
        method: "POST",
        body: {
          ...Object.fromEntries(new FormData(e.currentTarget)),
          orderId: review.orderId,
          productId: review.productId,
        },
      });
      setReview(null);
      setMessage("Thank you for sharing your experience.");
    } catch (err) {
      setFailure(err.message);
    } finally {
      setBusy("");
    }
  }
  return (
    <>
      <title>{`${admin ? "All orders" : "Your orders"} — ComunityBazar`}</title>
      <PageTitle
        eyebrow={admin ? "COMMUNITY OPERATIONS" : "YOUR GOOD FINDS"}
        title={
          admin ? "Every order, in one place." : "Their next chapter is yours."
        }
        description={
          admin
            ? "Manage handovers and keep order statuses accurate."
            : "Track your orders and share your experience after handover."
        }
      />
      <Notice message={message} onClose={() => setMessage("")} />
      <Notice message={failure} tone="error" />
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} retry={reload} />
      ) : !data?.length ? (
        <Empty
          title="No orders just yet"
          text="Your next good find is waiting in the marketplace."
          action={<BackToMarket />}
        />
      ) : (
        data.map((order) => (
          <article className="order-card" key={order._id}>
            <header className="order-header">
              <div>
                <strong>Order #{order._id.slice(-8).toUpperCase()}</strong>
                <small>
                  {new Date(order.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  {admin ? ` · ${order.name}` : ""}
                </small>
              </div>
              <Status status={order.status} />
            </header>
            <div className="order-body">
              {order.items.map((item) => (
                <div key={item.productId} className="line-item">
                  <div className="line-item-image">
                    <ProductImage src={item.image} alt={item.name} />
                  </div>
                  <div className="line-item-info">
                    <h3>{item.name}</h3>
                    <p>
                      {item.quantity} × {money(item.price)}
                    </p>
                    {!admin && order.status === "delivered" && (
                      <button
                        className="text-link"
                        style={{ marginTop: 8, fontSize: 11 }}
                        onClick={() =>
                          setReview({
                            orderId: order._id,
                            productId: item.productId,
                            name: item.name,
                          })
                        }
                      >
                        <Star size={13} />
                        Write a review
                      </button>
                    )}
                  </div>
                  <strong className="line-price">
                    {money(item.price * item.quantity)}
                  </strong>
                </div>
              ))}
              {review?.orderId === order._id && (
                <form className="review-form" onSubmit={submitReview}>
                  <h3>How was {review.name}?</h3>
                  <Field label="Your rating">
                    <select name="rating" defaultValue="5">
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? "star" : "stars"}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Your review">
                    <textarea
                      name="review"
                      required
                      maxLength={1500}
                      placeholder="Share an honest, helpful experience."
                    />
                  </Field>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button className="button small" disabled={!!busy}>
                      Publish review
                    </button>
                    <button
                      type="button"
                      className="button secondary small"
                      onClick={() => setReview(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
              {admin && (
                <p style={{ fontSize: 12, marginTop: 18, marginBottom: 0 }}>
                  <strong>Handover:</strong> {order.location}
                  <br />
                  {order.email} · {order.mobile}
                  {order.extraNote && (
                    <>
                      <br />
                      {order.extraNote}
                    </>
                  )}
                </p>
              )}
            </div>
            <footer className="order-footer">
              <span>
                Pay at handover · <strong>{money(order.totalPrice)}</strong>
              </span>
              {admin && ["placed", "confirmed"].includes(order.status) && (
                <label>
                  <span className="sr-only">
                    Update order {order._id.slice(-8)}
                  </span>
                  <select
                    disabled={!!busy}
                    value=""
                    onChange={(e) => status(order, e.target.value)}
                  >
                    <option value="" disabled>
                      Update status
                    </option>
                    {order.status === "placed" && (
                      <option value="confirmed">Confirm order</option>
                    )}
                    {order.status === "confirmed" && (
                      <option value="delivered">Mark completed</option>
                    )}
                    <option value="cancelled">Cancel & restore stock</option>
                  </select>
                </label>
              )}
              {!admin && (
                <span>
                  {order.status === "delivered"
                    ? "Handover complete"
                    : order.status === "cancelled"
                      ? "Order cancelled"
                      : "Awaiting handover"}
                </span>
              )}
            </footer>
          </article>
        ))
      )}
    </>
  );
}
