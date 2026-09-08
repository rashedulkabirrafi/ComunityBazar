import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  MapPin,
  PackageOpen,
  ShieldCheck,
  Star,
} from "lucide-react";
import useResource from "../hooks/useResource";
import {
  ProductCard,
  ProductImage,
  Empty,
  Loading,
  ErrorState,
  BackToMarket,
} from "../ui/shared";
export default function SellerProfile() {
  const { id } = useParams();
  const { data, loading, error, reload } = useResource(`/seller/${id}`);
  if (loading)
    return (
      <div className="container section-space">
        <Loading />
      </div>
    );
  if (error)
    return (
      <div className="container section-space">
        <ErrorState message={error} retry={reload} />
      </div>
    );
  const since = data.memberSince
    ? new Date(data.memberSince).getFullYear()
    : null;
  const areas = [
    ...new Set(
      data.listings
        .map((item) => (item.location || "").split(",")[0].trim())
        .filter(Boolean),
    ),
  ];
  return (
    <div className="container seller-page">
      <title>{`${data.name} — ComunityBazar`}</title>
      <Link className="text-link back-link" to="/Marketplace">
        <ArrowLeft size={16} />
        Back to the marketplace
      </Link>
      <header className="seller-hero">
        <span className="seller-avatar">
          {data.image ? (
            <ProductImage src={data.image} alt="" />
          ) : (
            data.name[0].toUpperCase()
          )}
        </span>
        <div className="seller-headline">
          <p className="eyebrow">A COMMUNITY SELLER</p>
          <h1>{data.name}</h1>
          <p className="seller-lede">
            {since
              ? `Sharing good things with the community since ${since}.`
              : "Sharing good things with the community."}
          </p>
          {areas.length > 0 && (
            <p className="seller-areas">
              <MapPin size={14} />
              Usually meets around {areas.slice(0, 3).join(", ")}
              {areas.length > 3 ? " and nearby" : ""}
            </p>
          )}
        </div>
        <dl className="seller-stats">
          <div>
            <dt>Listings</dt>
            <dd>{data.total}</dd>
          </div>
          <div>
            <dt>Rating</dt>
            <dd>
              {data.rating ? (
                <>
                  <Star size={15} fill="currentColor" />
                  {data.rating.toFixed(1)}
                </>
              ) : (
                "New"
              )}
            </dd>
          </div>
          <div>
            <dt>Reviews</dt>
            <dd>{data.reviews}</dd>
          </div>
        </dl>
      </header>
      <section className="seller-listings">
        <div className="section-heading">
          <h2>
            {data.total
              ? `Available from ${data.name}`
              : "Nothing available right now"}
          </h2>
          {data.total > data.listings.length && (
            <span className="results-count">
              Showing {data.listings.length} of {data.total}
            </span>
          )}
        </div>
        {data.listings.length ? (
          <div className="product-grid">
            {data.listings.map((item) => (
              <ProductCard key={item._id} item={item} />
            ))}
          </div>
        ) : (
          <Empty
            title="No listings at the moment"
            text="This member has nothing available right now. Their next good find might be just around the corner."
            action={<BackToMarket />}
          />
        )}
      </section>
      <div className="safety-note seller-safety">
        <ShieldCheck size={20} />
        <span>
          Meet in a public place, inspect the item, and pay at handover.{" "}
          <Link className="text-link" to="/safety">
            Read our safety guide
          </Link>
        </span>
      </div>
      <p className="seller-footnote">
        <PackageOpen size={15} />
        Every listing here is offered by a community member, not by
        ComunityBazar.
      </p>
    </div>
  );
}
