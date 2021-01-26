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
import { Link } from 'react-router';
import LinkifyIt from 'linkify-it';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import CancelIcon from '@material-ui/icons/Cancel';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import { makeStyles } from '@material-ui/core/styles';
import { can } from '../Can';
import CreateAccountSourceMutation from '../../relay/mutations/CreateAccountSourceMutation';
import DeleteAccountSourceMutation from '../../relay/mutations/DeleteAccountSourceMutation';
import SourcePicture from './SourcePicture';
import { urlFromSearchQuery } from '../search/Search';
import SourceTasks from './SourceTasks';
import { getErrorMessage } from '../../helpers';
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
}));

function SourceInfo({ source, team, onChangeClick }) {
  const [expandName, setExpandName] = React.useState(true);
  const [expandAccounts, setExpandAccounts] = React.useState(true);
  const [sourceName, setSourceName] = React.useState(source.name);
  const [sourceError, setSourceError] = React.useState('');
  const [secondaryUrl, setSecondaryUrl] = React.useState({ url: '', error: '', addNewLink: false });
  const [primaryUrl, setPrimaryUrl] = React.useState({ url: '', error: '' });

  const classes = useStyles();

  const handleRemoveLink = (asId) => {
    const onFailure = () => {};
    const onSuccess = () => {};

    Relay.Store.commitUpdate(
      new DeleteAccountSourceMutation({
        id: asId,
        source,
      }),
      { onSuccess, onFailure },
    );
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

  const handleNameKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (sourceName && source.name !== sourceName) {
        const onFailure = (transaction) => {
          const message = getErrorMessage(transaction, <GenericUnknownErrorMessage />);
          setSourceError(message);
        };

        const onSuccess = () => {
          setSourceError('');
        };

        commitMutation(Relay.Store, {
          mutation: graphql`
            mutation SourceInfoUpdateNameMutation($input: UpdateSourceInput!) {
              updateSource(input: $input) {
                source {
                  name
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
            if (errors) {
              return onFailure(errors);
            }
            return onSuccess(data);
          },
        });
      }
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
    if (e.key === 'Enter' && !e.shiftKey) {
      const value = e.target.value.trim();
      if (!value) {
        return;
      }
      const linkify = new LinkifyIt();
      const validateUrl = linkify.match(value);
      if (Array.isArray(validateUrl) && validateUrl[0] && validateUrl[0].url) {
        const { url } = validateUrl[0];
        const onFailure = (transaction) => {
          const message = getErrorMessage(transaction, <GenericUnknownErrorMessage />);
          handleAddLinkFail(type, message);
        };
        const onSuccess = () => {
          if (type === 'primary') {
            setPrimaryUrl({ url: '', error: '' });
          } else {
            setSecondaryUrl({ url: '', error: '', addNewLink: false });
          }
        };
        Relay.Store.commitUpdate(
          new CreateAccountSourceMutation({
            id: source.dbid,
            url,
            source,
          }),
          { onSuccess, onFailure },
        );
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
    }
  };

  const accountSources = source.account_sources.edges;
  const mainAccount = accountSources[0];
  const secondaryAccounts = accountSources.slice(1);
  const sourceMediasLink = urlFromSearchQuery({ sources: [source.dbid] }, `/${team.slug}/all-items`);

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
            <Link to={sourceMediasLink}>
              <FormattedMessage
                id="sourceInfo.mediasCount"
                defaultMessage="{mediasCount, plural, one {1 item} other {# items}}"
                description="show source media counts"
                values={{
                  mediasCount: source.medias_count || 0,
                }}
              />
            </Link>
          </StyledBigColumn>
        </StyledTwoColumns>
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
        </Button>
      </div>
      <Box clone mb={2}>
        <Card
          id={`source__card-${source.dbid}`}
          className="source__card-card"
        >
          <CardHeader
            className="source__card-header"
            disableTypography
            title={
              <FormattedMessage
                id="sourceInfo.mainName"
                defaultMessage="Main name"
                description="souce name"
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
            <CardContent>
              <TextField
                id="source__name-input"
                name="source__name-input"
                value={sourceName}
                disabled={!can(source.permissions, 'update Source')}
                error={Boolean(sourceError)}
                helperText={sourceError}
                onKeyPress={(e) => { handleNameKeyPress(e); }}
                onChange={(e) => { setSourceName(e.target.value); }}
                margin="normal"
                fullWidth
              />
            </CardContent>
          </Collapse>
        </Card>
      </Box>
      <Box clone mb={2}>
        <Card
          id={`source-accounts-${source.dbid}`}
          className="source__card-card"
        >
          <CardHeader
            className="source__card-header"
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
            <CardContent>
              <Box mb={2}>
                { mainAccount ?
                  <TextField
                    id="main_source__link"
                    value={mainAccount.node.account.url}
                    margin="normal"
                    fullWidth
                    disabled
                  /> : null
                }
                { !mainAccount && can(source.permissions, 'create Account') ?
                  <TextField
                    id="source_primary__link-input"
                    name="source_primary__link-input"
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
                    onKeyPress={(e) => { createAccountSource(e, 'primary'); }}
                    onChange={(e) => { handleChangeLink(e, 'primary'); }}
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
                    value={secondaryUrl.url}
                    error={Boolean(secondaryUrl.error)}
                    helperText={secondaryUrl.error}
                    onKeyPress={(e) => { createAccountSource(e, 'secondary'); }}
                    onChange={(e) => { handleChangeLink(e, 'secondary'); }}
                    margin="normal"
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
                  onClick={() => { setSecondaryUrl({ url: '', error: '', addNewLink: true }); }}
                  disabled={Boolean(secondaryUrl.addNewLink || !mainAccount || primaryUrl.error)}
                  startIcon={<AddCircleOutlineIcon />}
                >
                  <FormattedMessage
                    id="sourceInfo.addLink"
                    defaultMessage="Add a secondary URL"
                    description="allow user to relate a new link to media source"
                  />
                </Button> : null
              }
            </CardContent>
          </Collapse>
        </Card>
      </Box>
      { source !== null ?
        <SourceTasks key={source.id} source={source} fieldset="metadata" />
        : null
      }
    </div>
  );
}

SourceInfo.propTypes = {
  team: PropTypes.object.isRequired, // GraphQL "Team" object (current team)
  source: PropTypes.object.isRequired, // GraphQL "Source" object
  onChangeClick: PropTypes.func.isRequired, // func(<SourceId>) => undefined
};

export default createFragmentContainer(SourceInfo, {
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
            pending_suggestions_count
            suggestions_count
            log_count
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
