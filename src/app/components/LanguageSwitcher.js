import React from 'react';
import PropTypes from 'prop-types';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import languagesList from '../languagesList';

const LanguageSwitcher = (props) => {
  const handleChange = (event, newValue) => {
    props.onChange(newValue);
  };

  return (
    <Tabs value={props.currentLanguage} onChange={handleChange} variant="fullWidth">
      { props.languages.map(languageCode => (
        <Tab
          label={languagesList[languageCode].nativeName}
          value={languageCode}
          key={languageCode}
        />
      ))}
    </Tabs>
  );
};

LanguageSwitcher.propTypes = {
  currentLanguage: PropTypes.string.isRequired,
  languages: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default LanguageSwitcher;
