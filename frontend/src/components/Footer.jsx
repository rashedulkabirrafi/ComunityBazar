import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { Brand } from "../ui/shared";
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Brand light />
          <p>
            A second life for good things.
            <br />A closer connection to your community.
          </p>
        </div>
        <div>
          <h3>Make yourself at home</h3>
          <Link to="/Marketplace">Explore the marketplace</Link>
          <Link to="/dashboard/AddListing">
            Sell something good <ArrowUpRight size={13} />
          </Link>
          <Link to="/dashboard/MyProfile">Your account</Link>
        </div>
        <div>
          <h3>A better way to trade</h3>
          <Link to="/about">How it works</Link>
          <Link to="/safety">Trading safely</Link>
          <Link to="/privacy">Privacy & your data</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} ComunityBazar</span>
        <span>Made for the things worth passing on.</span>
      </div>
    </footer>
  );
}
