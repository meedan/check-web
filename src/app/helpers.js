import config from 'config';

// Functionally-pure sort: keeps the given array unchanged and returns sorted one.
Array.prototype.sortp = function(fn) {
  return [].concat(this).sort(fn);
}

function bemClass(baseClass, modifierBoolean, modifierSuffix) {
  return modifierBoolean ? [baseClass, baseClass + modifierSuffix].join(' ') : baseClass;
}

function teamSubdomain() {
  const baseDomain = config.selfHost;
  const currentDomain = window.location.host;

  if (currentDomain.indexOf(baseDomain) > 1) {
    return currentDomain.slice(0, currentDomain.indexOf(baseDomain) - 1)
  }
}

export { bemClass, teamSubdomain }
