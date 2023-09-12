import React from 'react';
import { PropTypes } from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { commitMutation, createFragmentContainer, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import { FormattedGlobalMessage } from '../../MappedMessage';
import { FlashMessageSetterContext } from '../../FlashMessage';
import GenericUnknownErrorMessage from '../../GenericUnknownErrorMessage';
import { safelyParseJSON, getErrorMessageForRelayModernProblem } from '../../../helpers';
import LanguageRegistry, { compareLanguages, languageLabelFull } from '../../../LanguageRegistry';

function submitAddLanguage({
  team,
  languages,
  onSuccess,
  onFailure,
}) {
  commitMutation(Store, {
    mutation: graphql`
      mutation AddLanguageActionUpdateTeamMutation($input: UpdateTeamInput!) {
        updateTeam(input: $input) {
          team {
            id
            get_languages
            rules_json_schema
          }
        }
      }
    `,
    variables: {
      input: {
        id: team.id,
        languages,
      },
    },
    onError: onFailure,
    onCompleted: ({ data, errors }) => {
      if (errors) {
        return onFailure(errors);
      }
      return onSuccess(data);
    },
  });
}

// FIXME rewrite using LanguagePickerDialog
const AddLanguageAction = ({ team }) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [value, setValue] = React.useState(null);
  const setFlashMessage = React.useContext(FlashMessageSetterContext);

  const languages = safelyParseJSON(team.get_languages) || [];
  const options = Object.keys(LanguageRegistry)
    .filter(code => !languages.includes(code))
    .sort((a, b) => compareLanguages(null, a, b));
  const getOptionLabel = code => languageLabelFull(code);

  const handleChange = (e, val) => {
    setValue(val);
  };

  const handleSubmit = () => {
    const onSuccess = () => {
      setValue(null);
      setIsSaving(false);
      setDialogOpen(false);
    };

    const onFailure = (errors) => {
      setIsSaving(false);
      setDialogOpen(false);
      console.error(errors); // eslint-disable-line no-console
      setFlashMessage((
        getErrorMessageForRelayModernProblem(errors)
        || <GenericUnknownErrorMessage />
      ), 'error');
    };

    setIsSaving(true);
    submitAddLanguage({
      team,
      languages: JSON.stringify([...languages, value]),
      onSuccess,
      onFailure,
    });
  };

  return (
    <React.Fragment>
      <ButtonMain
        className="add-language-action__add-button"
        theme="brand"
        size="default"
        variant="contained"
        onClick={() => setDialogOpen(true)}
        label={
          <FormattedMessage
            id="addLanguageAction.newLanguage"
            defaultMessage="New language"
            description="Label for button that adds a new language to list of supported languages"
          />
        }
      />
      <Dialog
        open={dialogOpen}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <FormattedMessage
            id="addLanguageAction.title"
            defaultMessage="Choose a new language"
            description="Title of language picker dialog"
          />
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
                variant="outlined"
                label={
                  <FormattedMessage
                    id="addLanguageAction.selectLanguage"
                    defaultMessage="Select a language"
                    description="Label to language selection dropdown"
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
          <ButtonMain
            className="add-language-action__cancel"
            size="default"
            variant="text"
            theme="lightText"
            onClick={() => setDialogOpen(false)}
            label={
              <FormattedGlobalMessage messageKey="cancel" />
            }
          />
          <ButtonMain
            className="add-language-action__submit"
            theme="brand"
            size="default"
            iconRight={isSaving ? <CircularProgress color="inherit" size="1em" /> : null}
            disabled={!value || isSaving}
            onClick={handleSubmit}
            variant="contained"
            label={
              <FormattedMessage
                id="addLanguageAction.addLanguage"
                defaultMessage="Add language"
                description="Label to submit button of language picker dialog"
              />
            }
          />
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

AddLanguageAction.propTypes = {
  team: PropTypes.shape({
    id: PropTypes.string.isRequired,
    get_languages: PropTypes.string.isRequired,
  }).isRequired,
};

export default createFragmentContainer(AddLanguageAction, graphql`
  fragment AddLanguageAction_team on Team {
    id
    get_languages
  }
`);
