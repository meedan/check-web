import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { makeStyles } from '@material-ui/core/styles';
import {
  Card,
  Grid,
  MenuItem,
  OutlinedInput,
  Select,
  Typography,
} from '@material-ui/core';
import MediaTypeDisplayName from '../media/MediaTypeDisplayName';
import MediaExpanded from '../media/MediaExpanded';
import { parseStringUnixTimestamp } from '../../helpers';
import TimeBefore from '../TimeBefore';
import {
  backgroundMain,
  brandSecondary,
  opaqueBlack54,
  Column,
} from '../../styles/js/shared';
import {
  StyledTwoColumns,
  StyledBigColumn,
} from '../../styles/js/HeaderCard';

const defaultImage = '/images/image_placeholder.svg';
const useStyles = makeStyles(theme => ({
  main: {
    backgroundColor: backgroundMain,
    padding: theme.spacing(2),
  },
  image: {
    height: 80,
    width: 80,
    objectFit: 'cover',
    border: `1px solid ${brandSecondary}`,
    float: 'left',
    marginRight: theme.spacing(1),
  },
  cardMain: {
    boxShadow: 'none',
    border: `1px solid ${brandSecondary}`,
    borderRadius: theme.spacing(1),
    marginBottom: theme.spacing(1),
    padding: theme.spacing(2),
    cursor: 'pointer',
  },
  cardDetail: {
    boxShadow: 'none',
    border: `1px solid ${brandSecondary}`,
    borderRadius: theme.spacing(1),
    marginBottom: theme.spacing(1),
    padding: theme.spacing(2),
  },
  cardTitle: {
    fontSize: '1.0em',
    fontWeight: 900,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  columnTitle: {
    fontSize: '1.0em',
    fontWeight: 900,
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1),
  },
  sortBy: {
    float: 'right',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
  },
  selectSort: {
    marginLeft: theme.spacing(1),
    fontSize: '1.0em',
    minWidth: '150px',
  },
  cardSubhead: {
    color: opaqueBlack54,
    fontSize: '0.85em',
    fontWeight: 500,
  },
  cardDescription: {
    fontSize: '14px',
    lineHeight: '1.3em',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    marginTop: theme.spacing(0.5),
  },
  selected: {
    backgroundColor: brandSecondary,
    border: '1px solid #ced3e2',
  },
  detailTitle: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textDecoration: 'none',
    lineClamp: '2',
    display: '-webkit-box',
    boxOrient: 'vertical',
  },
  detailDescription: {
    fontSize: '14px',
    lineHeight: '1.3em',
  },
  detailSubhead: {
    fontSize: '1.0em',
    fontWeight: 900,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

const TrendsItemComponent = ({ project_media }) => {
  const classes = useStyles();
  // eslint-disable-next-line
  const similarItems = project_media.confirmed_similar_relationships?.edges?.map(item => item.node?.target);
  const mainItem = project_media;
  // value of -1 means the main claim, 0+ are indexes to similar items
  const [selectedItemIndex, setSelectedItemIndex] = React.useState(project_media.id);
  const [sortBy, setSortBy] = React.useState('mostRequests');

  const sortOptions = {
    mostRequests: (a, b) => (b.requests_count - a.requests_count),
    leastRequests: (a, b) => (a.requests_count - b.requests_count),
    oldest: (a, b) => (b.last_seen - a.last_seen),
    newest: (a, b) => (a.last_seen - b.last_seen),
  };

  const handleClick = (e) => {
    setSelectedItemIndex(e.currentTarget.dataset.id);
  };

  const handleChange = (e) => {
    setSortBy(e.target.value);
  };

  const selectedItem = selectedItemIndex === project_media.id ? project_media : similarItems.find(item => item.id === selectedItemIndex);

  const ItemCard = ({ item, index }) => {
    const selectedItemClass = selectedItemIndex === index ? classes.selected : '';
    return (
      <Card
        className={`${classes.cardMain} ${selectedItemClass}`}
        data-id={index}
        onClick={handleClick}
      >
        {
          item.picture ?
            <img
              alt=""
              className={classes.image}
              onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }}
              src={item.picture}
            /> : null
        }
        <Typography className={classes.cardTitle}>
          {item.title}
        </Typography>
        <Typography className={classes.cardSubhead}>
          <MediaTypeDisplayName mediaType={item.type} /> - <FormattedMessage id="trendItem.lastSubmitted" defaultMessage="Last submitted" description="A label indicating that the following date is when an item was last submitted to the tip line" /> - <TimeBefore date={parseStringUnixTimestamp(item.last_seen)} /> - {item.requests_count} {item.requests_count === 1 ? <FormattedMessage id="trendItem.request" defaultMessage="Request" description="A label that appears alongside a number showing the number of requests an item has received. This is the singular noun for use when it is a single request, appearing in English as '1 request'." /> : <FormattedMessage id="trendItem.requests" defaultMessage="Requests" description="A label that appears alongside a number showing the number of requests an item has received. This is the plural noun for use when there are zero or more than one requests, appearing in English as '10 requests' or '0 requests'." />}
        </Typography>
        <Typography className={classes.cardDescription} variant="body1">
          {item.description}
        </Typography>
      </Card>
    );
  };

  return (
    <StyledTwoColumns className={classes.main}>
      <StyledBigColumn className="media__column">
        <Column>
          <Typography className={classes.columnTitle}>
            <FormattedMessage id="trendItem.main" defaultMessage="Main claim" description="This is a header that indicates there is a primary claim the user is viewing, to distinguish it from secondary, similar claims" />
          </Typography>
          <ItemCard item={mainItem} index={mainItem.id} />
          <Grid container alignItems="center">
            <Grid item xs={6}>
              <Typography className={classes.columnTitle}>
                <FormattedMessage id="trendItem.media" defaultMessage="Media" />
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography className={`${classes.columnTitle} ${classes.sortBy}`} component="div">
                <FormattedMessage id="trendItem.sortBy" defaultMessage="Sort by" />
                <Select
                  value={sortBy}
                  onChange={handleChange}
                  input={<OutlinedInput name="sort-select" margin="dense" />}
                  className={classes.selectSort}
                >
                  <MenuItem value="mostRequests">Most requests</MenuItem>
                  <MenuItem value="leastRequests">Least requests</MenuItem>
                  <MenuItem value="oldest">Newest</MenuItem>
                  <MenuItem value="newest">Oldest</MenuItem>
                </Select>
              </Typography>
            </Grid>
          </Grid>
          {
            similarItems
              .sort(sortOptions[sortBy])
              .map(item => <ItemCard item={item} index={item.id} />)
          }
        </Column>
      </StyledBigColumn>
      <StyledBigColumn className="media__column">
        <Column>
          <Card className={classes.cardDetail}>
            <MediaExpanded
              media={selectedItem}
              mediaUrl="foo"
              isTrends
            />
          </Card>
        </Column>
      </StyledBigColumn>
    </StyledTwoColumns>
  );
};

const renderQuery = ({ error, props }) => {
  if (!error && props) {
    return <TrendsItemComponent {...props} />;
  }
  return null;
};

const TrendsItem = props => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query TrendsItemQuery($ids_0: String!) {
        project_media(ids: $ids_0) {
          id
          title
          type
          description
          requests_count
          updated_at
          last_seen
          created_at
          picture
          language_code
          pusher_channel
          dbid
          project_id
          domain
          team {
            id
            dbid
            slug
            name
            get_language
            get_report
            get_tasks_enabled
            team_bots(first: 10000) {
              edges {
                node {
                  login
                }
              }
            }
          }
          media {
            url
            quote
            embed_path
            metadata
            type
            picture
            file_path
            thumbnail_path
          }
          confirmed_similar_relationships(first: 10000) {
            edges {
              node {
                id
                target {
                  id
                  title
                  type
                  description
                  requests_count
                  updated_at
                  last_seen
                  created_at
                  picture
                  language_code
                  pusher_channel
                  dbid
                  project_id
                  domain
                  team {
                    id
                    dbid
                    slug
                    name
                    get_language
                    get_report
                    get_tasks_enabled
                    team_bots(first: 10000) {
                      edges {
                        node {
                          login
                        }
                      }
                    }
                  }
                  media {
                    url
                    quote
                    embed_path
                    metadata
                    type
                    picture
                    file_path
                    thumbnail_path
                  }
                }
                source {
                  id
                }
              }
            }
          }
        }
      }
    `}
    variables={{
      ids_0: props.routeParams.mediaId,
    }}
    render={renderQuery}
  />
);

TrendsItem.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired,
    mediaId: PropTypes.string,
  }).isRequired,
};

export default TrendsItem;
