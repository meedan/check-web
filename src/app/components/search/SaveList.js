import React from 'react';
import PropTypes from 'prop-types';
import { commitMutation, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { makeStyles } from '@material-ui/core/styles';
import { browserHistory } from 'react-router';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import Box from '@material-ui/core/Box';
import { FormattedMessage, FormattedHTMLMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import { can } from '../Can';
import { withSetFlashMessage } from '../FlashMessage';
import TextField from '../cds/inputs/TextField';
import ConfirmProceedDialog from '../layout/ConfirmProceedDialog';
import Alert from '../cds/alerts-and-prompts/Alert';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';

const messages = defineMessages({
  saveList: {
    id: 'saveList.title',
    defaultMessage: 'Enter new list name',
    description: 'Prompt for editing list name',
  },
  saveAsNewList: {
    id: 'saveList.saveAsNewList',
    defaultMessage: 'Create a New List',
    description: 'Dialog title for saving filters as new lists',
  },
  createList: {
    id: 'saveList.createList',
    defaultMessage: 'Create List',
    description: 'Dialog submit button label for saving filters as new lists',
  },
  newList: {
    id: 'saveList.newList',
    defaultMessage: 'Save List',
    description: 'Dialog title and submit button label for saving changes to lists',
  },
});

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
              medias_count: items_count
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
        medias_count: items_count
      }
    }
  }
