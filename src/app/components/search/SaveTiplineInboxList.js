import React from 'react';
import PropTypes from 'prop-types';
import { commitMutation, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ListIcon from '@material-ui/icons/List';
import { FormattedMessage } from 'react-intl';
import { withSetFlashMessage } from '../FlashMessage';
import { checkBlue } from '../../styles/js/shared';


const useStyles = makeStyles({
  saveListButton: {
    color: checkBlue,
  },
});

const SaveTiplineInboxList = ({
  team,
  query,
  setFlashMessage,
}) => {
  const currentPath = window.location.pathname.match(/^\/[^/]+\/(tipline-inbox)(\/([0-9]+))?/);
  if (!currentPath) {
    return null;
  }

  // Just show the button on: "tipline-inbox"
  if (['tipline-inbox'].indexOf(currentPath[1]) === -1) {
    return null;
  }
  const defaultStatusId = team.verification_statuses.default;
  const defaultQuery = { read: ['0'], projects: ['-1'], verification_status: [defaultStatusId] };

  // Don't show the button if it's a default list
  if (JSON.stringify(query) === JSON.stringify(defaultQuery)) {
    return null;
  }
  // Don't show the button if it's a saved search
  const savedQuery = team.get_tipline_inbox_filters;
  if (savedQuery && JSON.stringify(query) === JSON.stringify(savedQuery)) {
    return null;
  }

  const classes = useStyles();

  const handleError = () => {
    setFlashMessage((
      <FormattedMessage
        id="saveList.defaultErrorMessage"
        defaultMessage="Could not save list, please try again"
        description="Error message displayed when it's not possible to save a list"
      />
    ), 'error');
  };

  const handleSuccess = () => {
    setFlashMessage((
      <FormattedMessage
        id="SaveTiplineInboxList.savedSuccessfully"
        defaultMessage="List saved successfully"
        description="Success message displayed when a list is saved"
      />
    ), 'success');
  };

  const handleSave = () => {
    const input = {
      id: team.id,
      tipline_inbox_filters: JSON.stringify(query),
    };

    commitMutation(Store, {
      mutation: graphql`
       mutation SaveTiplineInboxListUpdateTeamMutation($input: UpdateTeamInput!) {
          updateTeam(input: $input) {
            team {
              get_tipline_inbox_filters
            }
          }
        }
      `,
      variables: {
        input,
      },
      onCompleted: (response, error) => {
        if (error) {
          handleError();
        } else {
          handleSuccess(response);
        }
      },
      onError: () => {
        handleError();
      },
    });
  };

  return (
    <React.Fragment>
      <Button
        id="save-tipline-list__button"
        className={classes.saveListButton}
        startIcon={<ListIcon />}
        onClick={handleSave}
      >
        <FormattedMessage
          id="SaveTiplineInboxList.saveList"
          defaultMessage="Save list"
          description="'Save' here is in infinitive form - it's a button label, to save the current set of filters applied to a search result as a list"
        />
      </Button>
    </React.Fragment>
  );
};

SaveTiplineInboxList.propTypes = {
  team: PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
    slug: PropTypes.string.isRequired,
    permissions: PropTypes.string.isRequired,
  }).isRequired,
  query: PropTypes.object.isRequired,
};

export default withSetFlashMessage(SaveTiplineInboxList);
