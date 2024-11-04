/* eslint-disable react/sort-prop-types */
import React from 'react';
import { PropTypes } from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { commitMutation, createFragmentContainer, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Dialog from '@material-ui/core/Dialog';
import Loader from '../../cds/loading/Loader';
import TextField from '../../cds/inputs/TextField';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import { FormattedGlobalMessage } from '../../MappedMessage';
import { FlashMessageSetterContext } from '../../FlashMessage';
import GenericUnknownErrorMessage from '../../GenericUnknownErrorMessage';
import { safelyParseJSON, getErrorMessageForRelayModernProblem } from '../../../helpers';
import LanguageRegistry, { compareLanguages, languageLabelFull } from '../../../LanguageRegistry';
import dialogStyles from '../../../styles/css/dialog.module.css';

function submitAddLanguage({
  languages,
  onFailure,
  onSuccess,
  team,
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
const AddLanguageAction = ({ setLanguages, team }) => {
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
      setLanguages(languages.concat(value));
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
        label={
          <FormattedMessage
            defaultMessage="New language"
            description="Label for button that adds a new language to list of supported languages"
            id="addLanguageAction.newLanguage"
          />
        }
        size="default"
        theme="info"
        variant="contained"
        onClick={() => setDialogOpen(true)}
      />
      <Dialog
        className={dialogStyles['dialog-window']}
        fullWidth
        maxWidth="xs"
        open={dialogOpen}
      >
        <div className={dialogStyles['dialog-title']}>
          <FormattedMessage
            defaultMessage="Choose a new language"
            description="Title of language picker dialog"
            id="addLanguageAction.title"
            tagName="h6"
          />
        </div>
        <div className={dialogStyles['dialog-content']}>
          <Autocomplete
            getOptionLabel={getOptionLabel}
            id="autocomplete-add-language"
            name="autocomplete-add-language"
            openOnFocus
            options={options}
            renderInput={params => (
              <div ref={params.InputProps.ref}>
                <FormattedMessage defaultMessage="Select a language" description="Placeholder to language selection dropdown" id="addLanguageAction.selectLanguagePlaceholder">
                  { placeholder => (
                    <TextField
                      helpContent={<FormattedMessage defaultMessage="After adding this language, be sure to customize the chatbot’s responses in the tipline settings." description="Help text for next steps after selecting a language" id="addLanguageAction.selectLanguageHelp" />}
                      label={
                        <FormattedMessage
                          defaultMessage="Language"
                          description="Label to language selection dropdown"
                          id="addLanguageAction.selectLanguage"
                        />
                      }
                      placeholder={placeholder}
                      variant="outlined"
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
        <div className={dialogStyles['dialog-actions']}>
          <ButtonMain
            className="add-language-action__cancel"
            label={
              <FormattedGlobalMessage messageKey="cancel" />
            }
            size="default"
            theme="lightText"
            variant="text"
            onClick={() => setDialogOpen(false)}
          />
          <ButtonMain
            className="add-language-action__submit"
            disabled={!value || isSaving}
            iconLeft={isSaving ? <Loader size="icon" theme="white" variant="icon" /> : null}
            label={
              <FormattedMessage
                defaultMessage="Add language"
                description="Label to submit button of language picker dialog"
                id="addLanguageAction.addLanguage"
              />
            }
            size="default"
            theme="info"
            variant="contained"
            onClick={handleSubmit}
          />
        </div>
      </Dialog>
    </React.Fragment>
  );
};

AddLanguageAction.propTypes = {
  team: PropTypes.shape({
    id: PropTypes.string.isRequired,
    get_languages: PropTypes.string.isRequired,
  }).isRequired,
  setLanguages: PropTypes.func.isRequired,
};

export default createFragmentContainer(AddLanguageAction, graphql`
  fragment AddLanguageAction_team on Team {
    id
    get_languages
  }
`);
