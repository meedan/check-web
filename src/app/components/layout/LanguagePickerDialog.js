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
    id: 'languagePickerDialog.optionLabel',
    defaultMessage: '{languageName} ({languageCode})',
  },
  unknownLanguage: {
    id: 'languagePickerDialog.unknownLanguage',
    defaultMessage: 'Unknown language',
  },
});

const LanguagePickerDialog = ({
  intl,
  selectedlanguage,
  onSubmit,
  team,
}) => {
  const [value, setValue] = React.useState(selectedlanguage);
  const languages = safelyParseJSON(team.get_languages) || [];

  languages.unshift('und');

  const options = (languages ? languages.concat('disabled') : [])
    .concat(Object.keys(LanguageRegistry)
      .filter(code => !languages.includes(code)));

  // intl.formatMessage needed here because Autocomplete
  // performs toLowerCase on strings for comparison
  const getOptionLabel = (code) => {
    if (code === 'disabled') return '──────────';
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
        disableClearable
        id="autocomplete-add-language"
        name="autocomplete-add-language"
        options={options}
        openOnFocus
        getOptionLabel={getOptionLabel}
        getOptionDisabled={option => option === 'disabled'}
        value={value}
        onChange={handleChange}
        renderInput={params => (
          <TextField
            {...params}
            name="language-name"
            label={
              <FormattedMessage
                id="languagePickerDialog.selectLanguage"
                defaultMessage="Select language"
                description="Change language label"
              />
            }
            variant="outlined"
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <React.Fragment>
                  <LanguageIcon />
                  {params.InputProps.startAdornment}
                </React.Fragment>
              ),
            }}
          />
        )}
      />
    </div>
  );
};

LanguagePickerDialog.propTypes = {
  intl: intlShape.isRequired,
  selectedlanguage: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  team: PropTypes.shape({
    id: PropTypes.string.isRequired,
    get_languages: PropTypes.string.isRequired,
  }).isRequired,
};

export default injectIntl(LanguagePickerDialog);
