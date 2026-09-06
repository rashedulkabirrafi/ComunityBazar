import { useCallback, useState } from "react";
import { Link } from "react-router";
import { Archive } from "lucide-react";
import { api, money } from "../lib/api";
import useResource from "../hooks/useResource";
import {
  PageTitle,
  ProductImage,
  Loading,
  ErrorState,
  Notice,
  Empty,
  Dialog,
} from "../ui/shared";
export default function AllProducts() {
  const { data, loading, error, reload } = useResource("/admin/listings");
  const [search, setSearch] = useState(""),
    [selected, setSelected] = useState(null),
    [busy, setBusy] = useState(false),
    [failure, setFailure] = useState("");
  const close = useCallback(() => setSelected(null), []);
  async function archive() {
    setBusy(true);
    try {
      await api(`/listings/${selected._id}`, { method: "DELETE" });
      close();
      reload();
    } catch (err) {
      setFailure(err.message);
      close();
    } finally {
      setBusy(false);
    }
  }
  const rows = data?.filter((item) =>
    (item.name + " " + item.email).toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <title>All listings — ComunityBazar</title>
      <PageTitle
        eyebrow="COMMUNITY OPERATIONS"
        title="Keep good things in view."
        description="Review listings and archive items that don’t belong."
      />
      <Notice message={failure} tone="error" />
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} retry={reload} />
      ) : (
        <>
          <label className="field">
            <span>Find a listing</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by item or seller email"
            />
          </label>
          {!rows.length ? (
            <Empty
              title="No listings found"
              text="Try another search, or check back as the community grows."
            />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Seller</th>
                    <th>Price</th>
                    <th>Available</th>
                    <th>Manage</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((item) => (
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
                      <td>{item.email}</td>
                      <td>{money(item.price)}</td>
                      <td>{item.stock || 0}</td>
                      <td>
                        <button
                          className="icon-button"
                          aria-label={`Archive ${item.name}`}
                          onClick={() => setSelected(item)}
                        >
                          <Archive size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p style={{ fontSize: 11, marginTop: 18 }}>
            Showing up to 500 active listings.
          </p>
        </>
      )}
      {selected && (
        <Dialog title="Archive this listing?" onClose={close}>
          <p>
            “{selected.name}” will be hidden from the marketplace. Existing
            orders remain available.
          </p>
          <div className="dialog-actions">
            <button className="button secondary" onClick={close}>
              Keep listing
            </button>
            <button className="button danger" disabled={busy} onClick={archive}>
              Archive listing
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}
