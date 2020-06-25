import truncate from 'lodash.truncate';
import LinkifyIt from 'linkify-it';
import { toArray } from 'react-emoji-render';

/**
 * Functionally-pure sort: keeps the given array unchanged and returns sorted one.
 */
Array.prototype.sortp = function sortp(fn) {
  return [].concat(this).sort(fn);
};

/**
 * TODO
 */
function bemClass(baseClass, modifierBoolean, modifierSuffix) {
  return modifierBoolean ? [baseClass, baseClass + modifierSuffix].join(' ') : baseClass;
}

/**
 * TODO
 */
function bemClassFromMediaStatus(baseClass, mediaStatus) {
  return bemClass(
    baseClass,
    (mediaStatus && mediaStatus.length),
    `--${mediaStatus.toLowerCase().replace(/[ _]/g, '-')}`,
  );
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
 * Safely traverse an object to return a nested property.
 */
function nested(path, obj) {
  return path.reduce((parent, child) => (parent && parent[child]) ? parent[child] : null, obj);
}

/**
 * Find a status given its id.
 */
function getStatus(statusesParam, id) {
  let statusesJson = statusesParam;
  if (typeof statusesJson === 'string') {
    statusesJson = JSON.parse(statusesJson);
  }
  const { statuses } = statusesJson;
  let status = '';
  statuses.forEach((st) => {
    if (st.id === id) {
      status = st;
    }
  });
  return status;
}

/**
 * Safely get a status style.
 * TODO Deprecate in favour of `nested`.
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
function truncateLength(text, length = 70) {
  return truncate(text, { length, separator: /,? +/, ellipsis: '…' });
}

/**
 * Send a web browser notification.
 */
function notify(title, body, url, icon, name) {
  if (!Notification) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    Notification.requestPermission();
  } else {
    const notification = new Notification(title, { icon, body });
    notification.onclick = () => {
      window.open(url, name);
      window.focus();
      notification.close();
    };
  }

  return true;
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
function getErrorMessage(transaction, fallbackMessage) {
  let message = fallbackMessage;

  const transactionError = transaction.getError();
  const json = safelyParseJSON(transactionError.source);
  const error = json && json.errors && json.errors.length > 0 ? json.errors[0] : {};
  if (error && error.message) {
    message = error.message; // eslint-disable-line prefer-destructuring
  }

  return message;
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
 * Capitalize word
 * https://stackoverflow.com/a/7592235/209184
 */
function capitalize(text) {
  return text.replace(/(?:^|\s)\S/g, a => a.toUpperCase());
}

/**
* Get current project based on curent location and media.projects
*/
function getCurrentProject(projects) {
  let project = null;
  let currentProjectId = window.location.pathname.match(/project\/([0-9]+)/);
  if (currentProjectId) {
    currentProjectId = parseInt(currentProjectId[1], 10);
    project = projects.edges.find(p => parseInt(p.node.dbid, 10) === currentProjectId);
    if (project) {
      project = project.node;
    }
  }
  return project;
}

/**
* Get current project id based on curent location and media.projects
*/
function getCurrentProjectId(projectIds) {
  let projectId = null;
  let currentProjectId = window.location.pathname.match(/project\/([0-9]+)/);
  if (currentProjectId) {
    currentProjectId = parseInt(currentProjectId[1], 10);
    if (projectIds.indexOf(currentProjectId) > -1) {
      projectId = currentProjectId;
    }
  }
  return projectId;
}

export {
  bemClass,
  bemClassFromMediaStatus,
  safelyParseJSON,
  nested,
  getStatus,
  getStatusStyle,
  notify,
  truncateLength,
  unhumanizeSize,
  convertNumbers2English,
  encodeSvgDataUri,
  validateURL,
  getFilters,
  getErrorMessage,
  getErrorObjects,
  emojify,
  capitalize,
  getCurrentProject,
  getCurrentProjectId,
};
