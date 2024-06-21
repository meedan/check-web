import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql } from 'react-relay/compat';
import ErrorBoundary from '../error/ErrorBoundary';
import MediasLoading from '../media/MediasLoading';
import ArticlesSidebarCard from './ArticlesSidebarCard';
import styles from './Articles.module.css';

const ArticlesSidebarTeamArticlesComponent = ({ articles, team }) => (
  <div id="articles-sidebar-team-articles" className={styles.articlesSidebarList}>
    {articles.map(article => (
      <ArticlesSidebarCard article={article} team={team} />
    ))}
  </div>
);

ArticlesSidebarTeamArticlesComponent.defaultProps = {
  articles: [],
};

ArticlesSidebarTeamArticlesComponent.propTypes = {
  team: PropTypes.object.isRequired,
  articles: PropTypes.arrayOf(PropTypes.object),
};

const numberOfArticles = 30;

const ArticlesSidebarTeamArticles = ({ teamSlug }) => (
  <ErrorBoundary component="ArticlesSidebarTeamArticles">
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query ArticlesSidebarTeamArticlesQuery($slug: String!, $numberOfArticles: Int!) {
          team(slug: $slug) {
            ...ArticlesSidebarCard_team
            factChecks: articles(first: $numberOfArticles, sort: "id", sort_type: "desc", article_type: "fact-check", standalone: true) {
              edges {
                node {
                  ... on FactCheck {
                    created_at
                    ...ArticlesSidebarCard_article
                  }
                }
              }
            }
            explainers: articles(first: $numberOfArticles, sort: "id", sort_type: "desc", article_type: "explainer") {
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
        numberOfArticles,
      }}
      render={({ error, props }) => {
        if (!error && props) {
          // Merge explainers with fact-checks and re-sort
          const articles = props.team.factChecks.edges.concat(props.team.explainers.edges).map(edge => edge.node).sort((a, b) => (parseInt(a.created_at, 10) < parseInt(b.created_at, 10)) ? 1 : -1);

          return (
            <ArticlesSidebarTeamArticlesComponent articles={articles} team={props.team} />
          );
        }
        return <MediasLoading theme="white" variant="inline" size="large" />;
      }}
    />
  </ErrorBoundary>
);

ArticlesSidebarTeamArticles.propTypes = {
  teamSlug: PropTypes.string.isRequired,
};

export default ArticlesSidebarTeamArticles;
