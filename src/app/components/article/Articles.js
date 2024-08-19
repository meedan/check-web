/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql, commitMutation } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import ArticleFilters from './ArticleFilters';
import { ClaimFactCheckFormQueryRenderer } from './ClaimFactCheckForm';
import { ExplainerFormQueryRenderer } from './ExplainerForm';
import { FlashMessageSetterContext } from '../FlashMessage';
import ErrorBoundary from '../error/ErrorBoundary';
import BlankState from '../layout/BlankState';
import ArticleCard from '../search/SearchResultsCards/ArticleCard';
import Paginator from '../cds/inputs/Paginator';
import ListSort from '../cds/inputs/ListSort';
import { getStatus } from '../../helpers';
import {
  getQueryStringValue,
  pushQueryStringValue,
  deleteQueryStringValue,
  pageSize,
} from '../../urlHelpers';
import MediasLoading from '../media/MediasLoading';
import PageTitle from '../PageTitle';
import searchStyles from '../search/search.module.css';
import searchResultsStyles from '../search/SearchResults.module.css';

const ArticlesComponent = ({
  articles,
  articlesCount,
  defaultFilters,
  filterOptions,
  filters,
  icon,
  onChangeSearchParams,
  page,
  reloadData,
  sort,
  sortOptions,
  sortType,
  statuses,
  team,
  teamTags,
  title,
  type,
  updateMutation,
}) => {
  let articleDbidFromUrl = null;

  if (type === 'fact-check') articleDbidFromUrl = getQueryStringValue('factCheckId');
  if (type === 'explainer') articleDbidFromUrl = getQueryStringValue('explainerId');

  const [selectedArticleDbid, setSelectedArticleDbid] = React.useState(articleDbidFromUrl);

  // Track when number of articles increases: When it happens, it's because a new article was created, so refresh the list
  const [totalArticlesCount, setTotalArticlesCount] = React.useState(team.totalArticlesCount);
  React.useEffect(() => {
    if (team.totalArticlesCount > totalArticlesCount) {
      setTotalArticlesCount(team.totalArticlesCount);
      reloadData();
    }
  }, [team.totalArticlesCount]);

  const setFlashMessage = React.useContext(FlashMessageSetterContext);

  const handleChangeSort = ({ sort: newSort, sortType: newSortType }) => {
    onChangeSearchParams({
      page: 1,
      sort: newSort,
      sortType: newSortType,
      filters: { ...defaultFilters },
    });
  };

  const handleChangePage = (newPage) => {
    onChangeSearchParams({ page: newPage });
  };

  const handleChangeFilters = (newFilters) => {
    onChangeSearchParams({
      filters: newFilters,
      page: 1,
    });
  };

  const handleCloseSlideout = () => {
    setSelectedArticleDbid(null);
    deleteQueryStringValue(type === 'explainer' ? 'explainerId' : 'factCheckId');
  };

  const onCompleted = () => {
    setFlashMessage(
      <FormattedMessage
        id="articles.updateTagsSuccess"
        defaultMessage="Tags updated successfully."
        description="Banner displayed after article tags are updated successfully."
      />,
      'success');
  };

  const onError = () => {
    setFlashMessage(
      <FormattedMessage
        id="articles.updateTagsError"
        defaultMessage="Could not update tags, please try again later or contact support if the error persists."
        description="Banner displayed when article tags can't be updated."
      />,
      'error');
  };

  const handleUpdateTags = (id, tags) => {
    commitMutation(Relay.Store, {
      mutation: updateMutation,
      variables: {
        input: {
          id,
          tags,
        },
      },
      onCompleted,
      onError,
    });
  };

  const handleClick = (article) => {
    if (article.dbid !== selectedArticleDbid) {
      setSelectedArticleDbid(null);
      setTimeout(() => {
        setSelectedArticleDbid(article.dbid);
        pushQueryStringValue(type === 'explainer' ? 'explainerId' : 'factCheckId', article.dbid);
      }, 10);
    }
  };

  return (
    <PageTitle prefix={title} teamName={team.name}>
      <div className={searchResultsStyles['search-results-header']}>
        <div className={searchResultsStyles.searchResultsTitleWrapper}>
          <div className={searchResultsStyles.searchHeaderSubtitle}>
            &nbsp;
          </div>
          <div className={searchResultsStyles.searchHeaderTitle}>
            <h6>
              {icon}
              {title}
            </h6>
          </div>
        </div>
      </div>
      <div className={searchResultsStyles['search-results-top']}>
        <div className={searchStyles['filters-wrapper']}>
          <ListSort
            sort={sort}
            sortType={sortType}
            options={sortOptions}
            onChange={handleChangeSort}
            className={searchStyles['filters-sorting']}
          />
          <ArticleFilters
            type={type}
            teamSlug={team.slug}
            filterOptions={filterOptions}
            currentFilters={{ ...filters, article_type: type }}
            defaultFilters={{ ...defaultFilters, article_type: type }}
            statuses={statuses.statuses}
            onSubmit={handleChangeFilters}
          />
        </div>
      </div>
      <div className={searchResultsStyles['search-results-wrapper']}>
        { articles.length > 0 ?
          <div className={searchResultsStyles['search-results-toolbar']}>
            <div />
            <Paginator
              page={page}
              pageSize={pageSize}
              numberOfPageResults={articles.length}
              numberOfTotalResults={articlesCount}
              onChangePage={handleChangePage}
            />
          </div>
          : null
        }

        { articles.length === 0 ?
          <BlankState>
            <FormattedMessage
              id="articles.blank"
              defaultMessage="There are no articles here."
              description="Empty message that is displayed when there are no articles to display."
            />
          </BlankState>
          : null
        }

        <div className={searchResultsStyles['search-results-scroller']}>
          {articles.map((article) => {
            let currentStatus = null;
            if (article.rating) {
              currentStatus = getStatus(statuses, article.rating);
            }

            return (
              <ArticleCard
                key={article.id}
                variant={type}
                title={article.title || article.claim_description?.description}
                summary={article.description || article.summary}
                url={article.url}
                languageCode={article.language !== 'und' ? article.language : null}
                date={article.updated_at}
                tags={article.tags}
                tagOptions={teamTags}
                statusColor={currentStatus ? currentStatus.style?.color : null}
                statusLabel={currentStatus ? currentStatus.label : null}
                isPublished={article.report_status === 'published'}
                projectMediaDbid={article.claim_description?.project_media?.dbid}
                publishedAt={article.claim_description?.project_media?.fact_check_published_on ? parseInt(article.claim_description?.project_media?.fact_check_published_on, 10) : null}
                onChangeTags={(tags) => { handleUpdateTags(article.id, tags); }}
                handleClick={() => handleClick(article)}
              />
            );
          })}
        </div>

        <>
          {/* NOTE: If we happen to edit articles from multiple places we're probably better off
              having each form type be its own QueryRenderer instead of doing lots of prop passing repeatedly
          */}
          {selectedArticleDbid && type === 'fact-check' && (
            <ClaimFactCheckFormQueryRenderer
              teamSlug={team.slug}
              factCheckId={selectedArticleDbid}
              onClose={handleCloseSlideout}
            />
          )}
          {selectedArticleDbid && type === 'explainer' && (
            <ExplainerFormQueryRenderer
              teamSlug={team.slug}
              explainerId={selectedArticleDbid}
              onClose={handleCloseSlideout}
            />
          )}
        </>
      </div>
    </PageTitle>
  );
};

