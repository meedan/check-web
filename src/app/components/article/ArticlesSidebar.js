import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import ErrorBoundary from '../error/ErrorBoundary';
import MediasLoading from '../media/MediasLoading';
import NewArticleButton from './NewArticleButton';
import DescriptionIcon from '../../icons/description.svg';
import styles from './Articles.module.css';
// eslint-disable-next-line no-unused-vars
import ArticleForm from './ArticleForm'; // For GraphQL fragment

const ArticlesSidebarComponent = ({ team, hasArticle }) => (
  <div id="articles-sidebar">
    <div className={styles.articlesSidebarTopBar}>
      <NewArticleButton team={team} buttonMainProps={{ size: 'small', theme: 'text' }} /> {/* FIXME: Make sure the form can receive the right reference for the current item */}
    </div>
    { !hasArticle && (
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
    )}
  </div>
);

ArticlesSidebarComponent.propTypes = {
  team: PropTypes.object.isRequired,
  hasArticle: PropTypes.bool.isRequired,
};

const ArticlesSidebar = ({ teamSlug, projectMediaDbid }) => (
  <ErrorBoundary component="ArticlesSidebar">
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query ArticlesSidebarQuery($slug: String!, $ids: String!) {
          team(slug: $slug) {
            ...ArticleForm_team 
          }
          project_media(ids: $ids) {
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
      `}
      variables={{
        slug: teamSlug,
        ids: `${projectMediaDbid},,`,
      }}
      render={({ error, props }) => {
        if (!error && props) {
          return (
            <ArticlesSidebarComponent
              team={props.team}
              hasArticle={props.project_media.fact_check || props.project_media.explainers.edges[0]?.node?.id}
            />
          );
        }
        return <MediasLoading theme="white" variant="page" size="large" />;
      }}
    />
  </ErrorBoundary>
);

ArticlesSidebar.propTypes = {
  teamSlug: PropTypes.string.isRequired,
  projectMediaDbid: PropTypes.number.isRequired,
};

export default ArticlesSidebar;
