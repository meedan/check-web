import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import { stringHelper } from '../../customHelpers';

function isPublished(media) {
  return (
    media.dynamic_annotation_report_design &&
    media.dynamic_annotation_report_design.data &&
    media.dynamic_annotation_report_design.data.state === 'published'
  );
}

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

function AutoCompleteMediaItem(props, context) {
  const teamSlug = context.store.getState().app.context.team.slug; // TODO make it a prop
  const [searchText, setSearchText] = React.useState('');

  // Object with { loading, items, error } (only one truthy), or `null`
  const [searchResult, setSearchResult] = React.useState(null);

  const handleKeyPress = React.useCallback((e) => {
    // Avoid submitting form. TODO make Enter skip the timeout?
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  }, []);

  const handleChange = React.useCallback((e, obj) => { props.onSelect(obj); }, [props.onSelect]);

  const handleChangeSearchText = React.useCallback((e) => {
    setSearchText(e.target.value);
  }, [setSearchText]);

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

      const encodedQuery = JSON.stringify(JSON.stringify({
        keyword: searchText,
        show: props.typesToShow || ['claims', 'links', 'images', 'videos', 'audios'],
        eslimit: 30,
        archived: 0,
      }));
      const params = {
        body: JSON.stringify({
          query: `
            query {
              search(query: ${encodedQuery}) {
                medias(first: 30) {
                  edges {
                    node {
                      id
                      dbid
                      title
                      archived
                      relationships { sources_count, targets_count, target_id, source_id }
                      dynamic_annotation_report_design {
                        id
                        data
                      }
                    }
                  }
                }
              }
            }
          `,
        }),
        headers: {
          Accept: '*/*',
          'X-Check-Team': teamSlug,
          'Content-Type': 'application/json',
          ...config.relayHeaders,
        },
        method: 'POST',
        credentials: 'include',
        referrerPolicy: 'no-referrer',
        mode: 'no-cors',
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
        let items = response.data.search.medias.edges
          .map(({ node }) => node)
          .filter(({ relationships }) => (
            props.reverse ?
              (relationships.sources_count === 0) :
              (relationships.sources_count + relationships.targets_count === 0)
          ))
          .filter(({ dbid }) => dbid !== props.dbid)
          .filter(({ archived }) => !archived);
        if (props.onlyPublished) {
          items = items.filter(isPublished);
        }
        items = items.map(item => ({
          text: item.title,
          value: item.dbid,
          id: item.id,
          isPublished: isPublished(item),
          relationships: item.relationships,
          dbid: item.dbid,
        }));
        setSearchResult({ loading: false, items, error: null });
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
  }, [searchText, setSearchResult, props.dbid, props.onlyPublished]);

  return (
    <Autocomplete
      blurOnSelect
      id="autocomplete-media-item"
      name="autocomplete-media-item"
      options={(searchResult && searchResult.items) ? searchResult.items : []}
      open={!!searchResult}
      getOptionLabel={option => option.text}
      loading={searchResult ? searchResult.loading : false}
      loadingText={
        <FormattedMessage id="autoCompleteMediaItem.searching" defaultMessage="Searching…" />
      }
      noOptionsText={searchResult && searchResult.error ? (
        <FormattedMessage
          id="autoCompleteMediaItem.error"
          defaultMessage="Sorry, an error occurred while searching. Please try again and contact {supportEmail} if the condition persists."
          values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
        />
      ) : (
        <FormattedMessage id="autoCompleteMediaItem.notFound" defaultMessage="No matches found" />
      )}
      renderInput={
        params => (<TextField
          label={
            <FormattedMessage id="autoCompleteMediaItem.searchItem" defaultMessage="Search" />
          }
          onKeyPress={handleKeyPress}
          onChange={handleChangeSearchText}
          {...params}
        />)
      }
      onChange={handleChange}
      onBlur={() => setSearchText('') /* so useEffect() will setSearchResult(null) */}
    />
  );
}
AutoCompleteMediaItem.contextTypes = {
  store: PropTypes.object, // TODO nix
};
AutoCompleteMediaItem.defaultProps = {
  dbid: null,
  onlyPublished: false,
  typesToShow: ['claims', 'links', 'images', 'videos', 'audios'],
  reverse: false,
};
AutoCompleteMediaItem.propTypes = {
  onSelect: PropTypes.func.isRequired, // func({ value, text } or null) => undefined
  dbid: PropTypes.number, // filter results: do _not_ select this number
  onlyPublished: PropTypes.bool, // filter results
  reverse: PropTypes.bool, // filter results
  typesToShow: PropTypes.arrayOf(PropTypes.string),
};

export default AutoCompleteMediaItem;
