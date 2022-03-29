import React from 'react';
import Button from '@material-ui/core/Button';
import { FormattedMessage } from 'react-intl';
import LinkifyIt from 'linkify-it';
import { toArray } from 'react-emoji-render';
import styled from 'styled-components';
import CheckError from './CheckError';
import { units } from './styles/js/shared';

/**
 * TODO
 */
function bemClass(baseClass, modifierBoolean, modifierSuffix) {
  return modifierBoolean ? [baseClass, baseClass + modifierSuffix].join(' ') : baseClass;
}

/**
 * Parse a JSON string without throwing an exception.
 */
function safelyParseJSON(jsonString, invalid = null) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return invalid;
  }
}

/**
 * Find a status given its id.
 */
function getStatus(statusesParam, id, language, defaultLanguage) {
  let statusesJson = statusesParam;
  if (typeof statusesJson === 'string') {
    statusesJson = JSON.parse(statusesJson);
  }
  const { statuses } = statusesJson;
  let status = '';
  statuses.forEach((st) => {
    if (st.id === id) {
      status = JSON.parse(JSON.stringify(st));
    }
  });
  if (language) {
    const defaultLabel = status.locales[defaultLanguage || 'en'] ?
      status.locales[defaultLanguage || 'en'].label : '';
    status.label = status.locales[language] ?
      status.locales[language].label : defaultLabel;
  }
  return status;
}

/**
 * Safely get a status style.
 */
function getStatusStyle(status, property) {
  try {
    return status.style[property];
  } catch (e) {
    return '';
  }
}

/**
 * Truncate a string and append ellipsis.
 */
function truncateLength(str, length = 70) {
  const dots = str.length > length ? '...' : '';
  return `${str.substring(0, length)}${dots}`;
}

/**
 * Uppercase the first character of a string, lowercase the remaining
 */
function capitalize(str) {
  return `${str.substring(0, 1).toUpperCase()}${str.substr(1).toLowerCase()}`;
}

/**
 * Return an array of unique values that are in all arrays passed as arguments
 */
function intersection(array, ...args) {
  return array.filter(item => args.every(arr => arr.includes(item)));
}


/**
 * Convert human-readable file size to bytes
 * https://stackoverflow.com/a/6974728/209184
 */
function unhumanizeSize(text) {
  const powers = {
    k: 1, m: 2, g: 3, t: 4,
  };
  const regex = /(\d+(?:\.\d+)?)\s?(k|m|g|t)?b?/i;
  const res = regex.exec(text);
  return res[1] * (1024 ** powers[res[2].toLowerCase()]);
}

/**
 * Convert Arabic/Persian numbers to English
 * https://codereview.stackexchange.com/questions/166750/convert-persian-and-arabic-digits-to-english
 */
function convertNumbers2English(string) {
  return string
    .replace(/[\u0660-\u0669]/g, c => c.charCodeAt(0) - 0x0660)
    .replace(/[\u06f0-\u06f9]/g, c => c.charCodeAt(0) - 0x06f0);
}

/**
 * Encode SVG for use as CSS background.
 * via https://codepen.io/tigt/post/optimizing-svgs-in-data-uris
 */
function encodeSvgDataUri(svgString) {
  const parsedString = svgString.replace(/\n+/g, '');
  const uriPayload = encodeURIComponent(parsedString);
  return `data:image/svg+xml,${uriPayload}`;
}

/**
 * Check if the argument is a valid URL.
 */
function validateURL(value) {
  const linkify = new LinkifyIt();
  const url = linkify.match(value);
  return (Array.isArray(url) && url[0] && url[0].url);
}

/**
 * Extract filter values from the current URL path.
 */
function getFilters() {
  let filters = '{}';
  const urlParts = document.location.pathname.split('/');
  try {
    filters = JSON.parse(decodeURIComponent(urlParts[urlParts.length - 1]));
  } catch (e) {
    filters = '{}';
  }
  if (typeof filters === 'object') {
    filters = JSON.stringify(filters);
  } else {
    filters = '{}';
  }
  return filters;
}

/**
 * Safely extract an error message from a transaction, with default fallback.
 */
function getErrorMessage(transactionOrError, fallbackMessage) {
  let message = fallbackMessage;
  const json = transactionOrError.source ?
    safelyParseJSON(transactionOrError.source) :
    safelyParseJSON(transactionOrError.getError().source); // TODO remove after Relay Modern update
  const error = json && json.errors && json.errors.length > 0 ? json.errors[0] : {};
  if (error && error.message) {
    message = error.message; // eslint-disable-line prefer-destructuring
  }

  return message;
}

function getErrorObjectsForRelayModernProblem(errorOrErrors) {
  if (errorOrErrors.source) {
    const json = safelyParseJSON(errorOrErrors.source);
    return json && json.errors && json.errors.length > 0 ? json.errors : null;
  }
  return null;
}

