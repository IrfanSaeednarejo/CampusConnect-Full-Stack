import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNetworkState, fetchSuggestedMembers } from '../../redux/slices/networkSlice';
import MemberCard from '../common/MemberCard';
import MemberDiscovery from './MemberDiscovery';
import ConnectionButton from './ConnectionButton';
import { useNavigate } from 'react-router-dom';
import { createOrGetDMThunk } from '../../redux/slices/chatSlice';
import useHomeTheme from '../../hooks/useHomeTheme';

/* ─── Inline styles injected once ─────────────────────────────────────────── */
const STYLES = `
  .nt-root {
    --nt-bg: rgb(var(--color-surface-dark));
    --nt-bg-muted: rgb(var(--color-background-dark));
    --nt-bg-soft: rgb(var(--color-surface-muted-dark));
    --nt-border: rgb(var(--color-border-dark));
    --nt-border-strong: rgba(148, 163, 184, 0.2);
    --nt-text: rgb(var(--color-text-primary-dark));
    --nt-text-muted: rgb(var(--color-text-secondary-dark));
    --nt-text-subtle: rgba(148, 163, 184, 0.72);
    --nt-accent: rgb(var(--color-primary));
    --nt-accent-soft: rgba(37, 99, 235, 0.1);
    --nt-accent-border: rgba(37, 99, 235, 0.2);
    --nt-shadow: none;
  }
  .nt-root.nt-light {
    --nt-bg: rgb(var(--color-surface-light));
    --nt-bg-muted: rgb(var(--color-background-light));
    --nt-bg-soft: rgb(var(--color-surface-muted-light));
    --nt-border: rgb(var(--color-border-light));
    --nt-border-strong: rgba(148, 163, 184, 0.28);
    --nt-text: rgb(var(--color-text-primary-light));
    --nt-text-muted: rgb(var(--color-text-secondary-light));
    --nt-text-subtle: rgba(100, 116, 139, 0.9);
    --nt-accent: rgb(var(--color-primary));
    --nt-accent-soft: rgba(37, 99, 235, 0.08);
    --nt-accent-border: rgba(37, 99, 235, 0.18);
    --nt-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
  }

  /* Fade + slide-up entrance */
  @keyframes nt-fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .nt-fadeUp { animation: nt-fadeUp 0.28s cubic-bezier(.22,.68,0,1.2) both; }

  @keyframes nt-fadeIn {
    from { opacity: 0; } to { opacity: 1; }
  }
  .nt-fadeIn { animation: nt-fadeIn 0.22s ease both; }

  /* Stagger children */
  .nt-stagger > * { animation: nt-fadeUp 0.3s cubic-bezier(.22,.68,0,1.2) both; }
  .nt-stagger > *:nth-child(1)  { animation-delay: 0.03s; }
  .nt-stagger > *:nth-child(2)  { animation-delay: 0.06s; }
  .nt-stagger > *:nth-child(3)  { animation-delay: 0.09s; }
  .nt-stagger > *:nth-child(4)  { animation-delay: 0.12s; }
  .nt-stagger > *:nth-child(5)  { animation-delay: 0.15s; }
  .nt-stagger > *:nth-child(6)  { animation-delay: 0.18s; }
  .nt-stagger > *:nth-child(n+7){ animation-delay: 0.21s; }

  /* Tab underline slide */
  .nt-tab-line {
    position: absolute; bottom: -1px; left: 0; right: 0;
    height: 2px; background: rgb(var(--color-info)); border-radius: 999px;
    transform-origin: left;
    animation: nt-fadeIn 0.18s ease both;
  }

  /* View-toggle button */
  .nt-view-btn {
    display:flex; align-items:center; justify-content:center;
    width: 32px; height: 32px; border-radius: 8px;
    border: 1px solid var(--nt-border);
    background: transparent;
    color: var(--nt-text-muted);
    cursor: pointer;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
  }
  .nt-view-btn:hover { background: var(--nt-bg-soft); color: var(--nt-text); }
  .nt-view-btn.active {
    background: var(--nt-bg-soft); color: var(--nt-text);
    border-color: var(--nt-border-strong);
  }

  /* List row */
  .nt-list-row {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 16px;
    border-radius: 10px;
    border: 1px solid var(--nt-border);
    background: var(--nt-bg);
    transition: border-color 0.18s, background 0.18s;
    cursor: pointer;
    box-shadow: var(--nt-shadow);
  }
  .nt-list-row:hover { border-color: var(--nt-border-strong); background: var(--nt-bg-soft); }

  .nt-list-avatar {
    width: 42px; height: 42px; border-radius: 50%;
    background: var(--nt-bg-soft);
    flex-shrink: 0;
    object-fit: cover;
    border: 1px solid var(--nt-border);
  }
  .nt-list-avatar-placeholder {
    width: 42px; height: 42px; border-radius: 50%;
    background: var(--nt-bg-soft);
    flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; font-weight: 600; color: var(--nt-text-muted);
    border: 1px solid var(--nt-border);
    text-transform: uppercase;
  }

  /* Badge pill */
  .nt-badge {
    display: inline-flex; align-items: center;
    padding: 2px 8px; border-radius: 999px;
    font-size: 11px; font-weight: 500;
    background: var(--nt-bg-soft); color: var(--nt-text-muted);
    border: 1px solid var(--nt-border);
  }
  .nt-badge-accent { background: var(--nt-accent-soft); color: var(--nt-accent); border-color: var(--nt-accent-border); }
  .nt-badge-blue   { background: var(--nt-accent-soft); color: var(--nt-accent); border-color: var(--nt-accent-border); }

  /* Count chip on tabs */
  .nt-tab-count {
    display:inline-flex; align-items:center; justify-content:center;
    min-width: 20px; height: 18px; padding: 0 5px;
    border-radius: 999px; font-size: 11px; font-weight: 600;
    background: var(--nt-bg-soft); color: var(--nt-text-muted);
    margin-left: 6px;
    transition: background 0.15s, color 0.15s;
  }
  .nt-tab-active .nt-tab-count {
    background: var(--nt-accent-soft); color: var(--nt-accent);
  }

  /* Search bar */
  .nt-search-wrap { position: relative; }
  .nt-search-icon {
    position: absolute; left: 11px; top: 50%; transform: translateY(-50%);
    color: var(--nt-text-subtle); font-size: 18px;
    transition: color 0.15s;
    pointer-events: none;
  }
  .nt-search-wrap:focus-within .nt-search-icon { color: var(--nt-accent); }
  .nt-search-input {
    width: 100%; background: var(--nt-bg-muted); color: var(--nt-text);
    border: 1px solid var(--nt-border); border-radius: 10px;
    padding: 8px 12px 8px 36px;
    font-size: 13px; font-family: inherit;
    outline: none; transition: border-color 0.15s, box-shadow 0.15s;
  }
  .nt-search-input::placeholder { color: var(--nt-text-subtle); }
  .nt-search-input:focus {
    border-color: var(--nt-accent-border);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
  }

  /* Section label */
  .nt-section-label {
    font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
    color: var(--nt-text-subtle); text-transform: uppercase;
    margin-bottom: 12px;
  }

  /* Divider */
  .nt-divider { border: none; border-top: 1px solid var(--nt-border); margin: 28px 0; }

  /* Role tag */
  .nt-role-tag {
    font-size: 11px; padding: 2px 7px; border-radius: 6px;
    background: var(--nt-bg-soft); color: var(--nt-text-muted); border: 1px solid var(--nt-border);
    white-space: nowrap;
  }

  /* Connect / status button in list */
  .nt-list-action {
    flex-shrink: 0; margin-left: auto;
    padding: 5px 14px; border-radius: 8px; font-size: 12px; font-weight: 500;
    font-family: inherit; cursor: pointer; transition: background 0.15s, color 0.15s;
    border: 1px solid var(--nt-border); background: transparent; color: var(--nt-text-muted);
  }
  .nt-list-action:hover { background: var(--nt-bg-soft); color: var(--nt-text); }
  .nt-list-action-connected {
    border-color: var(--nt-accent-border); color: var(--nt-accent); background: var(--nt-accent-soft);
  }
  .nt-list-action-connected:hover { background: rgba(37, 99, 235, 0.14); }

  /* Message CTA button — replaces "Connected" in list rows */
  .nt-list-action-message {
    display: inline-flex; align-items: center; gap: 5px;
    flex-shrink: 0; margin-left: auto;
    padding: 5px 13px; border-radius: 8px; font-size: 12px; font-weight: 500;
    font-family: inherit; cursor: pointer;
    border: 1px solid var(--nt-border);
    background: transparent; color: var(--nt-text-muted);
    transition: background 0.15s, color 0.15s, border-color 0.15s;
  }
  .nt-list-action-message:hover {
    background: var(--nt-bg-soft); color: var(--nt-text); border-color: var(--nt-border-strong);
  }
  .nt-list-action-message .nt-msg-icon { font-size: 14px; }

  /* Empty state */
  .nt-empty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 56px 24px; border-radius: 12px;
    border: 1px dashed var(--nt-border); background: var(--nt-bg-muted);
    color: var(--nt-text-subtle); text-align: center; gap: 10px;
  }
  .nt-empty-icon { font-size: 32px; color: var(--nt-text-muted); }

  /* Loading skeleton pulse */
  @keyframes nt-pulse { 0%,100%{opacity:.4} 50%{opacity:.8} }
  .nt-skeleton {
    background: var(--nt-bg); border-radius: 10px; border: 1px solid var(--nt-border);
    animation: nt-pulse 1.4s ease-in-out infinite;
  }
`;

