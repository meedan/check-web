import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';
import {
  brandSecondary,
  backgroundMain,
} from '../../../styles/js/shared';
import MediaSimilarityBarAdd from './MediaSimilarityBarAdd';
import CounterButton from '../../cds/buttons-checkboxes-chips/CounterButton';

const useStyles = makeStyles(theme => ({
  root: {
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    margin: theme.spacing(-2),
    marginBottom: theme.spacing(2),
    borderBottom: `1px solid ${brandSecondary}`,
    position: 'sticky',
    top: theme.spacing(-2),
    background: backgroundMain,
    zIndex: 2,
  },
  spacing: {
    display: 'flex',
    gap: `${theme.spacing(2)}px`,
    alignItems: 'center',
  },
}));

const MediaSimilarityBarComponent = ({
  projectMediaDbid,
  suggestionsCount,
  confirmedSimilarCount,
  hasMain,
  confirmedMainItem,
  canAdd,
  isBlank,
  isPublished,
}) => {
  const classes = useStyles();
  const linkPrefix = window.location.pathname.match(/^\/[^/]+\/((project|list)\/[0-9]+\/)?media\/[0-9]+/);

  // This component should be used only on an item page
  if (!linkPrefix) {
    return null;
  }

  return (
    <Box className={classes.root} display="flex" justifyContent="space-between" alignItems="center">
      <Box className={classes.spacing}>
        <CounterButton
          count={confirmedSimilarCount}
          label={
            <FormattedMessage
              id="mediaSimilarityBarComponent.similarMedia"
              defaultMessage="Matched media"
              description="Plural. Heading for the number of matched media"
            />
          }
          onClick={() => { document.getElementById('matched-media').scrollIntoView({ behavior: 'smooth' }); }}
        />
        <CounterButton
          count={suggestionsCount}
          label={
            <FormattedMessage
              id="mediaSimilarityBarComponent.suggestedMatches"
              defaultMessage="Suggested media"
              description="Plural. Heading for the number of suggested media"
            />
          }
          onClick={() => { browserHistory.push(`${linkPrefix[0]}/similar-media${window.location.search}`); }}
        />
      </Box>
      <Box>
        { canAdd ?
          <MediaSimilarityBarAdd
            projectMediaId={confirmedMainItem.id}
            projectMediaDbid={projectMediaDbid}
            canBeAddedToSimilar={!hasMain && !isPublished}
            similarCanBeAddedToIt={!hasMain}
            canBeAddedToImported={!isBlank}
          /> : null }
      </Box>
    </Box>
  );
};

MediaSimilarityBarComponent.propTypes = {
  projectMediaDbid: PropTypes.number.isRequired,
  suggestionsCount: PropTypes.number.isRequired,
  confirmedSimilarCount: PropTypes.number.isRequired,
  hasMain: PropTypes.bool.isRequired,
  confirmedMainItem: PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
    team: PropTypes.shape({
      slug: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  canAdd: PropTypes.bool.isRequired,
  isBlank: PropTypes.bool.isRequired,
  isPublished: PropTypes.bool.isRequired,
};

export default MediaSimilarityBarComponent;
