import { useSearchParams } from "react-router";
import {
  Search,
  X,
  SlidersHorizontal,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import useResource from "../hooks/useResource";
import { categories } from "../lib/api";
import {
  ProductCard,
  PageTitle,
  Empty,
  Loading,
  ErrorState,
} from "../ui/shared";
export default function Marketplace() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "",
    category = params.get("category") || "",
    sort = params.get("sort") || "newest",
    page = Math.max(1, Number(params.get("page")) || 1);
  const query = new URLSearchParams({
    q,
    category,
    sort,
    page: String(page),
    limit: "12",
  });
  const { data, loading, error, reload } = useResource(`/listings?${query}`);
  function change(key, value) {
    const next = new URLSearchParams(params);
    next.delete("page");
    value ? next.set(key, value) : next.delete(key);
    setParams(next);
  }
  return (
    <div className="container marketplace-page">
      <title>Discover — ComunityBazar</title>
      <PageTitle
        eyebrow="THE MARKETPLACE"
        title="Find your next good thing."
        description="Useful, unexpected, and ready for a new home."
      />
      <div className="market-toolbar">
        <form
          className="search-field"
          onSubmit={(e) => {
            e.preventDefault();
            change("q", new FormData(e.currentTarget).get("q"));
          }}
          key={q}
        >
          <Search size={18} />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search for a good find…"
            aria-label="Search listings"
          />
          <button className="button small" type="submit">
            Search
          </button>
        </form>
        <label className="sort-field">
          <SlidersHorizontal size={17} />
          <span className="sr-only">Sort listings</span>
          <select value={sort} onChange={(e) => change("sort", e.target.value)}>
            <option value="newest">Recently added</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </label>
      </div>
      <div className="filter-chips" aria-label="Filter by category">
        {["", ...categories].map((c) => (
          <button
            className={c === category ? "selected" : ""}
            aria-pressed={c === category}
            key={c}
            onClick={() => change("category", c)}
          >
            {c || "All finds"}
          </button>
        ))}
      </div>
      <div className="results-label">
        <span>
          {loading
            ? "Finding good things…"
            : `${data?.total || 0} ${data?.total === 1 ? "find" : "finds"}${q ? ` for “${q}”` : ""}`}
        </span>
        {(q || category) && (
          <button className="text-link" onClick={() => setParams({})}>
            Clear filters <X size={14} />
          </button>
        )}
      </div>
      {loading ? (
        <Loading cards />
      ) : error ? (
        <ErrorState message={error} retry={reload} />
      ) : data?.items.length ? (
        <>
          <div className="product-grid market-products">
            {data.items.map((item) => (
              <ProductCard key={item._id} item={item} />
            ))}
          </div>
          {data.pages > 1 && (
            <nav className="pagination" aria-label="Listing pages">
              <button
                className="button secondary"
                disabled={page <= 1}
                onClick={() =>
                  setParams({
                    ...Object.fromEntries(params),
                    page: String(page - 1),
                  })
                }
              >
                <ArrowLeft size={16} />
                Previous
              </button>
              <span>
                Page {page} of {data.pages}
              </span>
              <button
                className="button secondary"
                disabled={page >= data.pages}
                onClick={() =>
                  setParams({
                    ...Object.fromEntries(params),
                    page: String(page + 1),
                  })
                }
              >
                Next
                <ArrowRight size={16} />
              </button>
            </nav>
          )}
        </>
      ) : (
        <Empty
          title="No finds this time"
          text="Try another search or a different category. Your next favorite might be one click away."
          action={
            <button className="button secondary" onClick={() => setParams({})}>
              See all listings
            </button>
          }
        />
      )}
    </div>
  );
}
