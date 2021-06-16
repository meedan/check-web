import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import { Link, browserHistory } from 'react-router';
import styled from 'styled-components';
import NextIcon from '@material-ui/icons/KeyboardArrowRight';
import PrevIcon from '@material-ui/icons/KeyboardArrowLeft';
import Box from '@material-ui/core/Box';
import Tooltip from '@material-ui/core/Tooltip';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import { withStyles } from '@material-ui/core/styles';
import { withPusher, pusherShape } from '../../pusher';
import SearchKeyword from './SearchKeyword';
import SearchFields from './SearchFields';
import Toolbar from './Toolbar';
import ParsedText from '../ParsedText';
import BulkActions from '../media/BulkActions';
import MediasLoading from '../media/MediasLoading';
import ProjectBlankState from '../project/ProjectBlankState';
import { black87, black54, headline, units, Row } from '../../styles/js/shared';
import SearchResultsTable from './SearchResultsTable';
import SearchRoute from '../../relay/SearchRoute';
import { isBotInstalled } from '../../helpers';

const pageSize = 50;

const StyledListHeader = styled.div`
  margin: ${units(2)};

  .search__list-header-filter-row {
    justify-content: space-between;
    display: flex;
  }

  .project__title-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 500px;
  }

  .project__description {
    max-width: 30%;
    padding-top: ${units(0.5)};
    height: ${units(4)};
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

const Styles = theme => ({
  similarSwitch: {
    marginLeft: theme.spacing(0),
  },
});

/**
 * Delete `esoffset`, `timestamp`, and maybe `projects` and `project_group_id` -- whenever
 * they can be inferred from the URL or defaults.
 *
 * This is useful for building simple-as-possible URLs.
 */
function simplifyQuery(query, project, projectGroup) {
  const ret = { ...query };
  delete ret.esoffset;
  delete ret.timestamp;
  if (
    ret.projects &&
    (
      ret.projects.length === 0 ||
      (ret.projects.length === 1 && project && ret.projects[0] === project.dbid)
    )
  ) {
    delete ret.projects;
  }
  if (
    ret.project_group_id &&
    (
      ret.project_group_id.length === 0 ||
      (ret.project_group_id.length === 1 && projectGroup && ret.project_group_id[0] === projectGroup.dbid)
    )
  ) {
    delete ret.project_group_id;
  }
  if (ret.keyword && !ret.keyword.trim()) {
    delete ret.keyword;
  }
  return ret;
}

/* eslint jsx-a11y/click-events-have-key-events: 0 */
class SearchResultsComponent extends React.PureComponent {
  constructor(props) {
    super(props);

    this.pusherChannel = null;
    const { query } = this.props;
    const showSimilar = 'show_similar' in query ? query.show_similar : false;
    this.state = {
      selectedProjectMediaIds: [],
      showSimilar,
    };
  }

  componentDidMount() {
    this.setProjectId();
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

  setProjectId() {
    const { project } = this.props;
    const projectId = project ? project.dbid : 0;
    this.props.relay.setVariables({ projectId });
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
    const { query, project, projectGroup } = this.props;

    const newQuery = { ...query };
    if (sortParams === null) {
      delete newQuery.sort;
      delete newQuery.sort_type;
    } else {
      newQuery.sort = sortParams.key;
      newQuery.sort_type = sortParams.ascending ? 'ASC' : 'DESC';
    }
    const cleanQuery = simplifyQuery(newQuery, project, projectGroup);
    this.navigateToQuery(cleanQuery);
  }

  handleChangeQuery = (newQuery /* minus sort data */) => {
    const { query, project, projectGroup } = this.props;
    const cleanQuery = simplifyQuery(newQuery, project, projectGroup);
    if (query.sort) {
      cleanQuery.sort = query.sort;
    }
    if (query.sort_type) {
      cleanQuery.sort_type = query.sort_type;
    }
    this.navigateToQuery(cleanQuery);
  }

  handleShowSimilarSwitch = () => {
    const { query, project, projectGroup } = this.props;
    const { showSimilar } = this.state;
    const newQuery = { ...query };
    newQuery.show_similar = !showSimilar;
    const cleanQuery = simplifyQuery(newQuery, project, projectGroup);
    this.navigateToQuery(cleanQuery);
  }

  navigateToQuery(query) {
    const { searchUrlPrefix } = this.props;
    const path = Object.keys(query).length > 0
      ? `${searchUrlPrefix}/${encodeURIComponent(JSON.stringify(query))}`
      : searchUrlPrefix;
    browserHistory.push(path);
  }

  buildSearchUrlAtOffset = (offset) => {
    const {
      query,
      project,
      projectGroup,
      searchUrlPrefix,
    } = this.props;

    const cleanQuery = simplifyQuery(query, project, projectGroup);
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
   * `{ timestamp, esoffset, projects: [projectId] }` then the result can be `{}`
   * because enough data is in `mediaUrlPrefix` to infer the properties.
   */
  buildProjectMediaUrl = (projectMedia) => {
    if (!projectMedia.dbid) {
      return null;
    }

    const {
      query,
      project,
      projectGroup,
      search,
      searchUrlPrefix,
      mediaUrlPrefix,
    } = this.props;

    const cleanQuery = simplifyQuery(query, project, projectGroup);
    const itemIndexInPage = search.medias.edges.findIndex(edge => edge.node === projectMedia);
    const listIndex = this.beginIndex + itemIndexInPage;
    const urlParams = new URLSearchParams();
    if (searchUrlPrefix.endsWith('/trash')) {
      // Usually, `listPath` can be inferred from the route params. With `trash` it can't,
      // so we'll give it to the receiving page. (See <MediaPage>.)
      urlParams.set('listPath', searchUrlPrefix);
    }
    if (searchUrlPrefix.endsWith('/unconfirmed')) {
      // Usually, `listPath` can be inferred from the route params. With `unconfirmed` it can't,
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
    const {
      query,
      project,
      projectGroup,
      title,
      icon,
      listActions,
      listDescription,
      classes,
    } = this.props;

    const projectMedias = this.props.search.medias
      ? this.props.search.medias.edges.map(({ node }) => node)
      : [];

    const count = this.props.search.number_of_results;
    const { team } = this.props.search;
    const isIdInSearchResults = wantedId => projectMedias.some(({ id }) => id === wantedId);
    const selectedProjectMediaIds = this.state.selectedProjectMediaIds.filter(isIdInSearchResults);

    const sortParams = query.sort ? {
      key: query.sort,
      ascending: query.sort_type !== 'DESC',
    } : {
      key: isBotInstalled(team, 'smooch') ? 'last_seen' : 'recent_added',
      ascending: false,
    };

    const selectedProjectMediaProjectIds = [];
    const selectedProjectMediaDbids = [];

    projectMedias.forEach((pm) => {
      if (selectedProjectMediaIds.indexOf(pm.id) !== -1) {
        selectedProjectMediaDbids.push(pm.dbid);
      }
    });

    let content = null;

    if (count === 0) {
      content = (
        <ProjectBlankState
          message={
            <FormattedMessage
              id="projectBlankState.blank"
              defaultMessage="There are no items here."
            />
          }
        />
      );
    } else {
      content = (
        <SearchResultsTable
          projectMedias={projectMedias}
          team={team}
          selectedIds={selectedProjectMediaIds}
          sortParams={sortParams}
          onChangeSelectedIds={this.handleChangeSelectedIds}
          onChangeSortParams={this.handleChangeSortParams}
          buildProjectMediaUrl={this.buildProjectMediaUrl}
        />
      );
    }

    const unsortedQuery = simplifyQuery(query, project, projectGroup); // nix .projects and .project_group_id
    delete unsortedQuery.sort;
    delete unsortedQuery.sort_type;

    return (
      <React.Fragment>
        <StyledListHeader>
          <Row className="search__list-header-filter-row">
            <div
              className="project__title"
              title={title}
              style={{
                font: headline,
                color: black54,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              { icon ? <Box display="flex" alignItems="center" mr={2}>{icon}</Box> : null }
              <span className="project__title-text">
                {title}
              </span>
              {listActions}
            </div>
            <SearchKeyword
              key={JSON.stringify(unsortedQuery) /* TODO make <SearchKeyword> stateless */}
              query={unsortedQuery}
              onChange={this.handleChangeQuery}
              project={this.props.project}
              hideFields={this.props.hideFields}
              title={this.props.title}
              team={team}
            />
          </Row>
          <Row className="project__description">
            {listDescription && listDescription.trim().length ?
              <ParsedText text={listDescription} />
              : null}
          </Row>
        </StyledListHeader>
        <Box m={2}>
          <SearchFields
            key={JSON.stringify(unsortedQuery) /* TODO make <SearchFields> stateless */}
            query={unsortedQuery}
            onChange={this.handleChangeQuery}
            project={this.props.project}
            projectGroup={this.props.projectGroup}
            savedSearch={this.props.savedSearch}
            hideFields={this.props.hideFields}
            title={this.props.title}
            team={team}
          />
        </Box>
        <StyledSearchResultsWrapper className="search__results results">
          <Toolbar
            team={team}
            similarAction={
              <FormControlLabel
                classes={{ labelPlacementStart: classes.similarSwitch }}
                value="start"
                control={
                  <Switch
                    className="search-show-similar__switch"
                    checked={this.state.showSimilar}
                    onClick={this.handleShowSimilarSwitch}
                  />
                }
                label={
                  <FormattedMessage
                    id="search.showSimilar"
                    defaultMessage="Show similar"
                    description="Allow user to show/hide secondary items"
                  />
                }
                labelPlacement="start"
              />
            }
            actions={projectMedias.length && selectedProjectMediaDbids.length ?
              <BulkActions
                parentComponent={this}
                count={this.props.search ? this.props.search.number_of_results : 0}
                team={team}
                page={this.props.page}
                project={this.props.project}
                selectedProjectMediaProjectIds={selectedProjectMediaProjectIds}
                selectedProjectMediaDbids={selectedProjectMediaDbids}
                selectedMedia={selectedProjectMediaIds}
                onUnselectAll={this.onUnselectAll}
              /> : null}
            title={count ?
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
                    defaultMessage="{count, plural, one {1 / 1} other {{from} - {to} / #}}"
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
                        defaultMessage="{selectedCount, plural, one {(# selected)} other {(# selected)}}"
                        description="Label for number of selected items"
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
              </span> : null
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
  projectGroup: null,
};

SearchResultsComponent.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  pusher: pusherShape.isRequired,
  clientSessionId: PropTypes.string.isRequired,
  query: PropTypes.object.isRequired,
  search: PropTypes.shape({
    id: PropTypes.string.isRequired, // TODO fill in props
    medias: PropTypes.shape({ edges: PropTypes.array.isRequired }).isRequired,
  }).isRequired,
  project: PropTypes.shape({
    id: PropTypes.string.isRequired, // TODO fill in props
    dbid: PropTypes.number.isRequired,
  }), // may be null
  projectGroup: PropTypes.shape({
    id: PropTypes.string.isRequired, // TODO fill in props
    dbid: PropTypes.number.isRequired,
  }), // may be null
  searchUrlPrefix: PropTypes.string.isRequired,
  mediaUrlPrefix: PropTypes.string.isRequired,
};

const SearchResultsContainer = Relay.createContainer(withStyles(Styles)(withPusher(SearchResultsComponent)), {
  initialVariables: {
    projectId: 0,
    pageSize,
  },
  fragments: {
    search: () => Relay.QL`
      fragment on CheckSearch {
        id,
        pusher_channel,
        team {
          ${BulkActions.getFragment('team')}
          ${SearchKeyword.getFragment('team')}
          ${SearchFields.getFragment('team')}
          id
          slug
          search_id,
          permissions,
          search { id, number_of_results },
          check_search_trash { id, number_of_results },
          verification_statuses,
          list_columns,
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
              id
              dbid
              picture
              title
              description
              is_read
              is_main
              is_secondary
              requests_count
              list_columns_values
              project {
                dbid
                id
              }
              team {
                verification_statuses
              }
            }
          }
        },
        number_of_results
      }
    `,
  },
});

/**
 * Build JSON-stringified query string that replicates check-api's warts.
 *
 * TL;DR when given `{projects: [projectId]}` or `{}` as input, return an
 * equivalent query that looks like the one `check-api` assumes.
 *
 * A long explanation follows -- [adamhooper, 2020-05-22] it took me hours to
 * figure this out.
 *
 * A CheckSearch has an `id`, to mimic GraphQL: check-api is designed to
 * encourage the client to store a CheckSearch in its `Relay.Store` (even though
 * CheckSearch is not stored anywhere on the server).
 *
 * What happens when the client alters a list? Well, that should change the
 * search results ... so check-api's UpdateProjectMediaPayload includes
 * `check_search_project`, `check_search_team` and `check_search_trash` based
 * on **check-api's guesses** of what the client-side IDs are.
 *
 * Check-api can't know the client-side IDs. So it guesses that they look like
 * `b64('CheckSearch/{"parent":{"type":"project","id":32},"projects":[32]}`)`.
 * The ordering must be exact. Luckily, MRI Ruby (check-api server side) happens
 * to JSON-encode Hash literals in deterministic order; and so does ES2015.
 *
 * This solution could never handle filters or sorting. (The search ID is based
 * on *all* parameters -- including filters/sorts.) So this is quasi-GraphQL.
 * TODO design `team.project_medias` and `project.project_medias`, filterable
 * GraphQL Connections, and nix `CheckSearch` (and these IDs).
 *
 * One other spot for confusion is in the GraphQL property,
 * `CheckSearch.pusher_channel`. Avoid it, because it's null if there are sorts
 * or filters -- and if you're reading the `pusher_channel` you can correctly
 * determine the pusher channel, client-side.
 */
function encodeQueryToMimicTheWayCheckApiGeneratesIds(query, teamSlug) {
  const nKeys = Object.keys(query).length;
  if (nKeys === 0) {
    return `{"parent":{"type":"team","slug":${JSON.stringify(teamSlug)}}}`;
  }
  if (nKeys === 1 && query.projects && query.projects.length === 1) {
    // JSON.stringify is pedantic -- the ID is a Number to begin with
    const id = JSON.stringify(query.projects[0]);
    return `{"parent":{"type":"project","id":${id}},"projects":[${id}]}`;
  }
  // In all but these two cases, generate a separate query.
  return JSON.stringify(query);
}

export default function SearchResults({ query, teamSlug, ...props }) {
  const jsonEncodedQuery = encodeQueryToMimicTheWayCheckApiGeneratesIds(query, teamSlug);
  let projectId = 0;
  const { projects } = query;
  if (projects && projects.length === 1) {
    [projectId] = projects;
  }
  const route = React.useMemo(() => new SearchRoute({
    jsonEncodedQuery,
    projectId,
  }), [jsonEncodedQuery]);

  return (
    <Relay.RootContainer
      Component={SearchResultsContainer}
      route={route}
      forceFetch
      renderFetched={data => (
        <SearchResultsContainer {...props} query={query} search={data.search} />
      )}
      renderLoading={() => <MediasLoading />}
    />
  );
}
SearchResults.propTypes = {
  query: PropTypes.object.isRequired,
  teamSlug: PropTypes.string.isRequired,
};
