/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import PropTypes from 'prop-types';
import { graphql, commitMutation, createFragmentContainer } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Collapse from '@material-ui/core/Collapse';
import LinkifyIt from 'linkify-it';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import CancelIcon from '@material-ui/icons/Cancel';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import { makeStyles } from '@material-ui/core/styles';
import SetSourceDialog from '../media/SetSourceDialog';
import { can } from '../Can';
import TimeBefore from '../TimeBefore';
import SourcePicture from './SourcePicture';
import { urlFromSearchQuery } from '../search/Search';
import Tasks from '../task/Tasks';
import CheckError from '../../CheckError';
import {
  getErrorMessage,
  getErrorMessageForRelayModernProblem,
  getErrorObjectsForRelayModernProblem,
  parseStringUnixTimestamp,
} from '../../helpers';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import {
  Row,
  StyledIconButton,
} from '../../styles/js/shared';
import {
  StyledTwoColumns,
  StyledSmallColumn,
  StyledBigColumn,
  StyledName,
} from '../../styles/js/HeaderCard';

const useStyles = makeStyles(theme => ({
  headerRow: {
    display: 'flex',
    alignItems: 'top',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
  },
  linkedText: {
    color: 'blue',
    textDecoration: 'underline',
  },
  sourceInfoRight: {
    textAlign: 'right',
  },
  sourceCardHeader: {
    paddingBottom: 0,
  },
  sourceCardContent: {
    paddingTop: 0,
  },
}));

function commitCreateAccountSource({
  source, url, onSuccess, onFailure,
}) {
  const accountSources = source.account_sources ? source.account_sources.edges : [];
  const newAccountSources = accountSources.concat({ node: { account: { url, metadata: '' } } });
  const optimisticResponse = {
    createAccountSource: {
      account_sources: {
        newAccountSources,
      },
    },
  };
  commitMutation(Relay.Store, {
    mutation: graphql`
      mutation SourceInfoCreateAccountSourceMutation($input: CreateAccountSourceInput!) {
        createAccountSource(input: $input) {
          source {
            id
            name
            updated_at
            account_sources(first: 10000) {
              edges {
                node {
                  id
                  permissions
                  account {
                    id
                    url
                  }
                }
              }
            }
          }
        }
      }
    `,
    optimisticResponse,
    variables: {
      input: {
        source_id: source.dbid,
        url,
      },
    },
    onError: onFailure,
    onCompleted: ({ data, errors }) => {
      if (errors) {
        return onFailure(errors);
      }
      return onSuccess(data);
    },
  });
}

function commitDeleteAccountSource({ source, asId }) {
  const onFailure = () => {};
  const onSuccess = () => {};
  commitMutation(Relay.Store, {
    mutation: graphql`
      mutation SourceInfoDeleteAccountSourceMutation($input: DestroyAccountSourceInput!) {
        destroyAccountSource(input: $input) {
          deletedId
          source {
            account_sources(first: 10000) {
              edges {
                node {
                  id
                  permissions
                  account {
                    id
                    url
                  }
                }
              }
            }
          }
        }
      }
    `,
    variables: {
      input: {
        id: asId,
      },
    },
    configs: [
      {
        type: 'NODE_DELETE',
        parentName: 'source',
        parentID: source.id,
        connectionName: 'account_sources',
        deletedIDFieldName: 'deletedId',
      },
    ],
    onError: onFailure,
    onCompleted: ({ data, errors }) => {
      if (errors) {
        return onFailure(errors);
      }
      return onSuccess(data);
    },
  });
}

