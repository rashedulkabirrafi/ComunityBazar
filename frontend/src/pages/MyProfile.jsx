import { useContext, useState } from "react";
import { updateProfile } from "firebase/auth";
import { Camera, Check } from "lucide-react";
import auth from "../firebase/firebase.config";
import { AuthContext } from "../Provider/AuthProvider";
import { api, uploadImage } from "../lib/api";
import { PageTitle, Field, Notice, Status } from "../ui/shared";
export default function MyProfile() {
  const { user, profile, refreshProfile } = useContext(AuthContext);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const form = new FormData(e.currentTarget);
    try {
      const file = form.get("photo");
      const mainImageUrl = file?.size
        ? await uploadImage(file)
        : profile.mainImageUrl;
      await api(`/users/profile/${encodeURIComponent(user.email)}`, {
        method: "PATCH",
        body: {
          name: form.get("name"),
          ...(mainImageUrl ? { mainImageUrl } : {}),
        },
      });
      await updateProfile(auth.currentUser, {
        displayName: form.get("name"),
        ...(mainImageUrl ? { photoURL: mainImageUrl } : {}),
      });
      await refreshProfile();
      setMessage("Your profile is up to date.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <title>Your profile — ComunityBazar</title>
      <PageTitle
        eyebrow="YOUR ACCOUNT"
        title="Make yourself at home."
        description="A familiar face makes for a better community."
      />
      <div className="panel form-panel">
        <div className="profile-head">
          <div className="profile-avatar">
            {profile?.mainImageUrl ? (
              <img src={profile.mainImageUrl} alt="Your profile" />
            ) : (
              (profile?.name || "C")[0]
            )}
          </div>
          <div>
            <h2>{profile?.name}</h2>
            <p>{user.email}</p>
          </div>
          <Status status={profile?.role === "admin" ? "admin" : "member"} />
        </div>
        <Notice message={error} tone="error" />
        <Notice message={message} />
        <form onSubmit={save}>
          <div className="form-grid">
            <Field label="Your name">
              <input
                name="name"
                required
                maxLength={80}
                defaultValue={profile?.name}
                autoComplete="name"
              />
            </Field>
            <Field
              label="Email address"
              hint="Your sign-in email cannot be changed here."
            >
              <input value={user.email} disabled />
            </Field>
          </div>
          <Field
            label={
              <>
                <Camera size={14} /> Profile photo
              </>
            }
            hint="Optional · PNG, JPEG, WebP or GIF · Up to 5 MB"
          >
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              name="photo"
            />
          </Field>
          <div className="form-actions">
            <p>
              Your name and photo may be visible with your listings and reviews.
            </p>
            <button className="button" disabled={busy}>
              <Check size={16} />
              {busy ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
