import config from 'config';

// Functionally-pure sort: keeps the given array unchanged and returns sorted one.
Array.prototype.sortp = function (fn) {
  return [].concat(this).sort(fn);
};

function bemClass(baseClass, modifierBoolean, modifierSuffix) {
  return modifierBoolean ? [baseClass, baseClass + modifierSuffix].join(' ') : baseClass;
}

// Make a Check page title as `prefix | team Check`.
// Try to get the current team's name and fallback to just `Check`.
// Skip team name if `skipTeam` is true.
// Skip `prefix |` if `prefix` empty.
function pageTitle(prefix, skipTeam, team) {
  let suffix = 'Check';
  if (!skipTeam) {
    try {
      suffix = `${team.name} Check`;
    } catch (e) {
      if (!(e instanceof TypeError)) throw e;
    }
  }
  return (prefix ? (`${prefix} | `) : '') + suffix;
}

export { bemClass, pageTitle };
