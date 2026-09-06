import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ImagePlus, ArrowUpRight } from "lucide-react";
import { api, categories, uploadImage } from "../lib/api";
import useResource from "../hooks/useResource";
import { PageTitle, Field, Notice, Loading, ErrorState } from "../ui/shared";
export default function AddListing() {
  const [params] = useSearchParams();
  const edit = params.get("edit");
  const { data, error, loading } = useResource(
    edit ? `/listing/${edit}` : null,
  );
  return edit ? (
    loading ? (
      <Loading />
    ) : error ? (
      <ErrorState message={error} />
    ) : (
      <ListingForm key={edit} item={data} />
    )
  ) : (
    <ListingForm />
  );
}
function ListingForm({ item }) {
  const [image, setImage] = useState(null),
    [preview, setPreview] = useState(item?.image || ""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    if (!image) return;
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const form = Object.fromEntries(new FormData(e.currentTarget));
      delete form.photo;
      const imageUrl = image ? await uploadImage(image) : item?.image;
      if (!imageUrl)
        throw new Error("Add a photo so people can see your item.");
      await api(item ? `/listings/${item._id}` : "/listings", {
        method: item ? "PATCH" : "POST",
        body: { ...form, image: imageUrl },
      });
      navigate("/dashboard/MyListing", {
        state: item
          ? "Your listing has been updated."
          : "Your listing is live. Let’s find it a new home.",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <title>{`${item ? "Edit listing" : "Sell an item"} — ComunityBazar`}</title>
      <PageTitle
        eyebrow="PASS ON SOMETHING GOOD"
        title={item ? "A little refresh." : "What’s ready for a new home?"}
        description="A clear photo and an honest description go a long way."
      />
      <div className="panel form-panel">
        <Notice message={error} tone="error" />
        <form onSubmit={submit}>
          <label className="upload-box">
            {preview ? (
              <img src={preview} alt="Listing preview" />
            ) : (
              <ImagePlus size={32} strokeWidth={1.3} />
            )}
            <span>
              {preview
                ? "Choose a different photo"
                : "Add a photo of your item"}
            </span>
            <small>PNG, JPEG, WebP or GIF · Up to 5 MB</small>
            <input
              type="file"
              name="photo"
              aria-label="Item photo"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={(e) => setImage(e.target.files[0] || null)}
            />
          </label>
          <Field label="What are you selling?">
            <input
              name="name"
              maxLength={100}
              required
              defaultValue={item?.name}
              placeholder="e.g. A well-loved oak reading chair"
            />
          </Field>
          <div className="form-grid">
            <Field label="Category">
              <select
                name="category"
                defaultValue={item?.category || ""}
                required
              >
                <option value="" disabled>
                  Choose a category
                </option>
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Condition">
              <select
                name="productType"
                defaultValue={item?.productType || "Used"}
              >
                {["New", "Like new", "Used"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Price (৳)">
              <input
                name="price"
                type="number"
                min="1"
                max="10000000"
                step="0.01"
                required
                defaultValue={item?.price}
                placeholder="Your asking price"
              />
            </Field>
            <Field label="Quantity available">
              <input
                name="stock"
                type="number"
                min="1"
                max="100"
                defaultValue={Math.max(1, item?.stock || 1)}
                required
              />
            </Field>
          </div>
          <Field
            label="Your area"
            hint="Use a neighborhood or campus name. Keep your home address private."
          >
            <input
              name="location"
              maxLength={120}
              required
              defaultValue={item?.location}
              placeholder="e.g. Dhanmondi, Dhaka"
            />
          </Field>
          <Field
            label="Tell its story"
            hint="Include dimensions, age, what’s included, and any wear or faults."
          >
            <textarea
              name="description"
              maxLength={3000}
              required
              defaultValue={item?.description}
              placeholder="What should its next owner know?"
            />
          </Field>
          <div className="form-actions">
            <p>
              Only list items you own and are allowed to sell. Keep descriptions
              accurate.
            </p>
            <button className="button" disabled={busy}>
              {busy
                ? "Saving your listing…"
                : item
                  ? "Save listing"
                  : "Publish listing"}
              <ArrowUpRight size={17} />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
