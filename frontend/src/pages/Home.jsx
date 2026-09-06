import { Link, useNavigate } from "react-router";
import {
  ArrowUpRight,
  ArrowRight,
  Search,
  Smartphone,
  BookOpen,
  Armchair,
  Shirt,
  Bike,
  Watch,
  MoveUpRight,
  Leaf,
  MapPin,
} from "lucide-react";
import useResource from "../hooks/useResource";
import { ProductCard, Loading, ErrorState, Empty } from "../ui/shared";
const categories = [
  ["Electronics", Smartphone],
  ["Books", BookOpen],
  ["Home & Living", Armchair],
  ["Clothes & Fashion", Shirt],
  ["Sports & Outdoors", Bike],
  ["Accessories", Watch],
];
export default function Home() {
  const navigate = useNavigate();
  const { data, loading, error, reload } = useResource("/listings?limit=4");
  return (
    <>
      <title>ComunityBazar — Good finds, close by</title>
      <section className="hero-section container">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="live-dot" />
            YOUR COMMUNITY. YOUR NEXT FIND.
          </p>
          <h1>
            Good things.
            <br />
            New <em>beginnings.</em>
          </h1>
          <p className="hero-description">
            Find something you love. Pass on something you don’t.
            <br className="desktop-only" /> A thoughtful marketplace for the
            people around you.
          </p>
          <form
            className="hero-search"
            onSubmit={(e) => {
              e.preventDefault();
              navigate(
                `/Marketplace?q=${encodeURIComponent(new FormData(e.currentTarget).get("q"))}`,
              );
            }}
          >
            <Search size={21} />
            <input
              name="q"
              aria-label="Search the marketplace"
              placeholder="What are you looking for?"
            />
            <button type="submit" aria-label="Search">
              <ArrowRight />
            </button>
          </form>
          <div className="hero-notes">
            <span>
              <MapPin size={16} />
              Discover locally
            </span>
            <span>
              <Leaf size={16} />
              Give good things another life
            </span>
          </div>
        </div>
        <div className="hero-art">
          <div className="hero-photo">
            <img
              src="/demo/chair.jpg"
              alt="A comfortable accent chair in a sunlit room"
              fetchPriority="high"
            />
            <span className="photo-label">
              A new home for your next favorite.
            </span>
          </div>
          <div className="floating-label">
            <span className="round-icon">
              <MoveUpRight size={22} />
            </span>
            <div>
              <strong>Pre-loved. Re-loved.</strong>
              <span>Great finds deserve a second act.</span>
            </div>
          </div>
          <div className="orbit-note">
            LESS WASTE.
            <br />
            <strong>MORE POSSIBILITY.</strong>
          </div>
        </div>
      </section>
      <section className="category-band">
        <div className="container">
          <div className="section-heading compact">
            <h2>A little bit of everything.</h2>
            <Link className="text-link" to="/Marketplace">
              Browse all <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="category-grid">
            {categories.map(([name, Icon]) => (
              <Link
                to={`/Marketplace?category=${encodeURIComponent(name)}`}
                key={name}
              >
                <span>
                  <Icon size={24} strokeWidth={1.4} />
                </span>
                {name}
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="container section-space">
        <div className="section-heading">
          <div>
            <p className="eyebrow">FRESH ON THE MARKET</p>
            <h2>
              One person’s extra.
              <br />
              Your next favorite.
            </h2>
          </div>
          <Link className="button secondary" to="/Marketplace">
            Explore all finds <ArrowUpRight size={17} />
          </Link>
        </div>
        {loading ? (
          <Loading cards />
        ) : error ? (
          <ErrorState message={error} retry={reload} />
        ) : data?.items.length ? (
          <div className="product-grid">
            {data.items.map((item) => (
              <ProductCard key={item._id} item={item} />
            ))}
          </div>
        ) : (
          <Empty
            title="Be the first to share something good"
            action={
              <Link className="button" to="/dashboard/AddListing">
                Create a listing
              </Link>
            }
          />
        )}
      </section>
      <section className="container editorial">
        <div>
          <p className="eyebrow">MAKE ROOM FOR WHAT’S NEXT</p>
          <h2>
            Your shelf has
            <br />
            someone’s <em>next story.</em>
          </h2>
          <p>
            That camera you upgraded. The chair you outgrew. The books you
            couldn’t put down. Give them a new beginning.
          </p>
          <Link className="button" to="/dashboard/AddListing">
            Let it find a new home <ArrowUpRight size={18} />
          </Link>
        </div>
        <img
          src="/demo/books.jpg"
          alt="Books ready for their next reader"
          loading="lazy"
        />
      </section>
      <section className="container section-space">
        <div className="section-heading">
          <div>
            <p className="eyebrow">SIMPLE BY DESIGN</p>
            <h2>Good exchanges start here.</h2>
          </div>
          <Link className="text-link" to="/about">
            A closer look <ArrowRight size={18} />
          </Link>
        </div>
        <div className="steps-grid">
          {[
            [
              "01",
              "Find your kind of thing",
              "Browse by category, discover a new favorite, and save the things that catch your eye.",
            ],
            [
              "02",
              "Make it yours",
              "Add items to your bag and place an order with your handover preferences.",
            ],
            [
              "03",
              "Give it a new beginning",
              "Arrange the handover, inspect your item, and pay when you’re happy with it.",
            ],
          ].map(([n, t, d]) => (
            <article key={n}>
              <span>{n}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
