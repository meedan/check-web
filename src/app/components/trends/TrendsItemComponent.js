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
  Chip,
  Dialog,
  Divider,
  FormControl,
  Grid,
  Button,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Typography,
  FormControlLabel,
  Checkbox,
} from '@material-ui/core';
import SystemUpdateAltOutlinedIcon from '@material-ui/icons/SystemUpdateAltOutlined';
import CloseIcon from '@material-ui/icons/Close';
import MediaStatus from '../media/MediaStatus';
import MediaTypeDisplayName from '../media/MediaTypeDisplayName';
import MediaExpanded from '../media/MediaExpanded';
import NextPreviousLinks from '../media/NextPreviousLinks';
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
    width: 360,
    minWidth: 360,
    maxWidth: 360,
  },
  middleColumn: {
    backgroundColor: 'white',
    borderRight: `1px solid ${brandSecondary}`,
  },
  mediasColumn: {
    width: 590,
    minWidth: 590,
    maxWidth: 590,
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
    padding: 0,
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  sortBy: {
    float: 'right',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    padding: 0,
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
  claimCardBox: {
    cursor: 'pointer',
  },
  claimCardFooter: {
    justifyContent: 'flex-end',
  },
  claim: {
    lineHeight: '1.5em',
  },
  chip: {
    marginRight: theme.spacing(1),
  },
}));

// FIXME: Break into smaller components

