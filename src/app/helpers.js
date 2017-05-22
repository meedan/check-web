import config from 'config';
import truncate from 'lodash.truncate';

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

// Make a Check page title as `prefix | team Check`.
// Try to get the current team's name and fallback to just `Check`.
// Skip team name if `skipTeam` is true.
// Skip `prefix |` if `prefix` empty.
function pageTitle(prefix, skipTeam, team) {
  let suffix = capitalize(config.appName);
  if (!skipTeam) {
    try {
      suffix = `${team.name} ${capitalize(config.appName)}`;
    } catch (e) {
      if (!(e instanceof TypeError)) throw e;
    }
  }
  return (prefix ? (`${prefix} | `) : '') + suffix;
}

function safelyParseJSON(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {}
}

function truncateLength(text, length = 100) {
  return truncate(text, { length, separator: /,? +/, ellipsis: '…' });
}

function capitalize(text) {
  return text.charAt(0).toUpperCase()+text.substring(1);
}

function rtlClass(language_code) {
  const rtl_locales = [
    'ar',
    'ar-001',
    'he',
  ];
  return (rtl_locales.indexOf(language_code) > -1) ? 'translation__rtl' : '';
}

export {
  bemClass,
  bemClassFromMediaStatus,
  capitalize,
  rtlClass,
  pageTitle,
  safelyParseJSON,
  getStatus,
  getStatusStyle,
  truncateLength
};
