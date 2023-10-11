import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import Reorder from '../../layout/Reorder';
import styles from './TeamLists.module.css';

const TeamListsItem = ({
  column,
  isFirst,
  isLast,
  onToggle,
  onMoveUp,
  onMoveDown,
  isRequired,
}) => {
  const {
    index,
    key,
    label,
    show,
  } = column;
  const handleToggle = () => {
    onToggle(key, index);
  };

  const handleMoveUp = () => {
    onMoveUp(key, index);
  };

  const handleMoveDown = () => {
    onMoveDown(key, index);
  };

  return (
    <div className={styles['teamlist-column-item']}>
      { onMoveUp && onMoveDown ?
        <Reorder
          variant="vertical"
          theme="white"
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          disableUp={isFirst}
          disableDown={isLast}
        /> : null }
      <div
        id={`team-lists__item-${index}-${key}`}
        className={cx(
          styles['item-details'],
          {
            [styles['item-visible']]: show,
          })
        }
      >
        <div className={styles['item-content']}>
          <span title={label} className={styles['item-label']}>
            {label}
          </span>
          { /^task_value_/.test(key) ?
            <FormattedMessage
              tagName="small"
              id="teamListsItem.metadata"
              defaultMessage="Annotation"
              description="label to show that this type of task is an annotation"
            /> :
            <FormattedMessage
              tagName="small"
              id="teamListsItem.general"
              defaultMessage="General"
              description="label to show that this type of task is a general task"
            />
          }
        </div>
        {
          isRequired ?
            null :
            <div className={styles['item-actions']}>
              <ButtonMain
                theme="lightBrand"
                variant="contained"
                size="small"
                onClick={handleToggle}
                className="int-list-toggle__button"
                label={show ?
                  <FormattedMessage
                    id="teamListsItem.hide"
                    defaultMessage="Hide"
                    description="Button label to hide this item from the list"
                  /> :
                  <FormattedMessage
                    id="teamListsItem.show"
                    defaultMessage="Display"
                    description="Button label to show this item in the list"
                  />
                }
              />
            </div>
        }
      </div>
    </div>
  );
};

TeamListsItem.defaultProps = {
  isFirst: false,
  isLast: false,
  onMoveUp: null,
  onMoveDown: null,
  isRequired: false,
};

TeamListsItem.propTypes = {
  column: PropTypes.shape({
    index: PropTypes.number.isRequired,
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    show: PropTypes.bool.isRequired,
  }).isRequired,
  isFirst: PropTypes.bool,
  isLast: PropTypes.bool,
  onToggle: PropTypes.func.isRequired,
  onMoveUp: PropTypes.func,
  onMoveDown: PropTypes.func,
  isRequired: PropTypes.bool,
};

export default TeamListsItem;
