/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { makeStyles } from '@material-ui/core/styles';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import CardHeader from '@material-ui/core/CardHeader';
import LayersIcon from '@material-ui/icons/Layers';
import TimeBefore from '../../TimeBefore';
import MediaTypeDisplayName from '../MediaTypeDisplayName';
import { parseStringUnixTimestamp, truncateLength } from '../../../helpers';
import { brandSecondary, checkBlue, inProgressYellow, black32 } from '../../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  root: {
    border: `1px solid ${brandSecondary}`,
    borderRadius: 8,
    color: 'black',
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(1),
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  mediaItemCardHeader: {
    padding: theme.spacing(1),
    width: 'calc(100% - 50px)', // Make space for the menu
  },
  notSelected: {
    background: 'white',
  },
  selected: {
    background: brandSecondary,
  },
  title: {
    fontSize: 14,
    lineHeight: '1.5em',
    color: 'black',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textDecoration: 'none',
    '&:hover': {
      color: 'black',
    },
    '&:visited': {
      color: 'black',
    },
  },
  image: {
    height: 80,
    width: 80,
    objectFit: 'cover',
    border: `1px solid ${brandSecondary}`,
  },
  sep: {
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
  },
  sub: {
    fontSize: 12,
    flexWrap: 'wrap',
  },
  mediaItemMetadataField: {
    whiteSpace: 'nowrap',
  },
  content: {
    minHeight: 80,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  description: {
    color: 'black',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  reportPublished: {
    color: checkBlue,
  },
  reportPaused: {
    color: inProgressYellow,
  },
  reportUnpublished: {
    color: black32,
  },
  by: {
    color: checkBlue,
  },
}));

