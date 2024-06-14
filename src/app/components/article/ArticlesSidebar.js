import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql } from 'react-relay/compat';
import ErrorBoundary from '../error/ErrorBoundary';
import MediasLoading from '../media/MediasLoading';
import NewArticleButton from './NewArticleButton';
import styles from './Articles.module.css';
// eslint-disable-next-line no-unused-vars
import ArticleForm from './ArticleForm'; // For GraphQL fragment

const ArticlesSidebarComponent = ({ team }) => (
  <div id="articles-sidebar">
    <div className={styles.articlesSidebarTopBar}>
      <NewArticleButton team={team} buttonMainProps={{ size: 'small', theme: 'text' }} /> {/* FIXME: Make sure the form can receive the right reference for the current item */}
    </div>
  </div>
);

ArticlesSidebarComponent.propTypes = {
  team: PropTypes.object.isRequired,
};

const ArticlesSidebar = ({ teamSlug }) => (
  <ErrorBoundary component="ArticlesSidebar">
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query ArticlesSidebarQuery($slug: String!) {
          team(slug: $slug) {
            ...ArticleForm_team 
          }
        }
      `}
      variables={{
        slug: teamSlug,
      }}
      render={({ error, props }) => {
        if (!error && props) {
          return (
            <ArticlesSidebarComponent
              team={props.team}
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
};

export default ArticlesSidebar;
