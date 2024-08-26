import React from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { createFragmentContainer, graphql, commitMutation } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import FeedCollaboration from './FeedCollaboration';
import FeedContent from './FeedContent';
import FeedMetadata from './FeedMetadata';
import FeedActions from './FeedActions';
import FeedDataPoints from './FeedDataPoints';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import { FlashMessageSetterContext } from '../FlashMessage';
import ConfirmProceedDialog from '../layout/ConfirmProceedDialog';
import { getErrorMessageForRelayModernProblem } from '../../helpers';
import Alert from '../cds/alerts-and-prompts/Alert';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import TextArea from '../cds/inputs/TextArea';
import TextField from '../cds/inputs/TextField';
import NavigateAwayDialog from '../NavigateAwayDialog';
import PageTitle from '../PageTitle';
import styles from './SaveFeed.module.css';

const createMutation = graphql`
  mutation SaveFeedCreateFeedMutation($input: CreateFeedInput!) {
    createFeed(input: $input) {
      feed {
        dbid
        saved_search {
          is_part_of_feeds
        }
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
        saved_search {
          is_part_of_feeds
        }
        saved_search_was {
          is_part_of_feeds
        }
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
        feed_teams(first: 10000) {
          edges {
            node {
              id
              dbid
              feed_id
              saved_search_id
              feed {
                name
              }
              type: __typename
            }
          }
        }
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
      saved_search {
        is_part_of_feeds
      }
      saved_search_was {
        is_part_of_feeds
      }
    }
  }
}
`;

const destroyFeedTeamMutation = graphql`
  mutation SaveFeedLeaveFeedMutation($input: DestroyFeedTeamInput!) {
    destroyFeedTeam(input: $input) {
      deletedId
      feed {
        name
        dbid
        id
        team_id
        type: __typename
      }
    }
  }
`;

const destroyInviteMutation = graphql`
  mutation SaveFeedDestroyFeedInvitationMutation($input: DestroyFeedInvitationInput!) {
    destroyFeedInvitation(input: $input) {
      deletedId
      feed {
        teams_count
        feed_invitations(first: 100) {
          edges {
            node {
              id
              email
              state
            }
          }
        }
      }
    }
  }
`;

const removeTeamMutation = graphql`
  mutation SaveFeedRemoveCollaboratorMutation($input: DestroyFeedTeamInput!) {
    destroyFeedTeam(input: $input) {
      deletedId
      feed {
        teams_count
        feed_teams(first: 100) {
          edges {
            node {
              id
              team {
                name
              }
            }
          }
        }
      }
    }
  }
`;

