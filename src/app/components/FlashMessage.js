import React from 'react';
import Message from './Message';

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
const FlashMessageProvider = ({ children }) => {
  const [message, setMessage] = React.useState(null);

  return (
    <FlashMessageSetterContext.Provider value={setMessage}>
      <FlashMessageContext.Provider value={message}>
        {children}
      </FlashMessageContext.Provider>
    </FlashMessageSetterContext.Provider>
  );
};


const flashMessageStyle = {
  marginTop: '0',
  position: 'fixed',
  width: '100%',
  zIndex: '1000',
};

/**
 * Display the message in an ancestor <FlashMessageContext.Provider>.
 */
const FlashMessage = () => {
  const message = React.useContext(FlashMessageContext);
  const setMessage = React.useContext(FlashMessageSetterContext);
  const resetMessage = React.useCallback(() => setMessage(null), [setMessage]);

  return (
    <Message
      message={message}
      onClick={resetMessage}
      className="home__message"
      style={flashMessageStyle}
    />
  );
};

/**
 * Call <Component setFlashMessage={fn} {...props}>.
 */
const withSetFlashMessage = (Component) => {
  const inner = props => (
    <FlashMessageSetterContext.Consumer>
      {setFlashMessage => <Component setFlashMessage={setFlashMessage} {...props} />}
    </FlashMessageSetterContext.Consumer>
  );
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
