import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import { QueryRenderer, graphql } from 'react-relay/compat';
import cx from 'classnames/bind';
import MediaArticlesCard from './MediaArticlesCard';
import ErrorBoundary from '../error/ErrorBoundary';
import Loader from '../cds/loading/Loader';
import DescriptionIcon from '../../icons/description.svg';
import styles from './Articles.module.css';

const MediaArticlesTeamArticlesComponent = ({
  articles,
  hasRelevantArticles,
  onAdd,
  team,
  textSearch,
}) => {
  // eslint-disable-next-line
  console.log('Article:', articles);

  return (
    <>
      { !hasRelevantArticles && !textSearch && (
        <div className="typography-subtitle2">
          <FormattedMessage
            defaultMessage="Choose a recent article to add to this media:"
            description="Message displayed on articles sidebar when an item has no articles."
            id="mediaArticles.chooseRecentArticle"
          />
        </div>
      )}
      { hasRelevantArticles && !textSearch && (
        <div className="typography-subtitle2">
          <FormattedMessage
            defaultMessage="Choose a relevant article to add to this media:"
            description="Message displayed on articles sidebar when an item has relevant articles."
            id="mediaArticles.chooseRelevantArticle"
          />
        </div>
      )}
      { textSearch && !articles.length ? (
        <div className={cx('typography-body1', styles.articlesSidebarNoArticle)}>
          <DescriptionIcon />
          <FormattedMessage
            defaultMessage="No results matched your search."
            description="Message displayed on articles sidebar when search returns no articles."
            id="mediaArticlesTeamArticles.noResults"
            tagName="div"
          />
        </div>
      ) : null }
      <div className={styles.articlesSidebarList} id="articles-sidebar-team-articles">
        {articles.map(article => (
          <MediaArticlesCard article={article} key={article.id} team={team} onAdd={onAdd} />
        ))}
      </div>
    </>
  );
};

MediaArticlesTeamArticlesComponent.defaultProps = {
  articles: [],
  hasRelevantArticles: false,
  textSearch: null,
};

MediaArticlesTeamArticlesComponent.propTypes = {
  articles: PropTypes.arrayOf(PropTypes.object),
  hasRelevantArticles: PropTypes.bool,
  team: PropTypes.object.isRequired,
  textSearch: PropTypes.string,
  onAdd: PropTypes.func.isRequired,
};

// eslint-disable-next-line
export { MediaArticlesTeamArticlesComponent };  // For unit test
const numberOfArticles = 30;

const MediaArticlesTeamArticles = ({
  onAdd,
  targetId,
  teamSlug,
  textSearch,
}) => (
  <ErrorBoundary component="MediaArticlesTeamArticles">
    <QueryRenderer
      cacheConfig={{ force: true }}
      environment={Relay.Store}
      key={new Date().getTime()}
      query={graphql`
        query MediaArticlesTeamArticlesQuery($ids: String!, $slug: String!, $textSearch: String!, $numberOfArticles: Int!, $targetId: Int, $standalone: Boolean) {
          project_media(ids: $ids) {
            relevant_articles(first: $numberOfArticles) {
              edges {
                node {
                  ... on FactCheck {
                    id
                    ...MediaArticlesCard_article
                  }
                }
              }
            }
            relevant_articles_count
          }
          team(slug: $slug) {
            ...MediaArticlesCard_team
            factChecks: articles(first: $numberOfArticles, sort: "id", sort_type: "desc", article_type: "fact-check", text: $textSearch, target_id: $targetId, standalone: $standalone) {
              edges {
                node {
                  ... on FactCheck {
                    id
                    created_at
                    ...MediaArticlesCard_article
                  }
                }
              }
            }
            explainers: articles(first: $numberOfArticles, sort: "id", sort_type: "desc", article_type: "explainer", text: $textSearch, target_id: $targetId) {
              edges {
                node {
                  ... on Explainer {
                    id
                    created_at
                    ...MediaArticlesCard_article
                  }
                }
              }
            }
          }
        }
      `}
      render={({ error, props }) => {
        if (!error && props) {
          // Merge explainers with fact-checks and re-sort
          // eslint-disable-next-line
          console.log("Props:", props);

          let articles = [];
          let hasRelevantArticles = false;
          if (props.project_media.relevant_articles_count > 0) {
            hasRelevantArticles = true;
            // eslint-disable-next-line
            console.log("Has Relevant Articles:", hasRelevantArticles);
            articles = props.project_media.relevant_articles.edges.map(edge => edge.node);
            // eslint-disable-next-line
            console.log("Relevant Articles:", articles);
          } else {
            articles = props.team.factChecks.edges.concat(props.team.explainers.edges).map(edge => edge.node).sort((a, b) => (parseInt(a.created_at, 10) < parseInt(b.created_at, 10)) ? 1 : -1);
            // eslint-disable-next-line
            console.log("Recente Articles:", articles);
          }

          return (
            <MediaArticlesTeamArticlesComponent articles={articles} hasRelevantArticles={hasRelevantArticles} team={props.team} textSearch={textSearch} onAdd={onAdd} />
          );
        }
        return <Loader size="large" theme="white" variant="inline" />;
      }}
      variables={{
        textSearch,
        slug: teamSlug,
        numberOfArticles,
        targetId,
        ids: targetId.toString(),
        timestamp: new Date().getTime(), // No cache
        standalone: !textSearch,
      }}
    />
  </ErrorBoundary>
);

MediaArticlesTeamArticles.defaultProps = {
  textSearch: '',
  targetId: null,
};

MediaArticlesTeamArticles.propTypes = {
  targetId: PropTypes.number,
  teamSlug: PropTypes.string.isRequired,
  textSearch: PropTypes.string, // ProjectMedia ID (in order to exclude articles already applied to this item)
  onAdd: PropTypes.func.isRequired,
};

export default MediaArticlesTeamArticles;
