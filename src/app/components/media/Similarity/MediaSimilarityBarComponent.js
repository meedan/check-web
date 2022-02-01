import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import IconArrowBack from '@material-ui/icons/ArrowBack';
import { Link, browserHistory } from 'react-router';
import {
  black54,
  checkBlue,
  brandHighlight,
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
  links: {
    display: 'flex',
    gap: `${theme.spacing(3)}px`,
    alignItems: 'center',
  },
  link: {
    display: 'block',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
    color: black54,
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
    marginTop: theme.spacing(0.5),
    color: brandHighlight,
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
  showSuggestionsCount,
  showBackButton,
}) => {
  const classes = useStyles();
  const linkPrefix = window.location.pathname.match(/^\/[^/]+\/((project|list)\/[0-9]+\/)?media\/[0-9]+/);
  const params = new URLSearchParams(window.location.search);
  const listIndex = params.get('listIndex');

  // This component should be used only on an item page
  if (!linkPrefix) {
    return null;
  }

  const MaybeLink = ({ to, style, children }) => {
    if (to) {
      return <Link to={to} className={classes.link} style={style}>{children}</Link>;
    }
    return <span className={classes.link} style={style}>{children}</span>;
  };

  const handleGoBack = () => {
    const itemUrl = `${window.location.pathname.replace(/\/similar-media$/, '')}?listIndex=${listIndex}`;
    browserHistory.push(itemUrl);
  };

  if (hasMain) {
    const mainItemLink = `/${confirmedMainItem.team.slug}/media/${confirmedMainItem.dbid}/similar-media`;
    return (
      <Box className={classes.root}>
        <Link to={mainItemLink} className={[classes.link, classes.similarityMessage].join(' ')}>
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
        <Link to={mainItemLink} className={[classes.link, classes.similarityMessage].join(' ')}>
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
        { showBackButton ?
          <Box>
            <Button startIcon={<IconArrowBack />} onClick={handleGoBack} size="small" className={classes.similarityBackButton}>
              <FormattedMessage
                id="mediaSimilarityBarComponent.back"
                defaultMessage="Back"
              />
            </Button>
            <br />
            <span style={{ color: checkBlue }} className={classes.link}>
              <FormattedMessage
                id="mediaSimilarityBarComponent.similarMediaWithValue"
                defaultMessage="{count, plural, one {# similar media} other {# similar media}}"
                values={{
                  count: confirmedSimilarCount,
                }}
              />
            </span>
          </Box> : null }
        { !showBackButton ?
          <MaybeLink
            to={confirmedSimilarCount > 0 ? `${linkPrefix[0]}/similar-media?listIndex=${listIndex}` : null}
            style={confirmedSimilarCount > 0 ? { color: checkBlue } : {}}
          >
            <FormattedMessage
              id="mediaSimilarityBarComponent.similarMedia"
              defaultMessage="Similar media"
              description="Plural. Heading for the number of similar media"
            />
            <br />
            <span className={classes.similarMediaCount}>{confirmedSimilarCount}</span>
          </MaybeLink> : null }
        { showSuggestionsCount ?
          <MaybeLink
            to={suggestionsCount > 0 ? `${linkPrefix[0]}/suggested-matches?listIndex=${listIndex}` : null}
            style={suggestionsCount > 0 ? { color: brandHighlight } : {}}
          >
            <FormattedMessage
              id="mediaSimilarityBarComponent.suggestedMatches"
              defaultMessage="Suggested media"
              description="Plural. Heading for the number of suggested media"
            />
            <br />
            <span className={classes.suggestionsCount}>{suggestionsCount}</span>
          </MaybeLink> : null }
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

MediaSimilarityBarComponent.defaultProps = {
  showSuggestionsCount: true,
  showBackButton: false,
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
  showSuggestionsCount: PropTypes.bool,
  showBackButton: PropTypes.bool,
};

export default MediaSimilarityBarComponent;
