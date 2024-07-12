/* eslint-disable relay/unused-fields */
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
import styles from './Articles.module.css';
import MediaArticlesDisplay from './MediaArticlesDisplay';
// eslint-disable-next-line no-unused-vars
import ArticleForm from './ArticleForm'; // For GraphQL fragment

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
  const setFlashMessage = React.useContext(FlashMessageSetterContext);
  const hasArticle = projectMedia.articles_count > 0;

  const onCompleted = () => {
    setFlashMessage(
      <FormattedMessage
        id="articlesSidebar.success"
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

  return (
    <div id="articles-sidebar" className={styles.articlesSidebar}>
      <div className={styles.articlesSidebarTopBar}>
        <ChooseExistingArticleButton teamSlug={team.slug} onAdd={handleAdd} />
        {/* FIXME: Make sure the form can receive the right reference for the current item */}
        <NewArticleButton team={team} buttonMainProps={{ size: 'small', theme: 'text' }} disabled={projectMedia.type === 'Blank'} />
      </div>
      { hasArticle ? (
        <>
          <MediaArticlesDisplay projectMedia={projectMedia} />
        </>
      ) : (
        <>
          <div className={cx('typography-body1', styles.articlesSidebarNoArticle)}>
            <DescriptionIcon style={{ fontSize: 'var(--font-size-h4)' }} />
            <div>
              <FormattedMessage
                id="articlesSidebar.noArticlesAddedToItem"
                defaultMessage="No articles are being delivered to Tipline users who send requests that match this Media."
                description="Message displayed on articles sidebar when an item has no articles."
              />
            </div>
          </div>
          <div className="typography-subtitle2">
            <FormattedMessage
              id="articlesSidebar.chooseRecentArticle"
              defaultMessage="Choose a recent article to add to this media:"
              description="Message displayed on articles sidebar when an item has no articles."
            />
          </div>
          <MediaArticlesTeamArticles teamSlug={team.slug} onAdd={handleAdd} />
        </>
      )}
    </div>
  );
};

MediaArticlesComponent.propTypes = {
  team: PropTypes.shape({
    slug: PropTypes.string.isRequired,
  }).isRequired,
  projectMedia: PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    // fact_check: PropTypes.object,
    // explainers: PropTypes.exact({
    //   edges: PropTypes.arrayOf(PropTypes.object),
    // }),
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
              ...ArticleForm_team
              verification_statuses
            }
            project_media(ids: $ids) {
              id
              dbid
              type
              articles_count
              ...MediaArticlesDisplay_projectMedia
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
