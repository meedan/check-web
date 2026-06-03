import React, { useState, useEffect, useRef } from 'react';

const SUPPORT_EMAIL = 'support@yourcompany.com';

const styles = {
  keyframes: `
    @keyframes popIn {
      0%   { opacity: 0; transform: translateY(12px) scale(0.95); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(241, 117, 34, 0.4); }
      50%       { box-shadow: 0 0 0 8px rgba(241, 117, 34, 0); }
    }
  `,
};

export default function SupportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const popupRef = useRef(null);
  const btnRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const handler = (e) => {
      if (
        popupRef.current && !popupRef.current.contains(e.target) &&
        btnRef.current && !btnRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handler);

    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, []);

  let background;

  if (isOpen) {
    background = 'linear-gradient(135deg, #4f46e5, #7c3aed)';
  } else if (hovered) {
    background = 'linear-gradient(135deg, #6366f1, #8b5cf6)';
  } else {
    background = 'linear-gradient(135deg, #6366f1, #a78bfa)';
  }

  return (
    <>
      <style>{styles.keyframes}</style>

      {/* Floating trigger button */}
      <button
        aria-expanded={isOpen}
        aria-label="Open support"
        ref={btnRef}
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          zIndex: 10000,
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          background,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s, transform 0.2s',
          transform: hovered ? 'scale(1.07)' : 'scale(1)',
          animation: 'pulse 3s ease-in-out infinite',
          boxShadow: '0 4px 20px rgba(241,117,34,0.45)',
        }}
        onClick={() => setIsOpen(v => !v)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {isOpen ? (
          // X icon
          <svg fill="none" height="18" viewBox="0 0 18 18" width="18" >
            <path d="M2 2l14 14M16 2L2 16" stroke="#fff" strokeLinecap="round" strokeWidth="2.2" />
          </svg>
        ) : (
          // Chat bubble icon
          <svg fill="none" height="22" viewBox="0 0 24 24" width="22" >
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        )}
      </button>

      {/* Popup panel */}
      {isOpen && (
        <div
          aria-label="Support"
          ref={popupRef}
          role="dialog"
          style={{
            position: 'fixed',
            bottom: '94px',
            right: '28px',
            zIndex: 9999,
            width: '320px',
            background: '#0f0f12',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(241,117,34,0.15)',
            overflow: 'hidden',
            animation: 'popIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both',
            fontFamily: '"DM Sans", system-ui, sans-serif',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              padding: '20px 20px 32px',
              position: 'relative',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '6px',
              }}

            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                }}
              >
                <span aria-label="waving hand" role="img" > 👋 </span>
              </div>
              <span
                style={{
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '15px',
                  letterSpacing: '-0.01em',
                }}
              >
                Hi there!
              </span>
            </div>
            <p
              style={{
                color: 'rgba(255,255,255,0.85)',
                margin: 0,
                fontSize: '13px',
                lineHeight: 1.5,
              }}
            >
              We usually respond within a few hours. Drop us a line anytime.
            </p>
          </div>

          {/* Body */}
          <div
            style={{
              padding: '20px',
              marginTop: '-16px',
              background: '#0f0f12',
              borderRadius: '16px 16px 0 0',
              position: 'relative',
            }}
          >
            {/* Email card */}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                textDecoration: 'none',
                transition: 'background 0.15s, border-color 0.15s',
                marginBottom: '12px',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(241,117,34,0.12)';
                e.currentTarget.style.borderColor = 'rgba(241,117,34,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg fill="none" height="18" viewBox="0 0 24 24" width="18" >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  <polyline points="22,6 12,13 2,6" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontWeight: 600,
                    fontSize: '13px',
                    color: '#f1f1f3',
                  }}
                >
                  Email us
                </p>
                <p
                  style={{
                    margin: '2px 0 0',
                    fontSize: '12px',
                    color: '#6b7280',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {SUPPORT_EMAIL}
                </p>
              </div>
              <svg fill="none" height="14" style={{ flexShrink: 0 }} viewBox="0 0 24 24" width="14" >
                <path d="M9 18l6-6-6-6" stroke="#6b7280" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </a>

            {/* Status row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#22c55e',
                  boxShadow: '0 0 0 2px rgba(34,197,94,0.25)',
                  display: 'inline-block',
                }}
              />
              <span
                style={{
                  fontSize: '11px',
                  color: '#6b7280',
                }}
              >
                Support team is online
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
