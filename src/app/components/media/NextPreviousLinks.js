/* eslint-disable relay/unused-fields, react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { browserHistory } from 'react-router';
import NextOrPreviousButton from './NextOrPreviousButton';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import NextIcon from '../../icons/chevron_right.svg';
import PrevIcon from '../../icons/chevron_left.svg';
import { getPathnameAndSearch, pageSize } from '../../urlHelpers';
import styles from './media.module.css';

function NextPreviousLinksComponent({
  buildSiblingUrl, listIndex, listQuery, nTotal, objectType,
}) {
  return (
    <div className={styles['next-prev-pager']}>
      <NextOrPreviousButton
        buildSiblingUrl={buildSiblingUrl}
        className="media-search__previous-item"
        disabled={listIndex < 1}
        icon={<PrevIcon />}
        key={`${JSON.stringify(listQuery)}-${listIndex - 1}`}
        listIndex={listIndex - 1}
        listQuery={listQuery}
        objectType={objectType}
        searchIndex={(listIndex - 1) - ((listIndex - 1) % pageSize)}
        tooltipTitle={
          <FormattedMessage defaultMessage="Previous item" description="Tooltip message for a paging button to move to the previous item" id="mediaSearch.previousItem" />
        }
        type="prev"
      />
      <span id="media-search__current-item">
        <FormattedMessage
          defaultMessage="{current} of {total}"
          description="The current item number and total in the list paging control is showing"
          id="mediaSearch.xOfY"
          values={{ current: listIndex + 1, total: nTotal }}
        />
      </span>
      <NextOrPreviousButton
        buildSiblingUrl={buildSiblingUrl}
        className="media-search__next-item"
        disabled={listIndex + 1 >= nTotal}
        icon={<NextIcon />}
        key={`${JSON.stringify(listQuery)}-${listIndex + 1}`}
        listIndex={listIndex + 1}
        listQuery={listQuery}
        objectType={objectType}
        searchIndex={(listIndex + 1) - ((listIndex + 1) % pageSize)}
        tooltipTitle={
          <FormattedMessage defaultMessage="Next item" description="Tooltip message for a paging button to move to the next item" id="mediaSearch.nextItem" />
        }
        type="next"
      />
    </div>
  );
}
NextPreviousLinksComponent.propTypes = {
  buildSiblingUrl: PropTypes.func.isRequired, // func(dbid, listIndex) => location
  listQuery: PropTypes.object.isRequired,
  listIndex: PropTypes.number.isRequired,
  nTotal: PropTypes.number.isRequired,
};

function NextPreviousLinksFastComponent({
  buildSiblingUrl, count, listIndex, listQuery, mediaNavList, objectType,
}) {
  const localIndex = listIndex % pageSize;

  const handlePrevClick = () => {
    const prevItemUrl = buildSiblingUrl(mediaNavList[localIndex - 1], listIndex - 1);
    const { pathname, search } = getPathnameAndSearch(prevItemUrl);
    browserHistory.push({ pathname, search, state: { mediaNavList, count } });
  };

  const handleNextClick = () => {
    const nextItemUrl = buildSiblingUrl(mediaNavList[localIndex + 1], listIndex + 1);
    const { pathname, search } = getPathnameAndSearch(nextItemUrl);
    browserHistory.push({ pathname, search, state: { mediaNavList, count } });
  };
  return (
    <div className={styles['next-prev-pager']}>
      { localIndex === 0 && listIndex !== 0 ? (
        <NextOrPreviousButton
          buildSiblingUrl={buildSiblingUrl}
          className="media-search__previous-item"
          icon={<PrevIcon />}
          key={listIndex - 1}
          listIndex={listIndex - 1}
          listQuery={listQuery}
          objectType={objectType}
          searchIndex={(listIndex - 1) - ((listIndex - 1) % pageSize)}
          tooltipTitle={
            <FormattedMessage defaultMessage="Previous item" description="Tooltip message for a paging button to move to the previous item" id="mediaSearch.previousItem" />
          }
          type="prev"
        />
      ) : (
        <Tooltip
          arrow
          title={<FormattedMessage defaultMessage="Previous item" description="Tooltip message for a paging button to move to the previous item" id="mediaSearch.previousItem" />}
        >
          <span>
            <ButtonMain
              className="media-search__previous-item"
              disabled={listIndex === 0}
              iconCenter={<PrevIcon />}
              size="default"
              theme="text"
              variant="text"
              onClick={handlePrevClick}
            />
          </span>
        </Tooltip>
      )}
      <span id="media-search__current-item">
        <FormattedMessage
          defaultMessage="{current} of {total}"
          description="The current item number and total in the list paging control is showing"
          id="mediaSearch.xOfY"
          values={{ current: listIndex + 1, total: count }}
        />
      </span>
      { localIndex === pageSize - 1 && listIndex !== count - 1 ? (
        <NextOrPreviousButton
          buildSiblingUrl={buildSiblingUrl}
          className="media-search__previous-item"
          icon={<NextIcon />}
          key={listIndex + 1}
          listIndex={listIndex + 1}
          listQuery={listQuery}
          objectType={objectType}
          searchIndex={(listIndex + 1) - ((listIndex + 1) % pageSize)}
          tooltipTitle={
            <FormattedMessage defaultMessage="Next item" description="Tooltip message for a paging button to move to the next item" id="mediaSearch.nextItem" />
          }
          type="next"
        />
      ) : (
        <Tooltip
          arrow
          title={<FormattedMessage defaultMessage="Next item" description="Tooltip message for a paging button to move to the next item" id="mediaSearch.nextItem" />}
        >
          <span>
            <ButtonMain
              className="media-search__next-item"
              disabled={listIndex === count - 1}
              iconCenter={<NextIcon />}
              size="default"
              theme="text"
              variant="text"
              onClick={handleNextClick}
            />
          </span>
        </Tooltip>
      )}
    </div>
  );
}

export default function NextPreviousLinks({
  annotationState,
  buildSiblingUrl,
  count,
  listIndex,
  listQuery,
  mediaNavList,
  objectType,
}) {
  // if we have a navigation list passed down to us, and we know the overall count, then render our new, faster component. This should happen in every single case except where a user is linked directly to a media item from outside the app
  if (mediaNavList && count) {
    return (
      <NextPreviousLinksFastComponent
        buildSiblingUrl={buildSiblingUrl}
        count={count}
        listIndex={listIndex}
        listQuery={listQuery}
        mediaNavList={mediaNavList}
        objectType={objectType}
      />
    );
  }
  // if the user is linked directly to a media item outside the app, we need to prerender some query information and use the "slow" next/prev button format temporarily
  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query NextPreviousLinksQuery($queryJson: String!) {
          search(query: $queryJson) {
            id
            number_of_results
          }
        }
      `}
      render={({ error, props }) => {
        if (error) {
          // Assume the network layer warned us. Just hide the links.
          return null;
        } else if (!props || !props.search) {
          // We're loading. Hide the links while loading.
          return null;
        }
        return (
          <NextPreviousLinksComponent
            annotationState={annotationState}
            buildSiblingUrl={buildSiblingUrl}
            listIndex={listIndex}
            listQuery={listQuery}
            nTotal={props.search.number_of_results}
            objectType={objectType}
          />
        );
      }}
      variables={{ queryJson: JSON.stringify(listQuery) }}
    />
  );
}
NextPreviousLinks.propTypes = {
  buildSiblingUrl: PropTypes.func.isRequired, // func(dbid, listIndex) => location
  listQuery: PropTypes.object.isRequired,
  listIndex: PropTypes.number.isRequired,
};
