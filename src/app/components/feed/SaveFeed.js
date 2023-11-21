import React from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { createFragmentContainer, graphql, commitMutation } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import styles from './SaveFeed.module.css';
import FeedCollaboration from './FeedCollaboration';
import FeedContent from './FeedContent';
import FeedMetadata from './FeedMetadata';
import FeedPublish from './FeedPublish';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import { FlashMessageSetterContext } from '../FlashMessage';
import ConfirmProceedDialog from '../layout/ConfirmProceedDialog';
import Can from '../Can';
import { getErrorMessageForRelayModernProblem } from '../../helpers';
import Alert from '../cds/alerts-and-prompts/Alert';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import TextArea from '../cds/inputs/TextArea';
import TextField from '../cds/inputs/TextField';
import TagList from '../cds/menus-lists-dialogs/TagList';
import ChevronDownIcon from '../../icons/chevron_down.svg';

const createMutation = graphql`
  mutation SaveFeedCreateFeedMutation($input: CreateFeedInput!) {
    createFeed(input: $input) {
      feed {
        dbid
      }
      team {
        feeds(first: 10000) {
          edges {
            node {
              id
              dbid
              name
              team_id
              type: __typename
            }
          }
        }
      }
    }
  }
`;

const inviteMutation = graphql`
  mutation SaveFeedCreateFeedInvitationMutation($input: CreateFeedInvitationInput!) {
    createFeedInvitation(input: $input) {
      feed_invitation {
        id
      }
    }
  }
`;

const updateMutation = graphql`
  mutation SaveFeedUpdateFeedMutation($input: UpdateFeedInput!) {
    updateFeed(input: $input) {
      feed {
        dbid
      }
      team {
        feeds(first: 10000) {
          edges {
            node {
              name
            }
          }
        }
      }
    }
  }
`;

const destroyMutation = graphql`
  mutation SaveFeedDestroyFeedMutation($input: DestroyFeedInput!) {
    destroyFeed(input: $input) {
      deletedId
      team {
        feeds(first: 10000) {
          edges {
            node {
              id
              dbid
              name
              team_id
              type: __typename
            }
          }
        }
      }
    }
  }
`;

const updateFeedTeamMutation = graphql`
mutation SaveFeedUpdateFeedTeamMutation($input: UpdateFeedTeamInput!) {
  updateFeedTeam(input: $input) {
    feed_team {
      dbid
      saved_search_id
    }
  }
}
`;

