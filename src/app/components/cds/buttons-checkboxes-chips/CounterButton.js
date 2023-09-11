import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import ButtonMain from './ButtonMain';
import styles from './ButtonMain.module.css';

const CounterButton = ({
  label,
  count,
  onClick,
}) => (
  <ButtonMain
    onClick={onClick}
    theme={count === 0 ? 'lightText' : 'brand'}
    variant="text"
    size="small"
    disabled={!onClick}
    className={cx('test__counter-button', styles.counterButton)}
    label={
      <>
        {label}
        <strong className="typography-subtitle2">
          {count}
        </strong>
      </>
    }
  />
);

CounterButton.defaultProps = {
  onClick: () => {},
};

CounterButton.propTypes = {
  label: PropTypes.object.isRequired,
  count: PropTypes.number.isRequired,
  onClick: PropTypes.func,
};

export default CounterButton;
