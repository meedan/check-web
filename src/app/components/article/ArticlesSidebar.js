import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql, commitMutation } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import ErrorBoundary from '../error/ErrorBoundary';
import MediasLoading from '../media/MediasLoading';
import NewArticleButton from './NewArticleButton';
import DescriptionIcon from '../../icons/description.svg';
import { FlashMessageSetterContext } from '../FlashMessage';
import { getErrorMessage } from '../../helpers';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import ArticlesSidebarTeamArticles from './ArticlesSidebarTeamArticles';
import styles from './Articles.module.css';
// eslint-disable-next-line no-unused-vars
import ArticleForm from './ArticleForm'; // For GraphQL fragment

const addExplainerMutation = graphql`
  mutation ArticlesSidebarCreateExplainerItemMutation($input: CreateExplainerItemInput!) {
    createExplainerItem(input: $input) {
      project_media {
        id
        fact_check {
          id
        }
        explainers(first: 100) {
          edges {
            node {
              id
            }
          }
        }
      }
    }
  }
`;

const addFactCheckMutation = graphql`
  mutation ArticlesSidebarUpdateClaimDescriptionMutation($input: UpdateClaimDescriptionInput!) {
    updateClaimDescription(input: $input) {
      project_media {
        id
        fact_check {
          id
        }
        explainers(first: 100) {
          edges {
            node {
              id
            }
          }
        }
      }
    }
  }
`;

const ArticlesSidebarComponent = ({
  team,
  projectMedia,
  onUpdate,
}) => {
  const [adding, setAdding] = React.useState(false);
  const setFlashMessage = React.useContext(FlashMessageSetterContext);
  const hasArticle = (projectMedia.fact_check?.id || projectMedia.explainers.edges[0]?.node?.id);

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
        {/* FIXME: Make sure the form can receive the right reference for the current item */}
        <NewArticleButton team={team} buttonMainProps={{ size: 'small', theme: 'text' }} disabled={projectMedia.type === 'Blank'} />
      </div>
      { !hasArticle && (
        <>
          <div className={cx('typography-body1', styles.articlesSidebarNoArticle)}>
            <DescriptionIcon style={{ fontSize: '32px' }} />
            <div>
              <FormattedMessage
                id="articlesSidebar.noArticlesAddedToItem"
                defaultMessage="No articles are being delivered to Tipline users who send in request with that match this Media."
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
          <ArticlesSidebarTeamArticles teamSlug={team.slug} onAdd={handleAdd} />
        </>
      )}
    </div>
  );
};

ArticlesSidebarComponent.propTypes = {
  team: PropTypes.shape({
    slug: PropTypes.string.isRequired,
  }).isRequired,
  projectMedia: PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    fact_check: PropTypes.object,
    explainers: PropTypes.exact({
      edges: PropTypes.arrayOf(PropTypes.object),
    }),
  }).isRequired,
  onUpdate: PropTypes.func.isRequired,
};

const ArticlesSidebar = ({ teamSlug, projectMediaDbid }) => {
  const [updateCount, setUpdateCount] = React.useState(0);

  const handleUpdate = () => {
    setUpdateCount(updateCount + 1);
  };

  return (
    <ErrorBoundary component="ArticlesSidebar">
      <QueryRenderer
        environment={Relay.Store}
        query={graphql`
          query ArticlesSidebarQuery($slug: String!, $ids: String!) {
            team(slug: $slug) {
              slug
              ...ArticleForm_team
            }
            project_media(ids: $ids) {
              id
              dbid
              type
              fact_check: fact_check {
                id
              }
              explainers(first: 100) {
                edges {
                  node {
                    id
                  }
                }
              }
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
              <ArticlesSidebarComponent
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

ArticlesSidebar.propTypes = {
  teamSlug: PropTypes.string.isRequired,
  projectMediaDbid: PropTypes.number.isRequired,
};

export default ArticlesSidebar;
