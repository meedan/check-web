/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import MediaSearchRedirect from './MediaSearchRedirect';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';

/**
 * <Button> that renders a <MediaSearchRedirect> when clicked.
 *
 * Once the user clicks this `<Button>`, it becomes "unfriendly": simply having
 * it mounted will cause an eventual redirect. Callers should use the `key` prop
 * to unmount the component if any of its props are going to change.
 */
export default function NextOrPreviousButton({
  buildSiblingUrl, className, disabled, icon, listIndex, listQuery, objectType, searchIndex, tooltipTitle, type,
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
    <>
      {loading ? (
        <MediaSearchRedirect
          buildSiblingUrl={buildSiblingUrl}
          listIndex={listIndex}
          listQuery={listQuery}
          objectType={objectType}
          searchIndex={searchIndex}
          type={type}
        />
      ) : (
        <Tooltip arrow title={tooltipTitle}>
          <span>
            <ButtonMain
              className={className}
              disabled={disabled}
              iconCenter={icon}
              size="default"
              theme="text"
              variant="text"
              onClick={handleClick}
            />
          </span>
        </Tooltip>
      )}
    </>
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
  icon: PropTypes.element.isRequired,
  tooltipTitle: PropTypes.node.isRequired, // <FormattedMessage>
  listQuery: PropTypes.object.isRequired,
  listIndex: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
  searchIndex: PropTypes.number.isRequired,
};
