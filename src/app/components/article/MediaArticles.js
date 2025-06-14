import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql, commitMutation } from 'react-relay/compat';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import cx from 'classnames/bind';
import ChooseExistingArticleButton from './ChooseExistingArticleButton';
import NewArticleButton from './NewArticleButton';
import MediaArticlesTeamArticles from './MediaArticlesTeamArticles';
import MediaArticlesDisplay from './MediaArticlesDisplay';
import SendExplainersToPreviousRequests from './SendExplainersToPreviousRequests';
import Alert from '../cds/alerts-and-prompts/Alert';
import { FlashMessageSetterContext } from '../FlashMessage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import ErrorBoundary from '../error/ErrorBoundary';
import Loader from '../cds/loading/Loader';
import { getErrorMessage } from '../../helpers';
import ConfirmProceedDialog from '../layout/ConfirmProceedDialog';
import DescriptionIcon from '../../icons/description.svg';
import CheckMediaTypes from '../../constants/CheckMediaTypes';
import styles from './Articles.module.css';
import mediaStyles from '../media/media.module.css';

const addExplainerMutation = graphql`
  mutation MediaArticlesCreateExplainerItemMutation($input: CreateExplainerItemInput!) {
    createExplainerItem(input: $input) {
      explainer_item {
        dbid
      }
      project_media {
        id
        ...MediaArticlesDisplay_projectMedia
        has_tipline_requests_that_never_received_articles
      }
    }
  }
`;

const addFactCheckMutation = graphql`
  mutation MediaArticlesUpdateClaimDescriptionMutation($input: UpdateClaimDescriptionInput!) {
    updateClaimDescription(input: $input) {
      project_media {
        id
        report_status
        status
        last_status
        last_status_obj {
          id
          locked
        }
        ...MediaArticlesDisplay_projectMedia
      }
    }
  }
`;

const MediaArticlesComponent = ({
  explainerItemDbidsToSend,
  onUpdate,
  projectMedia,
  team,
}) => {
  const [adding, setAdding] = React.useState(false);
  const [confirmReplaceFactCheck, setConfirmReplaceFactCheck] = React.useState(null);
  const [confirmSendExplainers, setConfirmSendExplainers] = React.useState(false);
  const [showAlert, setShowAlert] = React.useState(true);
  const setFlashMessage = React.useContext(FlashMessageSetterContext);
  const hasArticle = projectMedia.articles_count > 0;

  if (adding) {
    return <Loader size="large" theme="white" variant="inline" />;
  }

  const onCompleted = (response) => {
    setFlashMessage(
      <FormattedMessage
        defaultMessage="Article added successfully!"
        description="Banner displayed after an article is successfully added to an item."
        id="mediaArticles.success"
      />,
      'success');
    setAdding(false);
    const explainerItemDbid = response?.createExplainerItem?.explainer_item?.dbid;
    onUpdate(explainerItemDbid);
  };

  const onError = (error) => {
    const errorMessage = getErrorMessage(error);
    const errorComponent = errorMessage || <GenericUnknownErrorMessage />;
    setFlashMessage(errorComponent);
    setAdding(false);
  };

  const handleAdd = (nodeType, id) => { // "id" should be an explainer database ID or a fact-check claim description GraphQL ID
    if (!adding) {
      setAdding(true);
      let input = null;
      let mutation = null;
      if (nodeType === 'Explainer') {
        mutation = addExplainerMutation;
        input = {
          explainerId: id,
          projectMediaId: projectMedia.dbid,
        };
      } else if (nodeType === 'FactCheck') {
        mutation = addFactCheckMutation;
        input = {
          id,
          project_media_id: projectMedia.dbid,
        };
      }
      commitMutation(Relay.Store, {
        mutation,
        variables: {
          input,
        },
        onCompleted,
        onError,
      });
    }
  };

  const handleReplace = () => {
    commitMutation(Relay.Store, {
      mutation: addFactCheckMutation,
      variables: {
        input: {
          id: projectMedia.claim_description.id,
          project_media_id: null,
        },
      },
      onCompleted: () => {
        handleAdd(confirmReplaceFactCheck.nodeType, confirmReplaceFactCheck.id);
        setConfirmReplaceFactCheck(null);
      },
      onError,
    });
  };

  const handleConfirmAdd = (nodeType, id) => {
    if (nodeType === 'FactCheck' && projectMedia.claim_description) {
      setConfirmReplaceFactCheck({ nodeType, id });
    } else {
      handleAdd(nodeType, id);
    }
  };

  const handleAlertButtonClick = () => {
    setConfirmSendExplainers(true);
  };

  return (
    <div className={cx(mediaStyles['media-articles'], styles.articlesSidebar)} id="articles-sidebar">
      <div className={styles.articlesSidebarTopBar}>
        <ChooseExistingArticleButton
          disabled={projectMedia.type === CheckMediaTypes.BLANK}
          projectMediaDbid={projectMedia.dbid}
          teamSlug={team.slug}
          onAdd={handleConfirmAdd}
        />
        <NewArticleButton
          buttonMainProps={{ size: 'small', theme: 'text' }}
          disabled={projectMedia.type === CheckMediaTypes.BLANK}
          projectMedia={projectMedia}
          team={team}
          onCreate={(response) => {
            const explainerItemDbid = response?.createExplainerItem?.explainer_item?.dbid;
            onUpdate(explainerItemDbid);
          }}
        />
      </div>
      {explainerItemDbidsToSend.length > 0 && showAlert && (
        <Alert
          buttonLabel={
            <FormattedMessage
              defaultMessage="Send to Previous Requests"
              description="Label for the button in the alert to send articles."
              id="mediaArticles.sendArticlesButton"
            />
          }
          content={
            <FormattedHTMLMessage
              defaultMessage="You can deliver new articles added to users who have previously submitted this media, but did not receive a response in the past <b>30 days</b>."
              description="Message for the alert when there are unanswered requests."
              id="mediaArticles.unansweredRequestsMessage"
            />
          }
          icon
          placement="default"
          title={
            <FormattedMessage
              defaultMessage="Articles Added [{numberOfExplainersToSend}]"
              description="Title for the alert when explainers are added."
              id="mediaArticles.unansweredRequestsTitle"
              values={{ numberOfExplainersToSend: explainerItemDbidsToSend.length }}
            />
          }
          variant="success"
          onButtonClick={handleAlertButtonClick}
          onClose={() => { setShowAlert(false); }}
        />
      )}

      <div className={cx('typography-body1', styles.articlesSidebarScroller)}>
        { hasArticle ? (
          <MediaArticlesDisplay projectMedia={projectMedia} onUpdate={onUpdate} />
        ) : (
          <>
            <div className={cx('typography-body1', styles.articlesSidebarNoArticle)}>
              <DescriptionIcon />
              <div>
                <FormattedMessage
                  defaultMessage="No articles are being delivered to Tipline users who send requests that match this Media."
                  description="Message displayed on articles sidebar when an item has no articles."
                  id="mediaArticles.noArticlesAddedToItem"
                />
              </div>
            </div>
            <MediaArticlesTeamArticles targetId={projectMedia.dbid} teamSlug={team.slug} onAdd={handleConfirmAdd} />
          </>
        )}
      </div>

      {/* Confirm dialog for replacing fact-check */}
      <ConfirmProceedDialog
        body={
          <FormattedMessage
            defaultMessage="Are you sure you would like to replace the current claim & fact-check?"
            description="Confirmation dialog message when replacing a fact-check."
            id="mediaArticles.confirmReplaceFactCheckBody"
          />
        }
        cancelLabel={
          <FormattedMessage
            defaultMessage="Cancel"
            description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation"
            id="global.cancel"
          />
        }
        open={Boolean(confirmReplaceFactCheck)}
        proceedLabel={
          <FormattedMessage
            defaultMessage="Replace claim & fact-check"
            description="'Replace' here is an infinitive verb"
            id="mediaArticles.confirmReplaceFactCheckButton"
          />
        }
        title={
          <FormattedMessage
            defaultMessage="Replace claim & fact-check?"
            description="'Replace' here is an infinitive verb."
            id="mediaArticles.confirmReplaceFactCheckTitle"
          />
        }
        onCancel={() => { setConfirmReplaceFactCheck(null); }}
        onProceed={handleReplace}
      />

      {/* Dialog for sending explainers to previous requests */}
      { confirmSendExplainers && (
        <SendExplainersToPreviousRequests
          explainerItemDbidsToSend={explainerItemDbidsToSend}
          projectMedia={projectMedia}
          onClose={() => { setConfirmSendExplainers(false); }}
          onSubmit={onUpdate}
        />
      )}
    </div>
  );
};

