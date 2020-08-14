import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import { compareLanguages, languageLabel } from '../LanguageRegistry';

const LanguageSwitcher = (props) => {
  const handleChange = (event, newValue) => {
    props.onChange(newValue);
  };

  const { primaryLanguage, currentLanguage } = props;
  const languages = props.languages.sort((a, b) => compareLanguages(primaryLanguage, a, b));

  return (
    <Tabs
      value={currentLanguage}
      onChange={handleChange}
      scrollButtons="auto"
      variant="scrollable"
    >
      { languages.map((languageCode) => {
        const label = languageLabel(languageCode);
        return (
          <Tab
            label={
              languageCode === primaryLanguage ?
                <FormattedMessage
                  id="languageSwitcher.primaryLanguage"
                  defaultMessage="{language} (default)"
                  values={{
                    language: label,
                  }}
                /> : label
            }
            value={languageCode}
            key={languageCode}
          />
        );
      })}
    </Tabs>
  );
};

LanguageSwitcher.propTypes = {
  currentLanguage: PropTypes.string.isRequired,
  primaryLanguage: PropTypes.string.isRequired,
  languages: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default LanguageSwitcher;
