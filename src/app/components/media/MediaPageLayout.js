/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import Media from './Media';
import MediaActionsBar from './MediaActionsBar';
import NextPreviousLinks from './NextPreviousLinks';
import styles from './media.module.css';

export default function MediaPageLayout({
  buildSiblingUrl, count, listIndex, listQuery, listUrl, mediaNavList, projectMediaId, view,
}) {
  return (
    <div className={styles['media-item-wrapper']}>
      {buildSiblingUrl ? (
        <NextPreviousLinks
          buildSiblingUrl={buildSiblingUrl}
          count={count}
          listIndex={listIndex}
          listQuery={listQuery}
          mediaNavList={mediaNavList}
          objectType="media"
        />
      ) : null}
      <div className={styles['media-actions-bar']}>
        <MediaActionsBar
          key={`${listUrl}-${projectMediaId}` /* TODO test MediaActionsBar is sane, then nix key */}
          listIndex={listIndex}
          listQuery={listQuery}
          listUrl={listUrl}
          projectMediaId={projectMediaId}
        />
      </div>
      <div className={cx('test__media', styles['media-item'])}>
        <Media projectMediaId={projectMediaId} view={view} />
      </div>
    </div>
  );
}

MediaPageLayout.defaultProps = {
  listQuery: null,
  buildSiblingUrl: null,
  listIndex: null,
  view: 'default',
};

MediaPageLayout.propTypes = {
  listUrl: PropTypes.string.isRequired,
  buildSiblingUrl: PropTypes.func, // null or func(projectMediaId, listIndex) => String|null
  listQuery: PropTypes.object, // or null
  listIndex: PropTypes.number, // or null
  projectMediaId: PropTypes.number.isRequired,
  view: PropTypes.string, // or null
};
