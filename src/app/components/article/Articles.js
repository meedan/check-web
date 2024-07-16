import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql, commitMutation } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import { FlashMessageSetterContext } from '../FlashMessage';
import ErrorBoundary from '../error/ErrorBoundary';
import BlankState from '../layout/BlankState';
import ArticleCard from '../search/SearchResultsCards/ArticleCard';
import Paginator from '../cds/inputs/Paginator';
import ListSort from '../cds/inputs/ListSort';
import { getStatus } from '../../helpers';
import MediasLoading from '../media/MediasLoading';
// eslint-disable-next-line no-unused-vars
import ArticleForm from './ArticleForm'; // For GraphQL fragment
import ArticleFilters from './ArticleFilters';
import ClaimFactCheckForm from './ClaimFactCheckForm';
import ExplainerForm from './ExplainerForm';
import PageTitle from '../PageTitle';
import searchStyles from '../search/search.module.css';
import searchResultsStyles from '../search/SearchResults.module.css';

const pageSize = 50;

const ArticlesComponent = ({
  team,
  type,
  title,
  icon,
  page,
  sort,
  sortType,
  sortOptions,
  filterOptions,
  filters,
  onChangeSearchParams,
  statuses,
  teamTags,
  articles,
  articlesCount,
  updateMutation,
}) => {
  const [openEdit, setOpenEdit] = React.useState(false);
  const [selectedArticle, setSelectedArticle] = React.useState(null);
  const setFlashMessage = React.useContext(FlashMessageSetterContext);

  const handleChangeSort = ({ sort: newSort, sortType: newSortType }) => {
    onChangeSearchParams({
      page: 1,
      sort: newSort,
      sortType: newSortType,
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
        defaultMessage="Could not update tags, please try again later or connect the support if the error persists."
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

  const handleClick = (article, e) => {
    if (!openEdit && e.target.className.indexOf('Card') >= 0) {
      setSelectedArticle(article);
      setOpenEdit(true);
    }
    if (openEdit && e.target.className.indexOf('Card') >= 0 && article !== selectedArticle) {
      setOpenEdit(false);
      setSelectedArticle(article);
      setTimeout(() => {
        setOpenEdit(true);
      }, 10);
    }
  };

  return (
    <PageTitle prefix={title} team={team}>
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
                publishedAt={article.claim_description?.project_media?.fact_check_published_on ? parseInt(article.claim_description?.project_media?.fact_check_published_on, 10) : null}
                onChangeTags={(tags) => { handleUpdateTags(article.id, tags); }}
                handleClick={e => handleClick(article, e)}
              />
            );
          })}
        </div>

        <>
          {/* NOTE: If we happen to edit articles from multiple places we're probably better off
              having each form type be it's own QueryRenderer instead of doing lots of prop passing repeatedly
          */}
          {openEdit && selectedArticle && type === 'fact-check' && <ClaimFactCheckForm
            onClose={setOpenEdit}
            team={team}
            article={selectedArticle}
          />}
          {openEdit && selectedArticle && type === 'explainer' && <ExplainerForm
            onClose={setOpenEdit}
            team={team}
            article={selectedArticle}
          />}
        </>
      </div>
    </PageTitle>
  );
};

ArticlesComponent.defaultProps = {
  page: 1,
  sort: 'title',
  sortType: 'ASC',
  sortOptions: [],
  filterOptions: [],
  filters: {},
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
    url: PropTypes.string,
    language: PropTypes.string,
    updated_at: PropTypes.number,
    rating: PropTypes.string,
    report_status: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    claim_description: PropTypes.shape({
      description: PropTypes.string,
      project_media: PropTypes.shape({
        fact_check_published_on: PropTypes.number, // Timestamp
      }),
    }),
  })),
};

// Used in unit test
// eslint-disable-next-line import/no-unused-modules
export { ArticlesComponent };

const Articles = ({
  type,
  icon,
  title,
  teamSlug,
  sortOptions,
  filterOptions,
  defaultFilters,
  updateMutation,
}) => {
  const [searchParams, setSearchParams] = React.useState({
    page: 1,
    sort: 'title',
    sortType: 'ASC',
    filters: { ...defaultFilters },
  });
  const {
    page,
    sort,
    sortType,
    filters,
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
        query={graphql`
          query ArticlesQuery(
            $slug: String!, $type: String!, $pageSize: Int, $sort: String, $sortType: String, $offset: Int,
            $users: [Int], $updatedAt: String, $tags: [String], $language: [String], $published_by: [Int],
            $report_status: [String], $verification_status: [String], $imported: Boolean,
          ) {
            team(slug: $slug) {
              ...ArticleForm_team
              slug
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
                publisher_ids: $published_by, report_status: $report_status, rating: $verification_status,
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
                      title
                      description
                      url
                      language
                      updated_at
                      tags
                      ...ExplainerForm_article
                    }
                    ... on FactCheck {
                      id
                      title
                      description: summary
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
                          fact_check_published_on
                        }
                      }
                      ...ClaimFactCheckForm_article
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
          ...filters,
        }}
        render={({ error, props }) => {
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
                articles={props.team.articles.edges.map(edge => edge.node)}
                articlesCount={props.team.articles_count}
                statuses={props.team.verification_statuses}
                team={props.team}
                teamTags={props.team.tag_texts.edges.length > 0 ? props.team.tag_texts.edges.map(tag => tag.node.text) : null}
                onChangeSearchParams={handleChangeSearchParams}
                updateMutation={updateMutation}
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
};

Articles.propTypes = {
  type: PropTypes.oneOf(['explainer', 'fact-check']).isRequired,
  title: PropTypes.node.isRequired, // <FormattedMessage />
  icon: PropTypes.node.isRequired,
  teamSlug: PropTypes.string.isRequired,
  filterOptions: PropTypes.arrayOf(PropTypes.string),
  updateMutation: PropTypes.object.isRequired,
  sortOptions: PropTypes.arrayOf(PropTypes.exact({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired, // Localizable string
  })),
};

export default Articles;
