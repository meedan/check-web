import React from 'react';
import cx from 'classnames/bind';
import { Slider as MuiSlider } from '@material-ui/core';
import Tooltip from '../alerts-and-prompts/Tooltip';
import styles from './Slider.module.css';

const valueLabelComponet = (props) => {
  const {
    children,
    open,
    value,
    valueLabelDisplay,
  } = props;

  if (valueLabelDisplay === 'off') {
    return children;
  }

  return (
    <Tooltip arrow open={open} placement="top" title={value}>
      {children}
    </Tooltip>
  );
};

const Slider = props => (
  <MuiSlider
    ValueLabelComponent={valueLabelComponet}
    className={cx(
      styles.sliderComponent,
      {
        [props.className]: true,
        [styles.marked]: props.marked,
      },
    )}
    {...props}
  />
);

export default Slider;
