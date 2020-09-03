import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import Autocomplete from '@material-ui/lab/Autocomplete';
import AboutRoute from '../relay/AboutRoute';
import { safelyParseJSON } from '../helpers';

const LanguageSelectorComponent = ({
  about,
  onChange,
  selected,
  team,
}) => {
  const supportedLanguages = safelyParseJSON(about.languages_supported);
  const teamLanguages = safelyParseJSON(team.get_languages);

  const options = (teamLanguages ? teamLanguages.concat('disabled') : [])
    .concat(Object.keys(supportedLanguages)
      .filter(code => !teamLanguages || !teamLanguages.includes(code)));

  const handleChange = (e, value) => {
    if (value !== 'disabled') {
      onChange({ languageCode: value, languageName: supportedLanguages[value] });
    }
  };

  return (
    <Autocomplete
      options={options}
      getOptionLabel={code => supportedLanguages[code] || '──────────'}
      renderInput={params => (
        <div ref={params.InputProps.ref}>
          <input style={{ width: 200 }} type="text" {...params.inputProps} />
        </div>
      )}
      onChange={handleChange}
      defaultValue={selected}
    />
  );
};

LanguageSelectorComponent.propTypes = {
  about: PropTypes.shape({
    languages_supported: PropTypes.string.isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  selected: PropTypes.string.isRequired,
  team: PropTypes.shape({
    get_languages: PropTypes.string.isRequired,
  }).isRequired,
};

const LanguageSelectorContainer = Relay.createContainer(LanguageSelectorComponent, {
  fragments: {
    about: () => Relay.QL`
      fragment on About {
        languages_supported
      }
    `,
  },
});

const LanguageSelector = (props) => {
  const route = new AboutRoute();
  return (
    <Relay.RootContainer
      Component={LanguageSelectorContainer}
      route={route}
      renderFetched={data => <LanguageSelectorContainer {...props} {...data} />}
    />
  );
};

export default LanguageSelector;
