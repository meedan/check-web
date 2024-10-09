import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import MediaSimilarityBarAdd from './MediaSimilarityBarAdd';
import styles from './MediaSimilarities.module.css';

const MediaSimilarityBarComponent = ({
  canAdd,
  confirmedMainItemId,
  confirmedSimilarCount,
  hasMain,
  isPublished,
  projectMediaDbid,
}) => (
  <div className={styles['similar-matched-media-bar']}>
    <div className="similarity-bar__matches-count typography-subtitle2">
      <FormattedMessage
        defaultMessage="Media in Cluster"
        description="Plural. Heading for the number of media"
        id="mediaSimilarityBarComponent.similarMedia"
      />
      {confirmedSimilarCount > 0 && ` [${confirmedSimilarCount}]`}
    </div>
    { canAdd ?
      <MediaSimilarityBarAdd
        canExport={!hasMain && !isPublished}
        canImport={!hasMain}
        projectMediaDbid={projectMediaDbid}
        projectMediaId={confirmedMainItemId}
      /> : null }
  </div>
);

MediaSimilarityBarComponent.defaultProps = {
  canAdd: false,
  confirmedMainItemId: null,
  hasMain: false,
  isPublished: false,
};

MediaSimilarityBarComponent.propTypes = {
  canAdd: PropTypes.bool,
  confirmedMainItemId: PropTypes.string, // GraphQL base64 ID
  confirmedSimilarCount: PropTypes.number.isRequired,
  hasMain: PropTypes.bool,
  isPublished: PropTypes.bool,
  projectMediaDbid: PropTypes.number.isRequired,
};

export default MediaSimilarityBarComponent;