const SaveFeed = (props) => {
  const { feedTeam, permissions, teamName } = props;
  const feed = feedTeam?.feed || {}; // Editing a feed or creating a new feed
  const isFeedOwner = feedTeam?.team_id === feed?.team?.dbid;
  const teamNameFeed = feedTeam?.team ? feedTeam.team.name : teamName; // user team name if creating, feed team name if editing
  const [createdFeedDbid, setCreatedFeedDbid] = React.useState(null);
  const [showConfirmationDialog, setShowConfirmationDialog] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const setFlashMessage = React.useContext(FlashMessageSetterContext);
  const [formData, setFormData] = React.useState({
    title: (feed.name || ''),
    description: (feed.description || ''),
    selectedListId: (isFeedOwner ? feed.saved_search_id : feedTeam.saved_search_id),
    newInvites: [],
    invitesToDelete: [],
    collaboratorsToRemove: [],
    dataPoints: (feed.data_points || []),
  });

  // tracking pending messages to the API for bulk email invites
  // this is not tracked as state, but rather outside the component lifecycle
  // because it all happens in one batch update that doesn't, and shouldn't,
  // trigger rerender
  let pendingMessages = 0;

  const handleViewFeed = (feedId) => {
    const teamSlug = window.location.pathname.match(/^\/([^/]+)/)[1];
    browserHistory.push(`/${teamSlug}/feed/${feedId}/feed`);
  };

  const handleFormUpdate = (key, value) => {
    setFormData({
      ...formData,
      [key]: value,
    });
    setIsEditing(true);
  };

  const handleSetDataPoints = (value) => {
    handleFormUpdate('dataPoints', value);
  };

  const onPostSaveMutationSuccess = () => {
    pendingMessages -= 1;
    // if we have successfully processed all messages (number of success callbacks
    // equals number of calls) then we redirect
    if (pendingMessages === 0) {
      handleViewFeed(feed.dbid || createdFeedDbid);
    }
  };

  const onFailure = (error) => {
    const message = getErrorMessageForRelayModernProblem(error, <GenericUnknownErrorMessage />);
    setFlashMessage(message, 'error');
    setSaving(false);
  };

  const handlePostSaveMutations = (dbid) => {
    setSaving(true);

    const { collaboratorsToRemove, invitesToDelete, newInvites } = formData;

    // FIXME: Make atomic mutations createFeed/updateFeed accept these lists of changes as input
    pendingMessages = newInvites.length + invitesToDelete.length + collaboratorsToRemove.length;

    newInvites.forEach((email) => {
      const input = {
        feed_id: dbid,
        email,
      };
      commitMutation(Relay.Store, {
        mutation: inviteMutation,
        variables: { input },
        onCompleted: onPostSaveMutationSuccess,
        onError: onFailure,
      });
    });

    invitesToDelete.forEach((i) => {
      commitMutation(Relay.Store, {
        mutation: destroyInviteMutation,
        variables: { input: { id: i.value } },
        onCompleted: onPostSaveMutationSuccess,
        onError: onFailure,
      });
    });

    collaboratorsToRemove.forEach((c) => {
      commitMutation(Relay.Store, {
        mutation: removeTeamMutation,
        variables: { input: { id: c.value } },
        onCompleted: onPostSaveMutationSuccess,
        onError: onFailure,
      });
    });
  };

  React.useEffect(() => {
    const { collaboratorsToRemove, invitesToDelete, newInvites } = formData;

    if (createdFeedDbid && (newInvites.length || collaboratorsToRemove.length || invitesToDelete.length)) {
      handlePostSaveMutations(createdFeedDbid);
    }
  }, [createdFeedDbid]);

  // ---- isEditing state changed callback (start) ----
  // This makes sure we're tring to navigate to the feed only after a save
  // and the isEditing state is commited back to false and the NavigateAwayDialog
  // is then unmounted, which prevented, well, navigating away.
  const prevEditingRef = React.useRef(false);

  React.useEffect(() => {
    if (createdFeedDbid && prevEditingRef.current === true) { // .current is SO misleading, it actually means previous
      if (!formData.newInvites.length) {
        handleViewFeed(createdFeedDbid);
      }
    }
    prevEditingRef.current = isEditing;
  }, [isEditing]);
  // ---- isEditing state changed callback (end) ----

  const onSuccess = (response) => {
    const dbid = response?.createFeed?.feed?.dbid || feed.dbid;
    setCreatedFeedDbid(dbid);
    setSaving(false);
    setIsEditing(false);
  };

  // Error states that cause the save/edit button to disable
  const noTitle = formData.title.length === 0;
  const disableSaveButton = saving || noTitle || formData.dataPoints.length === 0;

  const handleSave = () => {
    setSaving(true);
    const licenses = [];
    const input = {
      name: formData.title,
      description: formData.description,
      saved_search_id: formData.selectedListId,
      licenses,
      dataPoints: formData.dataPoints,
      published: true,
    };
    if (feed.id) {
      setShowConfirmationDialog(false);
      input.id = feed.id;
      delete input.licenses;
      delete input.dataPoints;
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
      saved_search_id: formData.selectedListId,
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
    } else {
      setShowConfirmationDialog(true);
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
          const retPath = `/${feed.team.slug}/feeds`;
          browserHistory.push(retPath);
        },
        onError: onFailure,
      },
    );
  };

  const handleLeaveFeed = () => {
    setSaving(true);

    const input = { id: feedTeam.id };
    commitMutation(
      Relay.Store,
      {
        mutation: destroyFeedTeamMutation,
        variables: { input },
        onCompleted: () => {
          const path = `/${feedTeam.team.slug}/all-items`;
          window.location.assign(path);
        },
        onError: onFailure,
      },
    );
  };


  let pageTitle = (
    <FormattedMessage
      defaultMessage="Create Shared Feed"
      description="Subtitle of the shared feed creation page"
      id="saveFeed.sharedFeedPageSubtitle"
    />
  );

  if (feed.dbid) {
    pageTitle = isFeedOwner ? (
      <FormattedMessage
        defaultMessage="Edit | {feedName}"
        description="Subtitle of the shared feed editing page"
        id="saveFeed.sharedFeedPageEditSubtitle"
        values={{
          feedName: feed.name,
        }}
      />
    ) : feed.name;
  }

  const pageDescription = isFeedOwner ? (
    <FormattedMessage
      defaultMessage="Share data feeds with other organizations to unlock new insights across audiences and languages."
      description="Description of the shared feed creation page"
      id="createFeed.sharedFeedPageDescription"
    />
  ) : feed.description;

  return (
    <PageTitle prefix={pageTitle} team={{ name: props.teamName }} >
      <div className={styles.saveFeedContainer}>
        <div className={styles.saveFeedContent}>
          { feed.id ?
            <div>
              <ButtonMain
                disabled={!isFeedOwner && !feedTeam.saved_search_id}
                label={
                  <FormattedMessage
                    defaultMessage="View Shared Feed"
                    description="Label of a button displayed on the edit feed page that when clicked takes the user to the shared feed page."
                    id="saveFeed.viewSharedFeed"
                  />
                }
                size="default"
                theme="info"
                variant="outlined"
                onClick={() => { handleViewFeed(feed.dbid); }}
              />
            </div> : null }

          { !isFeedOwner && (
            <Alert
              title={
                <FormattedHTMLMessage
                  defaultMessage="To request changes to this shared feed, please contact the creating organization: <strong>{organizer}</strong>"
                  description="Warning displayed on edit feed page when logged in as a collaborating org."
                  id="saveFeed.feedCollaboratorWarning"
                  values={{ organizer: feed?.team?.name }}
                />
              }
              variant="warning"
            />
          )}

          <div>
            <div className={`typography-caption ${styles.sharedFeedTitle}`}>
              <FormattedMessage defaultMessage="Shared Feed" description="Generic Label for the shared feed feature which is a collection of check work spaces contributing content to one place" id="global.sharedFeed" />
            </div>
            <div className="typography-h6">
              { pageTitle }
            </div>
            <div className="typography-body1">
              { pageDescription }
            </div>
          </div>

          { isFeedOwner && (
            <div className={styles.saveFeedCard}>
              <div className="typography-subtitle2">
                <FormattedMessage
                  defaultMessage="Feed details"
                  description="Title of section where the details of the feed are filled. e.g.: title, description"
                  id="saveFeed.feedDetailsTitle"
                />
              </div>
              <FormattedMessage
                defaultMessage="Easily remembered title for this shared feed"
                description="Placeholder text for feed title field"
                id="saveFeed.titlePlaceholder"
              >
                { placeholder => (
                  <TextField
                    error={noTitle}
                    helpContent={<FormattedMessage
                      defaultMessage="Great shared feed names are short, memorable, and tell your audience the focus of the media"
                      description="Title input helper text"
                      id="saveFeed.titleHelper"
                    />}
                    id="create-feed__title"
                    label={<FormattedMessage
                      defaultMessage="Title"
                      description="Label for the shared feed title input"
                      id="saveFeed.titleLabel"
                    />}
                    placeholder={placeholder}
                    required
                    suppressInitialError
                    value={formData.title}
                    onChange={e => handleFormUpdate('title', e.target.value)}
                  />
                )}
              </FormattedMessage>
              <FormattedMessage
                defaultMessage="Give this shared feed an optional description."
                description="Placeholder text for feed description field"
                id="saveFeed.descriptionPlaceholder"
              >
                { placeholder => (
                  <TextArea
                    id="create-feed__description"
                    label={<FormattedMessage
                      defaultMessage="Description"
                      description="Label for a field where the user inputs text for a description to a shared feed"
                      id="saveFeed.descriptionLabel"
                    />}
                    placeholder={placeholder}
                    value={formData.description}
                    onChange={e => handleFormUpdate('description', e.target.value)}
                  />
                )}
              </FormattedMessage>
            </div>
          )}

          <div className={styles.saveFeedCard}>
            <FeedDataPoints
              dataPoints={formData.dataPoints}
              readOnly={Boolean(feed.id)}
              onChange={handleSetDataPoints}
            />

            { formData.dataPoints.length > 0 ?
              <FeedContent
                dataPoints={formData.dataPoints}
                listId={formData.selectedListId}
                onChange={e => handleFormUpdate('selectedListId', +e.target.value)}
                onRemove={() => handleFormUpdate('selectedListId', null)}
              />
              : null
            }
          </div>

        </div>
        <div className={styles.saveFeedContentNarrow}>
          <div className={styles.saveFeedButtonContainer}>
            <ButtonMain
              className={styles.saveFeedContentNarrowAction}
              disabled={disableSaveButton}
              label={feed.id ?
                <FormattedMessage
                  defaultMessage="Save"
                  description="Label to the save button of the shared feed update form"
                  id="saveFeed.updateSaveButton"
                /> :
                <FormattedMessage
                  defaultMessage="Create shared feed"
                  description="Label to the save button of the shared feed creation form"
                  id="saveFeed.createSaveButton"
                />
              }
              size="default"
              theme="info"
              variant="contained"
              onClick={handleConfirmOrSave}
            />
            { feed.id ?
              <FeedActions
                disableSaveButton={disableSaveButton}
                feedTeam={{ ...feedTeam, permissions: feedTeam.permissions }}
                handleDelete={handleDelete}
                handleLeaveFeed={handleLeaveFeed}
                saving={saving}
              />
              : null }
          </div>

          <FeedMetadata feed={feed} />

          <FeedCollaboration
            collaboratorId={feedTeam?.team_id}
            feed={feed}
            permissions={permissions}
            readOnly={feedTeam?.team_id && feedTeam?.team_id !== feed?.team?.dbid}
            onChange={value => handleFormUpdate('newInvites', value)}
            onChangeCollaboratorsToRemove={value => handleFormUpdate('collaboratorsToRemove', value)}
            onChangeInvitesToDelete={value => handleFormUpdate('invitesToDelete', value)}
          />
        </div>

        {/* "Update" dialog */}
        <ConfirmProceedDialog
          body={
            <div>
              { feed.id ?
                <p>
                  <FormattedHTMLMessage
                    defaultMessage="Updates to this shared feed will be available to all users of <strong>{name}</strong> and collaborating workspaces."
                    description="Confirmation dialog message when saving an existing feed."
                    id="saveFeed.confirmationDialogBody"
                    values={
                      {
                        name: teamNameFeed,
                      }
                    }
                  />
                </p>
                :
                <p>
                  <FormattedHTMLMessage
                    defaultMessage="This shared feed will be available to all users of <strong>{name}</strong>."
                    description="Confirmation dialog message when creating a feed."
                    id="saveFeed.confirmationDialogBodyCreate"
                    values={
                      {
                        name: teamNameFeed,
                      }
                    }
                  />
                </p>
              }
              { formData.newInvites.length ?
                <>
                  <p>
                    <FormattedMessage
                      defaultMessage="An email will be sent to collaborators listed to invite them to contribute to this shared feed."
                      description="Confirmation dialog message when saving a feed."
                      id="saveFeed.invitationConfirmationDialogBody"
                    />
                  </p>
                  <ul>
                    { formData.newInvites.map(email => (
                      <li className={styles.invitedEmail} key={email}>
                        &bull; {email}
                      </li>
                    ))}
                  </ul>
                </> : null
              }
              { formData.invitesToDelete.length ?
                <>
                  <p className={styles.paragraphMarginTop}>
                    <FormattedMessage
                      defaultMessage="The invitations to the following email addresses will be cancelled:"
                      description="Confirmation dialog message when saving a feed."
                      id="saveFeed.invitationDeleteConfirmationDialogBody"
                    />
                  </p>
                  <ul>
                    { formData.invitesToDelete.map(i => (
                      <li className={styles.invitedEmail} key={i.value}>
                        &bull; {i.label}
                      </li>
                    ))}
                  </ul>
                </> : null
              }
              { formData.collaboratorsToRemove.length ?
                <>
                  <p className={styles.paragraphMarginTop}>
                    <FormattedMessage
                      defaultMessage="The following collaborating organizations will be removed from this shared feed:"
                      description="Confirmation dialog message when saving a feed."
                      id="saveFeed.collaboratorRemovalConfirmationDialogBody"
                    />
                  </p>
                  <ul>
                    { formData.collaboratorsToRemove.map(c => (
                      <li className={styles.invitedEmail} key={c.value}>
                        &bull; {c.label}
                      </li>
                    ))}
                  </ul>
                </> : null
              }
              <Alert
                banner
                className={styles.paragraphMarginTop}
                content={
                  <FormattedMessage
                    defaultMessage="Check automatically refreshes all the data in shared feeds hourly. On each shared feed page you will see the time and date of the last update. If that date is prior to creating or making changes to the shared feed, then the data you will see will be accurate from the last update."
                    description="Alert box warning further explaining that shared feeds are updated hourly and recent content may not be visible"
                    id="alert.sharedFeedRealTimeAlertContent"
                  />
                }
                title={
                  <FormattedMessage
                    defaultMessage="Shared feed data updates may not occur in real time"
                    description="Alert box warning title to tell the user the shared feed they are updating or creating may not have real time updates"
                    id="alert.sharedFeedRealTimeAlertTitle"
                  />}
                variant="warning"
              />
            </div>
          }
          isSaving={saving}
          open={showConfirmationDialog}
          proceedLabel={
            feed.id ?
              <FormattedMessage defaultMessage="Update Shared Feed" description="Button label to confirm updating a feed." id="saveFeed.confirmationDialogButton" /> :
              <FormattedMessage defaultMessage="Create Shared Feed" description="Button label to confirm creating a feed." id="saveFeed.confirmationDialogButtonCreate" />
          }
          title={
            feed.id ? (
              <FormattedMessage
                defaultMessage="Update Shared Feed?"
                description="Confirmation dialog title when saving a feed."
                id="saveFeed.confirmationDialogTitle"
              />
            ) : (
              <FormattedMessage
                defaultMessage="Create Shared Feed?"
                description="Confirmation dialog title for creating a feed."
                id="saveFeed.confirmationDialogTitleCreate"
              />
            )
          }
          onCancel={() => { setShowConfirmationDialog(false); }}
          onProceed={handleSave}
        />
        {
          isEditing &&
          <NavigateAwayDialog
            body={
              <FormattedMessage
                defaultMessage="You have unsaved changes to your shared feed. Do you wish to continue to a new page? Your work will not be saved."
                description="This is a prompt that appears when a user tries to exit a page before saving their work."
                id="saveFeed.confirmLeave"
              />
            }
            hasUnsavedChanges
            title={
              <FormattedMessage
                defaultMessage="Do you want to leave without saving?"
                description="This is a prompt that appears when a user tries to exit a page before saving their work."
                id="saveFeed.confirmLeaveTitle"
              />
            }
          />
        }
      </div>
    </PageTitle>
  );
};

SaveFeed.defaultProps = {
  feedTeam: {},
  permissions: {},
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
      description: PropTypes.string,
      saved_search_id: PropTypes.number,
      licenses: PropTypes.arrayOf(PropTypes.number),
      data_points: PropTypes.arrayOf(PropTypes.number),
    }),
  }),
  permissions: PropTypes.object, // { key => value } (e.g., { 'create FeedTeam' => true })
};

// Used in unit test
// eslint-disable-next-line import/no-unused-modules
export { SaveFeed };

export default createFragmentContainer(SaveFeed, graphql`
  fragment SaveFeed_feedTeam on FeedTeam {
    id
    saved_search_id
    team_id
    permissions
    team {
      slug
      name
    }
    feed {
      id
      dbid
      name
      description
      licenses
      team {
        dbid
        name
        slug
      }
      saved_search_id
      data_points
      ...FeedCollaboration_feed
      ...FeedMetadata_feed
    }
    ...FeedActions_feedTeam
  }
`);