ArticlesComponent.defaultProps = {
  page: 1,
  sort: 'updated_at',
  sortType: 'DESC',
  sortOptions: [],
  filterOptions: [],
  filters: {},
  defaultFilters: {},
  statuses: {},
  teamTags: null,
  articles: [],
  articlesCount: 0,
};

ArticlesComponent.propTypes = {
  type: PropTypes.oneOf(['explainer', 'fact-check']).isRequired,
  title: PropTypes.node.isRequired, // <FormattedMessage />
  icon: PropTypes.node.isRequired,
  page: PropTypes.number,
  sort: PropTypes.oneOf(['title', 'language', 'updated_at']),
  sortType: PropTypes.oneOf(['ASC', 'DESC']),
  filters: PropTypes.object,
  defaultFilters: PropTypes.object,
  team: PropTypes.shape({
    name: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
  }).isRequired,
  onChangeSearchParams: PropTypes.func.isRequired,
  updateMutation: PropTypes.object.isRequired,
  filterOptions: PropTypes.arrayOf(PropTypes.string),
  sortOptions: PropTypes.arrayOf(PropTypes.exact({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired, // Localizable string
  })),
  statuses: PropTypes.object,
  teamTags: PropTypes.arrayOf(PropTypes.string),
  articlesCount: PropTypes.number,
  articles: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    summary: PropTypes.string,
    url: PropTypes.string,
    language: PropTypes.string,
    updated_at: PropTypes.string,
    rating: PropTypes.string,
    report_status: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    claim_description: PropTypes.shape({
      description: PropTypes.string,
      project_media: PropTypes.shape({
        dbid: PropTypes.number.isRequired,
        fact_check_published_on: PropTypes.number, // Timestamp
      }),
    }),
  })),
};