/* ─── Utility: inject styles once ─────────────────────────────────────────── */
function useStyles() {
  const injected = useRef(false);
  useEffect(() => {
    if (injected.current) return;
    const el = document.createElement('style');
    el.textContent = STYLES;
    document.head.appendChild(el);
    injected.current = true;
  }, []);
}

/* ─── Avatar helper ────────────────────────────────────────────────────────── */
export function Avatar({ url, name, size = 42 }) {
  const [err, setErr] = useState(false);
  const initial = (name || '?')[0];
  if (url && !err) {
    return (
      <img
        src={url} alt={name}
        className="nt-list-avatar"
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
        onError={() => setErr(true)}
      />
    );
  }
  return (
    <div 
      className="nt-list-avatar-placeholder" 
      style={{ width: size, height: size, fontSize: size * 0.38, borderRadius: '50%' }}
    >
      {initial}
    </div>
  );
}

/* ─── List row for a single member ────────────────────────────────────────── */
export function MemberListRow({ item, isConnected, isSuggested, onMessage, actionSlot, isDark = true }) {
  const navigate = useNavigate();
  const user = item.user || item;
  const name = user.profile?.displayName || 'Unknown';
  const role = user.roles?.[0];
  const bio = user.profile?.bio;
  const avatarUrl = user.profile?.avatar;
  const userId = user._id;
  const mutualCount = item.mutualCount || user.mutualCount;
  const sharedInterests = item.sharedInterests || user.sharedInterests;

  return (
    <div 
      className="nt-list-row"
      onClick={(e) => {
        if (e.target.closest('[data-no-nav]')) return;
        navigate(`/users/${userId}`);
      }}
    >
      <Avatar url={avatarUrl} name={name} size={42} />

      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--nt-text)', whiteSpace: 'nowrap' }}>{name}</span>
          {role && <span className="nt-role-tag">{role}</span>}
          {mutualCount > 0 && (
            <span className="nt-badge nt-badge-blue">
              <span className="material-symbols-outlined" style={{ fontSize: 11, marginRight: 3 }}>people</span>
              {mutualCount} mutual
            </span>
          )}
          {sharedInterests?.length > 0 && (
            <span className="nt-badge nt-badge-accent">
              <span className="material-symbols-outlined" style={{ fontSize: 11, marginRight: 3 }}>interests</span>
              {sharedInterests.length} shared
            </span>
          )}
        </div>
        {bio && (
          <p style={{ fontSize: 12, color: 'var(--nt-text-muted)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {bio}
          </p>
        )}
      </div>

      {/* Action Button */}
      <div className="flex-shrink-0" data-no-nav style={{ marginLeft: 'auto' }}>
        {actionSlot || <ConnectionButton targetUserId={userId} />}
      </div>
    </div>
  );
}

/* ─── View-toggle icons ────────────────────────────────────────────────────── */
function ViewToggle({ view, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      <button
        title="Grid view"
        className={`nt-view-btn${view === 'grid' ? ' active' : ''}`}
        onClick={() => onChange('grid')}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>grid_view</span>
      </button>
      <button
        title="List view"
        className={`nt-view-btn${view === 'list' ? ' active' : ''}`}
        onClick={() => onChange('list')}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>view_list</span>
      </button>
    </div>
  );
}

/* ─── Section wrapper ──────────────────────────────────────────────────────── */
function Section({ title, subtitle, items, view, isConnected, isSuggested, searchQuery, onSearchChange, showSearch, onMessage, isDark = true }) {
  const isEmpty = items.length === 0;
  const isFiltered = searchQuery && isEmpty;

  return (
    <div style={{ marginBottom: 32 }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--nt-text)', margin: 0 }}>{title}</h3>
            <span className="nt-badge">{items.length}</span>
          </div>
          {subtitle && <p style={{ fontSize: 12, color: 'var(--nt-text-muted)', marginTop: 2, marginBottom: 0 }}>{subtitle}</p>}
        </div>

        {showSearch && (
          <div className="nt-search-wrap" style={{ width: 220 }}>
            <span className="material-symbols-outlined nt-search-icon">search</span>
            <input
              className="nt-search-input"
              type="text"
              placeholder="Filter connections..."
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
            />
          </div>
        )}
      </div>

      {isEmpty ? (
        <div className="nt-empty">
          <span className="material-symbols-outlined nt-empty-icon">
            {isFiltered ? 'search_off' : 'person_off'}
          </span>
          <p style={{ fontSize: 13, margin: 0 }}>
            {isFiltered
              ? `No results for "${searchQuery}"`
              : 'Nothing here yet'}
          </p>
        </div>
      ) : view === 'grid' ? (
        <div className="nt-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {items.map(item => {
            const user = item.user || item;
            return (
              <MemberCard
                key={user._id}
                userId={user._id}
                name={user.profile?.displayName || 'Unknown'}
                displayName={user.profile?.displayName}
                role={user.roles?.[0]}
                avatarUrl={user.profile?.avatar}
                bio={user.profile?.bio}
                interests={user.interests}
                isConnected={isConnected}
                sharedInterests={item.sharedInterests || user.sharedInterests}
                matchType={item.matchType || user.matchType}
                mutualCount={item.mutualCount || user.mutualCount}
              />
            );
          })}
        </div>
      ) : (
        <div className="nt-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.map(item => {
            const user = item.user || item;
            return (
              <MemberListRow
                key={user._id}
                item={item}
                isConnected={isConnected}
                isSuggested={isSuggested}
                onMessage={onMessage}
                isDark={isDark}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Skeleton loader ──────────────────────────────────────────────────────── */
function SkeletonGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="nt-skeleton" style={{ height: 160 }} />
      ))}
    </div>
  );
}

