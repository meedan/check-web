import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Media from './Media';
import MediaActionsBar from './MediaActionsBar';
import NextPreviousLinks from './NextPreviousLinks';

const StyledTopBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 60%;
  position: absolute;
  height: 64px;
  right: 0;
  top: 0;
  display: flex;
  align-items: center;
  z-index: 2;
  padding: 0 16px;
  justify-content: space-between;
`;

export default function MediaPageLayout({
  listUrl, buildSiblingUrl, listQuery, listIndex, projectId, projectMediaId,
}) {
  return (
    <div>
      {buildSiblingUrl ? (
        <NextPreviousLinks
          buildSiblingUrl={buildSiblingUrl}
          listQuery={listQuery}
          listIndex={listIndex}
        />
      ) : null}
      <StyledTopBar className="media-search__actions-bar">
        <MediaActionsBar
          key={`${listUrl}-${projectMediaId}` /* TODO test MediaActionsBar is sane, then nix key */}
          listUrl={listUrl}
          listQuery={listQuery}
          listIndex={listIndex}
          projectId={projectId}
          projectMediaId={projectMediaId}
        />
      </StyledTopBar>
      <Media projectId={projectId} projectMediaId={projectMediaId} />
    </div>
  );
}
MediaPageLayout.defaultProps = {
  listQuery: null,
  buildSiblingUrl: null,
  listIndex: null,
  projectId: null,
};
MediaPageLayout.propTypes = {
  listUrl: PropTypes.string.isRequired,
  buildSiblingUrl: PropTypes.func, // null or func(projectMediaId, listIndex) => String|null
  listQuery: PropTypes.object, // or null
  listIndex: PropTypes.number, // or null
  projectId: PropTypes.number, // or null
  projectMediaId: PropTypes.number.isRequired,
};
