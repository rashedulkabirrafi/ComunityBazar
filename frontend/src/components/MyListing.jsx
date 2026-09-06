import { useCallback, useContext, useState } from "react";
import { Link, useLocation } from "react-router";
import { Plus, Pencil, Archive } from "lucide-react";
import { AuthContext } from "../Provider/AuthProvider";
import { api, money } from "../lib/api";
import useResource from "../hooks/useResource";
import {
  PageTitle,
  Empty,
  Loading,
  ErrorState,
  Notice,
  ProductImage,
  Dialog,
} from "../ui/shared";
export default function MyListing() {
  const { user } = useContext(AuthContext);
  const { data, loading, error, reload } = useResource(
    `/listings/${encodeURIComponent(user.email)}`,
  );
  const location = useLocation();
  const [selected, setSelected] = useState(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(location.state || ""),
    [failure, setFailure] = useState("");
  const close = useCallback(() => setSelected(null), []);
  async function archive() {
    setBusy(true);
    try {
      await api(`/listings/${selected._id}`, { method: "DELETE" });
      close();
      setMessage("Your listing has been archived.");
      reload();
    } catch (err) {
      setFailure(err.message);
      close();
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <title>Your listings — ComunityBazar</title>
      <PageTitle
        eyebrow="THE THINGS YOU SHARE"
        title="Your listings."
        description="Give your good things the next chapter they deserve."
        action={
          <Link className="button small" to="/dashboard/AddListing">
            <Plus size={16} />
            New listing
          </Link>
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
          title="Your first listing starts here"
          text="Take a photo, tell its story, and let someone discover it."
          action={
            <Link className="button" to="/dashboard/AddListing">
              Sell an item
            </Link>
          }
        />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Manage</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item._id}>
                  <td>
                    <Link
                      className="table-product"
                      to={`/ViewDetails/${item._id}`}
                    >
                      <ProductImage src={item.image} alt="" />
                      <strong>{item.name}</strong>
                    </Link>
                  </td>
                  <td>{money(item.price)}</td>
                  <td>{item.stock || 0}</td>
                  <td>
                    <Link
                      className="icon-button"
                      aria-label={`Edit ${item.name}`}
                      to={`/dashboard/AddListing?edit=${item._id}`}
                    >
                      <Pencil size={16} />
                    </Link>
                    <button
                      className="icon-button"
                      aria-label={`Archive ${item.name}`}
                      onClick={() => setSelected(item)}
                    >
                      <Archive size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {selected && (
        <Dialog title="Archive this listing?" onClose={close}>
          <p>
            “{selected.name}” will no longer appear in the marketplace. Existing
            orders will be kept.
          </p>
          <div className="dialog-actions">
            <button className="button secondary" onClick={close}>
              Keep listing
            </button>
            <button className="button danger" disabled={busy} onClick={archive}>
              {busy ? "Archiving…" : "Archive listing"}
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}
