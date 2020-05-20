import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import { Link, browserHistory } from 'react-router';
import styled from 'styled-components';
import NextIcon from '@material-ui/icons/KeyboardArrowRight';
import PrevIcon from '@material-ui/icons/KeyboardArrowLeft';
import Tooltip from '@material-ui/core/Tooltip';
import { withPusher, pusherShape } from '../../pusher';
import SearchQuery from './SearchQuery';
import Toolbar from './Toolbar';
import ParsedText from '../ParsedText';
import BulkActions from '../media/BulkActions';
import MediasLoading from '../media/MediasLoading';
import ProjectBlankState from '../project/ProjectBlankState';
import { searchQueryFromUrl } from './Search';
import { black87, headline, units, Row } from '../../styles/js/shared';
import SearchResultsTable from './SearchResultsTable';
import SearchRoute from '../../relay/SearchRoute';

// TODO Make this a config
const pageSize = 20;

const StyledListHeader = styled.div`
  padding: 0 ${units(2)};

  .search__list-header-filter-row {
    justify-content: space-between;
    display: flex;
  }

  .search__list-header-title-and-filter {
    justify-content: space-between;
    display: flex;
    width: 66%;
  }

  .search-query {
    margin-left: auto;
  }

  .project__title {
    max-width: 35%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .project__description {
    max-width: 30%;
    max-height: ${units(4)};
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const StyledSearchResultsWrapper = styled.div`
  .search__results-heading {
    color: ${black87};
    font-size: larger;
    font-weight: bolder;
    text-align: center;
    display: flex;
    align-items: center;

    .search__nav {
      padding: 0 ${units(1)};
      display: flex;
      cursor: pointer;
      color: ${black87};

      &:first-child {
        padding-left: 0;
      }
    }
  }
