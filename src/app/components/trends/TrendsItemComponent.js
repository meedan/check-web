import React from 'react';
import Relay from 'react-relay/classic';
import { graphql, commitMutation } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import {
  Avatar,
  Box,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Typography,
} from '@material-ui/core';
import SystemUpdateAltOutlinedIcon from '@material-ui/icons/SystemUpdateAltOutlined';
import MediaTypeDisplayName from '../media/MediaTypeDisplayName';
import MediaExpanded from '../media/MediaExpanded';
import { parseStringUnixTimestamp, getStatus } from '../../helpers';
import TimeBefore from '../TimeBefore';
import {
  backgroundMain,
  brandSecondary,
  checkBlue,
  opaqueBlack54,
  opaqueBlack38,
  Column,
} from '../../styles/js/shared';
import ConfirmProceedDialog from '../layout/ConfirmProceedDialog';
import { withSetFlashMessage } from '../FlashMessage';

const defaultImage = '/images/image_placeholder.svg';
const useStyles = makeStyles(theme => ({
  main: {
    backgroundColor: backgroundMain,
  },
  claimsColumn: {
    backgroundColor: 'white',
    borderRight: `1px solid ${brandSecondary}`,
    width: 400,
  },
  mediasColumn: {
  },
  mediaColumn: {
    width: '100%',
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
  claimCardFooter: {
    justifyContent: 'flex-end',
  },
  claim: {
    lineHeight: '1.5em',
  },
}));

// FIXME: Break into smaller components

const TrendsItemComponent = ({ projectMedia, teams, setFlashMessage }) => {
  const classes = useStyles();
  const { cluster } = projectMedia;
  const medias = cluster?.items?.edges.map(item => item.node);
  const [selectedItemIndex, setSelectedItemIndex] = React.useState(0);
  const [sortBy, setSortBy] = React.useState('mostRequests');
  const [importingClaim, setImportingClaim] = React.useState(null);
  const [selectedTeam, setSelectedTeam] = React.useState(teams[0].dbid);
  const [isImporting, setIsImporting] = React.useState(false);

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

  const handleError = () => {
    setIsImporting(false);
    setFlashMessage((
      <FormattedMessage
        id="trendsItem.couldNotImport"
        defaultMessage="Could not import claim"
      />
    ), 'error');
  };

  const handleImport = () => {
    setIsImporting(true);
    commitMutation(Relay.Store, {
      mutation: graphql`
        mutation TrendsItemComponentCreateProjectMediaMutation($input: CreateProjectMediaInput!) {
          createProjectMedia(input: $input) {
            project_media {
              id
            }
          }
        }
      `,
      variables: {
        input: {
          channel: 12, // Shared Database
          media_id: projectMedia.media_id,
          team_id: selectedTeam,
          set_claim_description: importingClaim,
        },
      },
      onCompleted: (response, err) => {
        if (err) {
          handleError();
        } else {
          setIsImporting(false);
          setImportingClaim(null);
          setFlashMessage((
            <FormattedMessage
              id="trendsItem.importedSuccessfully"
              defaultMessage="Claim successfully imported to {workspaceName} workspace"
              values={{
                workspaceName: teams.find(t => t.dbid === parseInt(selectedTeam, 10)).name,
              }}
            />
          ), 'success');
        }
      },
      onError: () => {
        handleError();
      },
    });
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

  const ClaimCard = ({ content, claimDescription }) => (
    <Box mt={1}>
      <Card variant="outlined">
        {content}
        <CardActions disableSpacing className={classes.claimCardFooter}>
          <IconButton color="primary" onClick={() => { setImportingClaim(claimDescription); }}>
            <SystemUpdateAltOutlinedIcon />
          </IconButton>
        </CardActions>
      </Card>
    </Box>
  );

  return (
    <Box className={classes.main} display="flex" justifyContent="space-between">
      <Box className={['media__column', classes.claimsColumn].join(' ')}>
        <Column>
          <Typography className={classes.columnTitle}>
            <FormattedMessage id="trendItem.claimDescription" defaultMessage="Claim descriptions and ratings" />
          </Typography>
          <Box pl={1} mb={2}>
            <Typography variant="body2" component="div">
              <FormattedMessage id="trendItem.claimDescriptionSubtitle" defaultMessage="{number} organizations added a claim description." values={{ number: cluster.claim_descriptions.edges.length }} />
            </Typography>
          </Box>
          <Box mt={2}>
            { cluster.claim_descriptions.edges.length === 0 ?
              <ClaimCard
                claimDescription=""
                content={
                  <CardContent>
                    <FormattedMessage id="trendItem.noClaims" defaultMessage="Import this group of media to be the first to add a claim description and publish a report." />
                  </CardContent>
                }
              /> : null }
            { cluster.claim_descriptions.edges.map(e => e.node).map(claim => (
              <ClaimCard
                claimDescription={claim.description}
                content={
                  <React.Fragment>
                    <CardHeader
                      avatar={<Avatar src={claim.project_media.team.avatar} />}
                      title={claim.project_media.team.name}
                    />
                    <CardContent>
                      <strong className={classes.claim}>{claim.description}</strong>
                      <Box mt={2}>
                        <FormattedMessage
                          id="trendItem.rating"
                          defaultMessage="Rating: {rating}"
                          values={{ rating: getStatus(claim.project_media.team.verification_statuses, claim.project_media.last_status).label }}
                        />
                      </Box>
                      <Box mt={1}>
                        <FormattedMessage
                          id="trendItem.publishedAt"
                          defaultMessage="Report published: {date}"
                          values={{
                            date: (
                              claim.project_media.report_status === 'published' ?
                                <TimeBefore date={parseStringUnixTimestamp(claim.project_media.report?.data?.last_published)} /> :
                                <span style={{ color: opaqueBlack38 }}>
                                  <FormattedMessage id="trendItem.notPublished" defaultMessage="Not published yet" />
                                </span>
                            ),
                          }}
                        />
                      </Box>
                    </CardContent>
                  </React.Fragment>
                }
              />
            ))}
          </Box>
        </Column>
      </Box>
      <Box className={['media__column', classes.mediasColumn].join(' ')}>
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
      </Box>
      <Box className={['media__column', classes.mediaColumn].join(' ')} mt={2} mr={2}>
        <Card className={classes.cardDetail}>
          <MediaExpanded
            media={selectedItem}
            linkTitle={selectedItem.title}
            mediaUrl={selectedItem.full_url}
            isTrends
          />
        </Card>
      </Box>

      <ConfirmProceedDialog
        open={importingClaim !== null}
        title={
          <FormattedMessage
            id="trendsItem.importTitle"
            defaultMessage="Import claims and medias to workspace"
            description="Dialog title when importing a claim from trends page."
          />
        }
        body={(
          <React.Fragment>
            <Typography paragraph>
              <FormattedMessage
                id="trendsItem.importDescription"
                defaultMessage="A new claim will be created in your workspace with media."
                description="Dialog description when importing a claim from trends page."
              />
            </Typography>
            <Box my={3}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel labelId="import-to-workspace-label">
                  <FormattedMessage
                    id="trendsItem.importSelectLabel"
                    defaultMessage="Import to workspace"
                    description="Select field label used in import claim dialog from trends page."
                  />
                </InputLabel>
                <Select
                  labelId="import-to-workspace-label"
                  value={selectedTeam}
                  onChange={(e) => { setSelectedTeam(e.target.value); }}
                  label={
                    <FormattedMessage
                      id="trendsItem.importSelectLabel"
                      defaultMessage="Import to workspace"
                      description="Select field label used in import claim dialog from trends page."
                    />
                  }
                >
                  { teams.sort((a, b) => (a.name > b.name) ? 1 : -1).map(team => (
                    <MenuItem value={team.dbid}>{team.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <TextField
              label={
                <FormattedMessage
                  id="trendsItem.importTextLabel"
                  defaultMessage="Claim description"
                  description="Text field label used in import claim dialog from trends page."
                />
              }
              variant="outlined"
              onBlur={(e) => { setImportingClaim(e.target.value); }}
              defaultValue={importingClaim}
              multiline
              rows={3}
              rowsMax={Infinity}
              fullWidth
            />
          </React.Fragment>
        )}
        proceedDisabled={!selectedTeam || !importingClaim}
        proceedLabel={<FormattedMessage id="trendsItem.proceedImport" defaultMessage="Import" description="Button label to confirm importing claim from trends page" />}
        onProceed={handleImport}
        onCancel={() => { setImportingClaim(null); }}
        isSaving={isImporting}
      />
    </Box>
  );
};

export default withSetFlashMessage(TrendsItemComponent);
