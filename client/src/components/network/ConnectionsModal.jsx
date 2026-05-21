import React, { useEffect, useState, useRef, useCallback } from 'react';
import { X, Loader2, Users, Search, MessageCircle, UserX } from 'lucide-react';
import { getUserConnections } from '../../api/networkApi';
import { MemberListRow } from './NetworkTabs';
import { useDispatch } from 'react-redux';
import { createOrGetDMThunk } from '../../redux/slices/chatSlice';
import { useNavigate } from 'react-router-dom';
import useHomeTheme from '../../hooks/useHomeTheme';

const MODAL_STYLES = `
  .cm-panel {
    --cm-bg: rgb(var(--color-surface-dark));
    --cm-bg-muted: rgb(var(--color-background-dark));
    --cm-bg-soft: rgb(var(--color-surface-muted-dark));
    --cm-border: rgb(var(--color-border-dark));
    --cm-text: rgb(var(--color-text-primary-dark));
    --cm-text-muted: rgb(var(--color-text-secondary-dark));
    --cm-text-subtle: rgba(148, 163, 184, 0.72);
    --cm-accent: rgb(var(--color-primary));
    --cm-accent-soft: rgba(37, 99, 235, 0.1);
    --cm-accent-border: rgba(37, 99, 235, 0.2);
  }
  .cm-panel.cm-light {
    --cm-bg: rgb(var(--color-surface-light));
    --cm-bg-muted: rgb(var(--color-background-light));
    --cm-bg-soft: rgb(var(--color-surface-muted-light));
    --cm-border: rgb(var(--color-border-light));
    --cm-text: rgb(var(--color-text-primary-light));
    --cm-text-muted: rgb(var(--color-text-secondary-light));
    --cm-text-subtle: rgba(100, 116, 139, 0.9);
    --cm-accent: rgb(var(--color-primary));
    --cm-accent-soft: rgba(37, 99, 235, 0.08);
    --cm-accent-border: rgba(37, 99, 235, 0.18);
  }
  @keyframes cm-backdropIn {
    from { opacity: 0; backdrop-filter: blur(0px); }
    to   { opacity: 1; backdrop-filter: blur(6px); }
  }
  @keyframes cm-slideUp {
    from { opacity: 0; transform: translateY(20px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes cm-fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes cm-spin {
    to { transform: rotate(360deg); }
  }

  .cm-backdrop { animation: cm-backdropIn 0.22s ease both; }
  .cm-panel { animation: cm-slideUp 0.28s cubic-bezier(.22,.68,0,1.2) both; }

  .cm-list > .cm-row-wrap { animation: cm-fadeUp 0.26s cubic-bezier(.22,.68,0,1.2) both; }
  .cm-list > .cm-row-wrap:nth-child(1)  { animation-delay: 0.04s; }
  .cm-list > .cm-row-wrap:nth-child(2)  { animation-delay: 0.08s; }
  .cm-list > .cm-row-wrap:nth-child(3)  { animation-delay: 0.12s; }
  .cm-list > .cm-row-wrap:nth-child(4)  { animation-delay: 0.15s; }
  .cm-list > .cm-row-wrap:nth-child(5)  { animation-delay: 0.18s; }
  .cm-list > .cm-row-wrap:nth-child(n+6) { animation-delay: 0.20s; }

  .cm-scroll::-webkit-scrollbar { width: 4px; }
  .cm-scroll::-webkit-scrollbar-track { background: transparent; }
  .cm-scroll::-webkit-scrollbar-thumb { background: var(--cm-border); border-radius: 999px; }
  .cm-scroll::-webkit-scrollbar-thumb:hover { background: var(--cm-text-subtle); }

  .cm-search-wrap { position: relative; }
  .cm-search-icon {
    position: absolute;
    left: 11px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--cm-text-subtle);
    transition: color 0.15s;
    pointer-events: none;
  }
  .cm-search-wrap:focus-within .cm-search-icon { color: var(--cm-accent); }
  .cm-search-input {
    width: 100%;
    box-sizing: border-box;
    background: var(--cm-bg-muted);
    color: var(--cm-text);
    border: 1px solid var(--cm-border);
    border-radius: 10px;
    padding: 8px 12px 8px 34px;
    font-size: 13px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .cm-search-input::placeholder { color: var(--cm-text-subtle); }
  .cm-search-input:focus {
    border-color: var(--cm-accent-border);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
  }

  .cm-spinner { animation: cm-spin 0.8s linear infinite; }

  .cm-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 8px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--cm-text-muted);
    cursor: pointer;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
  }
  .cm-close:hover { background: var(--cm-bg-soft); color: var(--cm-text); border-color: var(--cm-border); }

  .cm-footer-btn {
    padding: 7px 20px;
    border-radius: 9px;
    font-size: 13px;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    border: 1px solid var(--cm-border);
    background: transparent;
    color: var(--cm-text-muted);
    transition: background 0.15s, color 0.15s, border-color 0.15s;
  }
  .cm-footer-btn:hover { background: var(--cm-bg-soft); color: var(--cm-text); border-color: var(--cm-border); }

  .cm-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    background: var(--cm-bg-soft);
    color: var(--cm-text-muted);
    border: 1px solid var(--cm-border);
  }

  @keyframes cm-pulse { 0%,100% { opacity: .35 } 50% { opacity: .7 } }
  .cm-skeleton {
    background: var(--cm-bg);
    border-radius: 10px;
    border: 1px solid var(--cm-border);
    animation: cm-pulse 1.5s ease-in-out infinite;
  }

  .cm-error-btn {
    margin-top: 6px;
    padding: 6px 16px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    border: 1px solid var(--cm-border);
    background: transparent;
    color: var(--cm-accent);
    transition: background 0.15s, border-color 0.15s;
  }
  .cm-error-btn:hover { background: var(--cm-accent-soft); }
`;

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

