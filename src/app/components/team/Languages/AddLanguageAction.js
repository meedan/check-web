import React from 'react';
import { PropTypes } from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { graphql, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';
import languagesList from '../../../languagesList';

function submitAddLanguage({ input, onCompleted, onError }) {
  commitMutation(Store, {
    mutation: graphql`
      mutation AddLanguageActionUpdateTeamMutation($input: UpdateTeamInput!) {
        updateTeam(input: $input) {
          team {
            id
            get_languages
          }
        }
      }
    `,
    variables: {
      input,
    },
    onCompleted,
    onError,
  });
}

const useStyles = makeStyles(theme => ({
  autocompleteWrapper: {
    width: theme.spacing(40),
    height: theme.spacing(12),
  },
}));

const AddLanguageAction = ({
  languages,
  team,
}) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedLanguage, setSelectedLanguage] = React.useState('');
  const classes = useStyles();

  const options = Object.keys(languagesList).filter(code => !languages.includes(code));
  const getOptionLabel = code => `${languagesList[code].nativeName} (${code})`;

  const handleSelectLanguage = (e, value) => {
    setSelectedLanguage(value);
  };

  const handleSubmit = () => {
    const onCompleted = () => {
      setSelectedLanguage('');
      setDialogOpen(false);
    };
    const onError = () => {};

    submitAddLanguage({
      input: {
        id: team.id,
        languages: JSON.stringify([...languages, selectedLanguage]),
      },
      onCompleted,
      onError,
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
              onChange={handleSelectLanguage}
              fullWidth
            />
          </div>
        }
        onCancel={() => setDialogOpen(false)}
        onProceed={handleSubmit}
        open={dialogOpen}
        proceedDisabled={!selectedLanguage}
        proceedLabel={<FormattedMessage id="addLanguageAction.addLanguage" defaultMessage="Add language" />}
        title={<FormattedMessage id="addLanguageAction.title" defaultMessage="Choose a new language" />}
      />
    </React.Fragment>
  );
};

AddLanguageAction.propTypes = {
  languages: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  team: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
};

export default AddLanguageAction;
