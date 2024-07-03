import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql } from 'react-relay/compat';
import ErrorBoundary from '../error/ErrorBoundary';
import MediasLoading from '../media/MediasLoading';
import MediaArticlesCard from './MediaArticlesCard';
import styles from './Articles.module.css';

const MediaArticlesTeamArticlesComponent = ({ articles, team, onAdd }) => (
  <div id="articles-sidebar-team-articles" className={styles.articlesSidebarList}>
    {articles.map(article => (
      <MediaArticlesCard article={article} team={team} onAdd={onAdd} />
    ))}
  </div>
);

MediaArticlesTeamArticlesComponent.defaultProps = {
  articles: [],
};

MediaArticlesTeamArticlesComponent.propTypes = {
  team: PropTypes.object.isRequired,
  articles: PropTypes.arrayOf(PropTypes.object),
  onAdd: PropTypes.func.isRequired,
};

const numberOfArticles = 30;

const MediaArticlesTeamArticles = ({ teamSlug, onAdd }) => (
  <ErrorBoundary component="MediaArticlesTeamArticles">
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query MediaArticlesTeamArticlesQuery($slug: String!, $numberOfArticles: Int!) {
          team(slug: $slug) {
            ...MediaArticlesCard_team
            factChecks: articles(first: $numberOfArticles, sort: "id", sort_type: "desc", article_type: "fact-check", standalone: true) {
              edges {
                node {
                  ... on FactCheck {
                    created_at
                    ...MediaArticlesCard_article
                  }
                }
              }
            }
            explainers: articles(first: $numberOfArticles, sort: "id", sort_type: "desc", article_type: "explainer") {
              edges {
                node {
                  ... on Explainer {
                    created_at
                    ...MediaArticlesCard_article
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
            <MediaArticlesTeamArticlesComponent articles={articles} team={props.team} onAdd={onAdd} />
          );
        }
        return <MediasLoading theme="white" variant="inline" size="large" />;
      }}
    />
  </ErrorBoundary>
);

MediaArticlesTeamArticles.propTypes = {
  teamSlug: PropTypes.string.isRequired,
  onAdd: PropTypes.func.isRequired,
};

export default MediaArticlesTeamArticles;