MediaArticlesComponent.defaultProps = {
  explainerItemDbidsToSend: [],
};

MediaArticlesComponent.propTypes = {
  explainerItemDbidsToSend: PropTypes.arrayOf(PropTypes.number),
  projectMedia: PropTypes.shape({
    dbid: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    articles_count: PropTypes.number.isRequired,
    claim_description: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }),
  }).isRequired,
  team: PropTypes.shape({
    slug: PropTypes.string.isRequired,
  }).isRequired,
  onUpdate: PropTypes.func.isRequired,
};

const MediaArticles = ({ projectMediaDbid, teamSlug }) => {
  const [updateCount, setUpdateCount] = React.useState(0);
  const [explainerItemDbidsToSend, setExplainerItemDbidsToSend] = React.useState([]);

  // FIXME: Shouldn't be needed if Relay works as expected
  const handleUpdate = (explainerItemDbid) => {
    if (explainerItemDbid) {
      setExplainerItemDbidsToSend(explainerItemDbidsToSend.concat([explainerItemDbid]));
    } else {
      setExplainerItemDbidsToSend([]);
    }
    setUpdateCount(updateCount + 1);
  };

  return (
    <ErrorBoundary component="MediaArticles">
      <QueryRenderer
        environment={Relay.Store}
        query={graphql`
          query MediaArticlesQuery($slug: String!, $ids: String!) {
            team(slug: $slug) {
              slug
              ...NewArticleButton_team
            }
            project_media(ids: $ids) {
              dbid
              type
              articles_count
              fact_check_id
              has_tipline_requests_that_never_received_articles
              claim_description {
                id
              }
              ...MediaArticlesDisplay_projectMedia
              ...NewArticleButton_projectMedia
              ...SendExplainersToPreviousRequests_projectMedia
            }
          }
        `}
        render={({ error, props }) => {
          if (!error && props) {
            return (
              <MediaArticlesComponent
                explainerItemDbidsToSend={(!props.project_media.fact_check_id && props.project_media.has_tipline_requests_that_never_received_articles) ? explainerItemDbidsToSend : []}
                projectMedia={props.project_media}
                team={props.team}
                onUpdate={handleUpdate}
              />
            );
          }
          return <Loader size="large" theme="white" variant="inline" />;
        }}
        variables={{
          slug: teamSlug,
          ids: `${projectMediaDbid}`,
          updateCount, // Used to force a refresh
        }}
      />
    </ErrorBoundary>
  );
};

MediaArticles.propTypes = {
  projectMediaDbid: PropTypes.number.isRequired,
  teamSlug: PropTypes.string.isRequired,
};

export default MediaArticles;
