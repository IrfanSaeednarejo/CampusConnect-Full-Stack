import React, { useEffect, useState, useRef, useCallback } from 'react';
import { X, Loader2, Users, Search, MessageCircle, UserX } from 'lucide-react';
import { getUserConnections } from '../../api/networkApi';
import { MemberListRow } from './NetworkTabs';
import { useDispatch } from 'react-redux';
import { createOrGetDMThunk } from '../../redux/slices/chatSlice';
import { useNavigate } from 'react-router-dom';

/* ─── Scoped styles ─────────────────────────────────────────────────────────── */
const MODAL_STYLES = `
  @keyframes cm-backdropIn {
    from { opacity: 0; backdrop-filter: blur(0px); }
    to   { opacity: 1; backdrop-filter: blur(6px); }
  }
  @keyframes cm-slideUp {
    from { opacity: 0; transform: translateY(20px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)   scale(1); }
  }
  @keyframes cm-fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes cm-spin {
    to { transform: rotate(360deg); }
  }

  .cm-backdrop {
    animation: cm-backdropIn 0.22s ease both;
  }
  .cm-panel {
    animation: cm-slideUp 0.28s cubic-bezier(.22,.68,0,1.2) both;
  }

  /* Staggered row entrance */
  .cm-list > .cm-row-wrap { animation: cm-fadeUp 0.26s cubic-bezier(.22,.68,0,1.2) both; }
  .cm-list > .cm-row-wrap:nth-child(1)  { animation-delay: 0.04s; }
  .cm-list > .cm-row-wrap:nth-child(2)  { animation-delay: 0.08s; }
  .cm-list > .cm-row-wrap:nth-child(3)  { animation-delay: 0.12s; }
  .cm-list > .cm-row-wrap:nth-child(4)  { animation-delay: 0.15s; }
  .cm-list > .cm-row-wrap:nth-child(5)  { animation-delay: 0.18s; }
  .cm-list > .cm-row-wrap:nth-child(n+6){ animation-delay: 0.20s; }

  /* Custom scrollbar */
  .cm-scroll::-webkit-scrollbar { width: 4px; }
  .cm-scroll::-webkit-scrollbar-track { background: transparent; }
  .cm-scroll::-webkit-scrollbar-thumb { background: #30363d; border-radius: 999px; }
  .cm-scroll::-webkit-scrollbar-thumb:hover { background: #484f58; }

  /* Search */
  .cm-search-wrap { position: relative; }
  .cm-search-icon {
    position: absolute; left: 11px; top: 50%; transform: translateY(-50%);
    color: #484f58; transition: color 0.15s; pointer-events: none;
  }
  .cm-search-wrap:focus-within .cm-search-icon { color: #58a6ff; }
  .cm-search-input {
    width: 100%; box-sizing: border-box;
    background: #0d1117; color: #e6edf3;
    border: 1px solid #21262d; border-radius: 10px;
    padding: 8px 12px 8px 34px;
    font-size: 13px; font-family: inherit;
    outline: none; transition: border-color 0.15s, box-shadow 0.15s;
  }
  .cm-search-input::placeholder { color: #484f58; }
  .cm-search-input:focus {
    border-color: rgba(88,166,255,0.35);
    box-shadow: 0 0 0 3px rgba(88,166,255,0.06);
  }

  /* Spinner */
  .cm-spinner { animation: cm-spin 0.8s linear infinite; }

  /* Close button */
  .cm-close {
    display: flex; align-items: center; justify-content: center;
    width: 30px; height: 30px; border-radius: 8px;
    border: 1px solid transparent; background: transparent;
    color: #8b949e; cursor: pointer;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
  }
  .cm-close:hover { background: #21262d; color: #e6edf3; border-color: #30363d; }

  /* Footer close btn */
  .cm-footer-btn {
    padding: 7px 20px; border-radius: 9px; font-size: 13px; font-weight: 500;
    font-family: inherit; cursor: pointer;
    border: 1px solid #30363d; background: transparent; color: #8b949e;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
  }
  .cm-footer-btn:hover { background: #21262d; color: #e6edf3; border-color: #484f58; }

  /* Count badge */
  .cm-count {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600;
    background: #21262d; color: #8b949e; border: 1px solid #30363d;
  }

  /* Skeleton pulse */
  @keyframes cm-pulse { 0%,100%{opacity:.35} 50%{opacity:.7} }
  .cm-skeleton {
    background: #161b22; border-radius: 10px; border: 1px solid #1c2128;
    animation: cm-pulse 1.5s ease-in-out infinite;
  }

  /* Error state */
  .cm-error-btn {
    margin-top: 6px; padding: 6px 16px; border-radius: 8px;
    font-size: 12px; font-weight: 500; font-family: inherit; cursor: pointer;
    border: 1px solid #30363d; background: transparent; color: #58a6ff;
    transition: background 0.15s;
  }
  .cm-error-btn:hover { background: rgba(88,166,255,0.06); }
`;

