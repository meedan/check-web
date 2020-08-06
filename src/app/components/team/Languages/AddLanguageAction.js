import React from 'react';
import { PropTypes } from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { commitMutation, createFragmentContainer, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { FormattedGlobalMessage } from '../../MappedMessage';
import { FlashMessageSetterContext } from '../../FlashMessage';
import GenericUnknownErrorMessage from '../../GenericUnknownErrorMessage';
import { safelyParseJSON, getErrorMessageForRelayModernProblem } from '../../../helpers';
import LanguageRegistry, { compareLanguages, languageLabel } from '../../../LanguageRegistry';

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

const AddLanguageAction = ({ team }) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [value, setValue] = React.useState(null);
  const setFlashMessage = React.useContext(FlashMessageSetterContext);

  const languages = safelyParseJSON(team.get_languages) || [];
  const options = Object.keys(LanguageRegistry)
    .filter(code => !languages.includes(code))
    .sort((a, b) => compareLanguages(null, a, b));
  const getOptionLabel = code => `${languageLabel(code)} (${code})`;

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
      ));
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
      <Button className="add-language-action__add-button" color="primary" variant="contained" onClick={() => setDialogOpen(true)}>
        <FormattedMessage
          id="addLanguageAction.newLanguage"
          defaultMessage="New language"
        />
      </Button>
      <Dialog
        open={dialogOpen}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <FormattedMessage id="addLanguageAction.title" defaultMessage="Choose a new language" />
        </DialogTitle>
        <DialogContent>
          <Autocomplete
            id="autocomplete-media-item"
            name="autocomplete-media-item"
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
          <Button className="add-language-action__cancel" onClick={() => setDialogOpen(false)}>
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
