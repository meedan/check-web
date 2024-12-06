/* eslint-disable relay/unused-fields */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import Loader from '../cds/loading/Loader';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import WarningIcon from '../../icons/report_problem.svg';
import { stringHelper } from '../../customHelpers';
import { getPathnameAndSearch, pageSize } from '../../urlHelpers';
import styles from './media.module.css';

function BrokenLink() {
  return (
    <Tooltip
      arrow
      title={<FormattedMessage defaultMessage="Not found" description="Tooltip text to let the user know the item has been removed and is no longer availble" id="mediaSearch.itemWentAway" />}
    >
      <span className={styles['paging-not-found']}>
        <WarningIcon />
      </span>
    </Tooltip>
  );
}

function Error({ message }) {
  return (
    <Tooltip
      arrow
      title={
        <FormattedMessage
          defaultMessage="Sorry, the following error occurred: {message}. Please refresh the item to try again and contact {supportEmail} if the condition persists."
          description="Error message with instructions on how the user should proceed"
          id="mediaSearch.error"
          values={{ message, supportEmail: stringHelper('SUPPORT_EMAIL') }}
        />
      }
    >
      <span className={styles['paging-not-found']}>
        <WarningIcon />
      </span>
    </Tooltip>
  );
}
Error.propTypes = {
  message: PropTypes.string.isRequired,
};

/**
 * Find the `listIndex`-th item in the `listQuery`, and redirect to it.
 *
 * State transitions:
 *
 *     <Loader> -----> [success] <Redirect>
 *                             > [no item at listIndex] <BrokenLink>
 *                             > [query failure] <Error>
 *
 * Render this component in response to user action (i.e., clicking the "next"
 * link). Why so late? Because it runs a search to find the next item in the
 * list. The search-result media ordering changes over time, so the projectMedia
 * at `listIndex=4` is different depending on when the query runs. It's better
 * to redirect the user to the _current_ 5th item (even if it's the exact page
 * the user is clicking from, or if it skips an item) than it is to redirect the
 * user to the _not-anymore_ 5th item, because neither the client-side nor the
 * user is equipped to track the old list ordering.
 *
 * (Long-term, the _server_ could remember the old list ordering -- by storing
 * search results in Redis, for instance. Then we wouldn't need this on-demand
 * query because we could render pagination links at page load. But that's a
 * topic for another day.)
 *
 * Seeing infinite redirects? Sounds like you're changing this element's props.
 * Check your logic higher up in the component tree: this element should be
 * unmounted if its props are about to change.
 */
export default function MediaSearchRedirect({
  buildSiblingUrl,
  listIndex,
  listQuery,
  objectType,
  searchIndex,
}) {
  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query MediaSearchRedirectQuery($queryJson: String!, $pageSize: Int!) {
          search(query: $queryJson) {
            id
            number_of_results
            medias(first: $pageSize) {
              edges {
                node {
                  id
                  dbid
                }
              }
            }
          }
        }
      `}
      render={({ error, props }) => {
        if (error) {
          return <Error message={error.message} />;
        } else if (props) {
          if (!props.search) {
            return <BrokenLink />;
          }
          const edge = props.search.medias.edges[listIndex % pageSize];
          if (edge) {
            const targetId = objectType === 'media' ? edge.node.dbid : edge.node.cluster_id;
            const mediaNavList = props.search.medias.edges.map(media => media.node.dbid);
            const url = buildSiblingUrl(targetId, listIndex);
            const { pathname, search } = getPathnameAndSearch(url);
            browserHistory.push({ pathname, search, state: { mediaNavList, count: props.search.number_of_results } });
            return <Loader size="icon" variant="icon" />; // while the page loads
          }
          return <BrokenLink />;
        }
        return <Loader size="icon" variant="icon" />;
      }}
      variables={{
        queryJson: JSON.stringify({ ...listQuery, esoffset: searchIndex }),
        pageSize,
      }}
    />
  );
}