function EmptyState({ filtered, query, isDark }) {
    const bg = isDark ? 'rgb(var(--color-surface-dark))' : 'rgb(var(--color-surface-muted-light))';
    const border = isDark ? '1px solid rgb(var(--color-border-dark))' : '1px solid rgb(var(--color-border-light))';
    const iconColor = isDark ? 'rgb(var(--color-text-secondary-dark))' : 'rgb(var(--color-text-secondary-light))';

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '48px 24px',
                gap: 12,
                textAlign: 'center',
            }}
        >
            <div
                style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: bg,
                    border,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {filtered ? <Search size={20} color={iconColor} /> : <UserX size={20} color={iconColor} />}
            </div>
            <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: isDark ? 'rgb(var(--color-text-primary-dark))' : 'rgb(var(--color-text-primary-light))', margin: '0 0 4px' }}>
                    {filtered ? `No results for "${query}"` : 'No connections yet'}
                </p>
                <p style={{ fontSize: 12, color: isDark ? 'rgb(var(--color-text-secondary-dark))' : 'rgb(var(--color-text-secondary-light))', margin: 0 }}>
                    {filtered ? 'Try a different name or clear your search.' : 'This person has no connections to show.'}
                </p>
            </div>
        </div>
    );
}

function ErrorState({ onRetry, isDark }) {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '48px 24px',
                gap: 10,
                textAlign: 'center',
            }}
        >
            <div
                style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: 'rgba(220,38,38,0.08)',
                    border: '1px solid rgba(220,38,38,0.16)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                }}
            >
                ⚠
            </div>
            <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: isDark ? 'rgb(var(--color-text-primary-dark))' : 'rgb(var(--color-text-primary-light))', margin: '0 0 4px' }}>
                    Failed to load connections
                </p>
                <p style={{ fontSize: 12, color: isDark ? 'rgb(var(--color-text-secondary-dark))' : 'rgb(var(--color-text-secondary-light))', margin: 0 }}>
                    Something went wrong. Check your connection and try again.
                </p>
            </div>
            <button className="cm-error-btn" onClick={onRetry}>
                Try again
            </button>
        </div>
    );
}

