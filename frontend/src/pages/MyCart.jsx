import { useContext, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowRight, Minus, Plus, Trash2, ShieldCheck } from "lucide-react";
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
  BackToMarket,
} from "../ui/shared";
export default function MyCart() {
  const { user, profile } = useContext(AuthContext);
  const { data, loading, error, reload } = useResource(
    `/cart/${encodeURIComponent(user.email)}`,
  );
  const [busy, setBusy] = useState(""),
    [failure, setFailure] = useState(""),
    [checkout, setCheckout] = useState(false);
  const key = useRef(crypto.randomUUID()),
    navigate = useNavigate();
  async function update(item, quantity) {
    setBusy(item._id);
    setFailure("");
    try {
      await api(`/cart/${item._id}`, {
        method: quantity === 0 ? "DELETE" : "PATCH",
        ...(quantity ? { body: { quantity } } : {}),
      });
      reload();
    } catch (err) {
      setFailure(err.message);
    } finally {
      setBusy("");
    }
  }
  async function order(e) {
    e.preventDefault();
    setBusy("order");
    setFailure("");
    try {
      await api("/orders", {
        method: "POST",
        body: {
          ...Object.fromEntries(new FormData(e.currentTarget)),
          idempotencyKey: key.current,
        },
      });
      navigate("/dashboard/MyOrders", {
        state: "Your order is placed. Payment is due at handover.",
      });
    } catch (err) {
      setFailure(err.message);
    } finally {
      setBusy("");
    }
  }
  const total = (data || []).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  return (
    <>
      <title>Shopping bag — ComunityBazar</title>
      <PageTitle
        eyebrow="ALMOST YOURS"
        title="A bag full of possibility."
        description="Take another look at the things you’ve found."
      />
      <Notice message={failure} tone="error" />
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} retry={reload} />
      ) : !data?.length ? (
        <Empty
          title="Something good belongs here"
          text="Explore the marketplace and add your next favorite to your bag."
          action={<BackToMarket />}
        />
      ) : (
        <div className="bag-layout">
          <div>
            <div className="panel">
              {data.map((item) => (
                <article className="line-item" key={item._id}>
                  <Link
                    className="line-item-image"
                    to={`/ViewDetails/${item.productId}`}
                  >
                    <ProductImage src={item.image} alt={item.name} />
                  </Link>
                  <div className="line-item-info">
                    <Link to={`/ViewDetails/${item.productId}`}>
                      <h3>{item.name}</h3>
                    </Link>
                    <p>{money(item.price)} each</p>
                    <div className="quantity">
                      <button
                        disabled={!!busy || item.quantity <= 1}
                        aria-label={`Decrease quantity of ${item.name}`}
                        onClick={() => update(item, item.quantity - 1)}
                      >
                        <Minus size={12} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        disabled={!!busy || item.quantity >= 20}
                        aria-label={`Increase quantity of ${item.name}`}
                        onClick={() => update(item, item.quantity + 1)}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="line-price">
                    {money(item.price * item.quantity)}
                    <button
                      className="icon-button"
                      aria-label={`Remove ${item.name}`}
                      disabled={!!busy}
                      onClick={() => update(item, 0)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
            {checkout && (
              <form
                className="panel"
                style={{ marginTop: 24 }}
                onSubmit={order}
              >
                <h2 style={{ fontSize: 22 }}>Plan the handover.</h2>
                <p style={{ fontSize: 12 }}>
                  Share a contact number and preferred public meeting location.
                  These details are visible to order administrators.
                </p>
                <Field label="Your name">
                  <input
                    name="name"
                    defaultValue={profile?.name}
                    required
                    maxLength={80}
                    autoComplete="name"
                  />
                </Field>
                <Field label="Contact number">
                  <input
                    name="mobile"
                    type="tel"
                    required
                    pattern="[+0-9 ()\-]{7,25}"
                    maxLength={25}
                    autoComplete="tel"
                    placeholder="e.g. 01712 345678"
                  />
                </Field>
                <Field label="Preferred meeting area">
                  <input
                    name="location"
                    required
                    maxLength={300}
                    placeholder="Choose a public place and suitable time"
                  />
                </Field>
                <Field label="Anything else? (optional)">
                  <textarea
                    name="extraNote"
                    maxLength={500}
                    placeholder="A convenient time, or a note about the handover"
                  />
                </Field>
                <button className="button full" disabled={!!busy}>
                  {busy === "order"
                    ? "Placing your order…"
                    : "Place order · " + money(total)}
                  <ArrowRight size={17} />
                </button>
              </form>
            )}
          </div>
          <aside className="panel summary">
            <h2>Your order summary</h2>
            <div className="summary-line">
              <span>
                Items ({data.reduce((sum, item) => sum + item.quantity, 0)})
              </span>
              <span>{money(total)}</span>
            </div>
            <div className="summary-line">
              <span>Handover</span>
              <span>Arrange locally</span>
            </div>
            <div className="summary-line summary-total">
              <span>Total</span>
              <span>{money(total)}</span>
            </div>
            {!checkout && (
              <button className="button full" onClick={() => setCheckout(true)}>
                Continue to checkout
                <ArrowRight size={17} />
              </button>
            )}
            <small>
              <ShieldCheck size={15} /> Pay at handover. No online payment is
              collected. Availability and prices are verified when you place
              your order.
            </small>
          </aside>
        </div>
      )}
    </>
  );
}
