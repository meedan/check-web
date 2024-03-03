import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import ButtonMain from '../buttons-checkboxes-chips/ButtonMain';
import ExpandMoreIcon from '../../../icons/expand_more.svg';
import styles from './ColorPicker.module.css';

const ColorPicker = ({ color, onChange }) => (
  <React.Fragment>
    <ButtonMain
      variant="contained"
      size="default"
      theme="black"
      className={cx('int-colorpicker__button--open', styles.colorPicker)}
      customStyle={{ backgroundColor: color, borderColor: color }}
      iconCenter={
        <>
          <ExpandMoreIcon />
          <input type="color" id="head" name="head" value={color} onChange={onChange} />
        </>
      }
    />
  </React.Fragment>
);

ColorPicker.propTypes = {
  color: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default ColorPicker;