export default function ConnectionsModal({ isOpen, onClose, userId, userName }) {
    useModalStyles();
    const isDark = useHomeTheme();

    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [query, setQuery] = useState('');
    const [messaging, setMessaging] = useState(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const searchRef = useRef(null);

    const fetchConnections = useCallback(() => {
        if (!userId) return;
        setLoading(true);
        setError(false);
        getUserConnections(userId)
            .then((res) => setConnections(res.data.data))
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, [userId]);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            fetchConnections();
            setTimeout(() => searchRef.current?.focus(), 300);
        }
    }, [isOpen, fetchConnections]);

    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    const handleMessage = async (targetId) => {
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

    const filtered = connections.filter((item) => {
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
                position: 'fixed',
                inset: 0,
                zIndex: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 16,
                fontFamily: "inherit",
            }}
        >
            <div
                className="cm-backdrop"
                onClick={onClose}
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: isDark ? 'rgba(0,0,0,0.75)' : 'rgba(2,6,23,0.30)',
                    backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)',
                }}
            />

            <div
                className={`cm-panel ${isDark ? '' : 'cm-light'}`}
                style={{
                    position: 'relative',
                    width: 'min(92vw, 900px)',
                    maxWidth: 900,
                    maxHeight: '85vh',
                    background: 'var(--cm-bg)',
                    border: '1px solid var(--cm-border)',
                    borderRadius: 16,
                    boxShadow: isDark ? '0 24px 64px rgba(2, 6, 23, 0.45)' : '0 12px 32px rgba(2,6,23,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        padding: '16px 20px 14px',
                        borderBottom: '1px solid var(--cm-border)',
                        background: 'var(--cm-bg)',
                        flexShrink: 0,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            gap: 12,
                            marginBottom: 14,
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div
                                style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: 10,
                                    background: 'var(--cm-accent-soft)',
                                    border: '1px solid var(--cm-accent-border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <Users size={16} color="rgb(var(--color-primary))" />
                            </div>
                            <div>
                                <h2
                                    style={{
                                        margin: 0,
                                        fontSize: 15,
                                        fontWeight: 700,
                                        color: 'var(--cm-text)',
                                        lineHeight: 1.3,
                                    }}
                                >
                                    {displayName} Connections
                                </h2>
                                {!loading && !error && (
                                    <p style={{ margin: 0, fontSize: 11, color: 'var(--cm-text-muted)', marginTop: 2 }}>
                                        {connections.length} {connections.length === 1 ? 'person' : 'people'}
                                        {query && filtered.length !== connections.length ? ` · ${filtered.length} shown` : ''}
                                    </p>
                                )}
                            </div>
                        </div>

                        <button className="cm-close" onClick={onClose} aria-label="Close modal">
                            <X size={15} />
                        </button>
                    </div>

                    {!loading && !error && connections.length > 0 && (
                        <div className="cm-search-wrap">
                            <Search size={14} className="cm-search-icon" />
                            <input
                                ref={searchRef}
                                className="cm-search-input"
                                type="text"
                                placeholder="Search connections..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                style={{
                                    background: 'var(--cm-bg)',
                                    color: 'var(--cm-text)',
                                    border: '1px solid var(--cm-border)',
                                }}
                            />
                        </div>
                    )}
                </div>

                <div
                    className="cm-scroll"
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '12px 16px',
                    }}
                >
                    {loading ? (
                        <SkeletonRows count={5} />
                    ) : error ? (
                        <ErrorState onRetry={fetchConnections} isDark={isDark} />
                    ) : filtered.length === 0 ? (
                        <EmptyState filtered={query.length > 0} query={query} isDark={isDark} />
                    ) : (
                        <div className="cm-list" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {filtered.map((item) => (
                                <div key={item.user._id} className="cm-row-wrap">
                                    <MemberListRow
                                        item={item}
                                        isConnected={false}
                                        isSuggested={false}
                                        isDark={isDark}
                                        onMessage={async (targetId) => {
                                            if (messaging) return;
                                            await handleMessage(targetId);
                                        }}
                                        actionSlot={
                                            <button
                                                onClick={async () => {
                                                    if (messaging) return;
                                                    await handleMessage(item.user._id);
                                                }}
                                                disabled={!!messaging}
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 5,
                                                    flexShrink: 0,
                                                    marginLeft: 'auto',
                                                    padding: '5px 12px',
                                                    borderRadius: 8,
                                                    fontSize: 12,
                                                    fontWeight: 500,
                                                    fontFamily: 'inherit',
                                                    cursor: messaging ? 'not-allowed' : 'pointer',
                                                    border: '1px solid var(--cm-border)',
                                                    background: messaging === item.user._id ? 'var(--cm-accent-soft)' : 'transparent',
                                                    color: messaging === item.user._id ? 'var(--cm-accent)' : 'var(--cm-text-muted)',
                                                    opacity: messaging && messaging !== item.user._id ? 0.45 : 1,
                                                    transition: 'background 0.15s, color 0.15s, opacity 0.15s',
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!messaging) {
                                                        e.currentTarget.style.background = 'var(--cm-bg-soft)';
                                                        e.currentTarget.style.color = 'var(--cm-text)';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!messaging) {
                                                        e.currentTarget.style.background = 'transparent';
                                                        e.currentTarget.style.color = 'var(--cm-text-muted)';
                                                    }
                                                }}
                                            >
                                                {messaging === item.user._id ? <Loader2 size={13} className="cm-spinner" /> : <MessageCircle size={13} />}
                                                {messaging === item.user._id ? 'Opening...' : 'Message'}
                                            </button>
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div
                    style={{
                        padding: '12px 20px',
                        borderTop: '1px solid var(--cm-border)',
                        background: 'var(--cm-bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexShrink: 0,
                    }}
                >
                    <p style={{ margin: 0, fontSize: 11, color: 'var(--cm-text-subtle)' }}>
                        Press{' '}
                        <kbd
                            style={{
                                padding: '1px 5px',
                                borderRadius: 4,
                                fontSize: 10,
                                background: 'var(--cm-bg-soft)',
                                border: '1px solid var(--cm-border)',
                                color: 'var(--cm-text-muted)',
                            }}
                        >
                            Esc
                        </kbd>{' '}
                        to close
                    </p>

                    <button className="cm-footer-btn" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