`;

const useStyles = makeStyles(theme => ({
  saveListCreate: {
    whiteSpace: 'nowrap',
    marginRight: theme.spacing(1),
  },
  saveListCreateLabel: {
    marginRight: 0,
    flexGrow: 1,
  },
}));

const SaveList = ({
  intl,
  team,
  feedTeam,
  savedSearch,
  page,
  query,
  setFlashMessage,
}) => {
  // FIXME: Replace pathname context-detection and derived logic with the `page` prop
  const currentPath = window.location.pathname.match(/^\/[^/]+\/(list|all-items|assigned-to-me|tipline-inbox|suggested-matches|feed|imported-fact-checks|unmatched-media|published)(\/([0-9]+))?/);

  if (!page || !currentPath) {
    return null;
  }

  if (['spam', 'trash'].includes(page)) {
    return null;
  }

  const classes = useStyles();

  const objectType = page || currentPath[1];

  const [title, setTitle] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [operation, setOperation] = React.useState('CREATE'); // or 'UPDATE'
  const [showNewDialog, setShowNewDialog] = React.useState(false);
  const [showExistingDialog, setShowExistingDialog] = React.useState(false);

  // FIXME: Review specific permissions:
  // Create, Update SavedSearch
  // Update Feed
  if (!can(team.permissions, 'update Team')) {
    return null;
  }

  const feedFilters = {};
  if (objectType === 'feed') {
    // Don't show the button if it's a shared feed and nothing changed
    if (feedTeam) {
      Object.keys(query).forEach((key) => {
        if (!Object.keys(feedTeam.feedFilters).includes(key)) {
          feedFilters[key] = query[key];
        }
      });
      if (JSON.stringify(feedFilters) === JSON.stringify(feedTeam.filters)) {
        return null;
      }
    // Don't show the button if it's a feed
    } else {
      return null;
    }
  }

  const handleClose = () => {
    setShowNewDialog(false);
    setShowExistingDialog(false);
  };

  const handleError = () => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        id="saveList.defaultErrorMessage"
        defaultMessage="Could not save filters, please try again"
        description="Error message displayed when it's not possible to save a list"
      />
    ), 'error');
  };

  const handleSuccess = (response) => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        id="saveList.savedSuccessfully"
        defaultMessage="Filters saved successfully"
        description="Success message displayed when a list is saved"
      />
    ), 'success');
    setTitle('');
    handleClose();
    if (operation === 'CREATE' && response.createSavedSearch) {
      browserHistory.push(`/${team.slug}/list/${response.createSavedSearch.saved_search.dbid}`);
    }
  };

  const handleSave = () => {
    setSaving(true);
    const input = {
      filters: JSON.stringify({ ...query }),
    };

    let mutation = updateMutation;

    if (operation === 'CREATE') {
      input.team_id = team.dbid;
      input.title = title;
      mutation = createMutation;
    } else if (operation === 'UPDATE') {
      input.id = savedSearch.id;
      mutation = updateMutation;
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

  const handleSaveFeed = () => {
    setSaving(true);
    delete feedFilters.keyword;

    const mutation = graphql`
      mutation SaveListUpdateFeedTeamMutation($input: UpdateFeedTeamInput!) {
        updateFeedTeam(input: $input) {
          feed_team {
            filters
          }
        }
      }
    `;

    commitMutation(Store, {
      mutation,
      variables: {
        input: {
          id: feedTeam.id,
          filters: JSON.stringify(feedFilters),
        },
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

  const handleClick = () => {
    // FIXME: declare core lists globally.
    // From these pages we can just create a new list
    const coreLists = ['all-items', 'assigned-to-me', 'tipline-inbox', 'imported-fact-checks', 'suggested-matches', 'unmatched-media', 'published'];
    if (coreLists.includes(objectType)) {
      setShowNewDialog(true);
    // From a list page, we can either create a new one or update the one we're seeing
    } else if (objectType === 'list') {
      setOperation('UPDATE');
      setShowExistingDialog(true);
    // Save feed filters
    } else if (objectType === 'feed') {
      handleSaveFeed();
    }
  };

  const feeds = savedSearch?.feeds?.edges.map(edge => edge.node.name);

  return (
    <React.Fragment>
      {/* The "Save" button */}
      <ButtonMain
        variant="contained"
        size="default"
        theme="lightBrand"
        onClick={handleClick}
        buttonProps={{
          id: 'save-list__button',
        }}
        label={feedTeam && feedTeam.shared ?
          <FormattedMessage
            id="saveList.saveFeed"
            defaultMessage="Save and share"
            description="'Save and share' here are in infinitive form - it's a button label, to save the current set of filters applied to a search result as feed filters."
          >
            {(...content) => content}
          </FormattedMessage>
          :
          <FormattedMessage
            id="saveList.saveList"
            defaultMessage="Save"
            description="'Save' here is in infinitive form - it's a button label, to save the current set of filters applied to a search result as a list."
          >
            {(...content) => content}
          </FormattedMessage>
        }
      />

      {/* Create a new list */}
      <ConfirmProceedDialog
        open={showNewDialog}
        title={intl.formatMessage(messages.saveAsNewList)}
        body={
          <TextField
            placeholder={intl.formatMessage(messages.saveList)}
            onChange={(e) => { setTitle(e.target.value); }}
            className="new-list__title"
            id="new-list__title"
          />
        }
        proceedDisabled={!title}
        proceedLabel={intl.formatMessage(messages.newList)}
        onProceed={handleSave}
        isSaving={saving}
        cancelLabel={<FormattedMessage id="saveList.cancel" defaultMessage="Cancel" description="Cancel list editing button label" />}
        onCancel={handleClose}
      />

      {/* Create a new list or update an existing list */}
      { savedSearch ?
        <ConfirmProceedDialog
          open={showExistingDialog}
          title={operation === 'CREATE' ? intl.formatMessage(messages.saveAsNewList) : intl.formatMessage(messages.newList)}
          body={
            <FormControl fullWidth>
              <RadioGroup value={operation} onChange={(e) => { setOperation(e.target.value); }}>
                <FormControlLabel
                  value="UPDATE"
                  control={<Radio />}
                  label={<FormattedHTMLMessage id="saveList.update" defaultMessage="Save changes to the list <strong>{listName}</strong>" values={{ listName: savedSearch.title }} description="'Save' here is an infinitive verb" />}
                />
                { savedSearch?.is_part_of_feeds && operation === 'UPDATE' ?
                  <Alert
                    variant="warning"
                    title={
                      <FormattedMessage id="saveList.warningAlert" defaultMessage="Saving changes will update shared feeds:" description="Text displayed in the title of a warning box when saving a list related to shared feeds" />
                    }
                    content={
                      <ul>
                        {feeds.map(feed => (
                          <li key={feed}>&bull; {feed}</li>
                        ))}
                      </ul>
                    }
                  />
                  : null }
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
                      { operation === 'CREATE' ?
                        <TextField
                          placeholder={intl.formatMessage(messages.saveList)}
                          onChange={(e) => { setTitle(e.target.value); }}
                          className="new-list__title"
                          disabled={operation === 'UPDATE'}
                          autoFocus
                        />
                        : null
                      }
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>
          }
          proceedDisabled={operation === 'CREATE' && !title}
          proceedLabel={operation === 'CREATE' ? intl.formatMessage(messages.createList) : intl.formatMessage(messages.newList)}
          onProceed={handleSave}
          isSaving={saving}
          cancelLabel={<FormattedMessage id="saveList.cancel" defaultMessage="Cancel" description="Cancel list editing button label" />}
          onCancel={handleClose}
        /> : null }
    </React.Fragment>
  );
};

SaveList.defaultProps = {
  savedSearch: null,
  feedTeam: null,
};

SaveList.propTypes = {
  intl: intlShape.isRequired,
  team: PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
    slug: PropTypes.string.isRequired,
    permissions: PropTypes.string.isRequired,
  }).isRequired,
  page: PropTypes.oneOf(['all-items', 'assigned-to-me', 'tipline-inbox', 'imported-fact-checks', 'suggested-matches', 'unmatched-media', 'published', 'list', 'feed', 'spam', 'trash']).isRequired, // FIXME Define listing types as a global constant
  query: PropTypes.object.isRequired,
  feedTeam: PropTypes.shape({
    id: PropTypes.string.isRequired,
    filters: PropTypes.object,
    feedFilters: PropTypes.object,
    shared: PropTypes.bool,
  }), // may be null
  savedSearch: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    filters: PropTypes.string.isRequired,
  }),
};

export default withSetFlashMessage(injectIntl(SaveList));