// Used in unit test
// eslint-disable-next-line import/no-unused-modules
export { ArticlesComponent };

const Articles = ({
  defaultFilters,
  filterOptions,
  icon,
  sortOptions,
  teamSlug,
  title,
  type,
  updateMutation,
}) => {
  const [searchParams, setSearchParams] = React.useState({
    page: 1,
    sort: 'updated_at',
    sortType: 'DESC',
    filters: { ...defaultFilters },
  });
  const {
    filters,
    page,
    sort,
    sortType,
  } = searchParams;

  const handleChangeSearchParams = (newSearchParams) => { // { page, sort, sortType, filters } - a single state for a single query/render
    setSearchParams(Object.assign({}, searchParams, newSearchParams));
  };
  // Adjust some filters
  if (filters.range?.updated_at) {
    filters.updatedAt = JSON.stringify(filters.range.updated_at);
  } else {
    delete filters.updatedAt;
  }
  if (filters.language_filter?.report_language) {
    filters.language = filters.language_filter.report_language;
  } else {
    delete filters.language;
  }

  return (
    <ErrorBoundary component="Articles">
      <QueryRenderer
        environment={Relay.Store}
        key={new Date().getTime()}
        cacheConfig={{ force: true }}
        query={graphql`
          query ArticlesQuery(
            $slug: String!, $type: String!, $pageSize: Int, $sort: String, $sortType: String, $offset: Int,
            $users: [Int], $updatedAt: String, $tags: [String], $language: [String], $published_by: [Int],
            $report_status: [String], $verification_status: [String], $imported: Boolean,
          ) {
            team(slug: $slug) {
              name
              slug
              totalArticlesCount: articles_count
              verification_statuses
              tag_texts(first: 100) {
                edges {
                  node {
                    text
                  }
                }
              }
              articles_count(
                article_type: $type, user_ids: $users, tags: $tags, updated_at: $updatedAt, language: $language,
                publisher_ids: $published_by, report_status: $report_status, rating: $verification_status, imported: $imported
              )
              articles(
                first: $pageSize, article_type: $type, offset: $offset, sort: $sort, sort_type: $sortType,
                user_ids: $users, tags: $tags, updated_at: $updatedAt, language: $language, publisher_ids: $published_by,
                report_status: $report_status, rating: $verification_status, imported: $imported,
              ) {
                edges {
                  node {
                    ... on Explainer {
                      id
                      dbid
                      title
                      description
                      url
                      language
                      updated_at
                      tags
                    }
                    ... on FactCheck {
                      id
                      dbid
                      title
                      summary
                      url
                      language
                      updated_at
                      rating
                      report_status
                      tags
                      claim_description { # There will be no N + 1 problem here because the backend uses eager loading
                        id
                        description
                        project_media {
                          dbid
                          fact_check_published_on
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `}
        variables={{
          slug: teamSlug,
          type,
          pageSize,
          sort,
          sortType,
          offset: pageSize * (page - 1),
          timestamp: new Date().getTime(),
          ...filters,
        }}
        render={({ error, props, retry }) => {
          if (!error && props) {
            return (
              <ArticlesComponent
                type={type}
                title={title}
                icon={icon}
                page={page}
                sort={sort}
                sortType={sortType}
                sortOptions={sortOptions}
                filterOptions={filterOptions}
                filters={filters}
                defaultFilters={defaultFilters}
                articles={props.team.articles.edges.map(edge => edge.node)}
                articlesCount={props.team.articles_count}
                statuses={props.team.verification_statuses}
                team={props.team}
                teamTags={props.team.tag_texts.edges.length > 0 ? props.team.tag_texts.edges.map(tag => tag.node.text) : null}
                onChangeSearchParams={handleChangeSearchParams}
                updateMutation={updateMutation}
                reloadData={retry}
              />
            );
          }
          // TODO render error state
          return <MediasLoading theme="white" variant="page" size="large" />;
        }}
      />
    </ErrorBoundary>
  );
};

Articles.defaultProps = {
  sortOptions: [],
  filterOptions: [],
  defaultFilters: {},
};

Articles.propTypes = {
  type: PropTypes.oneOf(['explainer', 'fact-check']).isRequired,
  title: PropTypes.node.isRequired, // <FormattedMessage />
  icon: PropTypes.node.isRequired,
  teamSlug: PropTypes.string.isRequired,
  filterOptions: PropTypes.arrayOf(PropTypes.string),
  defaultFilters: PropTypes.object,
  updateMutation: PropTypes.object.isRequired,
  sortOptions: PropTypes.arrayOf(PropTypes.exact({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired, // Localizable string
  })),
};

export default Articles;
