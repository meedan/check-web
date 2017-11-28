// Encode SVG for use as CSS background
// https://codepen.io/tigt/post/optimizing-svgs-in-data-uris
// eslint-disable-next-line import/prefer-default-export
export function encodeSvgDataUri(svgString) {
  const parsedString = svgString.replace(/\n+/g, '');
  const uriPayload = encodeURIComponent(parsedString);
  return `data:image/svg+xml,${uriPayload}`;
}
