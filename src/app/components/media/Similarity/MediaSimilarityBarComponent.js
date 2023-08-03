import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';
import MediaSimilarityBarAdd from './MediaSimilarityBarAdd';
import CounterButton from '../../cds/buttons-checkboxes-chips/CounterButton';

const useStyles = makeStyles(theme => ({
  root: {
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    margin: theme.spacing(-2),
    marginBottom: 0,
    borderTop: '1px solid var(--brandBorder)',
    position: 'sticky',
    top: theme.spacing(-2),
    background: 'var(--grayBackground)',
    zIndex: 200,
  },
  spacing: {
    display: 'flex',
    gap: `${theme.spacing(2)}px`,
    alignItems: 'center',
  },
  animation: {
    animation: '$highlight 1000ms',
  },
  '@keyframes highlight': {
    '0%': {
      opacity: 0.7,
      height: `calc(100% + ${theme.spacing(5)}px)`,
    },
    '100%': {
      opacity: 0,
      height: `calc(100% + ${theme.spacing(5)}px)`,
    },
  },
}));

const MediaSimilarityBarComponent = ({
  projectMediaDbid,
  suggestionsCount,
  confirmedSimilarCount,
  hasMain,
  isSuggested,
  confirmedMainItemId,
  canAdd,
  isBlank,
  isPublished,
  setShowTab,
}) => {
  const classes = useStyles();

  return (
    <Box className={classes.root} display="flex" justifyContent="space-between" alignItems="center">
      <Box className={classes.spacing}>
        <CounterButton
          className="similarity-bar__matches-count"
          count={confirmedSimilarCount}
          label={
            <FormattedMessage
              id="mediaSimilarityBarComponent.similarMedia"
              defaultMessage="Media"
              description="Plural. Heading for the number of media"
            />
          }
          onClick={null}
        />
        <CounterButton
          className="similarity-bar__suggestions-count"
          count={isSuggested ? 0 : suggestionsCount}
          label={
            <FormattedMessage
              id="mediaSimilarityBarComponent.suggestedMatches"
              defaultMessage="Suggestions"
              description="Plural. Heading for the number of suggestions"
            />
          }
          onClick={() => { setShowTab('suggestedMedia'); }}
        />
      </Box>
      <Box>
        { canAdd ?
          <MediaSimilarityBarAdd
            projectMediaId={confirmedMainItemId}
            projectMediaDbid={projectMediaDbid}
            canBeAddedToSimilar={!hasMain && !isPublished}
            similarCanBeAddedToIt={!hasMain}
            canBeAddedToImported={!isBlank}
          /> : null }
      </Box>
    </Box>
  );
};

MediaSimilarityBarComponent.defaultProps = {
  confirmedMainItemId: null,
  hasMain: false,
  isSuggested: false,
  canAdd: false,
  isBlank: false,
  isPublished: false,
};

MediaSimilarityBarComponent.propTypes = {
  projectMediaDbid: PropTypes.number.isRequired,
  suggestionsCount: PropTypes.number.isRequired,
  confirmedSimilarCount: PropTypes.number.isRequired,
  hasMain: PropTypes.bool,
  isSuggested: PropTypes.bool,
  confirmedMainItemId: PropTypes.string, // GraphQL base64 ID
  canAdd: PropTypes.bool,
  isBlank: PropTypes.bool,
  isPublished: PropTypes.bool,
  setShowTab: PropTypes.func.isRequired, // React useState setter
};

export default MediaSimilarityBarComponent;
