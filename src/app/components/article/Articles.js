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
import ExportList from '../ExportList';
import SearchField from '../search/SearchField';
import Paginator from '../cds/inputs/Paginator';
import ListSort from '../cds/inputs/ListSort';
import { getStatus, isFactCheckValueBlank } from '../../helpers';
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

const adjustFilters = (filters) => {
  const newFilters = { ...filters };

  // Date
  if (filters.range?.updated_at) {
    newFilters.updated_at = JSON.stringify(filters.range.updated_at);
  } else {
    delete newFilters.updated_at;
  }

  // Language
  if (filters.language_filter?.report_language) {
    newFilters.language = filters.language_filter.report_language;
  } else {
    delete newFilters.language;
  }

  // Some aliases
  newFilters.user_ids = filters.users;
  newFilters.publisher_ids = filters.published_by;
  newFilters.rating = filters.verification_status;

  return newFilters;
};

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
  title,
  type,
  updateMutation,
}) => {
  let articleDbidFromUrl = null;

  if (type === 'fact-check') articleDbidFromUrl = getQueryStringValue('factCheckId');
  if (type === 'explainer') articleDbidFromUrl = getQueryStringValue('explainerId');
  if (!type) articleDbidFromUrl = getQueryStringValue('factCheckId') || getQueryStringValue('explainerId');

  const [selectedArticleDbid, setSelectedArticleDbid] = React.useState(articleDbidFromUrl);
  const [selectedArticleType, setSelectedArticleType] = React.useState(type);

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
    deleteQueryStringValue(selectedArticleType === 'explainer' ? 'explainerId' : 'factCheckId');
    setSelectedArticleType(null);
  };

  const onCompleted = () => {
    setFlashMessage(
      <FormattedMessage
        defaultMessage="Tags updated successfully."
        description="Banner displayed after article tags are updated successfully."
        id="articles.updateTagsSuccess"
      />,
      'success');
  };

  const onError = () => {
    setFlashMessage(
      <FormattedMessage
        defaultMessage="Could not update tags, please try again later or contact support if the error persists."
        description="Banner displayed when article tags can't be updated."
        id="articles.updateTagsError"
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
      setSelectedArticleType(null);
      setTimeout(() => {
        const articleType = article.report_status ? 'fact-check' : 'explainer';
        setSelectedArticleDbid(article.dbid);
        setSelectedArticleType(articleType);
        pushQueryStringValue(articleType === 'explainer' ? 'explainerId' : 'factCheckId', article.dbid);
      }, 10);
    }
  };

  return (
    <PageTitle prefix={title} teamName={team.name}>
      <div className={searchResultsStyles['search-results-header']}>
        <div className="search__list-header-filter-row">
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
          <div className={searchStyles['search-form']}>
            <SearchField
              handleClear={() => { handleChangeFilters({ ...filters, text: null }); }}
              searchText={filters.text}
              setParentSearchText={(text) => { handleChangeFilters({ ...filters, text }); }}
            />
          </div>
        </div>
      </div>
      <div className={searchResultsStyles['search-results-top']}>
        <div className={searchStyles['filters-wrapper']}>
          <ListSort
            className={searchStyles['filters-sorting']}
            options={sortOptions}
            sort={sort}
            sortType={sortType}
            onChange={handleChangeSort}
          />
          <ArticleFilters
            currentFilters={type ? { ...filters, article_type: type } : { ...filters }}
            defaultFilters={type ? { ...defaultFilters, article_type: type } : { ...defaultFilters }}
            filterOptions={filterOptions}
            statuses={statuses.statuses}
            teamSlug={team.slug}
            type={null}
            onSubmit={handleChangeFilters}
          />
        </div>
      </div>
      <div className={searchResultsStyles['search-results-wrapper']}>
        { articles.length > 0 ?
          <div className={searchResultsStyles['search-results-toolbar']}>
            <div />
            <div className={searchResultsStyles['search-actions']}>
              <Paginator
                numberOfPageResults={articles.length}
                numberOfTotalResults={articlesCount}
                page={page}
                pageSize={pageSize}
                onChangePage={handleChangePage}
              />
              <ExportList filters={adjustFilters(filters)} type={type.replace('-', '_')} />
            </div>
          </div>
          : null
        }

        { articles.length === 0 ?
          <BlankState>
            <FormattedMessage
              defaultMessage="There are no articles here."
              description="Empty message that is displayed when there are no articles to display."
              id="articles.blank"
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

            const summary = article.description || article.summary;

            return (
              <ArticleCard
                date={article.updated_at}
                handleClick={() => handleClick(article)}
                isPublished={article.report_status === 'published'}
                key={article.id}
                languageCode={article.language !== 'und' ? article.language : null}
                projectMediaDbid={article.claim_description?.project_media?.dbid}
                publishedAt={article.claim_description?.project_media?.fact_check_published_on ? parseInt(article.claim_description?.project_media?.fact_check_published_on, 10) : null}
                statusColor={currentStatus ? currentStatus.style?.color : null}
                statusLabel={currentStatus ? currentStatus.label : null}
                summary={isFactCheckValueBlank(summary) ? article.claim_description?.context : summary}
                tags={article.tags}
                title={isFactCheckValueBlank(article.title) ? article.claim_description?.description : article.title}
                url={article.url}
                variant={article.report_status ? 'fact-check' : 'explainer'}
                onChangeTags={(tags) => { handleUpdateTags(article.id, tags); }}
              />
            );
          })}
        </div>

        <>
          {selectedArticleDbid && type === 'fact-check' && (
            <ClaimFactCheckFormQueryRenderer
              factCheckId={selectedArticleDbid}
              teamSlug={team.slug}
              onClose={handleCloseSlideout}
            />
          )}
          {selectedArticleDbid && type === 'explainer' && (
            <ExplainerFormQueryRenderer
              explainerId={selectedArticleDbid}
              teamSlug={team.slug}
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
  articles: [],
  articlesCount: 0,
  type: null,
};

ArticlesComponent.propTypes = {
  type: PropTypes.oneOf(['explainer', 'fact-check']),
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
    page,
    sort,
    sortType,
  } = searchParams;
  let { filters } = searchParams;

  const handleChangeSearchParams = (newSearchParams) => { // { page, sort, sortType, filters } - a single state for a single query/render
    setSearchParams(Object.assign({}, searchParams, newSearchParams));
  };

  filters = adjustFilters(filters);

  return (
    <ErrorBoundary component="Articles">
      <QueryRenderer
        cacheConfig={{ force: true }}
        environment={Relay.Store}
        key={new Date().getTime()}
        query={graphql`
          query ArticlesQuery(
            $slug: String!, $type: String!, $pageSize: Int, $sort: String, $sortType: String, $offset: Int,
            $users: [Int], $updated_at: String, $tags: [String], $language: [String], $published_by: [Int],
            $report_status: [String], $verification_status: [String], $imported: Boolean, $text: String, $trashed: Boolean,
          ) {
            team(slug: $slug) {
              name
              slug
              totalArticlesCount: articles_count
              verification_statuses
              articles_count(
                article_type: $type, user_ids: $users, tags: $tags, updated_at: $updated_at, language: $language, text: $text,
                publisher_ids: $published_by, report_status: $report_status, rating: $verification_status, imported: $imported, trashed: $trashed,
              )
              articles(
                first: $pageSize, article_type: $type, offset: $offset, sort: $sort, sort_type: $sortType,
                user_ids: $users, tags: $tags, updated_at: $updated_at, language: $language, publisher_ids: $published_by, trashed: $trashed,
                report_status: $report_status, rating: $verification_status, imported: $imported, text: $text,
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
                        context
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
        render={({ error, props, retry }) => {
          if (!error && props) {
            return (
              <ArticlesComponent
                articles={props.team.articles.edges.map(edge => edge.node)}
                articlesCount={props.team.articles_count}
                defaultFilters={defaultFilters}
                filterOptions={filterOptions}
                filters={filters}
                icon={icon}
                page={page}
                reloadData={retry}
                sort={sort}
                sortOptions={sortOptions}
                sortType={sortType}
                statuses={props.team.verification_statuses}
                team={props.team}
                title={title}
                type={type}
                updateMutation={updateMutation}
                onChangeSearchParams={handleChangeSearchParams}
              />
            );
          }
          // TODO render error state
          return <MediasLoading size="large" theme="white" variant="page" />;
        }}
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
      />
    </ErrorBoundary>
  );
};

Articles.defaultProps = {
  sortOptions: [],
  filterOptions: [],
  defaultFilters: {},
  type: null,
};

Articles.propTypes = {
  type: PropTypes.oneOf(['explainer', 'fact-check']),
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
