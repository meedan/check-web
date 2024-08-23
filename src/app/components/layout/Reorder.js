/* eslint-disable react/sort-prop-types */

// DESIGNS: https://www.figma.com/file/7ZlvdotCAzeIQcbIKxOB65/Components?type=design&node-id=2142-47843&mode=design&t=Xk5LFyi7pmsXEX1T-4
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import ArrowDropUpIcon from '../../icons/arrow_drop_up.svg';
import ArrowDropDownIcon from '../../icons/arrow_drop_down.svg';
import styles from './Reorder.module.css';

const Reorder = ({
  className,
  customStyle,
  disableDown,
  disableUp,
  onMoveDown,
  onMoveUp,
  theme,
  variant,
}) => (
  <div
    className={cx(
      [styles.reorder],
      styles[`theme-${theme}`],
      {
        [className]: true,
        [styles.horizontal]: variant === 'horizontal',
        [styles.vertical]: variant === 'vertical',
      })
    }
    style={customStyle}
  >
    <Tooltip
      arrow
      disableHoverListener={disableUp}
      placement="top"
      title={
        <FormattedMessage
          defaultMessage="Move item up"
          description="Tooltip for control that moves an item higher up in a list"
          id="reorder.moveUp"
        />
      }
    >
      <span>
        <ButtonMain
          className="int-reorder__button-up"
          disabled={disableUp}
          iconCenter={<ArrowDropUpIcon />}
          size="small"
          theme="info"
          variant="text"
          onClick={onMoveUp}
        />
      </span>
    </Tooltip>
    <hr />
    <Tooltip
      arrow
      disableHoverListener={disableDown}
      placement="bottom"
      title={
        <FormattedMessage
          defaultMessage="Move item down"
          description="Tooltip for control that moves an item lower in a list"
          id="reorder.moveDown"
        />
      }
    >
      <span>
        <ButtonMain
          className="int-reorder__button-down"
          disabled={disableDown}
          iconCenter={<ArrowDropDownIcon />}
          size="small"
          theme="info"
          variant="text"
          onClick={onMoveDown}
        />
      </span>
    </Tooltip>
  </div>
);

Reorder.defaultProps = {
  disableUp: false,
  disableDown: false,
  theme: 'gray',
  variant: 'vertical',
  className: '',
  customStyle: {},
};

Reorder.propTypes = {
  className: PropTypes.string,
  customStyle: PropTypes.object,
  theme: PropTypes.oneOf(['gray', 'white']),
  variant: PropTypes.oneOf(['vertical', 'horizontal']),
  onMoveUp: PropTypes.func.isRequired,
  onMoveDown: PropTypes.func.isRequired,
  disableUp: PropTypes.bool,
  disableDown: PropTypes.bool,
};

export default Reorder;
