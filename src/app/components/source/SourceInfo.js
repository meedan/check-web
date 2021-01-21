import React from 'react';
import { graphql, commitMutation } from 'react-relay/compat';
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

  const updateName = (value) => {
    if (value && source.name !== value) {
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
            name: value,
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
  };

  const handleAddLinkFail = (type, message) => {
    if (type === 'primary') {
      primaryUrl.error = message;
      setPrimaryUrl(primaryUrl);
    } else {
      secondaryUrl.error = message;
      setSecondaryUrl(secondaryUrl);
    }
  };

  const createAccountSource = (type, value) => {
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
          setPrimaryUrl({ primaryUrl: { url: '', error: '' } });
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
                error={sourceError.length !== 0}
                helperText={sourceError}
                onBlur={(e) => { updateName(e.target.value); }}
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
                    error={primaryUrl.error.length !== 0}
                    helperText={primaryUrl.error}
                    onBlur={(e) => { createAccountSource('primary', e.target.value.trim()); }}
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
                    error={secondaryUrl.error.length !== 0}
                    helperText={secondaryUrl.error}
                    onBlur={(e) => { createAccountSource('secondary', e.target.value.trim()); }}
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
    </div>
  );
}

export default SourceInfo;
