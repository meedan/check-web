import React from 'react';
import { PropTypes } from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { commitMutation, createFragmentContainer, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { FormattedGlobalMessage } from '../../MappedMessage';
import { FlashMessageSetterContext } from '../../FlashMessage';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';
import { stringHelper } from '../../../customHelpers';
import { safelyParseJSON } from '../../../helpers';
import languagesList from '../../../languagesList';

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

const useStyles = makeStyles(theme => ({
  autocompleteWrapper: {
    width: theme.spacing(40),
    height: theme.spacing(12),
  },
}));

const AddLanguageAction = ({ team }) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [value, setValue] = React.useState(null);
  const setFlashMessage = React.useContext(FlashMessageSetterContext);
  const classes = useStyles();

  const languages = safelyParseJSON(team.get_languages) || [];
  const options = Object.keys(languagesList).filter(code => !languages.includes(code));
  const getOptionLabel = code => (
    languagesList[code] ? `${languagesList[code].nativeName} (${code})` : ''
  );

  const handleChange = (e, val) => {
    setValue(val);
  };

  const handleSubmit = () => {
    const onSuccess = () => {
      setValue(null);
      setDialogOpen(false);
    };

    const onFailure = () => {
      setDialogOpen(false);
      setFlashMessage((
        <FormattedGlobalMessage
          messageKey="unknownError"
          values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
        />
      ));
    };

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
      <ConfirmProceedDialog
        body={
          <div className={classes.autocompleteWrapper}>
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
          </div>
        }
        onCancel={() => setDialogOpen(false)}
        onProceed={handleSubmit}
        open={dialogOpen}
        proceedDisabled={!value}
        proceedLabel={<FormattedMessage id="addLanguageAction.addLanguage" defaultMessage="Add language" />}
        title={<FormattedMessage id="addLanguageAction.title" defaultMessage="Choose a new language" />}
      />
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
