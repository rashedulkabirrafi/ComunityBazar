import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useState,
} from "react";
import { Link } from "react-router";
import { ArrowRight, MapPin, PackageOpen, RefreshCw, X } from "lucide-react";
import { money } from "../lib/api";
export function Brand({ light = false }) {
  return (
    <Link
      className={`brand ${light ? "brand-light" : ""}`}
      to="/"
      aria-label="ComunityBazar home"
    >
      <img src="/brand-mark.svg" width="42" height="42" alt="" />
      <span>
        Comunity<span>Bazar</span>
        <small>GOOD FINDS. CLOSE BY.</small>
      </span>
    </Link>
  );
}
export function ProductImage({ src, alt, ...props }) {
  const [failed, setFailed] = useState(false);
  return src && !failed ? (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      {...props}
    />
  ) : (
    <div
      className="image-fallback"
      role="img"
      aria-label={alt || "No photo available"}
    >
      <PackageOpen size={38} />
      <span>No photo yet</span>
    </div>
  );
}
export function ProductCard({ item }) {
  return (
    <article className="product-card">
      <Link to={`/ViewDetails/${item._id}`} className="product-visual">
        <ProductImage src={item.image} alt={item.name} />
        <span className="condition">{item.productType || "Pre-loved"}</span>
      </Link>
      <div className="product-copy">
        <div className="eyebrow">{item.category}</div>
        <Link to={`/ViewDetails/${item._id}`}>
          <h3>{item.name}</h3>
        </Link>
        <div className="product-bottom">
          <strong>{money(item.price)}</strong>
          <span>
            <MapPin size={13} />
            {item.location || "Nearby"}
          </span>
        </div>
      </div>
    </article>
  );
}
export function PageTitle({ eyebrow, title, description, action }) {
  return (
    <div className="page-title">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function Empty({
  title = "Nothing here just yet",
  text = "Good things take a little time. Check back soon.",
  action,
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <PackageOpen size={30} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}
export function Loading({ cards = false }) {
  return cards ? (
    <div className="product-grid" aria-label="Loading listings" role="status">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="skeleton-card">
          <div />
          <span />
          <span />
        </div>
      ))}
    </div>
  ) : (
    <div className="loading-state" role="status">
      <RefreshCw className="spin" size={22} /> Loading…
    </div>
  );
}
export function ErrorState({ message, retry }) {
  return (
    <div className="error-state" role="alert">
      <strong>We couldn’t load this.</strong>
      <p>{message}</p>
      {retry && (
        <button className="button secondary" onClick={retry}>
          <RefreshCw size={16} />
          Try again
        </button>
      )}
    </div>
  );
}
export function Notice({ message, tone = "success", onClose }) {
  return message ? (
    <div
      className={`notice ${tone}`}
      role={tone === "error" ? "alert" : "status"}
    >
      {message}
      {onClose && (
        <button type="button" aria-label="Dismiss message" onClick={onClose}>
          <X size={16} />
        </button>
      )}
    </div>
  ) : null;
}
export function Field({ label, hint, controlId, hintId, children }) {
  const generated = useId();
  const id = controlId || generated;
  const describedBy = hint ? hintId || `${generated}-hint` : undefined;
  const control =
    controlId || !isValidElement(children)
      ? children
      : cloneElement(children, { id, "aria-describedby": describedBy });
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {control}
      {hint && <small id={describedBy}>{hint}</small>}
    </div>
  );
}
export function Status({ status }) {
  return <span className={`status status-${status}`}>{status}</span>;
}
export function BackToMarket() {
  return (
    <Link className="text-link" to="/Marketplace">
      Explore the marketplace <ArrowRight size={16} />
    </Link>
  );
}
export function Dialog({ title, children, onClose }) {
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = document.getElementById("active-dialog");
    dialog.showModal();
    const handler = (event) => {
      event.preventDefault();
      onClose();
    };
    dialog.addEventListener("cancel", handler);
    return () => {
      dialog.removeEventListener("cancel", handler);
      dialog.close();
      previous?.focus();
    };
  }, [onClose]);
  return (
    <dialog id="active-dialog" aria-labelledby="dialog-title">
      <div className="dialog-head">
        <h2 id="dialog-title">{title}</h2>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X />
        </button>
      </div>
      {children}
    </dialog>
  );
}