/* ─── Main component ───────────────────────────────────────────────────────── */
export default function NetworkTabs() {
  useStyles();
  const isDark = useHomeTheme();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('network');
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState('grid'); // 'grid' | 'list'

  const { connected, pendingSent, pendingReceived, suggested, loading } =
    useSelector((state) => state.network);

  useEffect(() => {
    dispatch(fetchNetworkState());
    dispatch(fetchSuggestedMembers(10));
  }, [dispatch]);

  const filteredConnected = connected.filter(item => {
    const name = item.user.profile?.displayName || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalNetwork = connected.length + pendingSent.length + pendingReceived.length;

  /* ── Tab bar ─────────────────────────────────────────────────── */
  const TabButton = ({ id, label, count }) => {
    const isActive = activeTab === id;
    return (
      <button
        onClick={() => setActiveTab(id)}
        className={isActive ? 'nt-tab-active' : ''}
        style={{
          position: 'relative', paddingBottom: 14, paddingTop: 4,
          paddingLeft: 4, paddingRight: 4,
          fontSize: 13, fontWeight: isActive ? 600 : 400,
          color: isActive ? 'var(--nt-text)' : 'var(--nt-text-muted)',
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center',
          transition: 'color 0.15s', fontFamily: 'inherit',
        }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--nt-text)'; }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--nt-text-muted)'; }}
      >
        {label}
        {count > 0 && (
          <span
            className="nt-tab-count"
            style={{
              background: isActive ? 'var(--nt-accent-soft)' : 'var(--nt-bg-soft)',
              color: isActive ? 'var(--nt-accent)' : 'var(--nt-text-muted)',
            }}
          >
            {count}
          </span>
        )}
        {isActive && <div className="nt-tab-line" />}
      </button>
    );
  };

  /* ── Loading state ───────────────────────────────────────────── */
  if (loading && !connected.length && !suggested.length) {
    return (
      <div className={`nt-root ${isDark ? '' : 'nt-light'}`} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {/* Tab skeleton */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--nt-border)', gap: 24, paddingBottom: 0 }}>
          {['My Network', 'Discover Members'].map(t => (
            <div key={t} className="nt-skeleton" style={{ width: 100, height: 14, marginBottom: 16, borderRadius: 6 }} />
          ))}
        </div>
        <SkeletonGrid />
      </div>
    );
  }

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <div className={`nt-root ${isDark ? '' : 'nt-light'}`} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* ── Top bar: tabs + view toggle ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        borderBottom: '1px solid var(--nt-border)',
        marginBottom: 28,
        gap: 16,
      }}>
        <div style={{ display: 'flex', gap: 24 }}>
          <TabButton id="network" label="My Network" count={totalNetwork} />
          <TabButton id="discover" label="Discover Members" count={0} />
        </div>

        {/* View toggle — available on both tabs */}
        <div style={{ paddingBottom: 14 }}>
          <ViewToggle view={view} onChange={v => { setView(v); setSearchQuery(''); }} />
        </div>
      </div>

      {/* ── Tab content ── */}
      {activeTab === 'network' ? (
        <div key="network" className="nt-fadeIn" style={{ display: 'flex', flexDirection: 'column' }}>

          {/* Incoming requests */}
          {pendingReceived.length > 0 && (
            <>
              <div className="nt-section-label">
                <span style={{ color: 'var(--nt-accent)' }}>●</span>&ensp;Incoming Requests
              </div>
              <Section
                title="Incoming Requests"
                items={pendingReceived}
                view={view}
                isDark={isDark}
              />
              <hr className="nt-divider" />
            </>
          )}

          {/* Pending sent */}
          {pendingSent.length > 0 && (
            <>
              <div className="nt-section-label">
                <span style={{ color: 'var(--nt-accent)' }}>●</span>&ensp;Pending
              </div>
              <Section
                title="Sent Requests"
                subtitle="Waiting for a response"
                items={pendingSent}
                view={view}
                isDark={isDark}
              />
              <hr className="nt-divider" />
            </>
          )}

          {/* Connected */}
          {connected.length > 0 && (
            <>
              <div className="nt-section-label">
                <span style={{ color: 'var(--nt-accent)' }}>●</span>&ensp;Connections
              </div>
              <Section
                title="My Connections"
                items={filteredConnected}
                view={view}
                isConnected
                showSearch
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                isDark={isDark}
                onMessage={async (userId, name) => {
                  try {
                    const result = await dispatch(createOrGetDMThunk(userId)).unwrap();
                    navigate(`/messages/${result._id}`);
                  } catch (err) {
                    console.error("Failed to open message", err);
                  }
                }}
              />
            </>
          )}

          {/* Suggestions */}
          {suggested.length > 0 && (
            <>
              <hr className="nt-divider" />
              <div className="nt-section-label">
                <span style={{ color: 'var(--nt-text-muted)' }}>●</span>&ensp;Recommended
              </div>
              <Section
                title="People You May Know"
                subtitle="Based on your interests and network"
                items={suggested}
                view={view}
                isDark={isDark}
                isSuggested
              />
            </>
          )}

          {/* Fully empty */}
          {totalNetwork === 0 && !suggested.length && (
            <div className="nt-empty nt-fadeUp" style={{ marginTop: 8 }}>
              <span className="material-symbols-outlined nt-empty-icon">hub</span>
              <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--nt-text)', margin: 0 }}>Your network is empty</p>
              <p style={{ fontSize: 13, color: 'var(--nt-text-muted)', margin: 0 }}>Connect with people to grow your professional network.</p>
              <button
                onClick={() => setActiveTab('discover')}
                style={{
                  marginTop: 8, padding: '7px 18px', borderRadius: 8,
                  border: '1px solid var(--nt-border)', background: 'transparent',
                  color: 'var(--nt-accent)', fontSize: 13, fontWeight: 500,
                  fontFamily: 'inherit', cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--nt-accent-soft)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Discover Members {"->"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div key="discover" className="nt-fadeIn">
          <MemberDiscovery view={view} />
        </div>
      )}
    </div>
  );
}
