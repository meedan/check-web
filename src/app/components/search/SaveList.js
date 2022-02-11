/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import PropTypes from 'prop-types';
import { commitMutation, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { makeStyles } from '@material-ui/core/styles';
import { browserHistory } from 'react-router';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import Box from '@material-ui/core/Box';
import ListIcon from '@material-ui/icons/List';
import { FormattedMessage } from 'react-intl';
import ConfirmProceedDialog from '../layout/ConfirmProceedDialog';
import { withSetFlashMessage } from '../FlashMessage';
import CheckChannels from '../../CheckChannels';
import { checkBlue } from '../../styles/js/shared';

const createMutation = graphql`
  mutation SaveListCreateSavedSearchMutation($input: CreateSavedSearchInput!) {
    createSavedSearch(input: $input) {
      saved_search {
        id
        dbid
      }
      team {
        saved_searches(first: 10000) {
          edges {
            node {
              id
              dbid
              title
              filters
            }
          }
        }
      }
    }
  }
`;

const updateMutation = graphql`
  mutation SaveListUpdateSavedSearchMutation($input: UpdateSavedSearchInput!) {
    updateSavedSearch(input: $input) {
      saved_search {
        filters
      }
    }
  }
`;

const updateSpecialPageMutation = graphql`
  mutation SaveListUpdateTeamMutation($input: UpdateTeamInput!) {
    updateTeam(input: $input) {
      team {
        get_tipline_inbox_filters
        get_suggested_matches_filters
      }
    }
  }
`;

const useStyles = makeStyles(theme => ({
  saveListCreate: {
    whiteSpace: 'nowrap',
    marginRight: theme.spacing(1),
  },
  saveListButton: {
    color: checkBlue,
  },
  saveListCreateLabel: {
    marginRight: 0,
    flexGrow: 1,
  },
}));

const SaveList = ({
  team,
  project,
  projectGroup,
  savedSearch,
  query,
  setFlashMessage,
}) => {
  const currentPath = window.location.pathname.match(/^\/[^/]+\/(list|project|all-items|collection|tipline-inbox|suggested-matches)(\/([0-9]+))?/);
  const classes = useStyles();

  const [title, setTitle] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [operation, setOperation] = React.useState('CREATE'); // or 'UPDATE'
  const [showNewDialog, setShowNewDialog] = React.useState(false);
  const [showExistingDialog, setShowExistingDialog] = React.useState(false);

  if (!currentPath) {
    return null;
  }

  const objectType = currentPath[1];

  // Just show the button on: "All Items", collection and folder (create a list) or list (create a new list or update list)
  if (['all-items', 'project', 'list', 'collection', 'tipline-inbox', 'suggested-matches'].indexOf(objectType) === -1) {
    return null;
  }

  // Don't even show the button if there is nothing to be saved
  if (!query || JSON.stringify(query) === '{}') {
    return null;
  }

  // Don't show the button if it's a list and nothing changed
  if (objectType === 'list' && savedSearch && JSON.stringify(query) === savedSearch.filters) {
    return null;
  }

  // Don't show the button if it's a tipline inbox or suggested matches page and nothing changed
  if (objectType === 'tipline-inbox' || objectType === 'suggested-matches') {
    let defaultQuery = {};
    if (objectType === 'tipline-inbox') {
      defaultQuery = { read: ['0'], projects: ['-1'], verification_status: [team.verification_statuses.default] };
    } else {
      defaultQuery = { suggestions_count: { min: 1 } };
    }
    // Don't show the button if it's a default list
    if (JSON.stringify(query) === JSON.stringify(defaultQuery)) {
      return null;
    }
    // Don't show the button if it's a saved search
    const savedQuery = objectType === 'tipline-inbox' ? team.get_tipline_inbox_filters : team.get_suggested_matches_filters;
    if (savedQuery && JSON.stringify(query) === JSON.stringify(savedQuery)) {
      return null;
    }
  }

  const handleClick = () => {
    // From the "All Items" page, collection page and a folder page, we can just create a new list
    if (objectType === 'all-items' || objectType === 'project' || objectType === 'collection') {
      setShowNewDialog(true);
    // From a list page, we can either create a new one or update the one we're seeing
    } else if (objectType === 'list') {
      setOperation('UPDATE');
      setShowExistingDialog(true);
    } else if (['tipline-inbox', 'suggested-matches'].indexOf(objectType) !== -1) {
      setOperation('UPDATE_SPECIAL_PAGE');
      setShowExistingDialog(true);
    }
  };

  const handleClose = () => {
    setShowNewDialog(false);
    setShowExistingDialog(false);
  };

  const handleError = () => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        id="saveList.defaultErrorMessage"
        defaultMessage="Could not save list, please try again"
        description="Error message displayed when it's not possible to save a list"
      />
    ), 'error');
  };

  const handleSuccess = (response) => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        id="saveList.savedSuccessfully"
        defaultMessage="List saved successfully"
        description="Success message displayed when a list is saved"
      />
    ), 'success');
    setTitle('');
    handleClose();
    if (operation === 'CREATE') {
      browserHistory.push(`/${team.slug}/list/${response.createSavedSearch.saved_search.dbid}`);
    }
  };

  const handleSave = () => {
    setSaving(true);
    const input = {};
    let queryToBeSaved = {};
    // If it's a folder, add the project.id as a filter
    if (project) {
      queryToBeSaved.projects = [project.dbid];
    }
    // If it's a collection, add the projectGroup.id as a filter
    if (projectGroup) {
      queryToBeSaved.project_group_id = [projectGroup.dbid];
    }
    if (objectType === 'tipline-inbox' && operation !== 'UPDATE_SPECIAL_PAGE') {
      queryToBeSaved.channels = [CheckChannels.ANYTIPLINE];
    }
    queryToBeSaved = { ...queryToBeSaved, ...query };

    if (operation === 'UPDATE_SPECIAL_PAGE') {
      if (objectType === 'tipline-inbox') {
        input.tipline_inbox_filters = JSON.stringify(query);
      } else if (objectType === 'suggested-matches') {
        input.suggested_matches_filters = JSON.stringify(query);
      }
    } else {
      input.filters = JSON.stringify(queryToBeSaved);
    }

    let mutation = updateMutation;

    if (operation === 'CREATE') {
      input.team_id = team.dbid;
      input.title = title;
      mutation = createMutation;
    } else if (operation === 'UPDATE') {
      input.id = savedSearch.id;
      mutation = updateMutation;
    } else if (operation === 'UPDATE_SPECIAL_PAGE') {
      input.id = team.id;
      mutation = updateSpecialPageMutation;
    }

    commitMutation(Store, {
      mutation,
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

      {/* The "Save list" button */}
      <Button
        id="save-list__button"
        className={classes.saveListButton}
        startIcon={<ListIcon />}
        onClick={handleClick}
      >
        <FormattedMessage
          id="saveList.saveList"
          defaultMessage="Save list"
          description="'Save' here is in infinitive form - it's a button label, to save the current set of filters applied to a search result as a list"
        />
      </Button>

      {/* Create a new list */}
      <ConfirmProceedDialog
        open={showNewDialog}
        title={<FormattedMessage id="saveList.newList" defaultMessage="Save list" />}
        body={
          <Box>
            <TextField
              label={
                <FormattedMessage
                  id="saveList.title"
                  defaultMessage="Enter new list name"
                />
              }
              onChange={(e) => { setTitle(e.target.value); }}
              variant="outlined"
              margin="normal"
              className="new-list__title"
              fullWidth
            />
          </Box>
        }
        proceedDisabled={!title}
        proceedLabel={<FormattedMessage id="saveList.newList" defaultMessage="Save list" />}
        onProceed={handleSave}
        isSaving={saving}
        cancelLabel={<FormattedMessage id="saveList.cancel" defaultMessage="Cancel" />}
        onCancel={handleClose}
      />

      {/* Create a new list or update an existing list */}
      { savedSearch || ['tipline-inbox', 'suggested-matches'].indexOf(objectType) !== -1 ?
        <ConfirmProceedDialog
          open={showExistingDialog}
          title={<FormattedMessage id="saveList.newList" defaultMessage="Save list" />}
          body={
            <FormControl fullWidth>
              <RadioGroup value={operation} onChange={(e) => { setOperation(e.target.value); }}>
                { savedSearch ?
                  <FormControlLabel
                    value="UPDATE"
                    control={<Radio />}
                    label={<FormattedMessage id="saveList.update" defaultMessage='Save changes to the list "{listName}"' values={{ listName: savedSearch.title }} description="'Save' here is an infinitive verb" />}
                  /> :
                  <FormControlLabel
                    value="UPDATE_SPECIAL_PAGE"
                    control={<Radio />}
                    label={<FormattedMessage id="saveList.updateSpecialPage" defaultMessage="Save changes to the list" description="'Save' here is an infinitive verb" />}
                  />
                }
                <FormControlLabel
                  value="CREATE"
                  control={<Radio />}
                  className={classes.saveListCreateLabel}
                  classes={{ label: classes.saveListCreateLabel }}
                  label={
                    <Box display="flex" alignItems="center" width={1}>
                      <span className={classes.saveListCreate}>
                        <FormattedMessage id="saveList.create" defaultMessage="Create new list" description="'Create' here is an infinitive verb" />
                      </span>
                      <TextField
                        label={
                          <FormattedMessage
                            id="saveList.title"
                            defaultMessage="Enter new list name"
                          />
                        }
                        onChange={(e) => { setTitle(e.target.value); }}
                        variant="outlined"
                        margin="normal"
                        className="new-list__title"
                        disabled={operation === 'UPDATE'}
                        autoFocus={operation === 'CREATE'}
                        fullWidth
                      />
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>
          }
          proceedDisabled={operation === 'CREATE' && !title}
          proceedLabel={<FormattedMessage id="saveList.newList" defaultMessage="Save list" />}
          onProceed={handleSave}
          isSaving={saving}
          cancelLabel={<FormattedMessage id="saveList.cancel" defaultMessage="Cancel" />}
          onCancel={handleClose}
        /> : null }
    </React.Fragment>
  );
};

SaveList.defaultProps = {
  project: null,
  projectGroup: null,
  savedSearch: null,
};

SaveList.propTypes = {
  team: PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
    slug: PropTypes.string.isRequired,
    permissions: PropTypes.string.isRequired,
  }).isRequired,
  query: PropTypes.object.isRequired,
  project: PropTypes.shape({
    dbid: PropTypes.number.isRequired,
  }),
  projectGroup: PropTypes.shape({
    dbid: PropTypes.number.isRequired,
  }),
  savedSearch: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    filters: PropTypes.string.isRequired,
  }),
};

export default withSetFlashMessage(SaveList);
