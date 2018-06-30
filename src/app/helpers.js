import truncate from 'lodash.truncate';
import LinkifyIt from 'linkify-it';
import rtlDetect from 'rtl-detect';

// Functionally-pure sort: keeps the given array unchanged and returns sorted one.
Array.prototype.sortp = function sortp(fn) {
  return [].concat(this).sort(fn);
};

function bemClass(baseClass, modifierBoolean, modifierSuffix) {
  return modifierBoolean ? [baseClass, baseClass + modifierSuffix].join(' ') : baseClass;
}

function bemClassFromMediaStatus(baseClass, mediaStatus) {
  return bemClass(
    baseClass,
    (mediaStatus && mediaStatus.length),
    `--${mediaStatus.toLowerCase().replace(/[ _]/g, '-')}`,
  );
}

function safelyParseJSON(jsonString, invalid = null) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return invalid;
  }
}

const nested = (path, obj) => path.reduce((parent, child) =>
  (parent && parent[child]) ? parent[child] : null, obj);

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

function getStatusStyle(status, property) {
  try {
    return status.style[property];
  } catch (e) {
    return '';
  }
}

function truncateLength(text, length = 70) {
  return truncate(text, { length, separator: /,? +/, ellipsis: '…' });
}

// TODO DEPRECATED
// Apply styles conditionally with style components
// Pass in `isRtl` as a prop
function rtlClass(language_code) {
  return (rtlDetect.isRtlLang(language_code)) ? 'translation__rtl' : 'translation__ltr';
}

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

// Convert human-readable file size to bytes
// https://stackoverflow.com/a/6974728/209184
function unhumanizeSize(text) {
  const powers = {
    k: 1, m: 2, g: 3, t: 4,
  };
  const regex = /(\d+(?:\.\d+)?)\s?(k|m|g|t)?b?/i;
  const res = regex.exec(text);
  return res[1] * (1024 ** powers[res[2].toLowerCase()]);
}

// Convert Arabic/Persian numbers to English
// https://codereview.stackexchange.com/questions/166750/convert-persian-and-arabic-digits-to-english
function convertNumbers2English(string) {
  return string
    .replace(/[\u0660-\u0669]/g, c => c.charCodeAt(0) - 0x0660)
    .replace(/[\u06f0-\u06f9]/g, c => c.charCodeAt(0) - 0x06f0);
}

// Encode SVG for use as CSS background
// via https://codepen.io/tigt/post/optimizing-svgs-in-data-uris
function encodeSvgDataUri(svgString) {
  const parsedString = svgString.replace(/\n+/g, '');
  const uriPayload = encodeURIComponent(parsedString);
  return `data:image/svg+xml,${uriPayload}`;
}

function validateURL(value) {
  const linkify = new LinkifyIt();
  const url = linkify.match(value);

  if ((Array.isArray(url) && url[0] && url[0].url)) {
    return true;
  }

  return false;
}

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

function hasFilters() {
  return getFilters() !== '{}';
}

function getErrorMessage(transaction, defaultMessage) {
  const error = transaction.getError();
  let errorMessage = defaultMessage;
  const json = safelyParseJSON(error.source);
  if (json && json.error) {
    errorMessage = json.error;
  }
  return errorMessage;
}

export {
  bemClass,
  bemClassFromMediaStatus,
  rtlClass,
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
  hasFilters,
  getErrorMessage,
};
