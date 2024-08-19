/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import LanguageIcon from '../../../icons/language.svg';
import { languageLabel } from '../../../LanguageRegistry';

const Language = ({ languageCode, theme, variant }) => (
  <span>
    <ButtonMain
      disabled
      size="small"
      theme={theme}
      iconLeft={<LanguageIcon />}
      variant={variant}
      label={languageLabel(languageCode)}
      buttonProps={{
        type: null,
      }}
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
