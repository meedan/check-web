// general-purpose JS helper utilities

// Functionally-pure sort: keeps the given array unchanged and returns sorted one.
Array.prototype.sortp = function(fn) {
  return [].concat(this).sort(fn);
}
