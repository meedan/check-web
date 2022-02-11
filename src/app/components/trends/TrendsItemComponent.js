import React from 'react';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import {
  Box,
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
  checkBlue,
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
  teamName: {
    color: checkBlue,
  },
  boxes: {
    gap: `${theme.spacing(1)}px`,
    marginBottom: theme.spacing(2),
  },
  box: {
    textAlign: 'center',
    backgroundColor: 'white',
    padding: theme.spacing(2),
    border: '1px solid #ced3e2',
    borderRadius: theme.spacing(1),
    whiteSpace: 'nowrap',
  },
}));

const TrendsItemComponent = ({ project_media }) => {
  const classes = useStyles();
  const { cluster } = project_media;
  const medias = cluster?.items?.edges.map(item => item.node);
  const [selectedItemIndex, setSelectedItemIndex] = React.useState(0);
  const [sortBy, setSortBy] = React.useState('mostRequests');

  const sortOptions = {
    mostRequests: (a, b) => (b.requests_count - a.requests_count),
    leastRequests: (a, b) => (a.requests_count - b.requests_count),
    oldest: (a, b) => (b.last_seen - a.last_seen),
    newest: (a, b) => (a.last_seen - b.last_seen),
  };

  const handleClick = (index) => {
    setSelectedItemIndex(index);
  };

  const handleChange = (e) => {
    setSortBy(e.target.value);
  };

  const selectedItem = medias[selectedItemIndex];

  const ItemCard = ({ item, index }) => {
    const selectedItemClass = selectedItemIndex === index ? classes.selected : '';
    return (
      <Card
        className={`${classes.cardMain} ${selectedItemClass}`}
        onClick={() => { handleClick(index); }}
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
          <MediaTypeDisplayName mediaType={item.type} /> - <FormattedMessage id="trendItem.lastSubmitted" defaultMessage="Last submitted" description="A label indicating that the following date is when an item was last submitted to the tip line" /> - <TimeBefore date={parseStringUnixTimestamp(item.last_seen)} /> - {item.requests_count} {item.requests_count === 1 ? <FormattedMessage id="trendItem.request" defaultMessage="Request" description="A label that appears alongside a number showing the number of requests an item has received. This is the singular noun for use when it is a single request, appearing in English as '1 request'." /> : <FormattedMessage id="trendItem.requests" defaultMessage="Requests" description="A label that appears alongside a number showing the number of requests an item has received. This is the plural noun for use when there are zero or more than one requests, appearing in English as '10 requests' or '0 requests'." />} - <span className={classes.teamName}>{item.team.name}</span>
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
            <FormattedMessage id="trendItem.main" defaultMessage="{number} Medias" values={{ number: cluster.size }} />
          </Typography>
          <Grid container alignItems="center">
            <Grid item xs={6}>
              <Box display="flex" alignItems="center" className={classes.boxes}>
                <Box className={classes.box}>
                  <Typography variant="caption"><FormattedMessage id="trendItem.requestsCount" defaultMessage="Requests" description="Label displayed on cluster item page" /></Typography>
                  <br />
                  <strong>{cluster.requests_count}</strong>
                </Box>
                <Box className={classes.box}>
                  <Typography variant="caption"><FormattedMessage id="trendItem.submitted" defaultMessage="Submitted" description="Label displayed on cluster item page" /></Typography>
                  <br />
                  <strong><TimeBefore date={parseStringUnixTimestamp(cluster.first_item_at)} /></strong>
                </Box>
                <Box className={classes.box}>
                  <Typography variant="caption"><FormattedMessage id="trendItem.lastSubmittedAt" defaultMessage="Last submitted" description="Label displayed on cluster item page" /></Typography>
                  <br />
                  <strong><TimeBefore date={parseStringUnixTimestamp(cluster.last_item_at)} /></strong>
                </Box>
              </Box>
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
            medias
              .sort(sortOptions[sortBy])
              .map((item, index) => <ItemCard item={item} index={index} />)
          }
        </Column>
      </StyledBigColumn>
      <StyledBigColumn className="media__column">
        <Column>
          <Card className={classes.cardDetail}>
            <MediaExpanded
              media={selectedItem}
              linkTitle={selectedItem.title}
              mediaUrl={selectedItem.full_url}
              isTrends
            />
          </Card>
        </Column>
      </StyledBigColumn>
    </StyledTwoColumns>
  );
};

export default TrendsItemComponent;
