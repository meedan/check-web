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
  },
}));

const MediaSimilarityBarComponent = ({
  projectMediaDbid,
  suggestionsCount,
  confirmedSimilarCount,
  hasMain,
  mainItem,
  canAdd,
}) => {
  const classes = useStyles();
  const teamSlug = window.location.pathname.match(/^\/([^/]+)/)[1];
  const linkPrefix = `/${teamSlug}/media/${projectMediaDbid}`;

  if (hasMain) {
    const mainItemLink = `/${mainItem.team.slug}/media/${mainItem.dbid}`;
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

  return (
    <Box className={classes.root} display="flex" justifyContent="space-between" alignItems="center">
      <Box className={classes.links}>
        <Link to={`${linkPrefix}/similar-media`} className={classes.link} style={{ color: checkBlue }}>
          <FormattedMessage
            id="mediaSimilarityBarComponent.similarMedia"
            defaultMessage="{count, plural, one {1 similar media} other {# similar media}}"
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
            projectMediaId={mainItem.id}
            projectMediaDbid={projectMediaDbid}
            canBeAddedToSimilar={confirmedSimilarCount === 0}
            similarCanBeAddedToIt={!hasMain}
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
  mainItem: PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
    team: PropTypes.shape({
      slug: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  canAdd: PropTypes.bool.isRequired,
};

export default MediaSimilarityBarComponent;
