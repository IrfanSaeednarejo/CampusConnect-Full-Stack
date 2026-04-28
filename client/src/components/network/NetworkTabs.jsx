import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNetworkState, fetchSuggestedMembers } from '../../redux/slices/networkSlice';
import MemberCard from '../common/MemberCard';
import SectionHeader from '../common/SectionHeader';
import MemberDiscovery from './MemberDiscovery';

/* ─── Inline styles injected once ─────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

  .nt-root { font-family: 'DM Sans', sans-serif; }

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
    height: 2px; background: #f78166; border-radius: 999px;
    transform-origin: left;
    animation: nt-fadeIn 0.18s ease both;
  }

  /* View-toggle button */
  .nt-view-btn {
    display:flex; align-items:center; justify-content:center;
    width: 32px; height: 32px; border-radius: 8px;
    border: 1px solid #30363d;
    background: transparent;
    color: #8b949e;
    cursor: pointer;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
  }
  .nt-view-btn:hover { background: #21262d; color: #e6edf3; }
  .nt-view-btn.active {
    background: #21262d; color: #e6edf3;
    border-color: #484f58;
  }

  /* List row */
  .nt-list-row {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 16px;
    border-radius: 10px;
    border: 1px solid #21262d;
    background: #161b22;
    transition: border-color 0.18s, background 0.18s;
    cursor: default;
  }
  .nt-list-row:hover { border-color: #30363d; background: #1c2128; }

  .nt-list-avatar {
    width: 42px; height: 42px; border-radius: 50%;
    background: #21262d;
    flex-shrink: 0;
    object-fit: cover;
    border: 1px solid #30363d;
  }
  .nt-list-avatar-placeholder {
    width: 42px; height: 42px; border-radius: 50%;
    background: #21262d;
    flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; font-weight: 600; color: #8b949e;
    border: 1px solid #30363d;
    text-transform: uppercase;
  }

  /* Badge pill */
  .nt-badge {
    display: inline-flex; align-items: center;
    padding: 2px 8px; border-radius: 999px;
    font-size: 11px; font-weight: 500;
    background: #21262d; color: #8b949e;
    border: 1px solid #30363d;
  }
  .nt-badge-accent { background: rgba(247,129,102,0.1); color: #f78166; border-color: rgba(247,129,102,0.25); }
  .nt-badge-blue   { background: rgba(88,166,255,0.1);  color: #58a6ff; border-color: rgba(88,166,255,0.25); }

  /* Count chip on tabs */
  .nt-tab-count {
    display:inline-flex; align-items:center; justify-content:center;
    min-width: 20px; height: 18px; padding: 0 5px;
    border-radius: 999px; font-size: 11px; font-weight: 600;
    background: #21262d; color: #8b949e;
    margin-left: 6px;
    transition: background 0.15s, color 0.15s;
  }
  .nt-tab-active .nt-tab-count {
    background: rgba(247,129,102,0.12); color: #f78166;
  }

  /* Search bar */
  .nt-search-wrap { position: relative; }
  .nt-search-icon {
    position: absolute; left: 11px; top: 50%; transform: translateY(-50%);
    color: #484f58; font-size: 18px;
    transition: color 0.15s;
    pointer-events: none;
  }
  .nt-search-wrap:focus-within .nt-search-icon { color: #58a6ff; }
  .nt-search-input {
    width: 100%; background: #0d1117; color: #e6edf3;
    border: 1px solid #30363d; border-radius: 10px;
    padding: 8px 12px 8px 36px;
    font-size: 13px; font-family: inherit;
    outline: none; transition: border-color 0.15s, box-shadow 0.15s;
  }
  .nt-search-input::placeholder { color: #484f58; }
  .nt-search-input:focus {
    border-color: rgba(88,166,255,0.4);
    box-shadow: 0 0 0 3px rgba(88,166,255,0.06);
  }

  /* Section label */
  .nt-section-label {
    font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
    color: #484f58; text-transform: uppercase;
    margin-bottom: 12px;
  }

  /* Divider */
  .nt-divider { border: none; border-top: 1px solid #21262d; margin: 28px 0; }

  /* Role tag */
  .nt-role-tag {
    font-size: 11px; padding: 2px 7px; border-radius: 6px;
    background: #161b22; color: #8b949e; border: 1px solid #21262d;
    white-space: nowrap;
  }

  /* Connect / status button in list */
  .nt-list-action {
    flex-shrink: 0; margin-left: auto;
    padding: 5px 14px; border-radius: 8px; font-size: 12px; font-weight: 500;
    font-family: inherit; cursor: pointer; transition: background 0.15s, color 0.15s;
    border: 1px solid #30363d; background: transparent; color: #8b949e;
  }
  .nt-list-action:hover { background: #21262d; color: #e6edf3; }
  .nt-list-action-connected {
    border-color: rgba(88,166,255,0.25); color: #58a6ff; background: rgba(88,166,255,0.06);
  }
  .nt-list-action-connected:hover { background: rgba(88,166,255,0.12); }

  /* Message CTA button — replaces "Connected" in list rows */
  .nt-list-action-message {
    display: inline-flex; align-items: center; gap: 5px;
    flex-shrink: 0; margin-left: auto;
    padding: 5px 13px; border-radius: 8px; font-size: 12px; font-weight: 500;
    font-family: inherit; cursor: pointer;
    border: 1px solid #30363d;
    background: transparent; color: #8b949e;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
  }
  .nt-list-action-message:hover {
    background: #21262d; color: #e6edf3; border-color: #484f58;
  }
  .nt-list-action-message .nt-msg-icon { font-size: 14px; }

  /* Empty state */
  .nt-empty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 56px 24px; border-radius: 12px;
    border: 1px dashed #21262d; background: #0d1117;
    color: #484f58; text-align: center; gap: 10px;
  }
  .nt-empty-icon { font-size: 32px; color: #30363d; }

  /* Loading skeleton pulse */
  @keyframes nt-pulse { 0%,100%{opacity:.4} 50%{opacity:.8} }
  .nt-skeleton {
    background: #161b22; border-radius: 10px; border: 1px solid #21262d;
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
function Avatar({ url, name, size = 42 }) {
  const [err, setErr] = useState(false);
  const initial = (name || '?')[0];
  if (url && !err) {
    return (
      <img
        className="nt-list-avatar"
        src={url} alt={name}
        style={{ width: size, height: size }}
        onError={() => setErr(true)}
      />
    );
  }
  return (
    <div className="nt-list-avatar-placeholder" style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {initial}
    </div>
  );
}

/* ─── List row for a single member ────────────────────────────────────────── */
function MemberListRow({ item, isConnected, isSuggested, onMessage }) {
  const user = item.user || item;
  const name = user.profile?.displayName || 'Unknown';
  const role = user.roles?.[0];
  const bio = user.profile?.bio;
  const avatarUrl = user.profile?.avatar;
  const userId = user._id;
  const mutualCount = item.mutualCount || user.mutualCount;
  const sharedInterests = item.sharedInterests || user.sharedInterests;

  const handleMessage = (e) => {
    e.stopPropagation();
    if (onMessage) onMessage(userId, name);
    // fallback: navigate to messages — wire this to your router
    // e.g. navigate(`/messages/${userId}`)
  };

  return (
    <div className="nt-list-row">
      <Avatar url={avatarUrl} name={name} size={42} />

      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3', whiteSpace: 'nowrap' }}>{name}</span>
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
          <p style={{ fontSize: 12, color: '#8b949e', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {bio}
          </p>
        )}
      </div>

      {isConnected ? (
        <button className="nt-list-action-message" onClick={handleMessage} title={`Message ${name}`}>
          <span className="material-symbols-outlined nt-msg-icon">chat</span>
          Message
        </button>
      ) : isSuggested ? (
        <button className="nt-list-action">Connect</button>
      ) : null}
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
function Section({ title, subtitle, items, view, isConnected, isSuggested, searchQuery, onSearchChange, showSearch, onMessage }) {
  const isEmpty = items.length === 0;
  const isFiltered = searchQuery && isEmpty;

  return (
    <div style={{ marginBottom: 32 }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3', margin: 0 }}>{title}</h3>
            <span className="nt-badge">{items.length}</span>
          </div>
          {subtitle && <p style={{ fontSize: 12, color: '#484f58', marginTop: 2, marginBottom: 0 }}>{subtitle}</p>}
        </div>

        {showSearch && (
          <div className="nt-search-wrap" style={{ width: 220 }}>
            <span className="material-symbols-outlined nt-search-icon">search</span>
            <input
              className="nt-search-input"
              type="text"
              placeholder="Filter connections…"
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

  const dispatch = useDispatch();
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
        className={`nt-tab-active`}
        style={{
          position: 'relative', paddingBottom: 14, paddingTop: 4,
          paddingLeft: 4, paddingRight: 4,
          fontSize: 13, fontWeight: isActive ? 600 : 400,
          color: isActive ? '#e6edf3' : '#8b949e',
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center',
          transition: 'color 0.15s', fontFamily: 'inherit',
        }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#c9d1d9'; }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = '#8b949e'; }}
      >
        {label}
        {count > 0 && (
          <span
            className="nt-tab-count"
            style={{
              background: isActive ? 'rgba(247,129,102,0.12)' : '#21262d',
              color: isActive ? '#f78166' : '#8b949e',
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
      <div className="nt-root" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {/* Tab skeleton */}
        <div style={{ display: 'flex', borderBottom: '1px solid #21262d', gap: 24, paddingBottom: 0 }}>
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
    <div className="nt-root" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* ── Top bar: tabs + view toggle ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        borderBottom: '1px solid #21262d',
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
                <span style={{ color: '#f78166' }}>●</span>&ensp;Incoming Requests
              </div>
              <Section
                title="Incoming Requests"
                items={pendingReceived}
                view={view}
              />
              <hr className="nt-divider" />
            </>
          )}

          {/* Pending sent */}
          {pendingSent.length > 0 && (
            <>
              <div className="nt-section-label">
                <span style={{ color: '#58a6ff' }}>●</span>&ensp;Pending
              </div>
              <Section
                title="Sent Requests"
                subtitle="Waiting for a response"
                items={pendingSent}
                view={view}
              />
              <hr className="nt-divider" />
            </>
          )}

          {/* Connected */}
          {connected.length > 0 && (
            <>
              <div className="nt-section-label">
                <span style={{ color: '#3fb950' }}>●</span>&ensp;Connections
              </div>
              <Section
                title="My Connections"
                items={filteredConnected}
                view={view}
                isConnected
                showSearch
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onMessage={(userId, name) => {
                  // Navigate to direct message thread — wire to your router
                  // e.g. navigate(`/messages/${userId}`)
                  console.log('Open message thread with', name, userId);
                }}
              />
            </>
          )}

          {/* Suggestions */}
          {suggested.length > 0 && (
            <>
              <hr className="nt-divider" />
              <div className="nt-section-label">
                <span style={{ color: '#8b949e' }}>●</span>&ensp;Recommended
              </div>
              <Section
                title="People You May Know"
                subtitle="Based on your interests and network"
                items={suggested}
                view={view}
                isSuggested
              />
            </>
          )}

          {/* Fully empty */}
          {totalNetwork === 0 && !suggested.length && (
            <div className="nt-empty nt-fadeUp" style={{ marginTop: 8 }}>
              <span className="material-symbols-outlined nt-empty-icon">hub</span>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#8b949e', margin: 0 }}>Your network is empty</p>
              <p style={{ fontSize: 13, color: '#484f58', margin: 0 }}>Connect with people to grow your professional network.</p>
              <button
                onClick={() => setActiveTab('discover')}
                style={{
                  marginTop: 8, padding: '7px 18px', borderRadius: 8,
                  border: '1px solid #30363d', background: 'transparent',
                  color: '#58a6ff', fontSize: 13, fontWeight: 500,
                  fontFamily: 'inherit', cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(88,166,255,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Discover Members →
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