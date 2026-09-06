import { Link } from "react-router";
const content = {
  about: {
    eyebrow: "A BETTER WAY TO PASS IT ON",
    title: "Good exchanges, made simple.",
    sections: [
      [
        "Find something you love",
        "Search the marketplace, filter by category, and take a close look at the condition and description. Save interesting items for later or add them to your shopping bag.",
      ],
      [
        "Make a little room",
        "Sign in, photograph your item, and publish an honest description with a price and a general location. You can edit or archive your listings from Your space.",
      ],
      [
        "Arrange a handover",
        "Checkout records your order and preferred meeting details. An administrator coordinates the order status. We do not collect online payments: inspect your item and pay at handover.",
      ],
      [
        "Share an honest review",
        "After an administrator marks the order completed, you can review the items you received. Reviews are linked to completed orders.",
      ],
    ],
  },
  safety: {
    eyebrow: "LOOK OUT FOR EACH OTHER",
    title: "A safer way to meet and trade.",
    sections: [
      [
        "Keep it public",
        "Arrange handovers in a busy public place during daylight. Bring a friend if you can. Share only the contact information needed to arrange the exchange.",
      ],
      [
        "Take your time",
        "Inspect the item, check that electronics work, and compare the item with the listing before paying. Ask about damage, missing parts or repairs.",
      ],
      [
        "Keep payments straightforward",
        "This app does not process payments or provide escrow, buyer protection or delivery guarantees. Never pay a surprise fee to release an item. Do not share verification codes or banking passwords.",
      ],
      [
        "Trust your judgment",
        "If something feels wrong, do not complete the exchange. You can leave the meeting or decline the item. For immediate danger, contact local emergency services.",
      ],
    ],
  },
  privacy: {
    eyebrow: "YOUR INFORMATION",
    title: "A clear view of your data.",
    sections: [
      [
        "Account information",
        "Firebase handles sign-in credentials. ComunityBazar stores your name, email, optional photo, account role, and account status. Passwords are not sent to or stored in the application database.",
      ],
      [
        "Listings and reviews",
        "Listing photos, descriptions, approximate locations, seller names and reviews are public. Do not include private addresses, identification documents, or sensitive information in them.",
      ],
      [
        "Order information",
        "Orders contain your name, email, contact number, preferred handover details and purchased items. Your account and authorized administrators can access them.",
      ],
      [
        "Local development",
        "The demo runs a local authentication emulator and database. Uploaded demo photos stay on the machine hosting the API. Production operators must publish their contact details, retention policy and applicable privacy terms before launch.",
      ],
    ],
  },
};
export default function Info({ type = "about" }) {
  const page = content[type];
  return (
    <article className="prose-page">
      <title>{`${page.title} — ComunityBazar`}</title>
      <p className="eyebrow">{page.eyebrow}</p>
      <h1>{page.title}</h1>
      {page.sections.map(([title, body]) => (
        <section key={title}>
          <h2>{title}</h2>
          <p>{body}</p>
        </section>
      ))}
      <Link to="/Marketplace" className="button" style={{ marginTop: 20 }}>
        Explore the marketplace →
      </Link>
    </article>
  );
}