const SaveFeed = (props) => {
  const { feedTeam } = props;
  const feed = feedTeam.feed || {}; // Editing a feed or creating a new feed
  const isFeedOwner = feedTeam.team_id === feed.team.dbid;

  const [title, setTitle] = React.useState(feed.name || '');
  const [description, setDescription] = React.useState(feed.description || '');
  const [selectedListId, setSelectedListId] = React.useState(isFeedOwner ? feed.saved_search_id : feedTeam.saved_search_id);
  const [discoverable, setDiscoverable] = React.useState(Boolean(feed.discoverable));
  const [createdFeedDbid, setCreatedFeedDbid] = React.useState(null);
  const [newInvites, setNewInvites] = React.useState([]);
  const [showConfirmationDialog, setShowConfirmationDialog] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const feedLicenses = feed.licenses || [];
  const [academicLicense, setAcademicLicense] = React.useState(feedLicenses.includes(1));
  const [commercialLicense, setCommercialLicense] = React.useState(feedLicenses.includes(2));
  const [openSourceLicense, setOpenSourceLicense] = React.useState(feedLicenses.includes(3));
  const [tags, setTags] = React.useState(feed.tags || []);
  const setFlashMessage = React.useContext(FlashMessageSetterContext);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  const handleViewFeed = (feedId) => {
    const teamSlug = window.location.pathname.match(/^\/([^/]+)/)[1];
    browserHistory.push(`/${teamSlug}/feed/${feedId}/feed`);
  };

  const onInviteSuccess = () => {
    handleViewFeed(feed.dbid || createdFeedDbid);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setShowDeleteDialog(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const onFailure = (error) => {
    const message = getErrorMessageForRelayModernProblem(error, <GenericUnknownErrorMessage />);
    setFlashMessage(message, 'error');
    setSaving(false);
  };

  const handleInvite = (dbid) => {
    setSaving(true);
    // TODO Make createFeedInvitation accept multiple emails
    newInvites.forEach((email) => {
      const input = {
        feed_id: dbid,
        email,
      };
      commitMutation(Relay.Store, {
        mutation: inviteMutation,
        variables: { input },
        onCompleted: onInviteSuccess,
        onError: onFailure,
      });
    });
  };

  React.useEffect(() => {
    if (createdFeedDbid && newInvites.length) {
      handleInvite(createdFeedDbid);
    }
  }, [createdFeedDbid]);

  const onSuccess = (response) => {
    const dbid = response?.createFeed?.feed?.dbid || feed.dbid;
    setCreatedFeedDbid(dbid);
    setSaving(false);
    if (!newInvites.length) {
      handleViewFeed(dbid);
    }
  };

  // Error states that cause the save/edit button to disable
  const discoverableNoLicense = discoverable && (
    !academicLicense &&
    !commercialLicense &&
    !openSourceLicense
  );
  const noTitle = title.length === 0;
  const disableSaveButton = saving || discoverableNoLicense || noTitle;

  const handleSave = () => {
    setSaving(true);
    const licenses = [];
    if (academicLicense) licenses.push(1);
    if (commercialLicense) licenses.push(2);
    if (openSourceLicense) licenses.push(3);
    const input = {
      name: title,
      description,
      saved_search_id: selectedListId,
      tags,
      licenses,
      discoverable,
      published: true,
    };
    if (feed.id) {
      setShowConfirmationDialog(false);
      input.id = feed.id;
      delete input.licenses;
    }
    commitMutation(Relay.Store, {
      mutation: (feed.id ? updateMutation : createMutation),
      variables: { input },
      onCompleted: onSuccess,
      onError: onFailure,
    });
  };

  const handleSaveFeedTeam = () => {
    setSaving(true);
    const input = {
      id: feedTeam.id,
      saved_search_id: selectedListId,
    };

    commitMutation(Relay.Store, {
      mutation: updateFeedTeamMutation,
      variables: { input },
      onCompleted: () => handleViewFeed(feedTeam.feed.dbid),
      onError: onFailure,
    });
  };

  const handleConfirmOrSave = () => {
    if (feed.id && !isFeedOwner) {
      handleSaveFeedTeam();
    } else if (feed.id || newInvites.length) {
      setShowConfirmationDialog(true);
    } else {
      handleSave();
    }
  };

  const handleDelete = () => {
    setSaving(true);

    const input = { id: feed.id };
    commitMutation(
      Relay.Store,
      {
        mutation: destroyMutation,
        variables: { input },
        onCompleted: () => {
          const retPath = `/${feed.team.slug}/all-items`;
          browserHistory.push(retPath);
        },
        onError: onFailure,
      },
    );
  };

  let pageTitle = (
    <FormattedMessage
      id="saveFeed.sharedFeedPageSubtitle"
      defaultMessage="Create a new shared feed"
      description="Subtitle of the shared feed creation page"
    />
  );

  if (feed.dbid) {
    pageTitle = (
      <FormattedMessage
        id="saveFeed.sharedFeedPageEditSubtitle"
        defaultMessage="Edit shared feed"
        description="Subtitle of the shared feed editing page"
      />
    );
  }

  if (feed.dbid && !isFeedOwner) {
    pageTitle = (
      <FormattedMessage
        id="saveFeed.sharedFeedPageEditCollabSubtitle"
        defaultMessage="Collab with likeminded organizations"
        description="Subtitle of the shared feed editing page"
      />
    );
  }

  return (
    <div className={styles.saveFeedContainer}>
      <div className={styles.saveFeedContent}>
        { feed.id ?
          <div>
            <ButtonMain
              variant="outlined"
              size="default"
              theme="brand"
              onClick={() => { handleViewFeed(feed.dbid); }}
              label={
                <FormattedMessage
                  id="saveFeed.viewSharedFeed"
                  defaultMessage="View Shared Feed"
                  description="Label of a button displayed on the edit feed page that when clicked takes the user to the shared feed page."
                />
              }
            />
          </div> : null }

        { !isFeedOwner && (
          <Alert
            variant="warning"
            title={
              <FormattedHTMLMessage
                id="saveFeed.feedCollaboratorWarning"
                defaultMessage="To request changes to this shared feed, please contact the creating organization: {organizer}</strong>"
                description="Warning displayed on edit feed page when logged in as a collaborating org."
                values={{ organizer: feed?.team?.name }}
              />
            }
          />
        )}

        <div>
          <div className={`typography-caption ${styles.sharedFeedTitle}`}>
            <FormattedMessage
              id="saveFeed.sharedFeedPageTitle"
              defaultMessage="Shared feed"
              description="Title of the shared feed creation page"
            />
          </div>
          <div className="typography-h6">
            { pageTitle }
          </div>
          <div className="typography-body1">
            <FormattedMessage
              id="createFeed.sharedFeedPageDescription"
              defaultMessage="Share data feeds with other organizations to unlock new insights across audiences and languages."
              description="Description of the shared feed creation page"
            />
          </div>
        </div>

        { isFeedOwner && (
          <div className={styles.saveFeedCard}>
            <div className="typography-subtitle2">
              <FormattedMessage
                id="saveFeed.feedDetailsTitle"
                defaultMessage="Feed details"
                description="Title of section where the details of the feed are filled. e.g.: title, description"
              />
            </div>
            <FormattedMessage
              id="saveFeed.titlePlaceholder"
              defaultMessage="Memorable feed title"
              description="Placeholder text for feed title field"
            >
              { placeholder => (
                <TextField
                  id="create-feed__title"
                  placeholder={placeholder}
                  label={<FormattedMessage
                    id="saveFeed.titleLabel"
                    defaultMessage="Title"
                    description="Label for the shared feed title input"
                  />}
                  helpContent={<FormattedMessage
                    id="saveFeed.titleHelper"
                    defaultMessage="Great shared feed names are short, memorable, and tell your audience the focus of the media"
                    description="Title input helper text"
                  />}
                  error={noTitle}
                  suppressInitialError
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              )}
            </FormattedMessage>
            <FormattedMessage
              id="saveFeed.descriptionPlaceholder"
              defaultMessage="Give this shared feed an optional description."
              description="Placeholder text for feed description field"
            >
              { placeholder => (
                <TextArea
                  id="create-feed__description"
                  placeholder={placeholder}
                  label={<FormattedMessage
                    id="saveFeed.descriptionLabel"
                    defaultMessage="Description"
                    description="Label for a field where the user inputs text for a description to a shared feed"
                  />}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              )}
            </FormattedMessage>
            <TagList
              tags={tags}
              setTags={setTags}
            />
          </div>
        )}

        <FeedContent
          listId={selectedListId}
          onChange={e => setSelectedListId(+e.target.value)}
          onRemove={() => setSelectedListId(null)}
        />

        { isFeedOwner && (
          <FeedPublish
            discoverable={discoverable}
            discoverableNoLicense={discoverableNoLicense}
            onToggleDiscoverable={() => setDiscoverable(!discoverable)}
            academicLicense={academicLicense}
            commercialLicense={commercialLicense}
            openSourceLicense={openSourceLicense}
            onToggleAcademic={() => setAcademicLicense(!academicLicense)}
            onToggleCommercial={() => setCommercialLicense(!commercialLicense)}
            onToggleOpenSource={() => setOpenSourceLicense(!openSourceLicense)}
          />
        )}

      </div>
      <div className={styles.saveFeedContentNarrow}>
        <div className={styles.saveFeedButtonContainer}>
          <ButtonMain
            className={styles.saveFeedContentNarrowAction}
            theme="brand"
            size="default"
            variant="contained"
            onClick={handleConfirmOrSave}
            disabled={disableSaveButton}
            label={feed.id ?
              <FormattedMessage
                id="saveFeed.updateSaveButton"
                defaultMessage="Save"
                description="Label to the save button of the shared feed update form"
              /> :
              <FormattedMessage
                id="saveFeed.createSaveButton"
                defaultMessage="Create shared feed"
                description="Label to the save button of the shared feed creation form"
              />
            }
          />
          { feed.id ?
            <Can permissions={feed.permissions} permission="destroy Feed">
              <ButtonMain
                className="typography-button ${styles.saveFeedButtonMoreActions"
                theme="text"
                size="default"
                variant="outlined"
                onClick={e => setAnchorEl(e.currentTarget)}
                disabled={disableSaveButton}
                iconRight={<ChevronDownIcon />}
                label={
                  <FormattedMessage
                    id="saveFeed.MoreActionsButton"
                    defaultMessage="More Actions"
                    description="Label to the save button of the shared feed update form"
                  />
                }
              />
            </Can>
            : null }
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            { feed.teams_count > 1 ?
              <MenuItem disabled>
                <FormattedHTMLMessage
                  id="SaveFeed.deleteButtonDisabled"
                  defaultMessage="Delete shared feed <br />(Remove collaborators to <br /> delete this shared feed)"
                  description="Menu option to inform user to remove collaborators before deleting the selected shared feed"
                />
              </MenuItem>
              :
              <MenuItem onClick={handleDeleteClick}>
                <FormattedMessage
                  id="SaveFeed.deleteButton"
                  defaultMessage="Delete shared feed"
                  description="Menu option to delete the selected shared feed"
                />
              </MenuItem>

            }
          </Menu>
        </div>

        <FeedMetadata feed={feed} />

        <FeedCollaboration
          collaboratorId={feedTeam.team_id}
          feed={feed}
          onChange={setNewInvites}
        />
      </div>

      {/* "Delete" dialog */}
      <ConfirmProceedDialog
        open={showDeleteDialog}
        title={
          feed.saved_search_id ?
            <FormattedMessage
              id="saveFeed.deleteSharedFeedWarningTitle"
              defaultMessage="Are you sure you want to delete this shared feed?"
              description="'Delete' here is an infinitive verb"
            />
            :
            <FormattedMessage
              id="saveFeed.deleteSharedFeedTitle"
              defaultMessage="Delete Shared Feed?"
              description="'Delete' here is an infinitive verb"
            />
        }
        body={
          feed.saved_search_id ?
            <>
              <FormattedHTMLMessage
                id="saveFeed.deleteSharedFeedConfirmationDialogWaningBody"
                defaultMessage="This shared feed is available to all users of <strong>{orgName}</strong>. After deleting it, no user will be able to access it.<br /><br />"
                values={{
                  orgName: feed.team?.name,
                }}
                description="Confirmation dialog message when deleting a feed."
              />
              <Alert
                variant="warning"
                title={
                  <FormattedHTMLMessage
                    id="saveFeed.deleteSharedFeedWarning"
                    defaultMessage="<strong>NOTE: Your custom list and items will remain available and unaffected.</strong>"
                    description="Warning displayed on edit feed page when no list is selected."
                  />
                }
                content={
                  <ul className="bulleted-list">
                    <li>{feed.saved_search.title}</li>
                  </ul>
                }
              />
            </>
            :
            <FormattedHTMLMessage
              id="saveFeed.deleteSharedFeedConfirmationDialogBody"
              defaultMessage="This shared feed is available to all users of <strong>{orgName}</strong>. After deleting it, no user will be able to access it.<br /><br />Note: Deleting this shared feed will not remove any items or list from your workspace."
              values={{
                orgName: feed.team?.name,
              }}
              description="Confirmation dialog message when deleting a feed."
            />
        }
        proceedLabel={
          <FormattedMessage
            id="saveFeed.deleteSharedFeedConfirmationButton"
            defaultMessage="Delete Shared Feed"
            description="'Delete' here is an infinitive verb"
          />
        }
        onProceed={handleDelete}
        isSaving={saving}
        cancelLabel={<FormattedMessage id="global.cancel" defaultMessage="Cancel" description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation" />}
        onCancel={handleClose}
      />

      {/* "Update" dialog */}
      <ConfirmProceedDialog
        open={showConfirmationDialog}
        title={
          feed.id ? (
            <FormattedMessage
              id="saveFeed.confirmationDialogTitle"
              defaultMessage="Are you sure you want to update this shared feed?"
              description="Confirmation dialog title when saving a feed."
            />
          ) : (
            <FormattedMessage
              id="saveFeed.invitationConfirmationDialogTitle"
              defaultMessage="Collaboration invitations"
              description="Confirmation dialog title for feed collaboration invitations."
            />
          )
        }
        body={
          <div>
            { feed.id &&
              <p>
                <FormattedMessage
                  id="saveFeed.confirmationDialogBody"
                  defaultMessage="Are you sure you want to update this shared feed?"
                  description="Confirmation dialog message when saving a feed."
                />
              </p>
            }
            { newInvites.length ?
              <>
                <p>
                  <FormattedMessage
                    id="saveFeed.invitationConfirmationDialogBody"
                    defaultMessage="An email will be sent to collaborators listed to invite them to contribute to this shared feed."
                    description="Confirmation dialog message when saving a feed."
                  />
                </p>
                <ul>
                  { newInvites.map(email => (
                    <li key={email} className={styles.invitedEmail}>
                      &bull; {email}
                    </li>
                  ))}
                </ul>
              </> : null
            }
          </div>
        }
        proceedLabel={
          feed.id ?
            <FormattedMessage id="saveFeed.confirmationDialogButton" defaultMessage="Update Shared Feed" description="Button label to confirm updating a feed." /> :
            <FormattedMessage id="saveFeed.confirmationDialogButtonCreate" defaultMessage="Create Shared Feed" description="Button label to confirm creating a feed." />
        }
        onProceed={handleSave}
        onCancel={() => { setShowConfirmationDialog(false); }}
        isSaving={saving}
      />
    </div>
  );
};

SaveFeed.defaultProps = {
  feedTeam: {},
};

SaveFeed.propTypes = {
  feedTeam: PropTypes.shape({
    id: PropTypes.string,
    saved_search_id: PropTypes.number.isRequired,
    team_id: PropTypes.number.isRequired,
    feed: PropTypes.shape({
      id: PropTypes.string,
      dbid: PropTypes.number,
      name: PropTypes.string,
      discoverable: PropTypes.bool,
      description: PropTypes.string,
      saved_search_id: PropTypes.number,
      licenses: PropTypes.arrayOf(PropTypes.number),
      tags: PropTypes.arrayOf(PropTypes.string),
    }),
  }),
};

// Used in unit test
// eslint-disable-next-line import/no-unused-modules
export { SaveFeed };

export default createFragmentContainer(SaveFeed, graphql`
  fragment SaveFeed_feedTeam on FeedTeam {
    id
    saved_search_id
    team_id
    feed {
      id
      dbid
      name
      discoverable
      description
      licenses
      tags
      permissions
      team {
        dbid
        name
        slug
      }
      teams_count
      saved_search_id
      saved_search {
        title
      }
      ...FeedCollaboration_feed
      ...FeedMetadata_feed
    }
  }
`);
