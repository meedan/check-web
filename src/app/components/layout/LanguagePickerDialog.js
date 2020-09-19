import React from 'react';
import { PropTypes } from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { FormattedGlobalMessage } from '../MappedMessage';
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
  isSaving,
  onDismiss,
  onSubmit,
  open,
  team,
}) => {
  const [value, setValue] = React.useState(null);
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
  };

  const handleSubmit = () => {
    onSubmit({ languageCode: value, languageName: languageLabel(value) });
  };

  return (
    <Dialog
      open={open}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>
        <FormattedMessage id="languagePickerDialog.title" defaultMessage="Choose a language" />
      </DialogTitle>
      <DialogContent>
        <Autocomplete
          id="autocomplete-add-language"
          name="autocomplete-add-language"
          options={options}
          openOnFocus
          getOptionLabel={getOptionLabel}
          getOptionDisabled={option => option === 'disabled'}
          value={value}
          renderInput={
            params => (<TextField
              label={
                <FormattedMessage
                  id="languagePickerDialog.selectLanguage"
                  defaultMessage="Select a language"
                />
              }
              {...params}
            />)
          }
          onChange={handleChange}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button className="add-language-action__cancel" onClick={onDismiss}>
          <FormattedGlobalMessage messageKey="cancel" />
        </Button>
        <Button
          className="add-language-action__submit"
          color="primary"
          endIcon={isSaving ? <CircularProgress color="inherit" size="1em" /> : null}
          disabled={!value || isSaving}
          onClick={handleSubmit}
          variant="contained"
        >
          <FormattedGlobalMessage messageKey="submit" />
        </Button>
      </DialogActions>
    </Dialog>
  );
};

LanguagePickerDialog.propTypes = {
  isSaving: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
  onDismiss: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  team: PropTypes.shape({
    id: PropTypes.string.isRequired,
    get_languages: PropTypes.string.isRequired,
  }).isRequired,
};

export default injectIntl(LanguagePickerDialog);
