import { useContext, useState } from "react";
import { AuthContext } from "../Provider/AuthProvider";
import { api } from "../lib/api";
import useResource from "../hooks/useResource";
import {
  PageTitle,
  Loading,
  ErrorState,
  Notice,
  Status,
  Empty,
} from "../ui/shared";
export default function AllUsers() {
  const { profile } = useContext(AuthContext);
  const { data, loading, error, reload } = useResource("/users");
  const [search, setSearch] = useState(""),
    [busy, setBusy] = useState(""),
    [failure, setFailure] = useState(""),
    [message, setMessage] = useState("");
  async function change(member, body) {
    setBusy(member._id);
    setFailure("");
    try {
      await api(`/users/${member._id}`, { method: "PATCH", body });
      reload();
      setMessage("Member access updated.");
    } catch (err) {
      setFailure(err.message);
    } finally {
      setBusy("");
    }
  }
  const filtered = data?.filter((m) =>
    (m.name + " " + m.email).toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <title>Members — ComunityBazar</title>
      <PageTitle
        eyebrow="COMMUNITY OPERATIONS"
        title="People make the place."
        description="Manage community access and administrator roles."
      />
      <Notice message={message} />
      <Notice message={failure} tone="error" />
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} retry={reload} />
      ) : (
        <>
          <div className="metrics-row">
            <div className="metric">
              <strong>{data.length}</strong>
              <span>Members</span>
            </div>
            <div className="metric">
              <strong>{data.filter((m) => m.role === "admin").length}</strong>
              <span>Administrators</span>
            </div>
            <div className="metric">
              <strong>{data.filter((m) => m.disabled).length}</strong>
              <span>Disabled accounts</span>
            </div>
          </div>
          <label className="field">
            <span>Find a member</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email"
            />
          </label>
          {!filtered.length ? (
            <Empty
              title="No matching members"
              text="Try a different name or email address."
            />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Access</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((member) => (
                    <tr key={member._id}>
                      <td>
                        <strong>{member.name}</strong>
                        <small>{member.email}</small>
                      </td>
                      <td>
                        <select
                          aria-label={`Role for ${member.name}`}
                          value={member.role}
                          disabled={!!busy || member._id === profile?._id}
                          onChange={(e) =>
                            change(member, { role: e.target.value })
                          }
                        >
                          <option value="general user">Member</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </td>
                      <td>
                        <Status
                          status={member.disabled ? "disabled" : "active"}
                        />
                      </td>
                      <td>
                        <button
                          className="button secondary small"
                          disabled={!!busy || member._id === profile?._id}
                          onClick={() =>
                            change(member, { disabled: !member.disabled })
                          }
                        >
                          {member.disabled ? "Enable" : "Disable"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p style={{ fontSize: 11, marginTop: 18 }}>
            Showing up to 500 members. Your own administrator access cannot be
            changed here.
          </p>
        </>
      )}
    </>
  );
}