function SourceInfo({
  about,
  source,
  team,
  projectMediaPermissions,
  onChangeClick,
  relateToExistingSource,
}) {
  const [expandName, setExpandName] = React.useState(true);
  const [expandAccounts, setExpandAccounts] = React.useState(true);
  const [sourceName, setSourceName] = React.useState(source.name);
  const [sourceError, setSourceError] = React.useState('');
  const [secondaryUrl, setSecondaryUrl] = React.useState({ url: '', error: '', addNewLink: false });
  const [primaryUrl, setPrimaryUrl] = React.useState({ url: '', error: '' });
  const [saving, setSaving] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [existingSource, setExistingSource] = React.useState({});

  const classes = useStyles();

  const handleRemoveLink = (asId) => {
    commitDeleteAccountSource({ source, asId });
  };

  const handleChangeLink = (e, type) => {
    const newLink = { url: e.target.value, error: '' };
    if (type === 'primary') {
      setPrimaryUrl(newLink);
    } else {
      newLink.addNewLink = true;
      setSecondaryUrl(newLink);
    }
  };

  const handleChangeSourceName = () => {
    if (sourceName && source.name !== sourceName) {
      const onFailure = (errors) => {
        setSaving(false);
        const error = getErrorObjectsForRelayModernProblem(errors);
        if (Array.isArray(error) && error.length > 0) {
          if (error[0].code === CheckError.codes.DUPLICATED) {
            setDialogOpen(true);
            setExistingSource(error[0].data);
          } else {
            const message = getErrorMessageForRelayModernProblem(errors) || <GenericUnknownErrorMessage />;
            setSourceError(message);
          }
        }
      };

      const onSuccess = () => {
        setSourceError('');
      };

      setSaving(true);

      commitMutation(Relay.Store, {
        mutation: graphql`
          mutation SourceInfoUpdateNameMutation($input: UpdateSourceInput!) {
            updateSource(input: $input) {
              source {
                name
                updated_at
              }
            }
          }
        `,
        variables: {
          input: {
            id: source.id,
            name: sourceName,
          },
        },
        onError: onFailure,
        onCompleted: ({ data, errors }) => {
          setSaving(false);
          if (errors) {
            return onFailure(errors);
          }
          return onSuccess(data);
        },
      });
    }
  };

  const handleNameKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleChangeSourceName();
    }
  };

  const handleAddLinkFail = (type, message) => {
    const newLink = { error: message };
    newLink.url = type === 'primary' ? primaryUrl.url : secondaryUrl.url;
    if (type === 'primary') {
      setPrimaryUrl(newLink);
    } else {
      newLink.addNewLink = secondaryUrl.addNewLink;
      setSecondaryUrl(newLink);
    }
  };

  const createAccountSource = (e, type) => {
    let value = e.target.value.trim().toLowerCase();
    if (!value) {
      return;
    }
    if (!/^https?:\/\//.test(value)) {
      value = `http://${value}`; // Pender will turn into HTTPS if available
    }
    const linkify = new LinkifyIt();
    const validateUrl = linkify.match(value);
    if (Array.isArray(validateUrl) && validateUrl[0] && validateUrl[0].url) {
      const { url } = validateUrl[0];
      const onFailure = (transaction) => {
        setSaving(false);
        const message = getErrorMessage(transaction, <GenericUnknownErrorMessage />);
        handleAddLinkFail(type, message);
      };
      const onSuccess = () => {
        setSaving(false);
        if (type === 'primary') {
          setPrimaryUrl({ url: '', error: '' });
        } else {
          setSecondaryUrl({ url: '', error: '', addNewLink: false });
        }
      };
      setSaving(true);
      commitCreateAccountSource({
        source, url, onSuccess, onFailure,
      });
    } else {
      const message = (
        <FormattedMessage
          id="sourceInfo.invalidLink"
          defaultMessage="Please enter a valid URL"
          description="Error message for invalid link"
        />
      );
      handleAddLinkFail(type, message);
    }
  };

  const handleCancelDialog = () => {
    setDialogOpen(false);
    setSourceName(source.name);
  };

  const handleSubmitDialog = () => {
    relateToExistingSource({ dbid: existingSource.id });
  };

  const accountSources = source.account_sources.edges;
  const mainAccount = accountSources[0];
  const secondaryAccounts = accountSources.slice(1);
  const sourceMediasLink = urlFromSearchQuery({ sources: [`${source.dbid}`] }, `/${team.slug}/all-items`);
  const { source_metadata } = source;
  const sourceMetadata = source_metadata ? source_metadata.edges : [];

  return (
    <div id={`source-${source.dbid}`}>
      <div className={classes.headerRow}>
        <StyledTwoColumns>
          <StyledSmallColumn>
            <SourcePicture
              object={source}
              type="user"
              className="source__avatar"
            />
          </StyledSmallColumn>
          <StyledBigColumn>
            <StyledName className="source__name">
              {sourceName}
            </StyledName>
            <a href={sourceMediasLink} target="_blank" rel="noopener noreferrer">
              <FormattedMessage
                id="sourceInfo.mediasCount"
                defaultMessage="{mediasCount, plural, one {1 item} other {# items}}"
                description="show source media counts"
                values={{
                  mediasCount: source.medias_count || 0,
                }}
              />
            </a>
          </StyledBigColumn>
        </StyledTwoColumns>
        <div className={classes.sourceInfoRight}>
          <Typography variant="caption" component="div">
            { saving ?
              <FormattedMessage
                id="sourceInfo.saving"
                defaultMessage="Saving…"
              /> :
              <FormattedMessage
                id="sourceInfo.saved"
                defaultMessage="Saved {ago}"
                values={{
                  ago: <TimeBefore date={parseStringUnixTimestamp(source.updated_at)} />,
                }}
              />
            }
          </Typography>
          { can(projectMediaPermissions, 'update ProjectMedia') ?
            <Button
              id="media-source-change"
              onClick={onChangeClick}
              className={classes.linkedText}
            >
              <FormattedMessage
                id="mediaSource.changeSource"
                defaultMessage="Change"
                description="allow user to change a project media source"
              />
            </Button> : null
          }
        </div>
      </div>
      <Box clone mb={2}>
        <Card
          id={`source__card-${source.dbid}`}
          className="source__card-card"
        >
          <CardHeader
            className={['source__card-header', classes.sourceCardHeader].join(' ')}
            disableTypography
            title={
              <FormattedMessage
                id="sourceInfo.mainName"
                defaultMessage="Main name"
                description="Source name"
              />
            }
            id={`source__label-${source.id}`}
            action={
              <IconButton
                className="source__card-expand"
                onClick={() => setExpandName(!expandName)}
              >
                <KeyboardArrowDown />
              </IconButton>
            }
          />
          <Collapse in={expandName} timeout="auto">
            <CardContent className={classes.sourceCardContent}>
              <TextField
                id="source__name-input"
                name="source__name-input"
                value={sourceName}
                disabled={!can(source.permissions, 'update Source') || saving}
                error={Boolean(sourceError)}
                helperText={sourceError}
                onKeyPress={(e) => { handleNameKeyPress(e); }}
                onChange={(e) => { setSourceName(e.target.value); }}
                onBlur={handleChangeSourceName}
                margin="normal"
                variant="outlined"
                fullWidth
              />
            </CardContent>
            {dialogOpen ?
              <SetSourceDialog
                open={dialogOpen}
                sourceName={existingSource.name}
                onSubmit={handleSubmitDialog}
                onCancel={handleCancelDialog}
              /> : null
            }
          </Collapse>
        </Card>
      </Box>
      <Box clone mb={2}>
        <Card
          id={`source-accounts-${source.dbid}`}
          className="source__card-card"
        >
          <CardHeader
            className={['source__card-header', classes.sourceCardHeader].join(' ')}
            disableTypography
            title={
              <FormattedMessage
                id="sourceInfo.mainAccount"
                defaultMessage="Main source URL"
                description="URL for first account related to media souce"
              />
            }
            id={`source__accounts-${source.id}`}
            action={
              <IconButton
                className="source__card-expand"
                onClick={() => setExpandAccounts(!expandAccounts)}
              >
                <KeyboardArrowDown />
              </IconButton>
            }
          />
          <Collapse in={expandAccounts} timeout="auto">
            <CardContent className={classes.sourceCardContent}>
              <Box mb={2}>
                { mainAccount ?
                  <Row key={mainAccount.node.id} className="source__url">
                    <TextField
                      id="main_source__link"
                      value={mainAccount.node.account.url}
                      margin="normal"
                      variant="outlined"
                      disabled
                      fullWidth
                    />
                    { can(mainAccount.node.permissions, 'destroy AccountSource') ?
                      <StyledIconButton
                        className="source__remove-link-button"
                        onClick={() => handleRemoveLink(mainAccount.node.id)}
                      >
                        <CancelIcon />
                      </StyledIconButton> : null }
                  </Row> : null }
                { !mainAccount && can(source.permissions, 'create Account') ?
                  <TextField
                    id="source_primary__link-input"
                    name="source_primary__link-input"
                    disabled={saving}
                    variant="outlined"
                    label={
                      <FormattedMessage
                        id="sourceInfo.primaryLink"
                        defaultMessage="Add main source URL"
                        description="Allow user to add a main source URL"
                      />
                    }
                    value={primaryUrl.url}
                    error={Boolean(primaryUrl.error)}
                    helperText={primaryUrl.error}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        createAccountSource(e, 'primary');
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">http(s)://</InputAdornment>
                      ),
                    }}
                    onChange={(e) => { handleChangeLink(e, 'primary'); }}
                    onBlur={(e) => { createAccountSource(e); }}
                    margin="normal"
                    fullWidth
                  /> : null
                }
              </Box>
              <Box mb={2}>
                { secondaryAccounts.length === 0 ?
                  null :
                  <h2>
                    <FormattedMessage
                      id="sourceInfo.secondaryAccounts"
                      defaultMessage="Secondary source URLs"
                      description="URLs for source accounts except first account"
                    />
                  </h2>
                }
                { secondaryAccounts.map((as, index) => (
                  <Row key={as.node.id} className="source__url">
                    <TextField
                      id={`source__link-item${index.toString()}`}
                      defaultValue={as.node.account.url}
                      margin="normal"
                      variant="outlined"
                      fullWidth
                      disabled
                    />
                    { can(as.node.permissions, 'destroy AccountSource') ?
                      <StyledIconButton
                        className="source__remove-link-button"
                        onClick={() => handleRemoveLink(as.node.id)}
                      >
                        <CancelIcon />
                      </StyledIconButton> : null
                    }
                  </Row>
                ))}
              </Box>
              { secondaryUrl.addNewLink ?
                <Row key="source-add-new-link" className="source__url-input">
                  <TextField
                    id="source__link-input-new"
                    name="source__link-input-new"
                    margin="normal"
                    variant="outlined"
                    value={secondaryUrl.url}
                    error={Boolean(secondaryUrl.error)}
                    helperText={secondaryUrl.error}
                    disabled={saving}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        createAccountSource(e, 'secondary');
                      }
                    }}
                    onChange={(e) => { handleChangeLink(e, 'secondary'); }}
                    onBlur={(e) => { createAccountSource(e); }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">http(s)://</InputAdornment>
                      ),
                    }}
                    fullWidth
                  />
                  <StyledIconButton
                    className="source__remove-link-button"
                    onClick={() => { setSecondaryUrl({ url: '', error: '', addNewLink: false }); }}
                  >
                    <CancelIcon />
                  </StyledIconButton>
                </Row> : null
              }
              { can(source.permissions, 'create Account') ?
                <Button
                  className="source__add-link-button"
                  onClick={() => { setSecondaryUrl({ url: '', error: '', addNewLink: true }); }}
                  disabled={Boolean(secondaryUrl.addNewLink || !mainAccount || primaryUrl.error)}
                  startIcon={<AddCircleOutlineIcon />}
                >
                  <FormattedMessage
                    id="sourceInfo.addLink"
                    defaultMessage="Add a secondary URL"
                    description="Allow user to relate a new link to media source"
                  />
                </Button> : null
              }
            </CardContent>
          </Collapse>
        </Card>
      </Box>
      <Tasks tasks={sourceMetadata} media={source} about={about} />
    </div>
  );
}

