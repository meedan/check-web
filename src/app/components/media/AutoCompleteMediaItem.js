import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl';
import { Link } from 'react-router';
import Checkbox from '@material-ui/core/Checkbox';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import cx from 'classnames/bind';
import { stringHelper } from '../../customHelpers';
import CheckArchivedFlags from '../../constants/CheckArchivedFlags';
import SearchKeywordContainer from '../search/SearchKeywordConfig/SearchKeywordContainer';
import SmallMediaCard from '../cds/media-cards/SmallMediaCard';
import TextField from '../cds/inputs/TextField';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import MediaIdentifier from '../cds/media-cards/MediaIdentifier';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import LastRequestDate from '../cds/media-cards/LastRequestDate';
import RequestsCount from '../cds/media-cards/RequestsCount';
import ArticleCard from '../search/SearchResultsCards/ArticleCard';
import SettingsIcon from '../../icons/settings.svg';
import SearchIcon from '../../icons/search.svg';
import { getStatus, isFactCheckValueBlank } from '../../helpers';
import CheckArticleTypes from '../../constants/CheckArticleTypes';
import CheckMediaTypes from '../../constants/CheckMediaTypes';
import styles from './media.module.css';

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

  const handleClick = (e, dbid) => {
    if (!props.multiple) {
      handleSelectOne(dbid);
    }
    e.preventDefault();
    e.stopPropagation();
  };

  const query = {
    keyword: encodeURIComponent(searchText),
    show: ['claims', 'links', 'images', 'videos', 'audios', 'blank'],
    eslimit: 50,
    archived: [CheckArchivedFlags.NONE, CheckArchivedFlags.UNCONFIRMED],
    show_similar: Boolean(props.customFilter),
    sort: 'score',
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
                    media_slug
                    fact_check {
                      claim_description {
                        context
                        description
                      }
                      tags
                      title
                      summary
                      url
                      updated_at
                      id
                      language
                      rating
                      report_status
                    }
                  }
                }
              }
              team {
                id
                name
                verification_statuses
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
      const { abort, jsonPromise } = fetchJsonEnsuringOkAllowingAbort(config.relayPath, params);
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
    <div className={cx('autocomplete-media-item', styles['media-item-autocomplete'])}>
      <div className={styles['media-item-autocomplete-inputs']}>
        <FormattedMessage
          defaultMessage="Search"
          description="Placeholder autocomplete search field"
          id="autoCompleteMediaItem.placeholder"
        >
          { placeholder => (
            <TextField
              helpContent={
                searchResult ?
                  <React.Fragment>
                    { searchResult.loading ?
                      <FormattedMessage defaultMessage="Searching…" description="Status message that a search is active" id="autoCompleteMediaItem.searching" /> : null }
                    { !searchResult.loading && !searchResult.error && !searchResult.items.length ?
                      <FormattedMessage defaultMessage="No matches found" description="Status message when a search returned no results" id="autoCompleteMediaItem.notFound" /> : null }
                    { searchResult.error ?
                      <FormattedMessage defaultMessage="Sorry, an error occurred while searching. Please try again and contact {supportEmail} if the condition persists." description="Status message when a search resulted in an error" id="autoCompleteMediaItem.error" values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }} /> : null }
                    { searchResult.items && searchResult.items.length > 0 ?
                      <FormattedMessage defaultMessage="{count, plural, one {# result} other {# results}}" description="Count of search results" id="autoCompleteMediaItem.results" values={{ count: searchResult.items.length }} /> : null }
                  </React.Fragment> : <FormattedMessage defaultMessage="Type above to search" description="Helper text displayed next to search field to look for items to be imported" id="autoCompleteMediaItem.type" />
              }
              iconLeft={<SearchIcon />}
              id="autocomplete-media-item"
              label={
                props.selectedItemType === CheckArticleTypes.FACT_CHECK ?
                  <FormattedMessage defaultMessage="Search Articles" description="Textfield input label to let the user know they are searching for artilces" id="autoCompleteMediaItem.textFieldArticlesLabel" />
                  : <FormattedMessage defaultMessage="Search Media Clusters" description="Textfield input label to let the user know they are searching for clusters of media" id="autoCompleteMediaItem.textFieldClustersLabel" />
              }
              name="autocomplete-media-item"
              placeholder={placeholder}
              onChange={handleChangeSearchText}
              onKeyPress={handleKeyPress}
            />
          )}
        </FormattedMessage>
        { props.showFilters ?
          <ButtonMain
            iconCenter={<SettingsIcon />}
            size="default"
            theme="lightText"
            variant="contained"
            onClick={handleSettingsButton}
          /> : null }
      </div>
      { searchResult && searchResult.items && searchResult.items.length > 0 ?
        <div className={styles['media-item-autocomplete-results']}>
          { searchResult.items.map((projectMedia) => {
            let currentStatus = null;

            /* If the selected item type is fact-check and the projectMedia lacks a fact-check, return null.
            This may be due to a missing ElasticSearch update or a race condition during the update process,
            where fact-check data is temporarily unavailable. This avoids showing stale or invalid data.
            */
            if (props.selectedItemType === CheckArticleTypes.FACT_CHECK && !projectMedia.fact_check) {
              return null;
            }

            if (projectMedia.fact_check?.rating) {
              currentStatus = getStatus(searchResult.team.verification_statuses, projectMedia.fact_check.rating);
            }

            const factCheckInUse = projectMedia.media.type !== CheckMediaTypes.BLANK;

            return (
              <div
                className={props.multiple ? styles['media-item-autocomplete-multiple'] : 'autocomplete-media-item__select'}
                key={projectMedia.dbid}
              >
                { props.multiple ?
                  <Tooltip
                    arrow
                    disableFocusListener
                    disableHoverListener={!projectMedia.isPublished || !props.disablePublished}
                    disableTouchListener
                    title={
                      <FormattedMessage
                        defaultMessage="Media cannot be imported from items that have their report published"
                        description="Tooltip error message about when media can be imported"
                        id="autoCompleteMediaItem.cantSelectPublished"
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
                { props.selectedItemType === CheckArticleTypes.FACT_CHECK ?
                  <Tooltip
                    arrow
                    disableFocusListener={!factCheckInUse}
                    disableHoverListener={!factCheckInUse}
                    disableTouchListener={!factCheckInUse}
                    title={
                      factCheckInUse ?
                        <FormattedHTMLMessage defaultMessage="This Claim & Fact-Check article is already applied to another media cluster<br /><br />Remove it from its current media cluster in order to add it here." description="Tooltip message displayed on article cards on item page for fact-check type articles." id="autoCompleteMediaItem.factcheckInUseTooltip" />
                        : ''
                    }
                  >
                    <span>
                      <ArticleCard
                        className={cx(
                          selectedDbid === projectMedia.dbid ? styles['media-item-autocomplete-selected-item'] : null,
                          factCheckInUse ? styles['disabled-card'] : null,
                        )}
                        date={projectMedia.fact_check.updated_at}
                        handleClick={factCheckInUse ? null : (e => handleClick(e, projectMedia.dbid))}
                        isPublished={projectMedia.fact_check.report_status === 'published'}
                        key={projectMedia.id}
                        languageCode={projectMedia.fact_check.language !== 'und' ? projectMedia.fact_check.language : null}
                        publishedAt={projectMedia.fact_check.claim_description?.updated_at}
                        readOnly
                        statusColor={currentStatus ? currentStatus.style?.color : null}
                        statusLabel={currentStatus ? currentStatus.label : null}
                        summary={isFactCheckValueBlank(projectMedia.fact_check.summary) ? projectMedia.fact_check.claim_description?.description : projectMedia.fact_check.summary}
                        tags={projectMedia.fact_check.tags}
                        title={isFactCheckValueBlank(projectMedia.fact_check.title) ? projectMedia.fact_check.claim_description?.context : projectMedia.fact_check.title}
                        url={projectMedia.fact_check.url}
                        variant="fact-check"
                        onChangeTags={() => {}}
                      />
                    </span>
                  </Tooltip>
                  :
                  <Link className={styles['media-item-autocomplete-link']} to={projectMedia.full_url}>
                    <SmallMediaCard
                      className={selectedDbid === projectMedia.dbid ? styles['media-item-autocomplete-selected-item'] : null}
                      description={projectMedia.description}
                      details={[
                        (
                          <LastRequestDate
                            lastRequestDate={+projectMedia.last_seen * 1000}
                            theme="lightText"
                            variant="text"
                          />
                        ), (
                          <RequestsCount
                            requestsCount={projectMedia.requests_count}
                            theme="lightText"
                            variant="text"
                          />
                        ), (
                          <MediaIdentifier
                            mediaType={projectMedia.type}
                            slug={projectMedia.media_slug}
                            theme="lightText"
                            variant="text"
                          />
                        ),
                      ]}
                      ignoreGeneralContentMask={props.ignoreGeneralContentMask}
                      maskContent={projectMedia.show_warning_cover}
                      media={projectMedia.media}
                      title={projectMedia.title}
                      onClick={e => handleClick(e, projectMedia.dbid)}
                    />
                  </Link>
                }
              </div>
            );
          })}
        </div> : null }
      { showFilters ?
        <SearchKeywordContainer
          anchorEl={anchorEl}
          query={query}
          onDismiss={handleCloseFilters}
          onSubmit={handleChangeFilters}
        /> : null }
    </div>
  );
};

AutoCompleteMediaItem.contextTypes = {
  store: PropTypes.object, // TODO nix
};

AutoCompleteMediaItem.defaultProps = {
  customFilter: null,
  dbid: null,
  disablePublished: false,
  ignoreGeneralContentMask: true,
  multiple: false,
  showFilters: false,
};

AutoCompleteMediaItem.propTypes = {
  customFilter: PropTypes.func,
  dbid: PropTypes.number, // filter results: do _not_ select this number
  disablePublished: PropTypes.bool,
  ignoreGeneralContentMask: PropTypes.bool,
  multiple: PropTypes.bool,
  showFilters: PropTypes.bool,
  // onSelect: PropTypes.func.isRequired, // func({ value, text } or null) => undefined
};

export default injectIntl(AutoCompleteMediaItem);
