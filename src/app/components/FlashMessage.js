import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import IconClose from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import { SnackbarProvider, withSnackbar } from 'notistack';
import Message from './Message';
import ParsedText from './ParsedText';
import { withClientSessionId } from '../ClientSessionId';
import { safelyParseJSON } from '../helpers';
import { checkBlue } from '../styles/js/shared';

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
  const setMessage = (message, type) => {
    const variant = type || 'error';
    const persist = (variant === 'error');
    const anchorOrigin = {
      vertical: (variant === 'error') ? 'top' : 'bottom',
      horizontal: (variant === 'error') ? 'center' : 'left',
    };

    enqueueSnackbar(message, { variant, persist, anchorOrigin });
  };

  return (
    <FlashMessageSetterContext.Provider value={setMessage}>
      <FlashMessageContext.Provider value="">
        {children}
      </FlashMessageContext.Provider>
    </FlashMessageSetterContext.Provider>
  );
});

const useSnackBarStyles = makeStyles({
  info: {
    backgroundColor: checkBlue,
  },
});

const FlashMessageProvider = ({ children }) => {
  const notistackRef = React.createRef();

  const onClickDismiss = key => () => {
    notistackRef.current.closeSnackbar(key);
  };

  const classes = useSnackBarStyles();

  return (
    <SnackbarProvider
      maxSnack={10}
      ref={notistackRef}
      action={key => (
        <IconButton className="message message__dismiss-button" onClick={onClickDismiss(key)}>
          <IconClose />
        </IconButton>
      )}
      classes={{
        variantInfo: classes.info,
      }}
    >
      <FlashMessageProviderWithSnackBar>
        { children }
      </FlashMessageProviderWithSnackBar>
    </SnackbarProvider>
  );
};

const useStyles = makeStyles({
  flashMessageStyle: {
    marginTop: '0',
    position: 'fixed',
    width: '100%',
    zIndex: '1000',
  },
});

/**
 * Display the message in an ancestor <FlashMessageContext.Provider>.
 */
const FlashMessage = withSnackbar(withClientSessionId(({ clientSessionId, enqueueSnackbar }) => {
  const classes = useStyles();
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

  if (isInitialMount && clientSessionId) {
    // eslint-disable-next-line no-undef
    const pusher = new Pusher(config.pusherKey, {
      cluster: config.pusherCluster,
      encrypted: true,
    });

    pusher.unsubscribe(`check-api-session-channel-${clientSessionId}`);
    pusher.subscribe(`check-api-session-channel-${clientSessionId}`).bind('info_message', (data) => {
      const infoContent = safelyParseJSON(data.message);
      if (infoContent) {
        enqueueSnackbar(<ParsedText text={infoContent.message} />, { variant: 'info' });
      }
    });
  }

  return (
    <Message
      message={message}
      onClick={resetMessage}
      className={`home__message ${classes.flashMessageStyle}`}
    />
  );
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
