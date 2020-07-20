import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import languagesList from '../languagesList';

const LanguageSwitcher = (props) => {
  const handleChange = (event, newValue) => {
    props.onChange(newValue);
  };

  return (
    <Tabs
      value={props.currentLanguage}
      onChange={handleChange}
      scrollButtons="auto"
      variant="scrollable"
    >
      { props.languages.map((languageCode) => {
        const label = Object.keys(languagesList).indexOf(languageCode) > -1 ?
          languagesList[languageCode].nativeName : languageCode;
        return (
          <Tab
            label={
              languageCode === props.primaryLanguage ?
                <FormattedMessage
                  id="languageSwitcher.primaryLanguage"
                  defaultMessage="{language} (primary)"
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
