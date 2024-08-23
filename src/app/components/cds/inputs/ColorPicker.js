import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import ButtonMain from '../buttons-checkboxes-chips/ButtonMain';
import ExpandMoreIcon from '../../../icons/expand_more.svg';
import styles from './ColorPicker.module.css';

const ColorPicker = ({ color, onChange }) => (
  <React.Fragment>
    <ButtonMain
      className={cx('int-colorpicker__button--open', styles.colorPicker)}
      customStyle={{ backgroundColor: color, borderColor: color }}
      iconCenter={
        <>
          <ExpandMoreIcon />
          <input id="head" name="head" type="color" value={color} onChange={onChange} />
        </>
      }
      size="default"
      theme="black"
      variant="contained"
    />
  </React.Fragment>
);

ColorPicker.propTypes = {
  color: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default ColorPicker;
