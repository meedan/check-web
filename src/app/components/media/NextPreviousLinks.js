import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import styled from 'styled-components';
import NextIcon from '@material-ui/icons/KeyboardArrowRight';
import PrevIcon from '@material-ui/icons/KeyboardArrowLeft';
import NextOrPreviousButton from './NextOrPreviousButton';
import { units, black54 } from '../../styles/js/shared';

const StyledPager = styled.div`
  position: absolute;
  top: 0;
  width: 20%;
  left: 20%;
  height: ${units(8)};
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-weight: bold;
  font-size: ${units(2)};
  color: ${black54};

  button {
    background: transparent;
    border: 0;
    color: ${black54};
    cursor: pointer;
    outline: 0;
  }

  @media (max-width: 650px) {
    top: 43px;
  }
`;

function NextPreviousLinksComponent({
  buildSiblingUrl, listQuery, listIndex, nTotal, objectType,
}) {
  return (
    <StyledPager>
      <NextOrPreviousButton
        className="media-search__previous-item"
        key={`${JSON.stringify(listQuery)}-${listIndex - 1}`}
        disabled={listIndex < 1}
        tooltipTitle={
          <FormattedMessage id="mediaSearch.previousItem" defaultMessage="Previous item" />
        }
        buildSiblingUrl={buildSiblingUrl}
        listQuery={listQuery}
        listIndex={listIndex - 1}
        objectType={objectType}
      >
        <PrevIcon />
      </NextOrPreviousButton>
      <span id="media-search__current-item">
        <FormattedMessage
          id="mediaSearch.xOfY"
          defaultMessage="{current} of {total}"
          values={{ current: listIndex + 1, total: nTotal }}
        />
      </span>
      <NextOrPreviousButton
        className="media-search__next-item"
        key={`${JSON.stringify(listQuery)}-${listIndex + 1}`}
        disabled={listIndex + 1 >= nTotal}
        tooltipTitle={
          <FormattedMessage id="mediaSearch.nextItem" defaultMessage="Next item" />
        }
        buildSiblingUrl={buildSiblingUrl}
        listQuery={listQuery}
        listIndex={listIndex + 1}
        objectType={objectType}
      >
        <NextIcon />
      </NextOrPreviousButton>
    </StyledPager>
  );
}
NextPreviousLinksComponent.propTypes = {
  buildSiblingUrl: PropTypes.func.isRequired, // func(dbid, listIndex) => location
  listQuery: PropTypes.object.isRequired,
  listIndex: PropTypes.number.isRequired,
  nTotal: PropTypes.number.isRequired,
};

export default function NextPreviousLinks({
  buildSiblingUrl,
  listQuery,
  listIndex,
  annotationState,
  objectType,
}) {
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
      variables={{ queryJson: JSON.stringify(listQuery) }}
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
            buildSiblingUrl={buildSiblingUrl}
            listQuery={listQuery}
            listIndex={listIndex}
            annotationState={annotationState}
            objectType={objectType}
            nTotal={props.search.number_of_results}
          />
        );
      }}
    />
  );
}
NextPreviousLinks.propTypes = {
  buildSiblingUrl: PropTypes.func.isRequired, // func(dbid, listIndex) => location
  listQuery: PropTypes.object.isRequired,
  listIndex: PropTypes.number.isRequired,
};
