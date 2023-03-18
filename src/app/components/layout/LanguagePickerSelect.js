/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import { PropTypes } from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import LanguageIcon from '@material-ui/icons/Language';
import { safelyParseJSON } from '../../helpers';
import LanguageRegistry, { languageLabel } from '../../LanguageRegistry';

const messages = defineMessages({
  optionLabel: {
    id: 'LanguagePickerSelect.optionLabel',
    defaultMessage: '{languageName} ({languageCode})',
  },
  unknownLanguage: {
    id: 'LanguagePickerSelect.unknownLanguage',
    defaultMessage: 'Unknown language',
  },
});

const LanguagePickerSelect = ({
  intl,
  isDisabled,
  selectedlanguage,
  onSubmit,
  team,
}) => {
  const [value, setValue] = React.useState(selectedlanguage);
  const languages = safelyParseJSON(team.get_languages) || [];
  languages.unshift('und');

  // intl.formatMessage needed here because Autocomplete
  // performs toLowerCase on strings for comparison
  const getOptionLabel = (code) => {
    if (code === 'und') return intl.formatMessage(messages.unknownLanguage);
    return intl.formatMessage(messages.optionLabel, {
      languageName: (
        LanguageRegistry[code] ?
          `${LanguageRegistry[code].name} / ${languageLabel(code)}` :
          `${languageLabel(code)}`
      ),
      languageCode: code,
    });
  };

  const handleChange = (e, val) => {
    setValue(val);
    onSubmit({ languageCode: val, languageName: languageLabel(val) });
  };

  return (
    <div id="language-change">
      <Autocomplete
        disabled={isDisabled}
        disableClearable
        id="autocomplete-add-language"
        name="autocomplete-add-language"
        options={languages}
        openOnFocus
        getOptionLabel={getOptionLabel}
        getOptionDisabled={option => option === 'und'}
        getOptionSelected={(option, val) => val !== null && option.id === val.id}
        value={value}
        onChange={handleChange}
        renderInput={params => (
          <FormattedMessage id="LanguagePickerSelect.selectLanguage" defaultMessage="Select language" description="Change language label" >
            { placeholder => (
              <TextField
                {...params}
                name="language-name"
                label={placeholder}
                placeholder={placeholder}
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <React.Fragment>
                      <LanguageIcon fontSize="small" />
                      {params.InputProps.startAdornment}
                    </React.Fragment>
                  ),
                }}
              />
            )}
          </FormattedMessage>
        )}
      />
    </div>
  );
};

LanguagePickerSelect.defaultProps = {
  isDisabled: false,
};

LanguagePickerSelect.propTypes = {
  intl: intlShape.isRequired,
  isDisabled: PropTypes.bool,
  selectedlanguage: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  team: PropTypes.shape({
    id: PropTypes.string.isRequired,
    get_languages: PropTypes.string.isRequired,
  }).isRequired,
};

export default injectIntl(LanguagePickerSelect);
