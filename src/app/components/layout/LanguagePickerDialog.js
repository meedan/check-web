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
import LanguageRegistry, { compareLanguages, languageLabel } from '../../LanguageRegistry';

const messages = defineMessages({
  optionLabel: {
    id: 'addLanguageAction.optionLabel',
    defaultMessage: '{languageName} ({languageCode})',
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

  // FIXME Make team languages appear first as in previous picker
  const options = Object.keys(LanguageRegistry)
    .filter(code => !languages.includes(code))
    .sort((a, b) => compareLanguages(null, a, b));

  // intl.formatMessage needed here because Autocomplete
  // performs toLowerCase on strings for comparison
  const getOptionLabel =
    code => intl.formatMessage(messages.optionLabel, {
      languageName: `${LanguageRegistry[code].name} / ${languageLabel(code)}`,
      languageCode: code,
    });

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
        <FormattedMessage id="addLanguageAction.title" defaultMessage="Choose a new language" />
      </DialogTitle>
      <DialogContent>
        <Autocomplete
          id="autocomplete-add-language"
          name="autocomplete-add-language"
          options={options}
          openOnFocus
          getOptionLabel={getOptionLabel}
          value={value}
          renderInput={
            params => (<TextField
              label={
                <FormattedMessage
                  id="addLanguageAction.selectLanguage"
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
          <FormattedMessage id="addLanguageAction.addLanguage" defaultMessage="Add language" />
        </Button>
      </DialogActions>
    </Dialog>
  );
};

LanguagePickerDialog.propTypes = {
  team: PropTypes.shape({
    id: PropTypes.string.isRequired,
    get_languages: PropTypes.string.isRequired,
  }).isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(LanguagePickerDialog);
