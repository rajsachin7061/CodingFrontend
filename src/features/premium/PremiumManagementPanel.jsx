/* eslint-disable react/prop-types */
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../../api";
import "./premium.css";

const parseResponse = async (response) => {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || "The administrator request failed.");
  }
  return payload;
};

const formatCurrency = (paise) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
        new Date(value),
      )
    : "—";

export default function PremiumManagementPanel() {
  const [overview, setOverview] = useState(null);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadOverview = useCallback(async (term = "") => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (term.trim()) params.set("search", term.trim());
      const suffix = params.size ? `?${params}` : "";
      const payload = await parseResponse(
        await apiFetch(`/api/premium/admin/overview${suffix}`, {
          authRole: "admin",
        }),
      );
      setOverview(payload);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOverview(query);
  }, [loadOverview, query]);

  const updatePlan = async (event, plan) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const amount = Number(formData.get("amount"));
    const features = String(formData.get("features") || "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    setLoading(true);
    setError("");
    setNotice("");
    try {
      await parseResponse(
        await apiFetch(
          `/api/premium/admin/plans/${encodeURIComponent(plan.code)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amount: Math.round(amount * 100),
              features,
            }),
            authRole: "admin",
          },
        ),
      );
      setNotice(`${plan.name} was updated.`);
      await loadOverview(query);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const refundPayment = async (payment) => {
    if (!window.confirm(`Request a full refund for ${formatCurrency(payment.amount)}?`)) {
      return;
    }
    setError("");
    setNotice("");
    try {
      await parseResponse(
        await apiFetch(
          `/api/premium/admin/payments/${encodeURIComponent(payment.paymentId)}/refund`,
          { method: "POST", authRole: "admin" },
        ),
      );
      setNotice("Refund request sent. Status updates after Razorpay confirmation.");
      await loadOverview(query);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <section className="premium-admin-page premium-admin-embedded">
      <h1>Premium management</h1>
      <p>
        Manage package pricing, subscribers, payment records, refunds, and
        revenue.
      </p>

      {error && <p className="premium-admin-error" role="alert">{error}</p>}
      {notice && <p role="status">{notice}</p>}

      <div className="premium-admin-panel">
        <div className="premium-section-heading">
          <h2>Overview</h2>
        </div>
        {loading && <p role="status">Loading premium records…</p>}
        {overview && (
          <div className="premium-admin-grid">
            {[
              ["DSA subscribers", overview.summary.dsaSubscribers],
              ["Practice subscribers", overview.summary.practiceSubscribers],
              ["Complete subscribers", overview.summary.completeSubscribers],
              ["Successful payments", overview.summary.successfulPayments],
              ["Failed payments", overview.summary.failedPayments],
              ["Refunded payments", overview.summary.refundedPayments],
              ["Net revenue", formatCurrency(overview.summary.revenue)],
            ].map(([label, value]) => (
              <div className="premium-admin-stat" key={label}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <section className="premium-admin-panel">
        <h2>Premium plans</h2>
        <div className="premium-admin-grid">
          {(overview?.plans || []).map((plan) => (
            <form
              className="premium-admin-form"
              key={plan.code}
              onSubmit={(event) => updatePlan(event, plan)}
            >
              <h3>{plan.name}</h3>
              <label>
                Price (INR)
                <input
                  defaultValue={(plan.amount / 100).toFixed(0)}
                  min="1"
                  name="amount"
                  required
                  step="1"
                  type="number"
                />
              </label>
              <label>
                Features (one per line)
                <textarea
                  defaultValue={plan.features.join("\n")}
                  name="features"
                  rows="5"
                />
              </label>
              <button disabled={loading} type="submit">
                Save plan
              </button>
            </form>
          ))}
        </div>
      </section>

      <section className="premium-admin-panel">
        <h2>Subscribers</h2>
        <form
          className="premium-admin-form"
          onSubmit={(event) => {
            event.preventDefault();
            setQuery(search);
          }}
        >
          <label>
            Search users
            <input
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name or email"
              value={search}
            />
          </label>
          <button type="submit">Search</button>
        </form>
        <div className="premium-table-wrap">
          <table className="premium-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Modules</th>
                <th>Purchase date</th>
              </tr>
            </thead>
            <tbody>
              {(overview?.users || []).map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    {user.entitlements
                      .filter((item) => item.status === "active")
                      .map((item) => item.module)
                      .join(", ") || "Free"}
                  </td>
                  <td>{formatDate(user.entitlements[0]?.purchaseDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="premium-admin-panel">
        <h2>Payments and refunds</h2>
        <div className="premium-table-wrap">
          <table className="premium-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment ID</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {(overview?.payments || []).map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.user || "—"}</td>
                  <td>{payment.planCode}</td>
                  <td>{formatCurrency(payment.amount)}</td>
                  <td>{payment.status.replaceAll("_", " ")}</td>
                  <td>{payment.paymentId || "—"}</td>
                  <td>{formatDate(payment.createdAt)}</td>
                  <td>
                    {payment.status === "captured" && (
                      <button
                        className="premium-admin-action"
                        onClick={() => refundPayment(payment)}
                        type="button"
                      >
                        Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
