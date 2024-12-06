import React from 'react';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import { SnackbarProvider, withSnackbar, useSnackbar } from 'notistack';
import reactStringReplace from 'react-string-replace';
import cx from 'classnames/bind';
import Alert from './cds/alerts-and-prompts/Alert';
import { withClientSessionId } from '../ClientSessionId';
import { safelyParseJSON, createFriendlyErrorMessageTitle, createFriendlyErrorMessage } from '../helpers';
import styles from './cds/alerts-and-prompts/Alert.module.css';

/**
 * A global message, already translated for the user.
 *
 * The value may be `null`, a `String`, or a `<Intl.FormattedMessage>`.
 */
const FlashMessageContext = React.createContext(null);
FlashMessageContext.displayName = 'FlashMessageContext';

/**
 * Setter of a global flash message.
 *
 * The argument may be `null`, a `String`, or a `<Intl.FormattedMessage>`.
 *
 * This is a separate context from FlashMessageContext because its value won't
 * change normally. So setMessage() won't trigger a render on all
 * <FlashMessageSetterContext.Consumer> tags.
 */
const FlashMessageSetterContext = React.createContext(() => {});
FlashMessageSetterContext.displayName = 'FlashMessageSetterContext';

/**
 * Combination <FlashMessageContext.Provider> and
 * <FlashMessageSetterContext.Provider>.
 *
 * Calling setMessage(x) will set message to x and re-render every
 * <FlashMessageContext.Consumer>.
 */
const FlashMessageProviderWithSnackBar = withSnackbar(({ children, enqueueSnackbar }) => {
  const { closeSnackbar } = useSnackbar();

  const setMessage = (message, type) => {
    const variant = type || 'error';
    const persist = (variant === 'error');
    const anchorOrigin = {
      vertical: (variant === 'error') ? 'top' : 'bottom',
      horizontal: (variant === 'error') ? 'center' : 'left',
    };
    if (variant === 'error' && typeof message === 'string') {
      // Split into multiple message in case we have a multiple validation errors
      message.split('<br />').forEach(msg =>
        enqueueSnackbar(msg, {
          variant,
          persist,
          anchorOrigin,
          content: key => (
            <div className="int-flash-message__toast" key={key}>
              <Alert
                className={cx(
                  {
                    [styles['persist-alert-flash-message']]: persist,
                  })
                }
                content={msg}
                floating
                variant={variant}
                onClose={() => { closeSnackbar(key); }}
              />
            </div>
          ),
        }),
      );
    } else if (variant === 'error' && message && typeof message === 'object' && message.length) {
      message.forEach(msg =>
        enqueueSnackbar(msg, {
          variant,
          persist,
          anchorOrigin,
          content: key => (
            <div className="int-flash-message__toast" key={key}>
              <Alert
                className={cx(
                  {
                    [styles['persist-alert-flash-message']]: persist,
                  })
                }
                content={<>{createFriendlyErrorMessage(msg)}</>}
                floating
                title={<>{createFriendlyErrorMessageTitle(msg)}</>}
                variant={variant}
                onClose={() => { closeSnackbar(key); }}
              />
            </div>
          ),
        }),
      );
    } else {
      // enqueueSnackbar(message, { variant, persist, anchorOrigin });
      enqueueSnackbar(message, {
        variant,
        persist,
        anchorOrigin,
        content: key => (
          <div className="int-flash-message__toast" key={key}>
            <Alert
              className={cx(
                {
                  [styles['persist-alert-flash-message']]: persist,
                })
              }
              content={message}
              floating
              variant={variant}
              onClose={() => { closeSnackbar(key); }}
            />
          </div>
        ),
      });
    }
  };

  return (
    <FlashMessageSetterContext.Provider value={setMessage}>
      <FlashMessageContext.Provider value="">
        {children}
      </FlashMessageContext.Provider>
    </FlashMessageSetterContext.Provider>
  );
});

const FlashMessageProvider = ({ children }) => {
  const notistackRef = React.createRef();

  return (
    <SnackbarProvider maxSnack={10} ref={notistackRef}>
      <FlashMessageProviderWithSnackBar>
        { children }
      </FlashMessageProviderWithSnackBar>
    </SnackbarProvider>
  );
};

/**
 * Display the message in an ancestor <FlashMessageContext.Provider>.
 */
const FlashMessage = withSnackbar(withClientSessionId(({ clientSessionId, enqueueSnackbar }) => {
  const message = React.useContext(FlashMessageContext);
  const setMessage = React.useContext(FlashMessageSetterContext);
  const resetMessage = React.useCallback(() => setMessage(null), [setMessage]);

  const useInitialMount = () => {
    const isFirst = React.useRef(true);
    if (isFirst.current) {
      isFirst.current = false;
      return true;
    }
    return false;
  };

  const isInitialMount = useInitialMount();

  if (isInitialMount && clientSessionId && config.pusherKey) {
    // eslint-disable-next-line no-undef
    const pusher = new Pusher(config.pusherKey, {
      cluster: config.pusherCluster,
      encrypted: true,
    });

    pusher.unsubscribe(`check-api-session-channel-${clientSessionId}`);
    pusher.subscribe(`check-api-session-channel-${clientSessionId}`).bind('info_message', (data) => {
      const infoContent = safelyParseJSON(data.message);

      if (infoContent) {
        // Parse markdown-formatted links. E.g.: [label](url)
        const parsedText = reactStringReplace(infoContent.message, /(\[[^[]+?\]\([^(]+?\))/gm, (match, i) => {
          const label = match.match(/\[(.*)\]/)[1];
          const url = match.match(/\((.*)\)/)[1];
          return (
            <a href={url} key={i} rel="noopener noreferrer" target="_blank" title={label}>
              {label}
            </a>
          );
        });
        enqueueSnackbar(parsedText, { variant: 'info' });
      }
    });
  }

  if (message) {
    return (
      <Alert
        banner
        className={cx('home__message', styles['alert-flash-home-message'])}
        content={message}
        variant="info"
        onClose={resetMessage}
      />
    );
  }

  return null;
}));

/**
 * Call <Component setFlashMessage={fn} {...props}>.
 */
const withSetFlashMessage = (Component) => {
  const inner = React.forwardRef((props, ref) => {
    const setFlashMessage = React.useContext(FlashMessageSetterContext);
    return <Component ref={ref} setFlashMessage={setFlashMessage} {...props} />;
  });
  inner.displayName = `WithSetFlashMessage(${Component.displayName || Component.name || 'Component'})`;
  return inner;
};

export {
  FlashMessageProvider,
  FlashMessageContext,
  FlashMessageSetterContext,
  FlashMessage,
  withSetFlashMessage,
};
