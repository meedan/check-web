import React from 'react';
import { PropTypes } from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '../../cds/inputs/TextField';
import LanguageRegistry, { languageLabel } from '../../../LanguageRegistry';
import LanguageIcon from '../../../icons/language.svg';

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
  selectedLanguage,
  onSubmit,
  languages,
  isDisabled,
}) => {
  const [value, setValue] = React.useState(selectedLanguage);
  const options = (languages || []).slice();
  options.unshift('und');

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
    <div id="language-change" style={{ minWidth: '230px' }}>
      <Autocomplete
        disabled={isDisabled}
        disableClearable
        id="autocomplete-add-language"
        name="autocomplete-add-language"
        options={options}
        openOnFocus
        getOptionLabel={getOptionLabel}
        getOptionDisabled={option => option === 'und'}
        getOptionSelected={(option, val) => val !== null && option.id === val.id}
        value={value}
        onChange={handleChange}
        renderInput={params => (
          <div ref={params.InputProps.ref}>
            <FormattedMessage id="LanguagePickerSelect.selectLanguage" defaultMessage="Select language" description="Change language label" >
              { placeholder => (
                <TextField
                  iconLeft={<LanguageIcon />}
                  label={<FormattedMessage id="LanguagePickerSelect.selectLanguageLabel" defaultMessage="Language" description="Label for input to select language of fact-check" />}
                  placeholder={placeholder}
                  {...params.inputProps}
                />
              )}
            </FormattedMessage>
          </div>
        )}
      />
    </div>
  );
};

LanguagePickerSelect.defaultProps = {
  languages: [],
  isDisabled: false,
  selectedLanguage: 'und',
};

LanguagePickerSelect.propTypes = {
  intl: intlShape.isRequired,
  selectedLanguage: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  languages: PropTypes.arrayOf(PropTypes.string),
  isDisabled: PropTypes.bool,
};

export default injectIntl(LanguagePickerSelect);
