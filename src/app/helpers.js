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

function truncateLength(text, length = 100) {
  return truncate(text, { length, separator: /,? +/, ellipsis: '…' });
}

function rtlClass(language_code) {
  return (rtlDetect.isRtlLang(language_code)) ? 'translation__rtl' : 'translation__ltr';
}

export {
  bemClass,
  bemClassFromMediaStatus,
  rtlClass,
  safelyParseJSON,
  getStatus,
  getStatusStyle,
  truncateLength
};
