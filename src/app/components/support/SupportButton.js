import React, { useState, useEffect, useRef } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { stringHelper } from '../../customHelpers';
import styles from './support_button.module.css';

const messages = defineMessages({
  support_title: {
    id: 'supportButton.title',
    defaultMessage: 'Hi {name}!',
    description: 'Message displayed for support popup title',
  },
  support_email: {
    id: 'supportButton.email',
    defaultMessage: 'Email us',
    description: 'Message displayed for email label',
  },
  support_subtitle: {
    id: 'supportButton.subTitle',
    defaultMessage: 'Need help?',
    description: 'Message displayed for support popup subtitle',
  },
});

const buildMailto = (sentryUrl) => {
  if (!sentryUrl) return `mailto:${stringHelper('SUPPORT_EMAIL')}`;
  const subject = encodeURIComponent('Bug Report: Sentry Error');
  const body = encodeURIComponent(
    `Hi Support Team,\n\nI encountered an error. Please find the Sentry details below:\n\n${sentryUrl}\n\nAdditional context:\n[Please describe what you were doing when the error occurred]`,
  );
  return `mailto:${stringHelper('SUPPORT_EMAIL')}?subject=${subject}&body=${body}`;
};

function SupportButton({ intl, name, sentryUrl }) {
  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <>
      {/* Floating trigger button */}
      <button
        aria-expanded={isOpen}
        aria-label="Open support"
        className={[styles['support-btn'], isOpen && styles['is-open']].filter(Boolean).join(' ')}
        ref={btnRef}
        onClick={() => setIsOpen(v => !v)}
      >
        {isOpen ? (
          // X icon
          <svg fill="none" height="18" viewBox="0 0 18 18" width="18">
            <path d="M4 7l5 5 5-5" stroke="#fff" strokeLinecap="round" strokeWidth="2.2" />
          </svg>
        ) : (
          // Chat bubble icon
          <svg fill="none" height="22" viewBox="0 0 24 24" width="22">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        )}
      </button>

      {/* Popup panel */}
      {isOpen && (
        <div
          aria-label="Support"
          className={styles['support-popup']}
          ref={popupRef}
          role="dialog"
        >
          {/* Header */}
          <div className={styles['support-popup__header']}>
            <div className={styles['support-popup__header-row']}>
              <span className={styles['support-popup__title']}>{intl.formatMessage(messages.support_title, { name })}</span>
              <div className={styles['support-popup__avatar']}>
                <span aria-label="waving hand" role="img">👋</span>
              </div>
            </div>
            <p className={styles['support-popup__subtitle']}>
              {intl.formatMessage(messages.support_subtitle)}
            </p>
          </div>

          {/* Body */}
          <div className={styles['support-popup__body']}>
            {/* Email card */}
            <a
              className={styles['support-popup__email-card']}
              href={buildMailto(sentryUrl)}
            >
              <div className={styles['support-popup__email-icon']}>
                <svg fill="none" height="18" viewBox="0 0 24 24" width="18">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  <polyline points="22,6 12,13 2,6" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className={styles['support-popup__email-label']}>{intl.formatMessage(messages.support_email)}</p>
                <p className={styles['support-popup__email-address']}>{stringHelper('SUPPORT_EMAIL')}</p>
              </div>
              <svg className={styles['support-popup__email-chevron']} fill="none" height="14" viewBox="0 0 24 24" width="14">
                <path d="M9 18l6-6-6-6" stroke="#6b7280" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </a>
          </div>
        </div>
      )}
    </>
  );
}

export default injectIntl(SupportButton);