// Requires an CheckNetworkLayer c. 2019 object with the `code` and `message` properties
function createFriendlyErrorMessage(error) {
  const StyledContainer = styled.div`
    margin: 0 0 0 ${units(2)};
    max-width: 500px;
  `;
  const StyledSummary = styled.summary`
    cursor: pointer;
    margin-bottom: 8px;
    user-select: none;
  `;
  const StyledTextarea = styled.textarea`
    width: 100%;
  `;
  const StyledButton = styled.span`
    & > .MuiButtonBase-root {
      text-transform: uppercase;
      color: #d32f2f;
      background-color: white;
    }
  `;
  const friendlyMessage = CheckError.getMessageFromCode(error.code);
  return (
    <StyledContainer id="snack-flex">
      <p>
        <strong>
          {friendlyMessage}
        </strong>
        {' '}Please report this issue to Meedan to help us fix it.
      </p>
      <p>
        <StyledButton>
          <FormattedMessage
            id="check.helpers.intercom_help"
            defaultMessage="Press the 'send' arrow to the right to send the report."
            description="This is text that will appear when the user opens the third-party application to file a bug report with our customer service. The arrow will be to the right side of the text regardless of whether this is a left-to-right or a right-to-left language."
          >
            {help_text => (
              <Button
                variant="contained"
                onClick={() => Intercom('showNewMessage', `(${help_text})\nReport: ${friendlyMessage.props.defaultMessage}\nCode: ${error.code}\nURL: ${window.location}\nDetails: ${error.message}`)}
              >
                <FormattedMessage
                  id="check.helpers.report_issue"
                  defaultMessage="Report issue"
                  description="This is a label on a button that appears in an error popup. When the user presses the button, another popup opens that allows the user to report an issue to customer service."
                />
              </Button>
            )}
          </FormattedMessage>
        </StyledButton>
      </p>
      <p>
        <details>
          <StyledSummary>
            <FormattedMessage
              id="check.helpers.more_info"
              defaultMessage="More info..."
              description="This is a label on a button that users press in order to get more info related to an error message."
            />
          </StyledSummary>
          <StyledTextarea id="error-message" name="error-message" rows="5">
            {error.message}
          </StyledTextarea>
        </details>
      </p>
    </StyledContainer>
  );
}

/**
 * Extract an error message from a Relay Modern error(s) or return `null` if
 * not possible.
 *
 * Note: with Relay Compat and CheckNetworkLayer c. 2019, we'll get `null` on
 * a network error (since the network layer will throw an Error). When we
 * upgrade our network layer to a Relay Modern one we should be able to avoid
 * JavaScript Errors and rely on Objects instead. Then we should discuss what
 * to do in the event of a network error.
 *
 * Calling convention:
 *
 * ```
 * commitUpdate(
 *   // ...
 *   onComplete: ({ data, errors }) => {
 *     if (data === null && errors) {
 *       reportProblem(errors);
 *     }
 *     handleData(data);
 *   }
 *   onError: err => reportProblem(err) // Error object
 * ```
 *
 * `reportProblem()` in this example must be able to handle `null`: we may not
 * be able to extract a sensible error message, even when the caller is certain
 * there was a problem. In that case, the caller should have a fallback. To
 * continue this example:
 *
 * ```
 * function MyComponent(props) {
 *   const [problem, setProblem] = React.useState(null);
 *   // ...
 *   if (problem !== null) {
 *     return (
 *       getErrorMessageForRelayModernProblem(problem) || (
   *       <FormattedMessage id="myComponent.unknownError" defaultMessage="Oops" />
   *     )
 *     );
 *   }
 * }
 * ```
 */
function getErrorMessageForRelayModernProblem(errorOrErrors) {
  if (errorOrErrors.source) { // Error was thrown from CheckNetworkLayer, c. 2019
    // return getErrorMessage(errorOrErrors, null);
    return getErrorObjectsForRelayModernProblem(errorOrErrors);
  }
  if (errorOrErrors.length) { // Error is an Array the API returned, alongside null data
    return errorOrErrors.map(({ message }) => message).filter(m => Boolean(m))[0] || null;
  }

  // If we didn't get an error from our network layer, and we didn't get an
  // error from the API, then what happened? Let's log the error and let the
  // user supply a fallback.

  // eslint-disable-next-line no-console
  console.warn('Unhandled error from Relay Modern', errorOrErrors);
  return null;
}

/**
 * Safely extract an error object from a transaction
 */
function getErrorObjects(transaction) {
  const transactionError = transaction.getError();
  const json = safelyParseJSON(transactionError.source);
  return json && json.errors && json.errors.length > 0 ? json.errors : null;
}

/**
 * Safely convert emojis to Unicode characters.
 */
function emojify(text) {
  try {
    return toArray(text).map(e => typeof e === 'string' ? e : e.props.children).join('');
  } catch (e) {
    return text;
  }
}

/**
 * Return a JavaScript `Date` from a stringified UNIX timestamp.
 *
 * TODO don't pass stringified UNIX timestamps over the wire. Use ISO8601 ... or
 * at least Numbers.
 */
function parseStringUnixTimestamp(s) {
  return new Date(parseInt(s, 10) * 1000);
}

/**
 * Return the human bot name
 * FIXME: That should be changed in the backend actually
 */
function botName(bot) {
  return bot.name === 'Smooch' ? 'Tipline' : bot.name;
}

export { // eslint-disable-line import/no-unused-modules
  bemClass,
  safelyParseJSON,
  getStatus,
  getStatusStyle,
  truncateLength,
  capitalize,
  intersection,
  unhumanizeSize,
  convertNumbers2English,
  encodeSvgDataUri,
  validateURL, // TODO: Verify if it is worthy using this for all URL validations across the app
  getFilters,
  getErrorMessage,
  getErrorMessageForRelayModernProblem,
  getErrorObjectsForRelayModernProblem,
  getErrorObjects,
  createFriendlyErrorMessage,
  emojify,
  parseStringUnixTimestamp,
  botName,
};
