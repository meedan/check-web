import React from 'react';
import PropTypes from 'prop-types';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import LanguageIcon from '../../../icons/language.svg';
import { languageLabel } from '../../../LanguageRegistry';

const Language = ({ languageCode }) => (
  <span>
    <ButtonMain
      disabled
      size="small"
      theme="lightBeige"
      iconLeft={<LanguageIcon />}
      variant="contained"
      label={languageLabel(languageCode)}
      buttonProps={{
        type: null,
      }}
    />
  </span>
);

Language.propTypes = {
  languageCode: PropTypes.string.isRequired,
};

export default Language;
