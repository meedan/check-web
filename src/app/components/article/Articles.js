import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql, commitMutation } from 'react-relay/compat';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
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
import Loader from '../cds/loading/Loader';
import PageTitle from '../PageTitle';
import searchStyles from '../search/search.module.css';
import searchResultsStyles from '../search/SearchResults.module.css';

const messages = defineMessages({
  sortTitle: {
    id: 'articles.sortTitle',
    defaultMessage: 'Title',
    description: 'Label for sort criteria option displayed in a drop-down in the articles page.',
  },
  sortLanguage: {
    id: 'articles.sortLanguage',
    defaultMessage: 'Language',
    description: 'Label for sort criteria option displayed in a drop-down in the articles page.',
  },
  sortDate: {
    id: 'articles.sortDate',
    defaultMessage: 'Updated (date)',
    description: 'Label for sort criteria option displayed in a drop-down in the articles page.',
  },
});

const updateMutationExplainer = graphql`
  mutation ArticlesUpdateExplainerMutation($input: UpdateExplainerInput!) {
    updateExplainer(input: $input) {
      explainer {
        id
        tags
      }
    }
  }
`;

const updateMutationFactCheck = graphql`
  mutation ArticlesUpdateFactCheckMutation($input: UpdateFactCheckInput!) {
    updateFactCheck(input: $input) {
      fact_check {
        id
        tags
      }
    }
  }
`;

// This converts the filters keys to the argument names expected by the articles field in the GraphQL query
// The original keys are used in `ArticleFilters` to display the filters
const adjustFilters = (filters) => {
  const newFilters = { ...filters };

  // Date
  if (filters.range?.updated_at) {
    newFilters.updated_at = JSON.stringify(filters.range.updated_at);
  } else {
    delete newFilters.updated_at;
  }
  if (filters.range?.created_at) {
    newFilters.created_at = JSON.stringify(filters.range.created_at);
  } else {
    delete newFilters.created_at;
  }

  // Language
  if (filters.language_filter?.report_language) {
    newFilters.language = filters.language_filter.report_language;
  } else {
    delete newFilters.language;
  }

  if (filters.users) {
    newFilters.user_ids = filters.users;
  }

  if (filters.published_by) {
    newFilters.publisher_ids = filters.published_by;
  }

  if (filters.verification_status) {
    newFilters.rating = filters.verification_status;
  }

  return newFilters;
};

