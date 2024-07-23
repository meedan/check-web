import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql, commitMutation } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import ChooseExistingArticleButton from './ChooseExistingArticleButton';
import NewArticleButton from './NewArticleButton';
import MediaArticlesTeamArticles from './MediaArticlesTeamArticles';
import { FlashMessageSetterContext } from '../FlashMessage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import ErrorBoundary from '../error/ErrorBoundary';
import MediasLoading from '../media/MediasLoading';
import DescriptionIcon from '../../icons/description.svg';
import { getErrorMessage } from '../../helpers';
import ConfirmProceedDialog from '../layout/ConfirmProceedDialog';
import styles from './Articles.module.css';
import MediaArticlesDisplay from './MediaArticlesDisplay';

const addExplainerMutation = graphql`
  mutation MediaArticlesCreateExplainerItemMutation($input: CreateExplainerItemInput!) {
    createExplainerItem(input: $input) {
      project_media {
        id
        ...MediaArticlesDisplay_projectMedia
      }
    }
  }
`;

const addFactCheckMutation = graphql`
  mutation MediaArticlesUpdateClaimDescriptionMutation($input: UpdateClaimDescriptionInput!) {
    updateClaimDescription(input: $input) {
      project_media {
        id
        status
        last_status
        last_status_obj {
          id
        }
        ...MediaArticlesDisplay_projectMedia
      }
    }
  }
`;

const MediaArticlesComponent = ({
  team,
  projectMedia,
  onUpdate,
}) => {
  const [adding, setAdding] = React.useState(false);
  const [confirmReplaceFactCheck, setConfirmReplaceFactCheck] = React.useState(null);
  const setFlashMessage = React.useContext(FlashMessageSetterContext);
  const hasArticle = projectMedia.articles_count > 0;

  if (adding) {
    return <MediasLoading theme="white" variant="inline" size="large" />;
  }

  const onCompleted = () => {
    setFlashMessage(
      <FormattedMessage
        id="mediaArticles.success"
        defaultMessage="Article added successfully!"
        description="Banner displayed after an article is successfully added to an item."
      />,
      'success');
    setAdding(false);
    onUpdate();
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

  return (
    <div id="articles-sidebar" className={styles.articlesSidebar}>
      <div className={styles.articlesSidebarTopBar}>
        <ChooseExistingArticleButton teamSlug={team.slug} onAdd={handleConfirmAdd} />
        <NewArticleButton team={team} buttonMainProps={{ size: 'small', theme: 'text' }} disabled={projectMedia.type === 'Blank'} projectMedia={projectMedia} onCreate={onUpdate} />
      </div>
      { hasArticle ? (
        <MediaArticlesDisplay projectMedia={projectMedia} onUpdate={onUpdate} />
      ) : (
        <div className={cx('typography-body1', styles.articlesSidebarNoArticleWrapper)}>
          <div className={cx('typography-body1', styles.articlesSidebarNoArticle)}>
            <DescriptionIcon style={{ fontSize: 'var(--font-size-h4)' }} />
            <div>
              <FormattedMessage
                id="mediaArticles.noArticlesAddedToItem"
                defaultMessage="No articles are being delivered to Tipline users who send requests that match this Media."
                description="Message displayed on articles sidebar when an item has no articles."
              />
            </div>
          </div>
          <div className="typography-subtitle2">
            <FormattedMessage
              id="mediaArticles.chooseRecentArticle"
              defaultMessage="Choose a recent article to add to this media:"
              description="Message displayed on articles sidebar when an item has no articles."
            />
          </div>
          <MediaArticlesTeamArticles teamSlug={team.slug} onAdd={handleConfirmAdd} />
        </div>
      )}

      {/* Confirm dialog for replacing fact-check */}
      <ConfirmProceedDialog
        open={Boolean(confirmReplaceFactCheck)}
        title={
          <FormattedMessage
            id="mediaArticles.confirmReplaceFactCheckTitle"
            defaultMessage="Replace claim & fact-check?"
            description="'Leave' here is an infinitive verb."
          />
        }
        body={
          <FormattedMessage
            id="mediaArticles.confirmReplaceFactCheckBody"
            defaultMessage="Are you sure you would like to replace the current claim & fact-check?"
            description="Confirmation dialog message when replacing a fact-check."
          />
        }
        proceedLabel={
          <FormattedMessage
            id="mediaArticles.confirmReplaceFactCheckButton"
            defaultMessage="Replace claim & fact-check"
            description="'Replace' here is an infinitive verb"
          />
        }
        onProceed={handleReplace}
        cancelLabel={
          <FormattedMessage
            id="global.cancel"
            defaultMessage="Cancel"
            description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation"
          />
        }
        onCancel={() => { setConfirmReplaceFactCheck(null); }}
      />
    </div>
  );
};

MediaArticlesComponent.propTypes = {
  team: PropTypes.shape({
    slug: PropTypes.string.isRequired,
  }).isRequired,
  projectMedia: PropTypes.shape({
    dbid: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    articles_count: PropTypes.number.isRequired,
    claim_description: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }),
  }).isRequired,
  onUpdate: PropTypes.func.isRequired,
};

const MediaArticles = ({ teamSlug, projectMediaDbid }) => {
  const [updateCount, setUpdateCount] = React.useState(0);

  // FIXME: Shouldn't be needed if Relay works as expected
  const handleUpdate = () => {
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
              claim_description {
                id
              }
              ...MediaArticlesDisplay_projectMedia
              ...NewArticleButton_projectMedia
            }
          }
        `}
        variables={{
          slug: teamSlug,
          ids: `${projectMediaDbid},,`,
          updateCount, // Used to force a refresh
        }}
        render={({ error, props }) => {
          if (!error && props) {
            return (
              <MediaArticlesComponent
                team={props.team}
                projectMedia={props.project_media}
                onUpdate={handleUpdate}
              />
            );
          }
          return <MediasLoading theme="white" variant="inline" size="large" />;
        }}
      />
    </ErrorBoundary>
  );
};

MediaArticles.propTypes = {
  teamSlug: PropTypes.string.isRequired,
  projectMediaDbid: PropTypes.number.isRequired,
};

export default MediaArticles;