SourceInfo.propTypes = {
  about: PropTypes.object.isRequired, // GraphQL "About" object
  team: PropTypes.object.isRequired, // GraphQL "Team" object (current team)
  source: PropTypes.object.isRequired, // GraphQL "Source" object
  projectMediaPermissions: PropTypes.object.isRequired, // ProjectMedia permissions
  onChangeClick: PropTypes.func.isRequired, // func(<SourceId>) => undefined
  relateToExistingSource: PropTypes.func.isRequired,
};

export default createFragmentContainer(SourceInfo, {
  about: graphql`
    fragment SourceInfo_about on About {
      upload_max_size
      upload_extensions
      video_max_size
      video_extensions
      audio_max_size
      audio_extensions
      file_max_size
      file_max_size_in_bytes
      file_extensions
      upload_max_dimensions
      upload_min_dimensions
    }
  `,
  source: graphql`
    fragment SourceInfo_source on Source
    @argumentDefinitions(teamSlug: { type: "String!"}) {
      id
      dbid
      image
      name
      pusher_channel
      medias_count
      permissions
      updated_at
      archived
      account_sources(first: 10000) {
        edges {
          node {
            id
            permissions
            account {
              id
              url
            }
          }
        }
      }
      source_metadata: tasks(fieldset: "metadata", first: 10000) {
        edges {
          node {
            id
            dbid
            show_in_browser_extension
            label
            type
            annotated_type
            description
            fieldset
            permissions
            jsonoptions
            json_schema
            options
            team_task {
              conditional_info
            }
            team_task_id
            responses(first: 10000) {
              edges {
                node {
                  id,
                  dbid,
                  permissions,
                  content,
                  file_data,
                  attribution(first: 10000) {
                    edges {
                      node {
                        id
                        dbid
                        name
                        team_user(team_slug: $teamSlug) {
                          id
                          status
                          role
                          team {
                            id
                            slug
                          }
                          user {
                            id
                            dbid
                            name
                            is_active
                            number_of_teams
                            source {
                              id
                              image
                              description
                              created_at
                              account_sources(first: 10000) {
                                edges {
                                  node {
                                    account {
                                      id
                                      url
                                      provider
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                        source {
                          id
                          dbid
                          image
                        }
                      }
                    }
                  }
                  annotator {
                    name,
                    profile_image,
                    user {
                      id,
                      dbid,
                      name,
                      is_active
                      team_user(team_slug: $teamSlug) {
                        id
                        status
                        role
                        team {
                          id
                          slug
                        }
                        user {
                          id
                          dbid
                          name
                          is_active
                          number_of_teams
                          source {
                            id
                            image
                            description
                            created_at
                            account_sources(first: 10000) {
                              edges {
                                node {
                                  account {
                                    id
                                    url
                                    provider
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                      source {
                        id,
                        dbid,
                        image,
                      }
                    }
                  }
                }
              }
            }
            assignments(first: 10000) {
              edges {
                node {
                  name
                  id
                  dbid
                  team_user(team_slug: $teamSlug) {
                    id
                    status
                    role
                    team {
                      id
                      slug
                    }
                    user {
                      id
                      dbid
                      name
                      is_active
                      number_of_teams
                      source {
                        id
                        image
                        description
                        created_at
                        account_sources(first: 10000) {
                          edges {
                            node {
                              account {
                                id
                                url
                                provider
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  source {
                    id
                    dbid
                    image
                  }
                }
              }
            }
            first_response_value
            first_response {
              id,
              dbid,
              permissions,
              content,
              file_data,
              attribution(first: 10000) {
                edges {
                  node {
                    id
                    dbid
                    name
                    team_user(team_slug: $teamSlug) {
                      id
                      status
                      role
                      team {
                        id
                        slug
                      }
                      user {
                        id
                        dbid
                        name
                        is_active
                        number_of_teams
                        source {
                          id
                          image
                          description
                          created_at
                          account_sources(first: 10000) {
                            edges {
                              node {
                                account {
                                  id
                                  url
                                  provider
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                    source {
                      id
                      dbid
                      image
                    }
                  }
                }
              }
              annotator {
                name,
                profile_image,
                user {
                  id,
                  dbid,
                  name,
                  is_active
                  team_user(team_slug: $teamSlug) {
                    id
                    status
                    role
                    team {
                      id
                      slug
                    }
                    user {
                      id
                      dbid
                      name
                      is_active
                      number_of_teams
                      source {
                        id
                        image
                        description
                        created_at
                        account_sources(first: 10000) {
                          edges {
                            node {
                              account {
                                id
                                url
                                provider
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  source {
                    id,
                    dbid,
                    image,
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
});
