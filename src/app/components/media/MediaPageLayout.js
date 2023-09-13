import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import Media from './Media';
import MediaActionsBar from './MediaActionsBar';
import NextPreviousLinks from './NextPreviousLinks';
import styles from './media.module.css';

export default function MediaPageLayout({
  listUrl, buildSiblingUrl, listQuery, listIndex, projectMediaId, view, mediaNavList, count,
}) {
  return (
    <div className={styles['media-item-wrapper']}>
      <div className={styles['media-actions-bar']}>
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
        <MediaActionsBar
          key={`${listUrl}-${projectMediaId}` /* TODO test MediaActionsBar is sane, then nix key */}
          listUrl={listUrl}
          listQuery={listQuery}
          listIndex={listIndex}
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
