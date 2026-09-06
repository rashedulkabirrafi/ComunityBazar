import { Link, useRouteError } from "react-router";
import { Brand } from "../ui/shared";
export default function ErrorPage() {
  const error = useRouteError();
  const missing = error?.status === 404;
  return (
    <main id="main-content" className="prose-page">
      <title>
        {`${missing ? "Page not found" : "Something went wrong"} — ComunityBazar`}
      </title>
      <Brand />
      <p className="eyebrow" style={{ marginTop: 70 }}>
        {missing
          ? "A LITTLE OFF THE BEATEN PATH"
          : "SOMETHING DIDN’T GO TO PLAN"}
      </p>
      <h1>{missing ? "This find isn’t here." : "Let’s try that again."}</h1>
      <p>
        {missing
          ? "The page may have moved, or the link may be out of date. There’s still plenty to discover."
          : "We couldn’t open this page. Return to the marketplace or reload to try again."}
      </p>
      <Link className="button" to="/">
        Back to home →
      </Link>
    </main>
  );
}