const TrendsItemComponent = ({
  cluster,
  teams,
  setFlashMessage,
  listIndex,
  buildSiblingUrl,
}) => {
  const classes = useStyles();
  const [importingClaim, setImportingClaim] = React.useState(null);

  const allMedias = cluster?.items?.edges.map(item => JSON.parse(JSON.stringify(item.node)));
  let totalDemand = 0;
  const medias = [];
  const allTeams = [];
  allMedias.forEach((media, i) => {
    allMedias[i].demand = media.requests_count;
    const existingMedia = medias.find(m => m.media.dbid === media.media.dbid);
    if (!allTeams.find(t => t.dbid === media.team.dbid)) {
      allTeams.push({ ...media.team });
    }
    if (existingMedia) {
      existingMedia.demand += media.requests_count;
      totalDemand += media.requests_count;
    } else if (!importingClaim || importingClaim.project_media.team.dbid === media.team.dbid) {
      totalDemand += media.requests_count;
      medias.push(media);
    }
  });
  const teamsWithoutClaims = allTeams.filter(t => !cluster.claim_descriptions.edges.find(cd => cd.node.project_media.team.dbid === t.dbid));

  const [selectedItemDbid, setSelectedItemDbid] = React.useState(medias.length > 0 ? medias[0].dbid : null);
  const [expandedMedia, setExpandedMedia] = React.useState(null);
  const [sortBy, setSortBy] = React.useState('mostRequests');
  const [importingClaimDescription, setImportingClaimDescription] = React.useState('');
  const [showImportClaimDialog, setShowImportClaimDialog] = React.useState(false);
  const [selectedTeam, setSelectedTeam] = React.useState(teams[0].dbid);
  const [isImporting, setIsImporting] = React.useState(false);
  const [importingOptions, setImportingOptions] = React.useState({ factCheck: true, annotations: true, tags: true });

  const selectedItem = medias.find(m => m.dbid === selectedItemDbid) || medias[0];

  const sortOptions = {
    mostRequests: (a, b) => (b.demand - a.demand),
    leastRequests: (a, b) => (a.demand - b.demand),
    oldest: (a, b) => (b.updated_at - a.updated_at),
    newest: (a, b) => (a.updated_at - b.updated_at),
  };

  const handleClick = (media) => {
    setSelectedItemDbid(media.dbid);
    setExpandedMedia(media);
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

    const input = {
      channel: 12, // Shared Database
      media_id: selectedItem.media_id,
      team_id: selectedTeam,
      set_claim_description: importingClaimDescription || importingClaim?.description,
    };
    if (importingOptions.factCheck && importingClaim.fact_check) {
      input.set_fact_check = JSON.stringify({ title: importingClaim.fact_check.title, summary: importingClaim.fact_check.summary });
    }
    if (importingOptions.annotations) {
      const tasks = {};
      importingClaim.project_media.tasks.edges.forEach((task) => {
        tasks[task.node.slug] = task.node.first_response_value;
      });
      input.set_tasks_responses = JSON.stringify(tasks);
    }
    if (importingOptions.tags) {
      input.set_tags = JSON.stringify(importingClaim.project_media.tags.edges.map(t => t.node.tag_text));
    }

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
        input,
      },
      onCompleted: (response, err) => {
        if (err) {
          handleError();
        } else {
          setIsImporting(false);
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

  const ItemCard = ({ item }) => {
    const fileTitle = item.media.file_path ? item.media.file_path.split('/').pop().replace(/\..*$/, '') : null;
    const title = item?.media?.metadata?.title || item?.media?.quote || fileTitle || item?.media?.title || item.title;
    const description = item?.media?.metadata?.description || item.description;
    return (
      <Card
        className={classes.cardMain}
        onClick={() => { handleClick(item); }}
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
          {title}
        </Typography>
        <Typography className={classes.cardSubhead}>
          <MediaTypeDisplayName mediaType={item.type} /> - <FormattedMessage id="trendItem.lastSubmitted" defaultMessage="Last submitted" description="A label indicating that the following date is when an item was last submitted to the tip line" /> - <TimeBefore date={parseStringUnixTimestamp(item.last_seen)} /> - {item.demand} {item.demand === 1 ? <FormattedMessage id="trendItem.request" defaultMessage="Request" description="A label that appears alongside a number showing the number of requests an item has received. This is the singular noun for use when it is a single request, appearing in English as '1 request'." /> : <FormattedMessage id="trendItem.requests" defaultMessage="Requests" description="A label that appears alongside a number showing the number of requests an item has received. This is the plural noun for use when there are zero or more than one requests, appearing in English as '10 requests' or '0 requests'." />}
        </Typography>
        <Typography className={classes.cardDescription} variant="body1">
          {description}
        </Typography>
      </Card>
    );
  };

  const ClaimCard = ({ content, claimDescription }) => (
    <Box mt={1} className={classes.claimCardBox}>
      <Card
        variant="outlined"
        className={importingClaim && claimDescription.id === importingClaim.id ? classes.selected : null}
        onClick={() => { setImportingClaim(claimDescription); }}
      >
        {content}
      </Card>
    </Box>
  );

  return (
    <>
      <NextPreviousLinks
        buildSiblingUrl={buildSiblingUrl}
        listQuery={{ trends: true }}
        listIndex={listIndex}
        objectType="cluster"
      />
      <Box className={classes.main} display="flex" justifyContent="space-between">
        <Box className={['media__column', classes.claimsColumn].join(' ')}>
          <Column>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography className={classes.columnTitle}>
                <FormattedMessage id="trendItem.claimDescription" defaultMessage="Claims" />
              </Typography>
              <IconButton onClick={() => { setImportingClaim(null); setImportingClaimDescription(null); }} disabled={!importingClaim}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Box mt={1}>
              {/* Claims */}
              { cluster.claim_descriptions.edges.map(e => e.node).map(claim => (
                <ClaimCard
                  key={claim.id}
                  claimDescription={claim}
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
                                claim?.project_media?.report_status === 'published' ?
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
              {/* Medias without claims */}
              { teamsWithoutClaims.map(team => (
                <Box mt={1} className={classes.claimCardBox}>
                  <Card variant="outlined">
                    <CardHeader
                      avatar={<Avatar src={team.avatar} />}
                      title={team.name}
                    />
                    <CardContent>
                      <Box mt={2}>
                        <span style={{ color: opaqueBlack38 }}>
                          <FormattedMessage
                            id="trendItem.noClaim"
                            defaultMessage="No claim added yet"
                          />
                        </span>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </Column>
        </Box>

        <Box className={['media__column', classes.mediaColumn, classes.middleColumn].join(' ')}>
          <Column>
            <Typography className={classes.columnTitle}>
              <FormattedMessage id="trendItem.factCheck" defaultMessage="Fact-check" description="Middle column title on trends item page" />
            </Typography>
            { !importingClaim ?
              <Box className={classes.box}>
                <FormattedMessage
                  id="trendItem.noImportingClaim"
                  defaultMessage="Select an organization to display available fact-check and annotations."
                  description="Message displayed on trends item page when no claim was selected."
                />
              </Box> : null }
            { importingClaim ?
              <Box>
                <Box mb={2} mt={2}>
                  <MediaStatus media={importingClaim.project_media} readonly />
                </Box>
                <Box mb={2}>
                  <TextField
                    key={`fact-check-title-${importingClaim.id}`}
                    label={<FormattedMessage id="trendItem.factCheckTitle" defaultMessage="Title" description="Fact-check title" />}
                    defaultValue={importingClaim?.fact_check?.title}
                    variant="outlined"
                    InputProps={{ readOnly: true }}
                    fullWidth
                  />
                </Box>
                <Box mb={2}>
                  <TextField
                    key={`fact-check-summary-${importingClaim.id}`}
                    label={<FormattedMessage id="trendItem.factCheckSummary" defaultMessage="Summary" description="Fact-check summary" />}
                    defaultValue={importingClaim?.fact_check?.summary}
                    variant="outlined"
                    rows={3}
                    InputProps={{ readOnly: true }}
                    multiline
                    fullWidth
                  />
                </Box>
                <Box mb={3}>
                  <TextField
                    key={`fact-check-url-${importingClaim.id}`}
                    label={<FormattedMessage id="trendItem.factCheckUrl" defaultMessage="Published article URL" description="Fact-check article URL" />}
                    defaultValue={importingClaim?.fact_check?.url}
                    variant="outlined"
                    InputProps={{ readOnly: true }}
                    fullWidth
                  />
                </Box>
                <Divider />
                <Box mb={2} mt={2}>
                  <strong><FormattedMessage id="trendItem.aboutThisClaim" defaultMessage="About this claim" /></strong>
                </Box>
                <Box key={`tags-${importingClaim.project_media.id}`}>
                  { importingClaim.project_media.tags.edges.length === 0 ?
                    <FormattedMessage id="trendItem.noTags" defaultMessage="No tags." description="Displayed on trends item page when item has no tags." /> : null }
                  {importingClaim.project_media.tags.edges.map(tag => <Chip label={tag.node.tag_text} key={tag.node.id} color="primary" className={classes.chip} />)}
                </Box>
                <Box mt={2}>
                  { importingClaim.project_media.tasks.edges.map(task => task.node).filter(task => task.first_response_value).length === 0 ?
                    <FormattedMessage id="trendItem.noTasks" defaultMessage="No completed annotations." description="Displayed on trends item page when item has no completed annotations." /> : null }
                  {importingClaim.project_media.tasks.edges.map(task => task.node).filter(task => task.first_response_value).map(task => (
                    <Box mt={2}>
                      <p><strong>{task.label}</strong></p>
                      <p>{task.first_response_value}</p>
                    </Box>
                  ))}
                </Box>
              </Box> : null }
          </Column>
        </Box>

        <Box className={['media__column', classes.mediaColumn].join(' ')}>
          <Column>
            <Box display="flex" justifyContent="flex-end">
              <Button color="primary" variant="contained" startIcon={<SystemUpdateAltOutlinedIcon />} onClick={() => { setShowImportClaimDialog(true); }} disabled={!importingClaim || !selectedItem}>
                <FormattedMessage id="trendItem.import" defaultMessage="Import" />
              </Button>
            </Box>
            <Grid container alignItems="center">
              <Grid item xs={6}>
                <Typography className={classes.columnTitle}>
                  { !importingClaim ?
                    <FormattedMessage id="trendItem.mediasColumnTitleAll" defaultMessage="{number} Medias across all organizations" values={{ number: medias.length }} /> : null }
                  { importingClaim ?
                    <FormattedMessage id="trendItem.mediasColumnTitleSingle" defaultMessage="{number} Medias from {organizationName}" values={{ number: medias.length, organizationName: importingClaim.project_media.team.name }} /> : null }
                </Typography>
                <p><small><FormattedMessage id="trendItem.mediaRequests" defaultMessage="{number} tipline requests across all medias" values={{ number: totalDemand }} /></small></p>
              </Grid>
              <Grid item xs={6}>
                <Typography className={`${classes.columnTitle} ${classes.sortBy}`} component="div">
                  <FormattedMessage id="trendItem.sortBy" defaultMessage="Sort by" /><br />
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
                .map(item => <ItemCard item={item} key={item.id} />)
            }
          </Column>
        </Box>

        { expandedMedia ?
          <Dialog onClose={() => { setExpandedMedia(null); }} maxWidth="md" fullWidth open>
            <Card className={classes.cardDetail}>
              <Box display="flex" justifyContent="flex-end">
                <IconButton onClick={() => { setExpandedMedia(null); }}>
                  <CloseIcon />
                </IconButton>
              </Box>
              <MediaExpanded
                media={expandedMedia}
                linkTitle={expandedMedia?.title}
                mediaUrl={null}
                isTrends
              />
            </Card>
          </Dialog> : null }

        <ConfirmProceedDialog
          open={showImportClaimDialog}
          title={
            <FormattedMessage
              id="trendsItem.importTitle"
              defaultMessage="Import data to workspace"
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
                      <MenuItem value={team.dbid} key={team.dbid}>{team.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box>
                <TextField
                  label={
                    <FormattedMessage
                      id="trendsItem.importTextLabel"
                      defaultMessage="Claim description"
                      description="Text field label used in import claim dialog from trends page."
                    />
                  }
                  variant="outlined"
                  onBlur={(e) => { setImportingClaimDescription(e.target.value); }}
                  defaultValue={importingClaimDescription || importingClaim?.description}
                  multiline
                  rows={3}
                  rowsMax={Infinity}
                  fullWidth
                />
              </Box>
              <Box mt={3}>
                <FormattedMessage id="trendsItem.importingQuestion" defaultMessage="What content do you want to import?" description="Question in trends page importing modal" paragraph />
                <Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={importingOptions.factCheck}
                        onChange={(e) => { setImportingOptions({ ...importingOptions, factCheck: e.target.checked }); }}
                      />
                    }
                    label={<FormattedMessage id="trendsItem.factCheck" defaultMessage="Fact-check" />}
                  />
                </Box>
                <Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={importingOptions.annotations}
                        onChange={(e) => { setImportingOptions({ ...importingOptions, annotations: e.target.checked }); }}
                      />
                    }
                    label={<FormattedMessage id="trendsItem.completedAnnotations" defaultMessage="Completed annotations" />}
                  />
                </Box>
                <Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={importingOptions.tags}
                        onChange={(e) => { setImportingOptions({ ...importingOptions, tags: e.target.checked }); }}
                      />
                    }
                    label={<FormattedMessage id="trendsItem.tags" defaultMessage="Tags" />}
                  />
                </Box>
              </Box>
            </React.Fragment>
          )}
          proceedDisabled={!selectedTeam || (!importingClaimDescription && !importingClaim?.description)}
          proceedLabel={<FormattedMessage id="trendsItem.proceedImport" defaultMessage="Import" description="Button label to confirm importing claim from trends page" />}
          onProceed={handleImport}
          onCancel={() => { setShowImportClaimDialog(false); }}
          isSaving={isImporting}
        />
      </Box>
    </>
  );
};

export default withSetFlashMessage(TrendsItemComponent);
