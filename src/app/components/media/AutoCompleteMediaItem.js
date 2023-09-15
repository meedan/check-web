import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router';
import Box from '@material-ui/core/Box';
import Tooltip from '@material-ui/core/Tooltip';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import { stringHelper } from '../../customHelpers';
import CheckArchivedFlags from '../../CheckArchivedFlags';
import SearchKeywordContainer from '../search/SearchKeywordConfig/SearchKeywordContainer';
import SmallMediaCard from '../cds/media-cards/SmallMediaCard';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import SettingsIcon from '../../icons/settings.svg';

const useStyles = makeStyles(theme => ({
  searchSettingsTitle: {
    fontWeight: 'bold',
  },
  searchSettingsBox: {
    marginLeft: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    width: 250,
  },
  autocompleteResults: {
    overflow: 'auto',
    maxHeight: 400,
    paddingRight: theme.spacing(1),
    marginTop: 12,
  },
  selectedItem: {
    background: 'var(--grayBackground)',
  },
  link: {
    textDecoration: 'none',
    display: 'contents',
  },
}));

// Return { jsonPromise, abort }.
//
// jsonPromise will reject as AbortError if aborted.
//
// jsonPromise will reject as Error if response status is not 200 or response
// is not valid JSON.
function fetchJsonEnsuringOkAllowingAbort(url, params) {
  const controller = new AbortController();
  const abort = () => controller.abort();

  const { signal } = controller;
  const jsonPromise = (async () => {
    const httpResponse = await fetch(url, { signal, ...params }); // may throw
    if (!httpResponse.ok) {
      throw new Error('HTTP response not OK');
    }
    const jsonResponse = await httpResponse.json(); // may throw
    return jsonResponse;
  })();

  return { jsonPromise, abort };
}

