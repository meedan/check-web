import React from 'react';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box'

/**
 * Count number of pixels from the top of `el` to the top of the HTML page.
 *
 * Undefined behavior if `el` is not visible or there is `position: fixed`
 * somewhere.
 */
function pxFromDocumentTop(el) {
  let px = 0;
  // https://developer.mozilla.org/en-US/docs/Web/API/HTMLelement/offsetParent
  // offsetParent returns null in the following situations:
  // * The element or its parent element has the display property set to none.
  // * The element  has the position property set to fixed (firefox returns <body>).
  // * The element is <body> or <html>.
  for (let node = el; node !== null; node = node.offsetParent) {
    px += node.offsetTop + node.clientTop;
  }
  return px;
}

/**
 * Render <component style="max-height: calc(100vh - ${offsetTop}px">{children}</component>.
 *
 * You'll want this element to render every time content higher-up in the
 * page renders. You can add dummy props, `affectsHeight1`, `affectsHeight2`,
 * etc., higher-up in the component tree to force renders here.
 */
export default function FillRemainingHeight({ component: Component, children }) {
  const boxRef = React.useRef();
  const [maxHeight, setMaxHeight] = React.useState('auto');

  const handleResize = React.useCallback(() => {
    const box = boxRef.current;
    if (box) {
      const pxBefore = pxFromDocumentTop(box);
      setMaxHeight(`calc(100vh - ${pxBefore}px)`);
    } else {
      setMaxHeight('auto');
    }
  }, [boxRef, setMaxHeight]); // boxRef and setMaxHeight must never change

  React.useLayoutEffect(handleResize);

  React.useEffect(() => {
    // on load, fonts may change, causing height change. (Untested.)
    window.addEventListener('load', handleResize);
    return () => window.removeEventListener('load', handleResize);
  }, [handleResize]);

  return (
    <Box clone maxHeight={maxHeight}>
      <Component ref={boxRef}>
        {children}
      </Component>
    </Box>
  );
}
FillRemainingHeight.propTypes = {
  children: PropTypes.element.isRequired,
  component: PropTypes.elementType.isRequired,
};