/* ─── Inject styles once ────────────────────────────────────────────────────── */
function useModalStyles() {
    const done = useRef(false);
    useEffect(() => {
        if (done.current) return;
        const el = document.createElement('style');
        el.textContent = MODAL_STYLES;
        document.head.appendChild(el);
        done.current = true;
    }, []);
}

/* ─── Skeleton rows shown while loading ─────────────────────────────────────── */
function SkeletonRows({ count = 5 }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '4px 0' }}>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="cm-skeleton"
                    style={{
                        height: 62,
                        animationDelay: `${i * 0.08}s`,
                    }}
                />
            ))}
        </div>
    );
}

/* ─── Empty / no-results state ──────────────────────────────────────────────── */
function EmptyState({ filtered, query }) {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '48px 24px', gap: 12, textAlign: 'center',
        }}>
            <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: '#161b22', border: '1px solid #21262d',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                {filtered
                    ? <Search size={20} color="#30363d" />
                    : <UserX size={20} color="#30363d" />
                }
            </div>
            <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#8b949e', margin: '0 0 4px' }}>
                    {filtered ? `No results for "${query}"` : 'No connections yet'}
                </p>
                <p style={{ fontSize: 12, color: '#484f58', margin: 0 }}>
                    {filtered
                        ? 'Try a different name or clear your search.'
                        : 'This person has no connections to show.'}
                </p>
            </div>
        </div>
    );
}

/* ─── Error state ────────────────────────────────────────────────────────────── */
function ErrorState({ onRetry }) {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '48px 24px', gap: 10, textAlign: 'center',
        }}>
            <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'rgba(247,129,102,0.06)', border: '1px solid rgba(247,129,102,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22,
            }}>⚠</div>
            <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#8b949e', margin: '0 0 4px' }}>
                    Failed to load connections
                </p>
                <p style={{ fontSize: 12, color: '#484f58', margin: 0 }}>
                    Something went wrong. Check your connection and try again.
                </p>
            </div>
            <button className="cm-error-btn" onClick={onRetry}>Try again</button>
        </div>
    );
}