`;

/**
 * Delete `esoffset`, `timestamp`, `parent` and maybe `projects` -- whenever
 * they can be inferred from the URL or defaults.
 *
 * This is useful for building simple-as-possible URLs.
 */
function simplifyQuery(query, project) {
  const ret = { ...query };
  delete ret.esoffset;
  delete ret.timestamp;
  delete ret.parent; // assume it's redundant
  if (
    ret.projects &&
    (
      ret.projects.length === 0 ||
      (ret.projects.length === 1 && project && ret.projects[0] === project.dbid)
    )
  ) {
    delete ret.projects;
  }
  return ret;
}

/* eslint jsx-a11y/click-events-have-key-events: 0 */
class SearchResultsComponent extends React.PureComponent {
  constructor(props) {
    super(props);

    this.pusherChannel = null;

    this.state = {
      selectedProjectMediaIds: [],
    };
  }

  componentDidMount() {
    this.resubscribe();
  }

  componentDidUpdate() {
    this.resubscribe();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  onUnselectAll = () => {
    this.setState({ selectedProjectMediaIds: [] });
  };

  get beginIndex() {
    return parseInt(this.props.query.esoffset /* may be invalid */, 10) || 0;
  }

  get endIndex() {
    return this.beginIndex + this.props.search.medias.edges.length;
  }

  get nextPageLocation() {
    if (this.endIndex >= this.props.search.number_of_results) {
      return null;
    }
    return this.buildSearchUrlAtOffset(this.beginIndex + pageSize);
  }

  get previousPageLocation() {
    if (this.beginIndex <= 0) {
      return null;
    }
    return this.buildSearchUrlAtOffset(this.beginIndex - pageSize);
  }

  resubscribe() {
    const { pusher, clientSessionId, search } = this.props;

    if (this.pusherChannel !== search.pusher_channel) {
      this.unsubscribe();
    }

    if (search.pusher_channel) {
      const channel = search.pusher_channel;
      this.pusherChannel = channel;

      pusher.subscribe(channel).bind('bulk_update_end', 'Search', (data, run) => {
        if (run) {
          this.props.relay.forceFetch();
          return true;
        }
        return {
          id: `search-${channel}`,
          callback: this.props.relay.forceFetch,
        };
      });

      pusher.subscribe(channel).bind('media_updated', 'Search', (data, run) => {
        if (clientSessionId !== data.actor_session_id) {
          if (run) {
            this.props.relay.forceFetch();
            return true;
          }
          return {
            id: `search-${channel}`,
            callback: this.props.relay.forceFetch,
          };
        }
        return false;
      });
    }
  }

  unsubscribe() {
    if (this.pusherChannel) {
      this.props.pusher.unsubscribe(this.pusherChannel);
      this.pusherChannel = null;
    }
  }

  handleChangeSelectedIds = (selectedProjectMediaIds) => {
    this.setState({ selectedProjectMediaIds });
  }

  handleChangeSortParams = (sortParams) => {
    const newQuery = { ...this.props.query };
    if (sortParams === null) {
      delete newQuery.sort;
      delete newQuery.sort_type;
    } else {
      newQuery.sort = sortParams.key;
      newQuery.sort_type = sortParams.ascending ? 'ASC' : 'DESC';
    }

    browserHistory.push(`${this.props.searchUrlPrefix}/${encodeURIComponent(JSON.stringify(newQuery))}`);
  }

  buildSearchUrlAtOffset = (offset) => {
    const {
      query,
      project,
      searchUrlPrefix,
    } = this.props;

    const cleanQuery = simplifyQuery(query, project);
    if (offset > 0) {
      cleanQuery.esoffset = offset;
    }

    if (Object.keys(cleanQuery).length > 0) {
      return `${searchUrlPrefix}/${encodeURIComponent(JSON.stringify(cleanQuery))}`;
    }
    return searchUrlPrefix;
  }

  /**
   * Build a URL for the 'ProjectMedia' page.
   *
   * The URL will have a `listIndex` (so the ProjectMedia page can paginate). It
   * will also include `listPath` and `listQuery` ... _unless_ those parameters
   * are redundant. (For instance, if the query is
   * `{ timestamp, parent, esoffset }` then it doesn't need to be supplied,
   * because enough data is in `mediaUrlPrefix` to infer `parent`.)
   */
  buildProjectMediaUrl = (projectMedia) => {
    if (!projectMedia.dbid) {
      return null;
    }

    const {
      query,
      project,
      search,
      searchUrlPrefix,
      mediaUrlPrefix,
    } = this.props;

    const cleanQuery = simplifyQuery(query, project);
    const itemIndexInPage = search.medias.edges.findIndex(edge => edge.node === projectMedia);
    const listIndex = this.beginIndex + itemIndexInPage;
    const urlParams = new URLSearchParams();
    if (searchUrlPrefix.endsWith('/trash')) {
      // Usually, `listPath` can be inferred from the route params. With `trash` it can't,
      // so we'll give it to the receiving page. (See <MediaPage>.)
      urlParams.set('listPath', searchUrlPrefix);
    }
    if (Object.keys(cleanQuery).length > 0) {
      urlParams.set('listQuery', JSON.stringify(cleanQuery));
    }
    urlParams.set('listIndex', String(listIndex));
    return `${mediaUrlPrefix}/${projectMedia.dbid}?${urlParams.toString()}`;
  }

  render() {
    const projectMedias = this.props.search.medias
      ? this.props.search.medias.edges.map(({ node }) => node)
      : [];

    const count = this.props.search ? this.props.search.number_of_results : 0;
    const { team } = this.props.search;
    const isIdInSearchResults = wantedId => projectMedias.some(({ id }) => id === wantedId);
    const selectedProjectMediaIds = this.state.selectedProjectMediaIds.filter(isIdInSearchResults);

    const query = Object.assign({}, searchQueryFromUrl());
    const isProject = !!this.props.project;

    let content = null;

    if (count === 0) {
      if (isProject) {
        content = <ProjectBlankState project={this.props.project} />;
      }
    } else {
      content = (
        <SearchResultsTable
          projectMedias={projectMedias}
          team={team}
          selectedIds={selectedProjectMediaIds}
          sortParams={query.sort ? {
            key: query.sort,
            ascending: query.sort_type !== 'DESC',
          } : null}
          onChangeSelectedIds={this.handleChangeSelectedIds}
          onChangeSortParams={this.handleChangeSortParams}
          buildProjectMediaUrl={this.buildProjectMediaUrl}
        />
      );
    }

    const {
      project,
      title,
      listActions,
      listDescription,
    } = this.props;

    return (
      <React.Fragment>
        <StyledListHeader>
          <Row className="search__list-header-filter-row">
            <Row className="search__list-header-title-and-filter">
              <div style={{ font: headline }} className="project__title">
                {title}
              </div>
              <SearchQuery
                className="search-query"
                project={this.props.project}
                fields={this.props.fields}
                title={this.props.title}
                team={team}
              />
            </Row>
            {listActions}
          </Row>
          <Row className="project__description">
            {listDescription && listDescription.trim().length ?
              <ParsedText text={listDescription} />
              : null}
          </Row>
        </StyledListHeader>
        <StyledSearchResultsWrapper className="search__results results">
          <Toolbar
            team={team}
            actions={projectMedias.length ?
              <BulkActions
                parentComponent={this}
                count={this.props.search ? this.props.search.number_of_results : 0}
                team={team}
                page={this.props.page}
                project={this.project}
                selectedMedia={selectedProjectMediaIds}
                onUnselectAll={this.onUnselectAll}
              /> : null}
            title={
              <span className="search__results-heading">
                <Tooltip title={
                  <FormattedMessage id="search.previousPage" defaultMessage="Previous page" />
                }
                >
                  {this.previousPageLocation ? (
                    <Link
                      className="search__previous-page search__nav"
                      to={this.previousPageLocation}
                    >
                      <PrevIcon />
                    </Link>
                  ) : (
                    <span className="search__previous-page search__nav">
                      <PrevIcon />
                    </span>
                  )}
                </Tooltip>
                <span className="search__count">
                  <FormattedMessage
                    id="searchResults.itemsCount"
                    defaultMessage="{count, plural, =0 {&nbsp;} one {1 / 1} other {{from} - {to} / #}}"
                    values={{
                      from: this.beginIndex + 1,
                      to: this.endIndex,
                      count,
                    }}
                  />
                  {selectedProjectMediaIds.length ?
                    <span>&nbsp;
                      <FormattedMessage
                        id="searchResults.withSelection"
                        defaultMessage="{selectedCount, plural, =0 {} one {(1 selected)} other {(# selected)}}"
                        values={{
                          selectedCount: selectedProjectMediaIds.length,
                        }}
                      />
                    </span> : null
                  }
                </span>
                <Tooltip title={
                  <FormattedMessage id="search.nextPage" defaultMessage="Next page" />
                }
                >
                  {this.nextPageLocation ? (
                    <Link className="search__next-page search__nav" to={this.nextPageLocation}>
                      <NextIcon />
                    </Link>
                  ) : (
                    <span className="search__next-page search__nav">
                      <NextIcon />
                    </span>
                  )}
                </Tooltip>
              </span>
            }
            project={project}
            page={this.props.page}
            search={this.props.search}
          />
          {content}
        </StyledSearchResultsWrapper>
      </React.Fragment>
    );
  }
}

SearchResultsComponent.defaultProps = {
  project: null,
};

SearchResultsComponent.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  pusher: pusherShape.isRequired,
  clientSessionId: PropTypes.string.isRequired,
  search: PropTypes.shape({
    id: PropTypes.string.isRequired, // TODO fill in props
    medias: PropTypes.shape({ edges: PropTypes.array.isRequired }).isRequired,
  }).isRequired,
  project: PropTypes.shape({
    id: PropTypes.string.isRequired, // TODO fill in props
    dbid: PropTypes.number.isRequired,
  }), // may be null
  searchUrlPrefix: PropTypes.string.isRequired,
  mediaUrlPrefix: PropTypes.string.isRequired,
};

const SearchResultsContainer = Relay.createContainer(withPusher(SearchResultsComponent), {
  initialVariables: {
    pageSize,
  },
  fragments: {
    search: () => Relay.QL`
      fragment on CheckSearch {
        id,
        pusher_channel,
        team {
          slug
          search_id,
          permissions,
          search { id, number_of_results },
          check_search_trash { id, number_of_results },
          verification_statuses,
          medias_count,
          team_bot_installations(first: 10000) {
            edges {
              node {
                id
                team_bot: bot_user {
                  id
                  identifier
                }
              }
            }
          }
        }
        medias(first: $pageSize) {
          edges {
            node {
              id,
              dbid,
              picture,
              title,
              description,
              virality,
              demand,
              linked_items_count,
              type,
              status,
              first_seen: created_at,
              last_seen,
              share_count,
              project_id,
              verification_statuses,
            }
          }
        },
        number_of_results
      }
    `,
  },
});

// eslint-disable-next-line react/no-multi-comp
class SearchResults extends React.PureComponent {
  render() {
    const resultsRoute = new SearchRoute({ jsonEncodedQuery: JSON.stringify(this.props.query) });

    return (
      <Relay.RootContainer
        Component={SearchResultsContainer}
        route={resultsRoute}
        renderFetched={data => (
          <SearchResultsContainer {...this.props} search={data.search} />
        )}
        renderLoading={() => <MediasLoading />}
      />
    );
  }
}

export default SearchResults;
