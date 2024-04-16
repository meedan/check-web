import React from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { createFragmentContainer, graphql, commitMutation } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import styles from './SaveFeed.module.css';
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
import PageTitle from '../PageTitle';

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
  mutation SaveFeedDestroyFeedTeamMutation($input: DestroyFeedTeamInput!) {
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


const SaveFeed = (props) => {
  const { feedTeam, permissions } = props;
  // eslint-disable-next-line
  console.log("feedTeam", feedTeam, props)
  const feed = feedTeam?.feed || {}; // Editing a feed or creating a new feed
  const isFeedOwner = feedTeam?.team_id === feed?.team?.dbid;

  const [title, setTitle] = React.useState(feed.name || '');
  const [description, setDescription] = React.useState(feed.description || '');
  const [selectedListId, setSelectedListId] = React.useState(isFeedOwner ? feed.saved_search_id : feedTeam.saved_search_id);
  const [createdFeedDbid, setCreatedFeedDbid] = React.useState(null);
  const [newInvites, setNewInvites] = React.useState([]);
  const [showConfirmationDialog, setShowConfirmationDialog] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [dataPoints, setDataPoints] = React.useState(feed.data_points || []);
  const setFlashMessage = React.useContext(FlashMessageSetterContext);

  // tracking pending messages to the API for bulk email invites
  // this is not tracked as state, but rather outside the component lifecycle
  // because it all happens in one batch update that doesn't, and shouldn't,
  // trigger rerender
  let pendingMessages = 0;

  const handleViewFeed = (feedId) => {
    const teamSlug = window.location.pathname.match(/^\/([^/]+)/)[1];
    browserHistory.push(`/${teamSlug}/feed/${feedId}/feed`);
  };

  const onInviteSuccess = () => {
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

  const handleInvite = (dbid) => {
    setSaving(true);

    // TODO Make createFeedInvitation accept multiple emails
    pendingMessages = newInvites.length;

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
  const noTitle = title.length === 0;
  const disableSaveButton = saving || noTitle || dataPoints.length === 0;

  const handleSave = () => {
    setSaving(true);
    const licenses = [];
    const input = {
      name: title,
      description,
      saved_search_id: selectedListId,
      licenses,
      dataPoints,
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
      id="saveFeed.sharedFeedPageSubtitle"
      defaultMessage="Create a new shared feed"
      description="Subtitle of the shared feed creation page"
    />
  );

  if (feed.dbid) {
    pageTitle = isFeedOwner ? (
      <FormattedMessage
        id="saveFeed.sharedFeedPageEditSubtitle"
        defaultMessage="Edit shared feed"
        description="Subtitle of the shared feed editing page"
      />
    ) : feed.name;
  }

  const pageDescription = isFeedOwner ? (
    <FormattedMessage
      id="createFeed.sharedFeedPageDescription"
      defaultMessage="Share data feeds with other organizations to unlock new insights across audiences and languages."
      description="Description of the shared feed creation page"
    />
  ) : feed.description;

  return (
    <PageTitle prefix={pageTitle} team={{ name: props.teamName }} >
      <div className={styles.saveFeedContainer}>
        <div className={styles.saveFeedContent}>
          { feed.id ?
            <div>
              <ButtonMain
                variant="outlined"
                size="default"
                theme="brand"
                onClick={() => { handleViewFeed(feed.dbid); }}
                disabled={!isFeedOwner && !feedTeam.saved_search_id}
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
                  defaultMessage="To request changes to this shared feed, please contact the creating organization: <strong>{organizer}</strong>"
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
              { pageDescription }
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
                defaultMessage="Easily remembered title for this shared feed"
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
            </div>
          )}

          <div className={styles.saveFeedCard}>
            <FeedDataPoints
              readOnly={Boolean(feed.id)}
              dataPoints={dataPoints}
              onChange={setDataPoints}
            />

            { dataPoints.length > 0 ?
              <FeedContent
                listId={selectedListId}
                dataPoints={dataPoints}
                onChange={e => setSelectedListId(+e.target.value)}
                onRemove={() => setSelectedListId(null)}
              />
              : null
            }
          </div>

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
              <FeedActions
                feedTeam={{ ...feedTeam, permissions: feedTeam.permissions }}
                disableSaveButton={disableSaveButton}
                saving={saving}
                handleDelete={handleDelete}
                handleLeaveFeed={handleLeaveFeed}
              />
              : null }
          </div>

          <FeedMetadata feed={feed} />

          <FeedCollaboration
            collaboratorId={feedTeam?.team_id}
            feed={feed}
            onChange={setNewInvites}
            permissions={permissions}
            readOnly={feedTeam?.team_id && feedTeam?.team_id !== feed?.team?.dbid}
          />
        </div>

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
