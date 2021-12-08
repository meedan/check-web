import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import MediaSearchRedirect from './MediaSearchRedirect';

/**
 * <Button> that renders a <MediaSearchRedirect> when clicked.
 *
 * Once the user clicks this `<Button>`, it becomes "unfriendly": simply having
 * it mounted will cause an eventual redirect. Callers should use the `key` prop
 * to unmount the component if any of its props are going to change.
 */
export default function NextOrPreviousButton({
  children, className, disabled, tooltipTitle, buildSiblingUrl, listQuery, listIndex,
}) {
  const [loading, setLoading] = React.useState(false);
  const handleClick = React.useCallback(() => {
    // Prevent the loading indicator from appearing if we are in the middle of editing metadata
    const isUserEditing = document.querySelectorAll('.form-save').length;
    if (isUserEditing === 0) {
      setLoading(true);
    }
  }, [setLoading]);

  return (
    <Button disabled={disabled || loading} className={className} onClick={handleClick}>
      {loading ? (
        <MediaSearchRedirect
          buildSiblingUrl={buildSiblingUrl}
          listQuery={listQuery}
          listIndex={listIndex}
        />
      ) : (
        <Tooltip title={tooltipTitle}>
          {children}
        </Tooltip>
      )}
    </Button>
  );
}
NextOrPreviousButton.defaultProps = {
  className: null,
  disabled: false,
};
NextOrPreviousButton.propTypes = {
  buildSiblingUrl: PropTypes.func.isRequired, // func(dbid, listIndex) => location
  disabled: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  tooltipTitle: PropTypes.node.isRequired, // <FormattedMessage>
  listQuery: PropTypes.object.isRequired,
  listIndex: PropTypes.number.isRequired,
};
