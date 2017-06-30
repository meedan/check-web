// Encode SVG for use as CSS background
// via https://codepen.io/tigt/post/optimizing-svgs-in-data-uris
export function encodeSvgDataUri(svgString) {
  const parsedString = svgString.replace(/\n+/g, '');
  const uriPayload = encodeURIComponent(parsedString);
  return `data:image/svg+xml,${uriPayload}`;
}
