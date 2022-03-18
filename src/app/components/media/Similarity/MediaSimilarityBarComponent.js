import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { Link, browserHistory } from 'react-router';
import {
  opaqueBlack54,
  checkBlue,
  brandSecondary,
  backgroundMain,
} from '../../../styles/js/shared';
import MediaSimilarityBarAdd from './MediaSimilarityBarAdd';

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
    gap: `${theme.spacing(3)}px`,
    alignItems: 'center',
  },
  link: {
    display: 'block',
    fontWeight: 'bold',
    fontSize: 14,
    color: opaqueBlack54,
    textAlign: 'center',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'none',
    },
  },
  similarMediaCount: {
    fontSize: 18,
  },
  suggestionsCount: {
    fontSize: 18,
  },
  similarityBackButton: {
    padding: 0,
  },
  similarityMessage: {
    padding: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    fontWeight: 'bold',
    fontSize: 14,
    color: 'black',
    textAlign: 'left',
  },
}));

const MediaSimilarityBarComponent = ({
  projectMediaDbid,
  suggestionsCount,
  confirmedSimilarCount,
  hasMain,
  confirmedMainItem,
  suggestedMainItem,
  canAdd,
  isBlank,
  isPublished,
}) => {
  const classes = useStyles();
  const linkPrefix = window.location.pathname.match(/^\/[^/]+\/((project|list)\/[0-9]+\/)?media\/[0-9]+/);
  const params = new URLSearchParams(window.location.search);
  const listIndex = params.get('listIndex');

  // This component should be used only on an item page
  if (!linkPrefix) {
    return null;
  }

  if (hasMain) {
    const mainItemLink = `/${confirmedMainItem.team.slug}/media/${confirmedMainItem.dbid}/similar-media`;
    return (
      <Box className={[classes.root, classes.spacing, classes.similarityMessage].join(' ')}>
        <FormattedMessage
          id="mediaSimilarityBarComponent.hasMain"
          defaultMessage="This media has been associated with an existing claim."
        />
        {' '}
        <Button onClick={() => browserHistory.push(mainItemLink)} variant="contained" color="primary" size="small">
          <FormattedMessage
            id="mediaSimilarityBarComponent.openClaim"
            defaultMessage="Open claim"
          />
        </Button>
      </Box>
    );
  }

  if (suggestedMainItem) {
    const mainItemLink = `/${suggestedMainItem.team.slug}/media/${suggestedMainItem.dbid}/similar-media?reviewId=${projectMediaDbid}`;
    return (
      <Box className={[classes.root, classes.spacing, classes.similarityMessage].join(' ')}>
        <FormattedMessage
          id="mediaSimilarityBarComponent.hasSuggestedMain"
          defaultMessage="This media has been suggested as similar to an existing claim."
          description="Caption to inform user that there is a suggested similarity"
        />
        {' '}
        <Button onClick={() => browserHistory.push(mainItemLink)} variant="contained" color="primary" size="small">
          <FormattedMessage
            id="mediaSimilarityBarComponent.reviewSuggestion"
            defaultMessage="Review suggestion"
            description="Button label for reviewing similarity suggestions"
          />
        </Button>
      </Box>
    );
  }

  return (
    <Box className={classes.root} display="flex" justifyContent="space-between" alignItems="center">
      <Box className={classes.spacing}>
        <Link
          className={classes.link}
          to={`${linkPrefix[0]}/similar-media?listIndex=${listIndex}`}
          style={confirmedSimilarCount > 0 ? { color: checkBlue } : { color: opaqueBlack54 }}
        >
          <FormattedMessage
            id="mediaSimilarityBarComponent.similarMedia"
            defaultMessage="Similar media"
            description="Plural. Heading for the number of similar media"
          />
          <br />
          <span className={classes.similarMediaCount}>{confirmedSimilarCount}</span>
        </Link>
        <Link
          className={classes.link}
          to={`${linkPrefix[0]}/similar-media?listIndex=${listIndex}`}
          style={suggestionsCount > 0 ? { color: checkBlue } : { color: opaqueBlack54 }}
        >
          <FormattedMessage
            id="mediaSimilarityBarComponent.suggestedMatches"
            defaultMessage="Suggested media"
            description="Plural. Heading for the number of suggested media"
          />
          <br />
          <span className={classes.suggestionsCount}>{suggestionsCount}</span>
        </Link>
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
  suggestedMainItem: PropTypes.shape({
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
