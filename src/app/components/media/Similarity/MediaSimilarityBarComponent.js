/* eslint-disable react/sort-prop-types */
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
  projectMediaDbid,
}) => (
  <div className={styles['similar-matched-media-bar']}>
    <div className="similarity-bar__matches-count typography-subtitle2">
      <FormattedMessage
        defaultMessage="Media"
        description="Plural. Heading for the number of media"
        id="mediaSimilarityBarComponent.similarMedia"
      />
      {confirmedSimilarCount > 0 && ` [${confirmedSimilarCount}]`}
    </div>
    { canAdd ?
      <MediaSimilarityBarAdd
        canMerge={!hasMain}
        projectMediaDbid={projectMediaDbid}
        projectMediaId={confirmedMainItemId}
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
