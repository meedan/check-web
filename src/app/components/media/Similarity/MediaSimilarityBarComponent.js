/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';
import MediaSimilarityBarAdd from './MediaSimilarityBarAdd';

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: 'var(--color-white-100)',
    padding: `0 0 ${theme.spacing(1)}px`,
    position: 'sticky',
    top: -16,
    zIndex: 200,
  },
}));

const MediaSimilarityBarComponent = ({
  canAdd,
  confirmedMainItemId,
  confirmedSimilarCount,
  hasMain,
  projectMediaDbid,
}) => {
  const classes = useStyles();

  return (
    <Box alignItems="center" className={classes.root} display="flex" justifyContent="space-between">
      <Box className="similarity-bar__matches-count typography-subtitle2">
        <FormattedMessage
          defaultMessage="Media"
          description="Plural. Heading for the number of media"
          id="mediaSimilarityBarComponent.similarMedia"
        />
        {confirmedSimilarCount > 0 && ` [${confirmedSimilarCount}]`}
      </Box>
      <Box>
        { canAdd ?
          <MediaSimilarityBarAdd
            canMerge={!hasMain}
            projectMediaDbid={projectMediaDbid}
            projectMediaId={confirmedMainItemId}
          /> : null }
      </Box>
    </Box>
  );
};

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
