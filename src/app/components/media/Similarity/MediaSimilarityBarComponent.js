import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import MediaSimilarityBarAdd from './MediaSimilarityBarAdd';
import styles from './MediaSimilarities.module.css';

const MediaSimilarityBarComponent = ({
  projectMediaDbid,
  confirmedSimilarCount,
  hasMain,
  confirmedMainItemId,
  canAdd,
}) => (
  <div className={styles['similar-matched-media-bar']}>
    <div className="similarity-bar__matches-count typography-subtitle2">
      <FormattedMessage
        id="mediaSimilarityBarComponent.similarMedia"
        defaultMessage="Media"
        description="Plural. Heading for the number of media"
      />
      {confirmedSimilarCount > 0 && ` [${confirmedSimilarCount}]`}
    </div>
    { canAdd ?
      <MediaSimilarityBarAdd
        projectMediaId={confirmedMainItemId}
        projectMediaDbid={projectMediaDbid}
        canMerge={!hasMain}
      /> : null }
  </div>
);

MediaSimilarityBarComponent.defaultProps = {
  confirmedMainItemId: null,
  hasMain: false,
  canAdd: false,
};

MediaSimilarityBarComponent.propTypes = {
  projectMediaDbid: PropTypes.number.isRequired,
  confirmedSimilarCount: PropTypes.number.isRequired,
  hasMain: PropTypes.bool,
  confirmedMainItemId: PropTypes.string, // GraphQL base64 ID
  canAdd: PropTypes.bool,
};

export default MediaSimilarityBarComponent;
