/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import LanguageIcon from '../../../icons/language.svg';
import { languageLabel } from '../../../LanguageRegistry';

const Language = ({ languageCode, theme, variant }) => (
  <span>
    <ButtonMain
      buttonProps={{
        type: null,
      }}
      disabled
      iconLeft={<LanguageIcon />}
      label={languageLabel(languageCode)}
      size="small"
      theme={theme}
      variant={variant}
    />
  </span>
);

Language.defaultProps = {
  variant: 'contained',
  theme: 'lightBeige',
};

Language.propTypes = {
  languageCode: PropTypes.string.isRequired,
  variant: PropTypes.string,
  theme: PropTypes.string,
};

export default Language;
