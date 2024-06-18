import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql } from 'react-relay/compat';
import ErrorBoundary from '../error/ErrorBoundary';
import MediasLoading from '../media/MediasLoading';
import ArticlesSidebarCard from './ArticlesSidebarCard';
import styles from './Articles.module.css';

const ArticlesSidebarTeamArticlesComponent = ({ articles }) => (
  <div id="articles-sidebar-team-articles" className={styles.articlesSidebarList}>
    {articles.map(article => (
      <ArticlesSidebarCard article={article} />
    ))}
  </div>
);

ArticlesSidebarTeamArticlesComponent.defaultProps = {
  articles: [],
};

ArticlesSidebarTeamArticlesComponent.propTypes = {
  articles: PropTypes.arrayOf(PropTypes.object),
};

const ArticlesSidebarTeamArticles = ({ teamSlug }) => (
  <ErrorBoundary component="ArticlesSidebarTeamArticles">
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query ArticlesSidebarTeamArticlesQuery($slug: String!) {
          team(slug: $slug) {
            factChecks: articles(first: 10, sort: "id", sort_type: "desc", article_type: "fact-check") {
              edges {
                node {
                  ... on FactCheck {
                    created_at
                    ...ArticlesSidebarCard_article
                  }
                }
              }
            }
            explainers: articles(first: 10, sort: "id", sort_type: "desc", article_type: "explainer") {
              edges {
                node {
                  ... on Explainer {
                    created_at
                    ...ArticlesSidebarCard_article
                  }
                }
              }
            }
          }
        }
      `}
      variables={{
        slug: teamSlug,
      }}
      render={({ error, props }) => {
        if (!error && props) {
          const articles = props.team.factChecks.edges.concat(props.team.explainers.edges).map(edge => edge.node).sort((a, b) => (parseInt(a.created_at, 10) < parseInt(b.created_at, 10)) ? 1 : -1);
          return (
            <ArticlesSidebarTeamArticlesComponent articles={articles} />
          );
        }
        return <MediasLoading theme="white" variant="page" size="large" />;
      }}
    />
  </ErrorBoundary>
);

ArticlesSidebarTeamArticles.propTypes = {
  teamSlug: PropTypes.string.isRequired,
};

export default ArticlesSidebarTeamArticles;
