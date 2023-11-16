import React from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { createFragmentContainer, graphql, commitMutation } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import styles from './SaveFeed.module.css';
import FeedCollaboration from './FeedCollaboration';
import FeedMetadata from './FeedMetadata';
import SelectListQueryRenderer from './SelectList';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import ExternalLink from '../ExternalLink';
import { FlashMessageSetterContext } from '../FlashMessage';
import { getErrorMessageForRelayModernProblem } from '../../helpers';
import Alert from '../cds/alerts-and-prompts/Alert';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';

const updateFeedTeamMutation = graphql`
mutation SaveFeedTeamUpdateFeedTeamMutation($input: UpdateFeedTeamInput!) {
  updateFeedTeam(input: $input) {
    feed_team {
      dbid
      saved_search_id
    }
  }
}
`;

const SaveFeedTeam = ({ feedTeam }) => {
  const { feed } = feedTeam;
  const collaboratorId = feedTeam?.team?.dbid;

  const [selectedListId, setSelectedListId] = React.useState(feedTeam.saved_search_id);
  const [saving, setSaving] = React.useState(false);
  const setFlashMessage = React.useContext(FlashMessageSetterContext);

  const handleViewFeed = () => {
    const teamSlug = window.location.pathname.match(/^\/([^/]+)/)[1];
    browserHistory.push(`/${teamSlug}/feed/${feed.dbid}/feed`);
  };

  const onFailure = (error) => {
    const message = getErrorMessageForRelayModernProblem(error, <GenericUnknownErrorMessage />);
    setFlashMessage(message, 'error');
    setSaving(false);
  };

  const handleSave = () => {
    setSaving(true);
    const input = {
      id: feedTeam.id,
      saved_search_id: selectedListId,
    };

    commitMutation(Relay.Store, {
      mutation: updateFeedTeamMutation,
      variables: { input },
      onCompleted: handleViewFeed,
      onError: onFailure,
    });
  };

  return (
    <div className={styles.saveFeedContainer}>
      <div className={styles.saveFeedContent}>
        <div>
          <ButtonMain
            variant="outlined"
            size="default"
            theme="brand"
            onClick={handleViewFeed}
            label={
              <FormattedMessage
                id="saveFeed.viewSharedFeed"
                defaultMessage="View Shared Feed"
                description="Label of a button displayed on the edit feed page that when clicked takes the user to the shared feed page."
              />
            }
          />
        </div>
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
        <div>
          <div className={`typography-caption ${styles.sharedFeedTitle}`}>
            <FormattedMessage
              id="saveFeed.sharedFeedPageTitle"
              defaultMessage="Shared feed"
              description="Title of the shared feed creation page"
            />
          </div>
          <div className="typography-h6">
            <FormattedMessage
              id="saveFeed.sharedFeedPageEditCollabSubtitle"
              defaultMessage="Collab with likeminded organizations"
              description="Subtitle of the shared feed editing page"
            />
          </div>
          <div className="typography-body1">
            <FormattedMessage
              id="createFeed.sharedFeedPageDescription"
              defaultMessage="Share data feeds with other organizations to unlock new insights across audiences and languages."
              description="Description of the shared feed creation page"
            />
          </div>
        </div>

        {/* TODO: Extract FeedContent card to its own component */}
        <div className={styles.saveFeedCard}>
          <div className="typography-subtitle2">
            <FormattedMessage
              id="saveFeed.feedContentTitle"
              defaultMessage="Feed content"
              description="Title of section where a list can be selected as the content of the feed"
            />
          </div>
          <div className="typography-body2">
            <FormattedMessage
              id="saveFeed.feedContentBlurb"
              defaultMessage="Select a filtered list of fact-checks from your workspace to contribute to this shared feed. You will be able to update this list at any time."
              description="Helper text for the feed content section"
            />
          </div>
          <div className="typography-body2">
            <FormattedHTMLMessage
              id="saveFeed.feedContentBlurb2"
              defaultMessage="<strong>Note:</strong> Your list must contain <strong>published fact-checks</strong> in order to be part of this shared feed."
              description="Helper text for the feed content section"
            />
          </div>
          <SelectListQueryRenderer
            required
            value={selectedListId}
            onChange={e => setSelectedListId(+e.target.value)}
            onRemove={() => setSelectedListId(null)}
            helperText={(
              <span>
                <FormattedMessage id="saveFeed.selectHelper" defaultMessage="Fact-check title, summary, and URL will be shared with the feed." description="Helper text for shared feed list selector" />
                &nbsp;
                <ExternalLink url="https://www.meedan.com">{ /* FIXME update url */}
                  <FormattedMessage id="saveFeed.learnMore" defaultMessage="Learn more." description="Link to external page with more details about shared feeds" />
                </ExternalLink>
              </span>
            )}
          />
        </div>
      </div>
      <div className={styles.saveFeedContentNarrow}>
        <div className={styles.saveFeedButtonContainer}>
          <ButtonMain
            className={styles.saveFeedContentNarrowAction}
            theme="brand"
            size="default"
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            label={
              <FormattedMessage
                id="saveFeed.updateSaveButton"
                defaultMessage="Save"
                description="Label to the save button of the shared feed update form"
              />
            }
          />
        </div>

        <FeedMetadata feed={feed} />

        <FeedCollaboration
          collaboratorId={collaboratorId}
          feed={feed}
        />
      </div>
    </div>
  );
};

SaveFeedTeam.propTypes = {
  feedTeam: PropTypes.shape({
    id: PropTypes.string,
    dbid: PropTypes.number,
    feed: PropTypes.shape({
      dbid: PropTypes.number,
      created_at: PropTypes.number,
      updated_at: PropTypes.number,
    }),
  }).isRequired,
};

// Used in unit test
// eslint-disable-next-line import/no-unused-modules
export { SaveFeedTeam };

export default createFragmentContainer(SaveFeedTeam, graphql`
  fragment SaveFeedTeam_feedTeam on FeedTeam {
    id
    saved_search_id
    team {
      dbid
    }
    feed {
      dbid
      team {
        name
      }
      ...FeedCollaboration_feed
      ...FeedMetadata_feed
    }
  }
`);
