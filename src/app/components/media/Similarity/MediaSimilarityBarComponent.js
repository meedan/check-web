import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import { Link } from 'react-router';
import { checkBlue, inProgressYellow } from '../../../styles/js/shared';
import MediaSimilarityBarAdd from './MediaSimilarityBarAdd';

const useStyles = makeStyles(theme => ({
  root: {
    marginBottom: theme.spacing(2),
  },
  links: {
    display: 'flex',
    gap: `${theme.spacing(3)}px`,
    alignItems: 'center',
  },
  link: {
    display: 'block',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    textDecoration: 'underline',
    lineHeight: '1.5em',
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
  const teamSlug = window.location.pathname.match(/^\/([^/]+)/)[1];
  const linkPrefix = `/${teamSlug}/media/${projectMediaDbid}`;

  if (hasMain) {
    const mainItemLink = `/${confirmedMainItem.team.slug}/media/${confirmedMainItem.dbid}/similar-media`;
    return (
      <Box className={classes.root}>
        <Link to={mainItemLink} className={classes.link} style={{ color: inProgressYellow }}>
          <FormattedMessage
            id="mediaSimilarityBarComponent.hasMain"
            defaultMessage="This media has been added as similar to another item"
          />
        </Link>
      </Box>
    );
  }

  if (suggestedMainItem) {
    const mainItemLink = `/${suggestedMainItem.team.slug}/media/${suggestedMainItem.dbid}/suggested-matches`;
    return (
      <Box className={classes.root}>
        <Link to={mainItemLink} className={classes.link} style={{ color: inProgressYellow }}>
          <FormattedMessage
            id="mediaSimilarityBarComponent.hasSuggestedMain"
            defaultMessage="This media has been suggested to be similar to another item"
          />
        </Link>
      </Box>
    );
  }

  return (
    <Box className={classes.root} display="flex" justifyContent="space-between" alignItems="center">
      <Box className={classes.links}>
        <Link to={`${linkPrefix}/similar-media`} className={classes.link} style={{ color: checkBlue }}>
          <FormattedMessage
            id="mediaSimilarityBarComponent.similarMedia"
            defaultMessage="{count, plural, one {1 confirmed similar media} other {# confirmed similar media}}"
            values={{
              count: confirmedSimilarCount,
            }}
          />
        </Link>
        <Link to={`${linkPrefix}/suggested-matches`} className={classes.link} style={{ color: inProgressYellow }}>
          <FormattedMessage
            id="mediaSimilarityBarComponent.suggestedMatches"
            defaultMessage="{count, plural, one {1 suggested match} other {# suggested matches}}"
            values={{
              count: suggestionsCount,
            }}
          />
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
