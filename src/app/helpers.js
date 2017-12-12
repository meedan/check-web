import config from 'config';
import truncate from 'lodash.truncate';
import rtlDetect from 'rtl-detect';

// Functionally-pure sort: keeps the given array unchanged and returns sorted one.
Array.prototype.sortp = function (fn) {
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

function getStatus(statusesJson, id) {
  const statuses = safelyParseJSON(statusesJson).statuses;
  let status = '';
  statuses.forEach((st) => {
    if (st.id === id) {
      status = st;
    }
  });
  return status;
}

function getStatusStyle(status, property) {
  let style = '';
  if (status && status.style) {
    style = status.style[property];
  }
  return style;
}

function safelyParseJSON(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {}
}

function truncateLength(text, length = 70) {
  return truncate(text, { length, separator: /,? +/, ellipsis: '…' });
}

// DEPRECATED
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
    notification.onclick = function () {
      window.open(url, name);
      window.focus();
      notification.close();
    };
  }
}

// Convert human-readable file size to bytes
// https://stackoverflow.com/a/6974728/209184
function unhumanizeSize(text) {
  const powers = { k: 1, m: 2, g: 3, t: 4 };
  const regex = /(\d+(?:\.\d+)?)\s?(k|m|g|t)?b?/i;
  const res = regex.exec(text);
  return res[1] * Math.pow(1024, powers[res[2].toLowerCase()]);
}

// Convert Arabic/Persian numbers to English
// https://codereview.stackexchange.com/questions/166750/convert-persian-and-arabic-digits-to-english
function convertNumbers2English(string) {
  return string.replace(/[\u0660-\u0669]/g, c => c.charCodeAt(0) - 0x0660).replace(/[\u06f0-\u06f9]/g, c => c.charCodeAt(0) - 0x06f0);
}

// Encode SVG for use as CSS background
// via https://codepen.io/tigt/post/optimizing-svgs-in-data-uris
function encodeSvgDataUri(svgString) {
  const parsedString = svgString.replace(/\n+/g, '');
  const uriPayload = encodeURIComponent(parsedString);
  return `data:image/svg+xml,${uriPayload}`;
}

export {
  bemClass,
  bemClassFromMediaStatus,
  rtlClass,
  safelyParseJSON,
  getStatus,
  getStatusStyle,
  notify,
  truncateLength,
  unhumanizeSize,
  convertNumbers2English,
  encodeSvgDataUri,
};
