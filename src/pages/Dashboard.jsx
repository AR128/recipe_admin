import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import api from "../api/axios";
import { useTheme } from "../context/useTheme";

const pageSize = 20;

const formatDate = (date) =>
  date
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
      }).format(new Date(date))
    : "—";

function StatCard({ label, value, note }) {
  return (
    <article className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#141412]">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C9A96E]">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
        {value ?? "—"}
      </p>
      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{note}</p>
    </article>
  );
}

function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 dark:border-slate-800">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium disabled:opacity-40 dark:border-slate-700 dark:text-slate-200"
      >
        Previous
      </button>
      <span className="text-sm text-slate-500 dark:text-slate-400">
        Page {page} of {pages}
      </span>
      <button
        type="button"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium disabled:opacity-40 dark:border-slate-700 dark:text-slate-200"
      >
        Next
      </button>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("posts");
  const [dashboard, setDashboard] = useState(null);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [actionId, setActionId] = useState("");

  const fetchPanel = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [dashboardResponse, panelResponse] = await Promise.all([
        api.get("/dashboard"),
        api.get(`/${activeTab}`, {
          params: { page, limit: pageSize, ...(search ? { search } : {}) },
        }),
      ]);
      setDashboard(dashboardResponse.data);
      const responseRows =
        activeTab === "posts"
          ? panelResponse.data.recipes
          : activeTab === "users"
            ? panelResponse.data.users
            : panelResponse.data.requests;
      setRows(responseRows || []);
      setPages(panelResponse.data.pages || 1);
      setTotal(panelResponse.data.total || 0);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Couldn't load the admin data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, search]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) fetchPanel();
    });
    return () => {
      active = false;
    };
  }, [fetchPanel]);

  const changeTab = (nextTab) => {
    setActiveTab(nextTab);
    setPage(1);
    setSearch("");
    setSearchInput("");
    setNotice("");
  };

  const refreshAfterAction = async (message) => {
    setNotice(message);
    await fetchPanel();
  };

  const deletePost = async (post) => {
    if (
      !window.confirm(
        `Permanently delete "${post.title}" and its comments? This cannot be undone.`
      )
    ) {
      return;
    }
    setActionId(post._id);
    setNotice("");
    setError("");
    try {
      await api.delete(`/posts/${post._id}`);
      await refreshAfterAction("Post and related data permanently deleted.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "The post could not be deleted."
      );
    } finally {
      setActionId("");
    }
  };

  const removeUser = async (account) => {
    if (
      !window.confirm(
        `Permanently remove ${account.fullName || account.name || account.username}? Their posts, comments, and saved references will also be deleted.`
      )
    ) {
      return;
    }
    setActionId(account._id);
    setNotice("");
    setError("");
    try {
      await api.delete(`/users/${account._id}`);
      await refreshAfterAction("User and associated content permanently removed.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "The user could not be removed."
      );
    } finally {
      setActionId("");
    }
  };

  const reviewAccessRequest = async (request, action) => {
    setActionId(request._id);
    setNotice("");
    setError("");
    try {
      await api.patch(`/access-requests/${request._id}`, { action });
      await refreshAfterAction(
        `Access request ${action === "approve" ? "approved" : "declined"}.`
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "The access request could not be reviewed."
      );
    } finally {
      setActionId("");
    }
  };

  const submitSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const tabs = [
    { id: "posts", label: "All posts" },
    { id: "users", label: "Users" },
    { id: "access-requests", label: "Access requests" },
  ];

  const openPost = (post) => {
    if (!post.slug) return;
    const frontendUrl =
      import.meta.env.VITE_FRONTEND_URL?.trim() || "http://localhost:5173";
    window.open(`${frontendUrl}/recipe/${encodeURIComponent(post.slug)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 transition-colors duration-200 dark:bg-[#0a0a0a] dark:text-[#F5F0E8]">
      <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/95 backdrop-blur-xl dark:border-white/10 dark:bg-[#0f0f0e]/95">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-[#C9A96E] to-[#E7CA8D] font-serif text-xl font-black text-[#121210] shadow-md shadow-[#C9A96E]/20">
              P
            </div>
            <div>
              <p className="font-serif text-lg font-bold leading-tight dark:text-white">
                Poodiest
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Platform administration</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{user?.email}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Administrator</p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-lg transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <button
              type="button"
              onClick={() => logout()}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C9A96E]">
              Control room
            </p>
            <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              Platform overview
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Review community content and manage accounts.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchPanel}
            className="self-start rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 md:self-auto dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            Refresh data
          </button>
        </div>

        <section className="mb-8 grid gap-4 sm:grid-cols-2">
          <StatCard
            label="Registered users"
            value={dashboard?.stats?.users}
            note="Active platform accounts"
          />
          <StatCard
            label="Community posts"
            value={dashboard?.stats?.posts}
            note="Published and unpublished"
          />
        </section>

        <section className="overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-[#141412]">
          <div className="flex flex-col gap-4 border-b border-neutral-200/80 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between dark:border-white/10">
            <nav className="flex flex-wrap gap-2" aria-label="Admin sections">
              {tabs.map((tab) => (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => changeTab(tab.id)}
                  className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                    activeTab === tab.id
                      ? "bg-[#C9A96E] text-[#121210]"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-white/5 dark:text-neutral-300 dark:hover:bg-white/10"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
            <form onSubmit={submitSearch} className="flex gap-2">
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder={
                    activeTab === "posts"
                      ? "Search posts or authors"
                      : activeTab === "users"
                        ? "Search users"
                        : "Search access requests"
                  }
                  className="min-w-0 flex-1 rounded-full border border-neutral-200 px-4 py-2.5 text-sm outline-none focus:border-[#C9A96E] sm:w-64 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white dark:placeholder-neutral-500"
                />
                <button
                  type="submit"
                  className="rounded-full bg-[#C9A96E] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#121210] transition hover:brightness-110"
                >
                  Search
                </button>
              </form>
          </div>

          {(error || notice) && (
            <div
              role={error ? "alert" : "status"}
              className={`mx-5 mt-5 rounded-lg border px-4 py-3 text-sm ${
                error
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-emerald-200 bg-emerald-50 text-emerald-800"
              }`}
            >
              {error || notice}
            </div>
          )}

          {loading ? (
            <div className="p-12 text-center text-sm text-slate-500 dark:text-slate-400">
              Loading platform data...
            </div>
          ) : rows.length === 0 ? (
            <div className="p-12 text-center">
              <p className="font-semibold text-slate-800 dark:text-slate-100">
                No {activeTab} found
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {search ? "Try a different search." : "Nothing to show here yet."}
              </p>
            </div>
          ) : (
            <>
              <div className="border-b border-slate-100 px-5 py-3 text-xs font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400">
                {total.toLocaleString()} {activeTab.replace("-", " ")}
              </div>
              {activeTab === "posts" && (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {rows.map((post) => (
                    <article
                      key={post._id}
                      role="link"
                      tabIndex={0}
                      onClick={() => openPost(post)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          openPost(post);
                        }
                      }}
                      className="flex cursor-pointer flex-col gap-4 px-5 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center dark:hover:bg-slate-800"
                    >
                      {post.image ? (
                        <img
                          src={post.image}
                          alt=""
                          className="h-16 w-20 shrink-0 rounded-lg bg-slate-100 object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
                          No image
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-semibold text-slate-900 dark:text-white">
                            {post.title}
                          </h2>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              post.published
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {post.published ? "Published" : "Draft"}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                          {post.description}
                        </p>
                        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                          By{" "}
                          {post.author?.fullName ||
                            post.author?.name ||
                            post.authorName ||
                            "Deleted account"}
                          {post.author?.email ? ` · ${post.author.email}` : ""}
                          {` · ${formatDate(post.createdAt)}`}
                          {post.category ? ` · ${post.category}` : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={actionId === post._id}
                        onClick={(event) => {
                          event.stopPropagation();
                          deletePost(post);
                        }}
                        className="shrink-0 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        {actionId === post._id ? "Deleting..." : "Delete post"}
                      </button>
                    </article>
                  ))}
                </div>
              )}
              {activeTab === "users" && (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {rows.map((account) => (
                    <article
                      key={account._id}
                      className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f7eee7] font-semibold text-[#a83434]">
                        {(account.fullName || account.name || account.username)
                          ?.slice(0, 1)
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="font-semibold text-slate-900 dark:text-white">
                          {account.fullName || account.name || account.username}
                        </h2>
                        <p className="mt-1 break-all text-sm text-slate-500 dark:text-slate-400">
                          {account.email}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          @{account.username} · {account.postCount} posts ·
                          Joined {formatDate(account.createdAt)}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={actionId === account._id}
                        onClick={() => removeUser(account)}
                        className="shrink-0 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        {actionId === account._id
                          ? "Removing..."
                          : "Remove user"}
                      </button>
                    </article>
                  ))}
                </div>
              )}
              {activeTab === "access-requests" && (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {rows.map((request) => (
                    <article
                      key={request._id}
                      className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-50 font-semibold text-amber-700">
                        {(request.displayName || request.email)
                          ?.slice(0, 1)
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="font-semibold text-slate-900 dark:text-white">
                          {request.displayName || "Poodiest user"}
                        </h2>
                        <p className="mt-1 break-all text-sm text-slate-500 dark:text-slate-400">
                          {request.email}
                        </p>
                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                          Requested {formatDate(request.requestedAt)}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          disabled={actionId === request._id}
                          onClick={() =>
                            reviewAccessRequest(request, "decline")
                          }
                          className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          {actionId === request._id ? "Reviewing..." : "Decline"}
                        </button>
                        <button
                          type="button"
                          disabled={actionId === request._id}
                          onClick={() =>
                            reviewAccessRequest(request, "approve")
                          }
                          className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
                        >
                          {actionId === request._id ? "Reviewing..." : "Accept"}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
              <Pagination page={page} pages={pages} onChange={setPage} />
            </>
          )}
        </section>
      </main>
    </div>
  );
}
