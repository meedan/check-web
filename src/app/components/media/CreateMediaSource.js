/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Collapse from '@material-ui/core/Collapse';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import CancelIcon from '@material-ui/icons/Cancel';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import LinkifyIt from 'linkify-it';
import { makeStyles } from '@material-ui/core/styles';
import Message from '../Message';
import CreateSourceMutation from '../../relay/mutations/CreateSourceMutation';
import SourcePicture from '../source/SourcePicture';
import SetSourceDialog from './SetSourceDialog';
import globalStrings from '../../globalStrings';
import { getErrorObjects, getErrorMessage } from '../../helpers';
import CheckError from '../../CheckError';
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
  cancelSaveRow: {
    display: 'flex',
    gap: `${theme.spacing(1)}px`,
    padding: `${theme.spacing(1)}px 0`,
    flexDirection: 'row-reverse',
  },
  linkedText: {
    color: 'blue',
    textDecoration: 'underline',
  },
  sourceCardHeader: {
    paddingBottom: 0,
  },
  sourceCardContent: {
    paddingTop: 0,
  },
}));

function CreateMediaSource({
  media,
  onCancel,
  relateToExistingSource,
  name,
}) {
  const [expandName, setExpandName] = React.useState(true);
  const [expandAccounts, setExpandAccounts] = React.useState(true);
  const [sourceName, setSourceName] = React.useState(name || '');
  const [primaryUrl, setPrimaryUrl] = React.useState({ url: '', error: '' });
  const [submitDisabled, setSubmitDisabled] = React.useState(!name);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [validatePrimaryLinkExist, setValidatePrimaryLinkExist] = React.useState(true);
  const [links, setLinks] = React.useState([]);
  const [message, setMessage] = React.useState(null);
  const [existingSource, setExistingSource] = React.useState({});

  const classes = useStyles();

  const handleChangeLink = (e, index) => {
    const newLinks = links.slice();
    newLinks[index].url = e.target.value;
    newLinks[index].error = '';
    setLinks(newLinks);
  };

  const handleChangeName = (e) => {
    const submitDisabledValue = e.target.value.length === 0;
    setSourceName(e.target.value);
    setSubmitDisabled(submitDisabledValue);
  };

  const handleRemoveNewLink = (index) => {
    const newLinks = links.slice();
    newLinks.splice(index, 1);
    setLinks(newLinks);
  };

  const handleAddLink = () => {
    const newLinks = links.slice();
    newLinks.push({ url: '', error: '' });
    setLinks(newLinks);
  };

  const validatePrimaryLink = () => {
    const linkify = new LinkifyIt();
    if (primaryUrl.url.trim()) {
      if (!/^https?:\/\//.test(primaryUrl.url)) {
        primaryUrl.url = `http://${primaryUrl.url}`; // Pender will turn into HTTPS if available
      }
      const validateUrl = linkify.match(primaryUrl.url);
      if (Array.isArray(validateUrl) && validateUrl[0] && validateUrl[0].url) {
        return true;
      }
      const error = (
        <FormattedMessage
          id="sourceInfo.invalidLink"
          defaultMessage="Please enter a valid URL"
          description="Error message for invalid link"
        />
      );
      setPrimaryUrl({ url: primaryUrl.url, error });
      return false;
    }
    return true;
  };

  const validateLinks = () => {
    const linkify = new LinkifyIt();

    let success = true;

    const newLinks = links.slice().filter(link => !!link.url.trim()).map((link) => {
      let { url } = link;
      if (!/^https?:\/\//.test(link)) {
        url = `http://${url}`; // Pender will turn into HTTPS if available
      }
      return { ...link, url };
    });

    newLinks.forEach((item_) => {
      const item = item_;
      const url = linkify.match(item.url);
      if (Array.isArray(url) && url[0] && url[0].url) {
        item.url = url[0].url;
      } else {
        item.error = (
          <FormattedMessage
            id="sourceInfo.invalidLink"
            defaultMessage="Please enter a valid URL"
            description="Error message for invalid link"
          />
        );
        success = false;
      }
    });

    setLinks(newLinks);
    return success;
  };

  const handleCancelOrSave = () => {
    onCancel();
  };

  const handleCancelDialog = () => {
    setDialogOpen(false);
    setValidatePrimaryLinkExist(false);
  };

  const handleSubmitDialog = () => {
    relateToExistingSource({ dbid: existingSource.id });
  };

  const handleSave = () => {
    if (!submitDisabled && validateLinks() && validatePrimaryLink()) {
      setSubmitDisabled(true);
      const urls = [];
      let newLinks = [primaryUrl].concat(links);
      newLinks = newLinks.filter(link => !!link.url.trim());
      newLinks.forEach((link) => {
        urls.push(link.url);
      });

      const onFailure = (transaction) => {
        setSubmitDisabled(false);
        const error = getErrorObjects(transaction);
        if (Array.isArray(error) && error.length > 0) {
          if (error[0].code === CheckError.codes.DUPLICATED) {
            setDialogOpen(true);
            setExistingSource(error[0].data);
          } else {
            const messageError = getErrorMessage(transaction, <GenericUnknownErrorMessage />);
            setMessage(messageError);
          }
        }
      };

      const onSuccess = () => {
        handleCancelOrSave();
      };

      Relay.Store.commitUpdate(
        new CreateSourceMutation({
          name: sourceName,
          slogan: sourceName,
          urls,
          validate_primary_link_exist: validatePrimaryLinkExist,
          project_media: media,
        }),
        { onSuccess, onFailure },
      );
    }
    return true;
  };

  return (
    <React.Fragment>
      <div className={classes.cancelSaveRow}>
        <Button
          className="source__edit-cancel-button"
          onClick={handleCancelOrSave}
        >
          <FormattedMessage {...globalStrings.cancel} />
        </Button>
        <Button
          variant="outlined"
          color="primary"
          className="source__edit-save-button"
          onClick={handleSave}
          disabled={submitDisabled}
        >
          <FormattedMessage
            id="createMediaSource.createSource"
            defaultMessage="Create source"
            description="Label for button to create a new source"
          />
        </Button>
      </div>
      <Message message={message} />
      <div className={classes.headerRow}>
        <StyledTwoColumns>
          <StyledSmallColumn>
            <SourcePicture
              type="user"
              className="source__avatar"
            />
          </StyledSmallColumn>
          <StyledBigColumn>
            <div className="source__primary-info">
              <StyledName className="source__name">
                <Row>
                  {sourceName.length !== 0 ?
                    sourceName :
                    <FormattedMessage
                      id="sourceInfo.createNew"
                      defaultMessage="Create new"
                      description="Create a new media source label"
                    />
                  }
                </Row>
              </StyledName>
              <div className={classes.linkedText}>
                <FormattedMessage
                  id="sourceInfo.mediasCount"
                  defaultMessage="{mediasCount, plural, one {1 item} other {# items}}"
                  description="show source media counts"
                  values={{
                    mediasCount: 0,
                  }}
                />
              </div>
            </div>
          </StyledBigColumn>
        </StyledTwoColumns>
      </div>
      <Box clone mb={2}>
        <Card
          id="source-create-name__card"
          className="source__card-card"
        >
          <CardHeader
            className={['source__card-header', classes.sourceCardHeader].join(' ')}
            disableTypography
            title={
              <FormattedMessage
                id="sourceInfo.mainName"
                defaultMessage="Main name"
                description="souce name"
              />
            }
            id="source-create__label"
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
            <CardContent className={['source__card-text', classes.sourceCardContent].join(' ')}>
              <TextField
                id="source__name-input"
                name="source__name-input"
                value={sourceName}
                label={
                  <FormattedMessage
                    id="sourceInfo.sourceName"
                    defaultMessage="Add name"
                    description="label for create source name"
                  />
                }
                onChange={e => handleChangeName(e)}
                margin="normal"
                variant="outlined"
                fullWidth
                required
              />
            </CardContent>
          </Collapse>
        </Card>
      </Box>
      <Box clone mb={2}>
        <Card
          id="source-create-accounts"
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
            id="source-create__accounts"
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
            <CardContent className={['source__card-text', classes.sourceCardContent].join(' ')}>
              <TextField
                id="source_primary__link-input"
                name="source_primary__link-input"
                variant="outlined"
                label={
                  <FormattedMessage
                    id="sourceInfo.primaryLink"
                    defaultMessage="Add main source URL"
                    description="Allow user to add a main source URL"
                  />
                }
                value={primaryUrl.url ? primaryUrl.url.replace(/^https?:\/\//, '') : ''}
                error={Boolean(primaryUrl.error)}
                helperText={primaryUrl.error}
                onChange={(e) => { setPrimaryUrl({ url: e.target.value, error: '' }); }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">http(s)://</InputAdornment>
                  ),
                }}
                fullWidth
                margin="normal"
              />
              <Box mb={2}>
                { links.length === 0 ?
                  null :
                  <h2>
                    <FormattedMessage
                      id="sourceInfo.secondaryAccounts"
                      defaultMessage="Secondary source URLs"
                      description="URLs for source accounts except first account"
                    />
                  </h2>
                }
                { links.map((link, index) => (
                  <Row key={index.toString()} className="source__url-input">
                    <TextField
                      id={`source__link-input${index.toString()}`}
                      name={`source__link-input${index.toString()}`}
                      value={link.url ? link.url.replace(/^https?:\/\//, '') : ''}
                      error={Boolean(link.error)}
                      helperText={link.error}
                      variant="outlined"
                      label={
                        <FormattedMessage
                          id="sourceInfo.addSecondaryLink"
                          defaultMessage="Add a secondary URL"
                          description="Label for add a new source secondary URL"
                        />
                      }
                      onChange={(e) => { handleChangeLink(e, index); }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">http(s)://</InputAdornment>
                        ),
                      }}
                      margin="normal"
                      fullWidth
                    />
                    <StyledIconButton
                      className="source__remove-link-button"
                      onClick={() => handleRemoveNewLink(index)}
                    >
                      <CancelIcon />
                    </StyledIconButton>
                  </Row>))}
              </Box>
              <Button
                onClick={() => handleAddLink()}
                startIcon={<AddCircleOutlineIcon />}
              >
                <FormattedMessage
                  id="sourceInfo.addLink"
                  defaultMessage="Add a secondary URL"
                  description="allow user to relate a new link to media source"
                />
              </Button>
            </CardContent>
          </Collapse>
        </Card>
      </Box>
      {dialogOpen ?
        <SetSourceDialog
          open={dialogOpen}
          sourceName={existingSource.name}
          primaryUrl={primaryUrl.url}
          onSubmit={handleSubmitDialog}
          onCancel={handleCancelDialog}
        /> : null
      }
    </React.Fragment>
  );
}

CreateMediaSource.defaultProps = {
  name: '',
};

CreateMediaSource.propTypes = {
  media: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
  relateToExistingSource: PropTypes.func.isRequired,
  name: PropTypes.string,
};

export default CreateMediaSource;
