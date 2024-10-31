import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql, commitMutation } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import ChooseExistingArticleButton from './ChooseExistingArticleButton';
import NewArticleButton from './NewArticleButton';
import MediaArticlesTeamArticles from './MediaArticlesTeamArticles';
import MediaArticlesDisplay from './MediaArticlesDisplay';
import { FlashMessageSetterContext } from '../FlashMessage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import ErrorBoundary from '../error/ErrorBoundary';
import Loader from '../cds/loading/Loader';
import DescriptionIcon from '../../icons/description.svg';
import { getErrorMessage } from '../../helpers';
import ConfirmProceedDialog from '../layout/ConfirmProceedDialog';
import styles from './Articles.module.css';

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
  onUpdate,
  projectMedia,
  team,
}) => {
  const [adding, setAdding] = React.useState(false);
  const [confirmReplaceFactCheck, setConfirmReplaceFactCheck] = React.useState(null);
  const setFlashMessage = React.useContext(FlashMessageSetterContext);
  const hasArticle = projectMedia.articles_count > 0;

  if (adding) {
    return <Loader size="large" theme="white" variant="inline" />;
  }

  const onCompleted = () => {
    setFlashMessage(
      <FormattedMessage
        defaultMessage="Article added successfully!"
        description="Banner displayed after an article is successfully added to an item."
        id="mediaArticles.success"
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
    <div className={styles.articlesSidebar} id="articles-sidebar">
      <div className={styles.articlesSidebarTopBar}>
        <ChooseExistingArticleButton
          disabled={projectMedia.type === 'Blank'}
          projectMediaDbid={projectMedia.dbid}
          teamSlug={team.slug}
          onAdd={handleConfirmAdd}
        />
        <NewArticleButton
          buttonMainProps={{ size: 'small', theme: 'text' }}
          disabled={projectMedia.type === 'Blank'}
          projectMedia={projectMedia}
          team={team}
          onCreate={onUpdate}
        />
      </div>
      <div className={cx('typography-body1', styles.articlesSidebarScroller)}>
        { hasArticle ? (
          <MediaArticlesDisplay projectMedia={projectMedia} onUpdate={onUpdate} />
        ) : (
          <>
            <div className={cx('typography-body1', styles.articlesSidebarNoArticle)}>
              <DescriptionIcon style={{ fontSize: 'var(--font-size-h4)' }} />
              <div>
                <FormattedMessage
                  defaultMessage="No articles are being delivered to Tipline users who send requests that match this Media."
                  description="Message displayed on articles sidebar when an item has no articles."
                  id="mediaArticles.noArticlesAddedToItem"
                />
              </div>
            </div>
            <div className="typography-subtitle2">
              <FormattedMessage
                defaultMessage="Choose a recent article to add to this media:"
                description="Message displayed on articles sidebar when an item has no articles."
                id="mediaArticles.chooseRecentArticle"
              />
            </div>
            <MediaArticlesTeamArticles teamSlug={team.slug} onAdd={handleConfirmAdd} />
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
    </div>
  );
};

MediaArticlesComponent.propTypes = {
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
        render={({ error, props }) => {
          if (!error && props) {
            return (
              <MediaArticlesComponent
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
          ids: `${projectMediaDbid},,`,
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
