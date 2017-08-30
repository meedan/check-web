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
  var powers = {'k': 1, 'm': 2, 'g': 3, 't': 4};
  var regex = /(\d+(?:\.\d+)?)\s?(k|m|g|t)?b?/i;
  var res = regex.exec(text);
  return res[1] * Math.pow(1024, powers[res[2].toLowerCase()]);
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
  unhumanizeSize
};
