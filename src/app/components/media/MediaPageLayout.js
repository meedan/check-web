import React from 'react';
import PropTypes from 'prop-types';
import Media from './Media';
import MediaActionsBar from './MediaActionsBar';
import NextPreviousLinks from './NextPreviousLinks';
import styles from './media.module.css';

export default function MediaPageLayout({
  listUrl, buildSiblingUrl, listQuery, listIndex, projectId, projectMediaId, view, mediaNavList, count,
}) {
  return (
    <div>
      {buildSiblingUrl ? (
        <NextPreviousLinks
          buildSiblingUrl={buildSiblingUrl}
          listQuery={listQuery}
          listIndex={listIndex}
          objectType="media"
          mediaNavList={mediaNavList}
          count={count}
        />
      ) : null}
      <div className={styles['media-actions-bar']}>
        <MediaActionsBar
          key={`${listUrl}-${projectMediaId}` /* TODO test MediaActionsBar is sane, then nix key */}
          listUrl={listUrl}
          listQuery={listQuery}
          listIndex={listIndex}
          projectId={projectId}
          projectMediaId={projectMediaId}
        />
      </div>
      <Media projectId={projectId} projectMediaId={projectMediaId} view={view} />
    </div>
  );
}

MediaPageLayout.defaultProps = {
  listQuery: null,
  buildSiblingUrl: null,
  listIndex: null,
  projectId: null,
  view: 'default',
};

MediaPageLayout.propTypes = {
  listUrl: PropTypes.string.isRequired,
  buildSiblingUrl: PropTypes.func, // null or func(projectMediaId, listIndex) => String|null
  listQuery: PropTypes.object, // or null
  listIndex: PropTypes.number, // or null
  projectId: PropTypes.number, // or null
  projectMediaId: PropTypes.number.isRequired,
  view: PropTypes.string, // or null
};