const AutoCompleteMediaItem = (props, context) => {
  const classes = useStyles();
  const teamSlug = context.store.getState().app.context.team.slug; // TODO make it a prop
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [searchText, setSearchText] = React.useState('');
  const [showFilters, setShowFilters] = React.useState(false);
  const [keywordFields, setKeywordFields] = React.useState(null);
  const [selectedDbid, setSelectedDbid] = React.useState(null);

  // Object with { loading, items, error } (only one truthy), or `null`
  const [searchResult, setSearchResult] = React.useState(null);

  const handleKeyPress = React.useCallback((e) => {
    // Avoid submitting form. TODO make Enter skip the timeout?
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  }, []);

  const handleSelectOne = (dbid) => {
    const selProjectMedia = searchResult.items.find(projectMedia => projectMedia.dbid === dbid);
    setSelectedDbid(dbid);
    props.onSelect(selProjectMedia);
  };

  const handleSelectMany = (dbid, selected) => {
    const selProjectMedia = searchResult.items.find(projectMedia => projectMedia.dbid === dbid);
    props.onSelect(selProjectMedia, selected);
  };

  const handleChangeSearchText = React.useCallback((e) => {
    setSearchText(e.target.value);
  }, [setSearchText]);

  const handleCloseFilters = () => {
    setShowFilters(false);
    setKeywordFields(null);
  };

  const handleChangeFilters = (filters) => {
    setKeywordFields(filters.keyword_fields);
    setShowFilters(false);
  };

  const handleSettingsButton = (event) => {
    setAnchorEl(event.currentTarget);
    setShowFilters(!showFilters);
  };

  const query = {
    keyword: searchText,
    show: props.typesToShow || ['claims', 'links', 'images', 'videos', 'audios'],
    eslimit: 50,
    archived: [CheckArchivedFlags.NONE, CheckArchivedFlags.UNCONFIRMED],
    show_similar: Boolean(props.customFilter),
  };
  if (keywordFields) {
    query.keyword_fields = keywordFields;
  }

  // Call setSearchResult() twice (loading ... results!) whenever `searchText` changes.
  //
  // After abort, we promise we won't call any more setSearchResult().
  React.useEffect(() => {
    // eslint-disable-next-line no-useless-escape
    if (searchText.length < 3 && !/\p{Extended_Pictographic}/u.test(searchText)) {
      setSearchResult(null);
      return undefined; // no cleanup needed
    }

    const keystrokeWait = 1000;

    setSearchResult({ loading: true, items: null, error: null });

    let aborted = false;
    let timer = null; // we'll set it below
    let abortHttpRequest = null;

    async function begin() {
      timer = null;
      if (aborted) { // paranoia?
        return;
      }

      const encodedQuery = JSON.stringify(JSON.stringify(query));
      const params = {
        body: `query=query {
            search(query: ${encodedQuery}) {
              medias(first: 50) {
                edges {
                  node {
                    id
                    dbid
                    title
                    description
                    picture
                    type
                    last_seen
                    requests_count
                    linked_items_count
                    report_status
                    is_confirmed_similar_to_another_item
                    full_url
                    show_warning_cover
                    media {
                      type
                      url
                      domain
                      quote
                      picture
                      metadata
                    }
                  }
                }
              }
              team {
                id
                name
                project_groups(first: 10000) {
                  edges {
                    node {
                      dbid
                      title
                    }
                  }
                }
                projects(first: 10000) {
                  edges {
                    node {
                      id
                      dbid
                      title
                      medias_count
                      search_id
                    }
                  }
                }
              }
            }
          }
        `,
        headers: {
          Accept: '*/*',
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Check-Team': teamSlug,
          ...config.relayHeaders,
        },
        method: 'POST',
        credentials: 'include',
        referrerPolicy: 'no-referrer',
      };
      const { jsonPromise, abort } = fetchJsonEnsuringOkAllowingAbort(config.relayPath, params);
      // abortAsyncStuff() should call this HTTP abort(). That will cause
      // an AbortError from the HTTP response.
      abortHttpRequest = abort;
      let response;
      try {
        response = await jsonPromise;
      } catch (err) {
        if (aborted) {
          return; // this is a healthy error and we should stop processing now
        }
        setSearchResult({ loading: false, items: null, error: err });
        return;
      }

      if (aborted) {
        // After HTTP response and before we started processing it, user aborted.
        return;
      }

      // The rest of this code is synchronous, so it can't be aborted.
      try {
        const { team } = response.data.search;
        let items = response.data.search.medias.edges.map(({ node }) => node);
        if (props.customFilter) {
          items = props.customFilter(items);
        } else {
          items = items
            .filter(({ is_confirmed_similar_to_another_item }) =>
              !is_confirmed_similar_to_another_item);
        }
        items = items
          .filter(({ dbid }) => dbid !== props.dbid);
        items = items.map(item => ({
          ...item,
          text: item.title,
          value: item.dbid,
          isPublished: item.report_status === 'published',
        }));
        setSearchResult({
          loading: false,
          items,
          team,
          error: null,
        });
      } catch (err) {
        // TODO nix catch-all error handler for errors we've likely never seen
        console.error(err); // eslint-disable-line no-console
        setSearchResult({ loading: false, items: null, error: err });
      }
    }

    const abortAsyncStuff = () => {
      aborted = true;
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      if (abortHttpRequest !== null) {
        abortHttpRequest();
        abortHttpRequest = null;
      }
    };
    timer = setTimeout(begin, keystrokeWait);
    return abortAsyncStuff;
  }, [searchText, setSearchResult, props.dbid, keywordFields]);

  return (
    <Box display="flex" alignItems="center" className="autocomplete-media-item">
      <Box flexGrow="1" width={1}>
        <Box display="flex" alignItems="flex-start" flexGrow="1">
          <TextField
            id="autocomplete-media-item"
            name="autocomplete-media-item"
            onKeyPress={handleKeyPress}
            onChange={handleChangeSearchText}
            helperText={
              searchResult ?
                <React.Fragment>
                  { searchResult.loading ?
                    <FormattedMessage id="autoCompleteMediaItem.searching" defaultMessage="Searching…" description="Status message that a search is active" /> : null }
                  { !searchResult.loading && !searchResult.error && !searchResult.items.length ?
                    <FormattedMessage id="autoCompleteMediaItem.notFound" defaultMessage="No matches found" description="Status message when a search returned no results" /> : null }
                  { searchResult.error ?
                    <FormattedMessage id="autoCompleteMediaItem.error" defaultMessage="Sorry, an error occurred while searching. Please try again and contact {supportEmail} if the condition persists." description="Status message when a search resulted in an error" values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }} /> : null }
                  { searchResult.items && searchResult.items.length > 0 ?
                    <FormattedMessage id="autoCompleteMediaItem.results" defaultMessage="{count, plural, one {# result} other {# results}}" description="Count of search results" values={{ count: searchResult.items.length }} /> : null }
                </React.Fragment> : <FormattedMessage id="autoCompleteMediaItem.type" defaultMessage="Type above to search" description="Helper text displayed next to search field to look for items to be imported" />
            }
            variant="outlined"
            fullWidth
          />
          { props.showFilters ?
            <ButtonMain
              iconCenter={<SettingsIcon />}
              variant="outlined"
              size="small"
              theme="text"
              onClick={handleSettingsButton}
            /> : null }
        </Box>
        { searchResult ?
          <Box>
            { searchResult.items && searchResult.items.length > 0 ?
              <Box className={classes.autocompleteResults}>
                { searchResult.items.map(projectMedia => (
                  <Box
                    display="flex"
                    alignItems="center"
                    key={projectMedia.dbid}
                    className={props.multiple ? '' : 'autocomplete-media-item__select'}
                  >
                    { props.multiple ?
                      <Tooltip
                        disableFocusListener
                        disableTouchListener
                        disableHoverListener={!projectMedia.isPublished || !props.disablePublished}
                        title={
                          <FormattedMessage
                            id="autoCompleteMediaItem.cantSelectPublished"
                            defaultMessage="Media cannot be imported from items that have their report published"
                            description="Tooltip error message about when media can be imported"
                          />
                        }
                      >
                        <span>
                          <Checkbox
                            className="autocomplete-media-item__select"
                            disabled={projectMedia.isPublished && props.disablePublished}
                            onChange={(e, checked) => {
                              handleSelectMany(projectMedia.dbid, checked);
                            }}
                          />
                        </span>
                      </Tooltip> : null
                    }
                    <Link to={projectMedia.full_url} className={classes.link}>
                      <SmallMediaCard
                        customTitle={projectMedia.title}
                        details={[
                          (
                            <FormattedMessage
                              id="autoCompleteMediaItem.lastSubmitted"
                              defaultMessage="Last submitted {date}"
                              description="Shows the last time a media was submitted"
                              values={{
                                date: props.intl.formatDate(+projectMedia.last_seen * 1000, { year: 'numeric', month: 'short', day: '2-digit' }),
                              }}
                            />
                          ),
                          <FormattedMessage
                            id="autoCompleteMediaItem.requestsCount"
                            defaultMessage="{requestsCount, plural, one {# request} other {# requests}}"
                            description="Header of requests list. Example: 26 requests"
                            values={{ requestsCount: projectMedia.requests_count }}
                          />,
                        ]}
                        media={projectMedia.media}
                        maskContent={projectMedia.show_warning_cover}
                        description={projectMedia.description}
                        className={selectedDbid === projectMedia.dbid ? classes.selectedItem : null}
                        onClick={(e) => {
                          if (!props.multiple) {
                            handleSelectOne(projectMedia.dbid);
                          }
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      />
                    </Link>
                  </Box>
                ))}
              </Box> : null }
          </Box> : null }
      </Box>
      { showFilters ?
        <SearchKeywordContainer
          anchorEl={anchorEl}
          query={query}
          onDismiss={handleCloseFilters}
          onSubmit={handleChangeFilters}
        /> : null }
    </Box>
  );
};

AutoCompleteMediaItem.contextTypes = {
  store: PropTypes.object, // TODO nix
};

AutoCompleteMediaItem.defaultProps = {
  dbid: null,
  typesToShow: ['claims', 'links', 'images', 'videos', 'audios'],
  customFilter: null,
  showFilters: false,
  multiple: false,
  disablePublished: false,
};

AutoCompleteMediaItem.propTypes = {
  // onSelect: PropTypes.func.isRequired, // func({ value, text } or null) => undefined
  dbid: PropTypes.number, // filter results: do _not_ select this number
  typesToShow: PropTypes.arrayOf(PropTypes.string),
  customFilter: PropTypes.func,
  showFilters: PropTypes.bool,
  multiple: PropTypes.bool,
  disablePublished: PropTypes.bool,
};

export default injectIntl(AutoCompleteMediaItem);
