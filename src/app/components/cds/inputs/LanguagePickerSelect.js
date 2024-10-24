import React from 'react';
import { PropTypes } from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '../../cds/inputs/TextField';
import LanguageRegistry, { languageLabel } from '../../../LanguageRegistry';
import LanguageIcon from '../../../icons/language.svg';
import ChevronDownIcon from '../../../icons/chevron_down.svg';

const messages = defineMessages({
  optionLabel: {
    id: 'LanguagePickerSelect.optionLabel',
    defaultMessage: '{languageName} ({languageCode})',
    description: 'English (en), French (fr), etc.',
  },
  allLanguages: {
    id: 'LanguagePickerSelect.allLanguages',
    defaultMessage: 'Languages: All',
    description: 'Label for the all languages option',
  },
  unknownLanguage: {
    id: 'LanguagePickerSelect.unknownLanguage',
    defaultMessage: 'Unknown language',
    description: 'Label for the unknown language option',
  },
});

const LanguagePickerSelect = ({
  allowAllLanguages,
  helpContent,
  intl,
  isDisabled,
  label,
  languages,
  onSubmit,
  required,
  selectedLanguage,
}) => {
  const [value, setValue] = React.useState(selectedLanguage);
  const options = (languages || []).slice();

  if (allowAllLanguages) {
    options.unshift('all');
  }

  if (!allowAllLanguages && !options.includes('und')) {
    options.unshift('und');
  }

  // intl.formatMessage needed here because Autocomplete
  // performs toLowerCase on strings for comparison
  const getOptionLabel = (code) => {
    if (code === 'all') return intl.formatMessage(messages.allLanguages);
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
        disableClearable
        disabled={isDisabled}
        getOptionDisabled={option => option === 'und'}
        getOptionLabel={getOptionLabel}
        getOptionSelected={(option, val) => val !== null && option.id === val.id}
        id="autocomplete-add-language"
        name="autocomplete-add-language"
        openOnFocus
        options={options}
        renderInput={params => (
          <div ref={params.InputProps.ref}>
            <FormattedMessage defaultMessage="Select language" description="Change language label" id="LanguagePickerSelect.selectLanguage" >
              { placeholder => (
                <TextField
                  helpContent={helpContent}
                  iconLeft={<LanguageIcon />}
                  iconRight={<ChevronDownIcon />}
                  label={label}
                  placeholder={placeholder}
                  required={required}
                  {...params.inputProps}
                />
              )}
            </FormattedMessage>
          </div>
        )}
        value={value}
        onChange={handleChange}
      />
    </div>
  );
};

LanguagePickerSelect.defaultProps = {
  languages: [],
  isDisabled: false,
  label: null,
  selectedLanguage: 'und',
  helpContent: null,
  required: false,
};

LanguagePickerSelect.propTypes = {
  helpContent: PropTypes.node,
  intl: intlShape.isRequired,
  isDisabled: PropTypes.bool,
  label: PropTypes.node,
  languages: PropTypes.arrayOf(PropTypes.string),
  required: PropTypes.bool,
  selectedLanguage: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
};

export default injectIntl(LanguagePickerSelect);
