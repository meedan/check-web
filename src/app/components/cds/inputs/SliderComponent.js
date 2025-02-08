import React from 'react';
import cx from 'classnames/bind';
import Slider from '@material-ui/core/Slider';
import Tooltip from '../alerts-and-prompts/Tooltip';
import styles from './Slider.module.css';

const valueLabelComponet = (props) => {
  const { children, open, value } = props;

  return (
    <Tooltip arrow open={open} placement="top" title={value}>
      {children}
    </Tooltip>
  );
};

const SliderComponent = props => (
  <Slider
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

export default SliderComponent;