/* ─── Main component ─────────────────────────────────────────────────────────── */
export default function ConnectionsModal({ isOpen, onClose, userId, userName }) {
    useModalStyles();

    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [query, setQuery] = useState('');
    const [messaging, setMessaging] = useState(null); // userId being messaged

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const searchRef = useRef(null);

    /* ── Fetch ── */
    const fetchConnections = useCallback(() => {
        if (!userId) return;
        setLoading(true);
        setError(false);
        getUserConnections(userId)
            .then(res => setConnections(res.data.data))
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, [userId]);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            fetchConnections();
            // Auto-focus search after modal animates in
            setTimeout(() => searchRef.current?.focus(), 300);
        }
    }, [isOpen, fetchConnections]);

    /* ── Keyboard: Escape to close ── */
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    /* ── Message handler ── */
    const handleMessage = async (targetId, name) => {
        setMessaging(targetId);
        try {
            const result = await dispatch(createOrGetDMThunk(targetId)).unwrap();
            onClose();
            navigate(`/messages/${result._id}`);
        } catch (err) {
            console.error('Failed to open message thread', err);
        } finally {
            setMessaging(null);
        }
    };

    /* ── Filter ── */
    const filtered = connections.filter(item => {
        const name = item.user?.profile?.displayName || '';
        return name.toLowerCase().includes(query.toLowerCase());
    });

    if (!isOpen) return null;

    const displayName = userName ? `${userName}'s` : '';

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={`${displayName} Connections`}
            style={{
                position: 'fixed', inset: 0, zIndex: 100,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 16, fontFamily: "'DM Sans', sans-serif",
            }}
        >
            {/* ── Backdrop ── */}
            <div
                className="cm-backdrop"
                onClick={onClose}
                style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0.75)',
                    backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)',
                }}
            />

            {/* ── Panel ── */}
            <div
                className="cm-panel"
                style={{
                    position: 'relative',
                    width: 'min(92%, 60vw)',
                    maxWidth: '900px',
                    maxHeight: '85vh',
                    background: '#0d1117',
                    border: '1px solid #21262d',
                    borderRadius: 16,
                    boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)',
                    display: 'flex', flexDirection: 'column',
                    overflow: 'hidden',
                }}
            >
                {/* ── Header ── */}
                <div style={{
                    padding: '16px 20px 14px',
                    borderBottom: '1px solid #161b22',
                    background: '#0d1117',
                    flexShrink: 0,
                }}>
                    {/* Title row */}
                    <div style={{
                        display: 'flex', alignItems: 'flex-start',
                        justifyContent: 'space-between', gap: 12, marginBottom: 14,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                                width: 34, height: 34, borderRadius: 10,
                                background: 'rgba(88,166,255,0.08)',
                                border: '1px solid rgba(88,166,255,0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <Users size={16} color="#58a6ff" />
                            </div>
                            <div>
                                <h2 style={{
                                    margin: 0, fontSize: 15, fontWeight: 700,
                                    color: '#e6edf3', lineHeight: 1.3,
                                }}>
                                    {displayName} Connections
                                </h2>
                                {!loading && !error && (
                                    <p style={{ margin: 0, fontSize: 11, color: '#484f58', marginTop: 2 }}>
                                        {connections.length} {connections.length === 1 ? 'person' : 'people'}
                                        {query && filtered.length !== connections.length &&
                                            ` · ${filtered.length} shown`}
                                    </p>
                                )}
                            </div>
                        </div>

                        <button className="cm-close" onClick={onClose} aria-label="Close modal">
                            <X size={15} />
                        </button>
                    </div>

                    {/* Search bar — shown once loaded with results */}
                    {!loading && !error && connections.length > 0 && (
                        <div className="cm-search-wrap">
                            <Search size={14} className="cm-search-icon" />
                            <input
                                ref={searchRef}
                                className="cm-search-input"
                                type="text"
                                placeholder="Search connections…"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                {/* ── Body ── */}
                <div
                    className="cm-scroll"
                    style={{
                        flex: 1, overflowY: 'auto',
                        padding: '12px 16px',
                    }}
                >
                    {loading ? (
                        <SkeletonRows count={5} />
                    ) : error ? (
                        <ErrorState onRetry={fetchConnections} />
                    ) : filtered.length === 0 ? (
                        <EmptyState filtered={query.length > 0} query={query} />
                    ) : (
                        <div className="cm-list" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {filtered.map((item) => (
                                <div key={item.user._id} className="cm-row-wrap">
                                    <MemberListRow
                                        item={item}
                                        isConnected={false}
                                        isSuggested={false}
                                        onMessage={async (targetId, name) => {
                                            if (messaging) return; // prevent double-click
                                            await handleMessage(targetId, name);
                                        }}
                                        /* Override action slot to show a proper Message CTA */
                                        actionSlot={
                                            <button
                                                onClick={async () => {
                                                    if (messaging) return;
                                                    await handleMessage(item.user._id, item.user.profile?.displayName);
                                                }}
                                                disabled={!!messaging}
                                                style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 5,
                                                    flexShrink: 0, marginLeft: 'auto',
                                                    padding: '5px 12px', borderRadius: 8,
                                                    fontSize: 12, fontWeight: 500, fontFamily: 'inherit',
                                                    cursor: messaging ? 'not-allowed' : 'pointer',
                                                    border: '1px solid #30363d',
                                                    background: messaging === item.user._id
                                                        ? 'rgba(88,166,255,0.06)' : 'transparent',
                                                    color: messaging === item.user._id ? '#58a6ff' : '#8b949e',
                                                    opacity: (messaging && messaging !== item.user._id) ? 0.45 : 1,
                                                    transition: 'background 0.15s, color 0.15s, opacity 0.15s',
                                                }}
                                                onMouseEnter={e => {
                                                    if (!messaging) {
                                                        e.currentTarget.style.background = '#21262d';
                                                        e.currentTarget.style.color = '#e6edf3';
                                                    }
                                                }}
                                                onMouseLeave={e => {
                                                    if (!messaging) {
                                                        e.currentTarget.style.background = 'transparent';
                                                        e.currentTarget.style.color = '#8b949e';
                                                    }
                                                }}
                                            >
                                                {messaging === item.user._id
                                                    ? <Loader2 size={13} className="cm-spinner" />
                                                    : <MessageCircle size={13} />
                                                }
                                                {messaging === item.user._id ? 'Opening…' : 'Message'}
                                            </button>
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                <div style={{
                    padding: '12px 20px',
                    borderTop: '1px solid #161b22',
                    background: '#0d1117',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexShrink: 0,
                }}>
                    {/* Left: subtle hint */}
                    <p style={{ margin: 0, fontSize: 11, color: '#30363d' }}>
                        Press <kbd style={{
                            padding: '1px 5px', borderRadius: 4, fontSize: 10,
                            background: '#161b22', border: '1px solid #21262d', color: '#484f58',
                        }}>Esc</kbd> to close
                    </p>

                    <button className="cm-footer-btn" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}