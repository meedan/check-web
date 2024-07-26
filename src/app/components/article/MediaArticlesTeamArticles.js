import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import { QueryRenderer, graphql } from 'react-relay/compat';
import cx from 'classnames/bind';
import ErrorBoundary from '../error/ErrorBoundary';
import MediasLoading from '../media/MediasLoading';
import MediaArticlesCard from './MediaArticlesCard';
import styles from './Articles.module.css';
import DescriptionIcon from '../../icons/description.svg';

const MediaArticlesTeamArticlesComponent = ({
  articles,
  team,
  textSearch,
  onAdd,
}) => (
  <>
    { textSearch && !articles.length ? (
      <div className={cx('typography-body1', styles.articlesSidebarNoArticle)}>
        <DescriptionIcon />
        <FormattedMessage
          tagName="div"
          id="mediaArticlesTeamArticles.noResults"
          defaultMessage="No results matched your search."
          description="Message displayed on articles sidebar when search returns no articles."
        />
      </div>
    ) : null }
    <div id="articles-sidebar-team-articles" className={styles.articlesSidebarList}>
      {articles.map(article => (
        <MediaArticlesCard article={article} team={team} onAdd={onAdd} />
      ))}
    </div>
  </>
);

MediaArticlesTeamArticlesComponent.defaultProps = {
  articles: [],
  textSearch: null,
};

MediaArticlesTeamArticlesComponent.propTypes = {
  team: PropTypes.object.isRequired,
  articles: PropTypes.arrayOf(PropTypes.object),
  textSearch: PropTypes.string,
  onAdd: PropTypes.func.isRequired,
};

const numberOfArticles = 30;

const MediaArticlesTeamArticles = ({ teamSlug, textSearch, onAdd }) => (
  <ErrorBoundary component="MediaArticlesTeamArticles">
    <QueryRenderer
      environment={Relay.Store}
      key={new Date().getTime()}
      cacheConfig={{ force: true }}
      query={graphql`
        query MediaArticlesTeamArticlesQuery($slug: String!, $textSearch: String!, $numberOfArticles: Int!) {
          team(slug: $slug) {
            ...MediaArticlesCard_team
            factChecks: articles(first: $numberOfArticles, sort: "id", sort_type: "desc", article_type: "fact-check", text: $textSearch, standalone: true) {
              edges {
                node {
                  ... on FactCheck {
                    created_at
                    ...MediaArticlesCard_article
                  }
                }
              }
            }
            explainers: articles(first: $numberOfArticles, sort: "id", sort_type: "desc", article_type: "explainer", text: $textSearch) {
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
        textSearch,
        slug: teamSlug,
        numberOfArticles,
        timestamp: new Date().getTime(), // No cache
      }}
      render={({ error, props }) => {
        if (!error && props) {
          // Merge explainers with fact-checks and re-sort
          const articles = props.team.factChecks.edges.concat(props.team.explainers.edges).map(edge => edge.node).sort((a, b) => (parseInt(a.created_at, 10) < parseInt(b.created_at, 10)) ? 1 : -1);

          return (
            <MediaArticlesTeamArticlesComponent textSearch={textSearch} articles={articles} team={props.team} onAdd={onAdd} />
          );
        }
        return <MediasLoading theme="white" variant="inline" size="large" />;
      }}
    />
  </ErrorBoundary>
);

MediaArticlesTeamArticles.defaultProps = {
  textSearch: '',
};

MediaArticlesTeamArticles.propTypes = {
  teamSlug: PropTypes.string.isRequired,
  textSearch: PropTypes.string,
  onAdd: PropTypes.func.isRequired,
};

export default MediaArticlesTeamArticles;