const ArticlesComponent = ({
  articleTypeReadOnly,
  articles,
  articlesCount,
  defaultFilters,
  filterOptions,
  filters,
  icon,
  intl,
  onChangeSearchParams,
  page,
  reloadData,
  sort,
  sortType,
  statuses,
  team,
  title,
  type,
}) => {
  const sortOptions = [
    { value: 'title', label: intl.formatMessage(messages.sortTitle) },
    { value: 'language', label: intl.formatMessage(messages.sortLanguage) },
    { value: 'updated_at', label: intl.formatMessage(messages.sortDate) },
  ];

  let articleTypeFromUrl = null;
  let articleDbidFromUrl = getQueryStringValue('factCheckId');
  if (articleDbidFromUrl) {
    articleTypeFromUrl = 'fact-check';
  } else {
    articleDbidFromUrl = getQueryStringValue('explainerId');
    if (articleDbidFromUrl) {
      articleTypeFromUrl = 'explainer';
    }
  }

  const articleTypeFilter = {};
  if (type) {
    articleTypeFilter.article_type = type;
  }

  const [selectedArticle, setSelectedArticle] = React.useState({ id: articleDbidFromUrl, type: articleTypeFromUrl });

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
    if (selectedArticle.type) deleteQueryStringValue(selectedArticle.type === 'explainer' ? 'explainerId' : 'factCheckId');
    setSelectedArticle({});
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

  const handleUpdateTags = (id, tags, updateMutation) => {
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
    if (article.dbid !== selectedArticle.id) {
      setSelectedArticle({});
      setTimeout(() => {
        setSelectedArticle({ id: article.dbid, type: article.type });
        pushQueryStringValue(article.type === 'explainer' ? 'explainerId' : 'factCheckId', article.dbid);
      }, 10);
    }
  };

  return (
    <PageTitle prefix={title} teamName={team.name}>
      <div className={searchResultsStyles['search-results-header']}>
        <div className="search__list-header-filter-row">
          <div className={searchResultsStyles.searchResultsTitleWrapper}>
            <div className={searchResultsStyles.searchHeaderSubtitle}>
              <FormattedMessage
                defaultMessage="Articles List"
                description="Sub header for the articles lists to indicate they are in the articles section"
                id="articles.subheader"
              />
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
            articleTypeReadOnly={articleTypeReadOnly}
            currentFilters={{ ...filters, ...articleTypeFilter }}
            defaultFilters={{ ...defaultFilters, ...articleTypeFilter }}
            filterOptions={filterOptions}
            statuses={statuses.statuses}
            teamSlug={team.slug}
            type={type}
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
              <ExportList filters={adjustFilters(filters)} type={type ? type.replace('-', '_') : 'articles'} />
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
            let articleType = null;
            let updateMutation = null;
            if (article.nodeType === 'Explainer') {
              articleType = 'explainer';
              updateMutation = updateMutationExplainer;
            } else if (article.nodeType === 'FactCheck') {
              articleType = 'fact-check';
              updateMutation = updateMutationFactCheck;
            }

            let currentStatus = null;
            if (article.rating) {
              currentStatus = getStatus(statuses, article.rating);
            }

            const summary = article.description || article.summary;

            return (
              <ArticleCard
                date={article.updated_at}
                handleClick={() => handleClick({ ...article, type: articleType })}
                isPublished={article.report_status === 'published'}
                key={article.id}
                languageCode={article.language !== 'und' ? article.language : null}
                projectMediaDbid={article.claim_description?.project_media?.dbid}
                publishedAt={article.claim_description?.project_media?.fact_check_published_on ? parseInt(article.claim_description?.project_media?.fact_check_published_on, 10) : null}
                statusColor={currentStatus ? currentStatus.style?.color : null}
                statusLabel={currentStatus ? currentStatus.label : null}
                summary={isFactCheckValueBlank(summary) ? article.claim_description?.context : summary}
                tags={article.tags}
                teamSlug={team.slug}
                title={isFactCheckValueBlank(article.title) ? article.claim_description?.description : article.title}
                url={article.url}
                variant={articleType}
                onChangeTags={(tags) => { handleUpdateTags(article.id, tags, updateMutation); }}
              />
            );
          })}
        </div>

        <>
          {selectedArticle.type === 'fact-check' && (
            <ClaimFactCheckFormQueryRenderer
              factCheckId={selectedArticle.id}
              teamSlug={team.slug}
              onClose={handleCloseSlideout}
            />
          )}
          {selectedArticle.type === 'explainer' && (
            <ExplainerFormQueryRenderer
              explainerId={selectedArticle.id}
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
  articleTypeReadOnly: false,
  page: 1,
  sort: 'updated_at',
  sortType: 'DESC',
  filterOptions: [],
  filters: {},
  defaultFilters: {},
  statuses: {},
  articles: [],
  articlesCount: 0,
  type: null,
};

ArticlesComponent.propTypes = {
  articleTypeReadOnly: PropTypes.bool,
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
  articlesCount: PropTypes.number,
  defaultFilters: PropTypes.object,
  filterOptions: PropTypes.arrayOf(PropTypes.string),
  filters: PropTypes.object,
  icon: PropTypes.node.isRequired,
  intl: intlShape.isRequired,
  page: PropTypes.number,
  sort: PropTypes.oneOf(['title', 'language', 'updated_at']),
  sortType: PropTypes.oneOf(['ASC', 'DESC']),
  statuses: PropTypes.object,
  team: PropTypes.shape({
    name: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
  }).isRequired,
  title: PropTypes.node.isRequired, // <FormattedMessage />
  type: PropTypes.oneOf(['explainer', 'fact-check', null]),
  onChangeSearchParams: PropTypes.func.isRequired,
};

const ArticlesComponentWithIntl = injectIntl(ArticlesComponent);

// Used in unit test
// eslint-disable-next-line import/no-unused-modules
export { ArticlesComponent, adjustFilters };

const Articles = ({
  articleTypeReadOnly,
  defaultFilters,
  filterOptions,
  icon,
  teamSlug,
  title,
  type,
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
            $users: [Int], $updated_at: String, $created_at: String, $tags: [String], $language: [String], $published_by: [Int],
            $report_status: [String], $verification_status: [String], $imported: Boolean, $text: String, $trashed: Boolean,
          ) {
            team(slug: $slug) {
              name
              slug
              totalArticlesCount: articles_count
              verification_statuses
              articles_count(
                article_type: $type, user_ids: $users, tags: $tags, updated_at: $updated_at, created_at: $created_at, language: $language, text: $text,
                publisher_ids: $published_by, report_status: $report_status, rating: $verification_status, imported: $imported, trashed: $trashed,
              )
              articles(
                first: $pageSize, article_type: $type, offset: $offset, sort: $sort, sort_type: $sortType,
                user_ids: $users, tags: $tags, updated_at: $updated_at, created_at: $created_at, language: $language, publisher_ids: $published_by,
                report_status: $report_status, rating: $verification_status, imported: $imported, text: $text, trashed: $trashed,
              ) {
                edges {
                  node {
                    nodeType: __typename
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
              <ArticlesComponentWithIntl
                articleTypeReadOnly={articleTypeReadOnly}
                articles={props.team.articles.edges.map(edge => edge.node)}
                articlesCount={props.team.articles_count}
                defaultFilters={defaultFilters}
                filterOptions={filterOptions}
                filters={filters}
                icon={icon}
                page={page}
                reloadData={retry}
                sort={sort}
                sortType={sortType}
                statuses={props.team.verification_statuses}
                team={props.team}
                title={title}
                type={type}
                onChangeSearchParams={handleChangeSearchParams}
              />
            );
          }
          // TODO render error state
          return <Loader size="large" theme="white" variant="page" />;
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
  articleTypeReadOnly: false,
  filterOptions: [],
  defaultFilters: {},
  type: null,
};

Articles.propTypes = {
  articleTypeReadOnly: PropTypes.bool,
  defaultFilters: PropTypes.object,
  filterOptions: PropTypes.arrayOf(PropTypes.string),
  icon: PropTypes.node.isRequired,
  teamSlug: PropTypes.string.isRequired,
  title: PropTypes.node.isRequired, // <FormattedMessage />
  type: PropTypes.oneOf(['explainer', 'fact-check', null]),
};

export default Articles;
