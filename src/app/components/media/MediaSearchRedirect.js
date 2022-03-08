import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import CircularProgress from '@material-ui/core/CircularProgress';
import Tooltip from '@material-ui/core/Tooltip';
import WarningIcon from '@material-ui/icons/Warning';
import { stringHelper } from '../../customHelpers';
import { getPathnameAndSearch } from '../../urlHelpers';

function BrokenLink() {
  return (
    <Tooltip title={<FormattedMessage id="mediaSearch.itemWentAway" defaultMessage="Not found" />}>
      <WarningIcon />
    </Tooltip>
  );
}

function Error({ message }) {
  return (
    <Tooltip title={
      <FormattedMessage
        id="mediaSearch.error"
        defaultMessage="Sorry, the following error occurred: {message}. Please refresh the item to try again and contact {supportEmail} if the condition persists."
        values={{ message, supportEmail: stringHelper('SUPPORT_EMAIL') }}
      />
    }
    >
      <WarningIcon />
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
 *     <CircularProgress> -----> [success] <Redirect>
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
  listQuery,
  listIndex,
  searchIndex,
  objectType,
  type,
}) {
  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query MediaSearchRedirectQuery($queryJson: String!) {
          search(query: $queryJson) {
            id
            number_of_results
            medias(first: 50) {
              edges {
                node {
                  id
                  dbid
                  cluster_id
                }
              }
            }
          }
        }
      `}
      variables={{
        queryJson: JSON.stringify({ ...listQuery, esoffset: searchIndex }),
      }}
      render={({ error, props }) => {
        if (error) {
          return <Error message={error.message} />;
        } else if (props) {
          if (!props.search) {
            return <BrokenLink />;
          }
          let edge;
          if (type === 'next') {
            [edge] = props.search.medias.edges;
          } else if (type === 'prev') {
            edge = props.search.medias.edges[props.search.medias.edges.length - 1];
          }
          if (edge) {
            const targetId = objectType === 'media' ? edge.node.dbid : edge.node.cluster_id;
            const mediaNavList = props.search.medias.edges.map(media => media.node.dbid);
            const url = buildSiblingUrl(targetId, listIndex);
            const { pathname, search } = getPathnameAndSearch(url);
            browserHistory.push({ pathname, search, state: { mediaNavList, count: props.search.number_of_results } });
            return <CircularProgress />; // while the page loads
          }
          return <BrokenLink />;
        }
        return <CircularProgress />;
      }}
    />
  );
}