const MediaItem = ({
  projectMedia,
  mainProjectMedia,
  isSelected,
  setIsSelected,
  showReportStatus,
  onSelect,
  modalOnly,
}) => {
  if (!projectMedia || !projectMedia.dbid) {
    return null;
  }

  const teamSlug = window.location.pathname.match(/^\/([^/]+)/)[1];
  const mediaUrl = `/${teamSlug}/media/${projectMedia.dbid}`;
  const defaultImage = '/images/image_placeholder.svg';
  const classes = useStyles();

  return (
    <Box
      className={
        isSelected ?
          [classes.root, classes.selected].join(' ') :
          [classes.root, classes.notSelected].join(' ')
      }
      display="flex"
      width={1}
      onClick={(event) => {
        if (onSelect) {
          onSelect(projectMedia.dbid);
        } else {
          setIsSelected(true);
        }
        event.stopPropagation();
      }}
      style={onSelect ? { cursor: 'pointer' } : {}}
    >
      <CardHeader
        classes={{ content: classes.content, title: classes.title, root: classes.mediaItemCardHeader }}
        title={
          <Box display="flex" alignItems="center">
            { projectMedia.linked_items_count > 0 && !mainProjectMedia.id ? <LayersIcon /> : null }
            { modalOnly ? <strong>{truncateLength(projectMedia.title, 140)}</strong>
              : (
                <a href={mediaUrl} className={classes.title} target="_blank" rel="noopener noreferrer">
                  <strong>{truncateLength(projectMedia.title, 140)}</strong>
                </a>
              )
            }
          </Box>
        }
        subheader={
          <Box>
            <Box display="flex" className={classes.sub}>
              <div className={classes.mediaItemMetadataField}>
                { projectMedia.linked_items_count && !mainProjectMedia.id ?
                  <FormattedMessage
                    id="mediaItem.similarMedia"
                    defaultMessage="{count, plural, one {# matched media} other {# matched media}}"
                    values={{
                      count: projectMedia.linked_items_count,
                    }}
                  /> :
                  <MediaTypeDisplayName mediaType={projectMedia.type} />
                }
              </div>
              <div className={classes.sep}> - </div>
              { projectMedia.type !== 'Blank' ?
                <React.Fragment>
                  <div className={classes.mediaItemMetadataField}>
                    <FormattedMessage
                      id="mediaItem.lastSubmitted"
                      defaultMessage="Last submitted {timeAgo}"
                      description="Here timeAgo is a relative time, for example, '10 minutes ago' or 'yesterday'"
                      values={{
                        timeAgo: (
                          <TimeBefore
                            date={parseStringUnixTimestamp(projectMedia.last_seen)}
                          />
                        ),
                      }}
                    />
                  </div>
                  <div className={classes.sep}> - </div>
                  <div className={classes.mediaItemMetadataField}>
                    <FormattedMessage
                      id="mediaItem.requests"
                      defaultMessage="{count, plural, one {# request} other {# requests}}"
                      values={{
                        count: projectMedia.requests_count,
                      }}
                    />
                  </div>
                </React.Fragment> : null }
              { showReportStatus ?
                <React.Fragment>
                  <div className={classes.sep}> - </div>
                  <div className={classes.mediaItemMetadataField}>
                    { projectMedia.report_status === 'published' ?
                      <div className={classes.reportPublished}>
                        <FormattedMessage id="mediaItem.reportPublished" defaultMessage="Published" />
                      </div> : null }
                    { projectMedia.report_status === 'unpublished' ?
                      <div className={classes.reportUnpublished}>
                        <FormattedMessage id="mediaItem.reportUnpublished" defaultMessage="Unpublished" />
                      </div> : null }
                    { projectMedia.report_status === 'paused' ?
                      <div className={classes.reportPaused}>
                        <FormattedMessage id="mediaItem.reportPaused" defaultMessage="Paused" />
                      </div> : null }
                  </div>
                </React.Fragment> : null }
              { projectMedia.added_as_similar_by_name && !projectMedia.is_confirmed_similar_to_another_item ?
                <React.Fragment>
                  <div className={classes.sep}> - </div>
                  <div className={classes.by}>
                    <FormattedMessage id="mediaItem.addedBy" defaultMessage="Added by {name}" values={{ name: projectMedia.added_as_similar_by_name }} />
                  </div>
                </React.Fragment> : null }
              { projectMedia.confirmed_as_similar_by_name ?
                <React.Fragment>
                  <div className={classes.sep}> - </div>
                  <div className={classes.by}>
                    <FormattedMessage id="mediaItem.confirmedBy" defaultMessage="Confirmed by {name}" values={{ name: projectMedia.confirmed_as_similar_by_name }} />
                  </div>
                </React.Fragment> : null }
            </Box>
            <Typography variant="body2" className={classes.description}>
              {truncateLength(projectMedia.description, 140)}
            </Typography>
          </Box>
        }
        avatar={
          projectMedia.picture ?
            <img
              alt=""
              className={classes.image}
              onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }}
              src={projectMedia.picture}
            /> : null
        }
      />
    </Box>
  );
};

MediaItem.defaultProps = {
  mainProjectMedia: { id: '' },
  isSelected: false,
  showReportStatus: true,
  onSelect: undefined,
  modalOnly: false,
};

MediaItem.propTypes = {
  mainProjectMedia: PropTypes.shape({
    id: PropTypes.string.isRequired,
    confirmedSimilarCount: PropTypes.number,
    demand: PropTypes.number,
  }),
  projectMedia: PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    picture: PropTypes.string.isRequired,
    last_seen: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    requests_count: PropTypes.number.isRequired,
    linked_items_count: PropTypes.number.isRequired,
    report_status: PropTypes.string.isRequired,
    added_as_similar_by_name: PropTypes.string.isRequired,
    confirmed_as_similar_by_name: PropTypes.string.isRequired,
  }).isRequired,
  isSelected: PropTypes.bool,
  showReportStatus: PropTypes.bool,
  onSelect: PropTypes.func,
  modalOnly: PropTypes.bool,
};

export default createFragmentContainer(MediaItem, {
  projectMedia: graphql`
    fragment MediaItem_projectMedia on ProjectMedia {
      id
      dbid
      title
      description
      picture
      type
      last_seen
      requests_count
      linked_items_count
      report_status
      added_as_similar_by_name
      confirmed_as_similar_by_name
      is_confirmed_similar_to_another_item
    }
  `,
});
