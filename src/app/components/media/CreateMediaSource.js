import React, { Component } from 'react';
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
import CancelIcon from '@material-ui/icons/Cancel';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import LinkifyIt from 'linkify-it';
import Relay from 'react-relay/classic';
import styled from 'styled-components';
import { withStyles } from '@material-ui/core/styles';
import Message from '../Message';
import UploadFile from '../UploadFile';
import CreateSourceMutation from '../../relay/mutations/CreateSourceMutation';
import SourcePicture from '../source/SourcePicture';
import globalStrings from '../../globalStrings';
import { getErrorMessage } from '../../helpers';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import {
  Row,
  units,
  StyledIconButton,
} from '../../styles/js/shared';
import {
  StyledAvatarEditButton,
  StyledTwoColumns,
  StyledSmallColumn,
  StyledBigColumn,
  StyledName,
} from '../../styles/js/HeaderCard';

const StyledWordBreakDiv = styled.div`
  width: 100%;
  hyphens: auto;
  overflow-wrap: break-word;
  word-break: break-word;
`;

const styles = theme => ({
  headerRow: {
    display: 'flex',
    alignItems: 'top',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
  },
});

class CreateMediaSource extends Component {
  constructor(props) {
    super(props);

    this.state = {
      expandName: true,
      expandAccounts: true,
      sourceName: null,
      primaryUrl: { url: '', error: '' },
      submitDisabled: true,
    };
  }

  handleChangePrimaryLink(e) {
    const { primaryUrl } = this.state;
    primaryUrl.url = e.target.value;
    primaryUrl.error = '';
    this.setState({ primaryUrl });
  }

  handleChangeLink(e, index) {
    const links = this.state.links ? this.state.links.slice(0) : [];
    links[index].url = e.target.value;
    links[index].error = '';
    this.setState({ links });
  }

  handleChangeName(e) {
    const submitDisabled = e.target.value.length === 0;
    this.setState({ sourceName: e.target.value, submitDisabled });
  }

  handleImageChange = (file) => {
    this.setState({ image: file, message: null });
  }

  handleImageError = (file, message) => {
    this.setState({ message, image: null });
  }

  handleEditProfileImg() {
    this.setState({ editProfileImg: true });
  }

  handleRemoveNewLink(index) {
    const links = this.state.links ? this.state.links.slice(0) : [];
    links.splice(index, 1);
    this.setState({ links });
  }

  handleAddLink() {
    const links = this.state.links ? this.state.links.slice(0) : [];
    const newEntry = {};
    newEntry.url = '';
    newEntry.error = '';
    links.push(newEntry);
    this.setState({ links });
  }

  validatePrimaryLink() {
    const linkify = new LinkifyIt();
    const { primaryUrl } = this.state;
    if (primaryUrl.url.trim()) {
      const validateUrl = linkify.match(primaryUrl.url);
      if (Array.isArray(validateUrl) && validateUrl[0] && validateUrl[0].url) {
        return true;
      }
      primaryUrl.error = (
        <FormattedMessage
          id="sourceInfo.invalidLink"
          defaultMessage="Please enter a valid URL"
          description="Error message for invalid link"
        />
      );
      this.setState({ primaryUrl });
      return false;
    }
    return true;
  }

  validateLinks() {
    const linkify = new LinkifyIt();

    let success = true;

    let links = this.state.links ? this.state.links.slice(0) : [];
    links = links.filter(link => !!link.url.trim());

    links.forEach((item_) => {
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

    this.setState({ links });
    return success;
  }

  handleCancelOrSave() {
    this.props.onCancel();
  }

  handleSave() {
    if (!this.state.submitDisabled && this.validateLinks() && this.validatePrimaryLink()) {
      this.setState({ submitDisabled: true });
      const urls = [];
      const { primaryUrl } = this.state;
      let links = this.state.links ? this.state.links.slice(0) : [];
      links = [primaryUrl].concat(links);
      links = links.filter(link => !!link.url.trim());
      links.forEach((link) => {
        urls.push(link.url);
      });

      const onFailure = (transaction) => {
        this.setState({ submitDisabled: false });
        const message = getErrorMessage(transaction, <GenericUnknownErrorMessage />);
        this.setState({ message });
      };

      const onSuccess = () => {
        this.handleCancelOrSave();
      };

      Relay.Store.commitUpdate(
        new CreateSourceMutation({
          name: this.state.sourceName,
          slogan: this.state.sourceName,
          image: this.state.image,
          urls,
          project_media: this.props.media,
        }),
        { onSuccess, onFailure },
      );
    }
    return true;
  }

  render() {
    const { classes } = this.props;
    const links = this.state.links ? this.state.links.slice(0) : [];

    return (
      <React.Fragment>
        <div id="media-source-create-new" style={this.props.style}>
          <div className="source__create-buttons-cancel-save" style={{ textAlign: 'right' }}>
            <Button
              className="source__edit-cancel-button"
              onClick={this.handleCancelOrSave.bind(this)}
            >
              <FormattedMessage {...globalStrings.cancel} />
            </Button>
            <Button
              variant="contained"
              color="primary"
              className="source__edit-save-button"
              onClick={this.handleSave.bind(this)}
              disabled={this.state.submitDisabled}
            >
              <FormattedMessage {...globalStrings.save} />
            </Button>
          </div>
          <Message message={this.state.message} />
          <div className={classes.headerRow}>
            <StyledTwoColumns>
              <StyledSmallColumn>
                <SourcePicture
                  type="user"
                  className="source__avatar"
                />
                {!this.state.editProfileImg ?
                  <StyledAvatarEditButton className="source__edit-avatar-button">
                    <Button
                      onClick={this.handleEditProfileImg.bind(this)}
                      color="primary"
                    >
                      <FormattedMessage {...globalStrings.edit} />
                    </Button>
                  </StyledAvatarEditButton>
                  : null}
              </StyledSmallColumn>
              <StyledBigColumn>
                <div className="source__primary-info">
                  {this.state.editProfileImg ?
                    <div>
                      <Message message={this.state.message} />
                      <UploadFile
                        type="image"
                        value={this.state.image}
                        onChange={this.handleImageChange}
                        onError={this.handleImageError}
                      />
                    </div>
                    : null}
                  <StyledName className="source__name">
                    <Row>
                      {this.state.sourceName ?
                        this.state.sourceName :
                        <FormattedMessage
                          id="sourceInfo.createNew"
                          defaultMessage="Create new"
                          description="Create a new media source label"
                        />
                      }
                    </Row>
                  </StyledName>
                  <div style={{ textDecoration: 'underline' }}>
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
          <StyledWordBreakDiv>
            <Box clone mb={1}>
              <Card
                id="source-create-name__card"
                className="source__card-card"
                style={{ marginBottom: units(1) }}
              >
                <CardHeader
                  className="source__card-header"
                  style={{ paddingBottom: '0px' }}
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
                      onClick={() => this.setState({ expandName: !this.state.expandName })}
                    >
                      <KeyboardArrowDown />
                    </IconButton>
                  }
                />
                <Collapse in={this.state.expandName} timeout="auto">
                  <CardContent className="source__card-text">
                    <Row>
                      <TextField
                        id="source__name-input"
                        name="source__name-input"
                        value={this.state.sourceName}
                        label={
                          <FormattedMessage
                            id="sourceInfo.sourceName"
                            defaultMessage="Add name"
                            description="label for create source name"
                          />
                        }
                        error={this.state.sourceError}
                        helperText={this.state.sourceError}
                        onChange={e => this.handleChangeName(e)}
                        style={{ width: '100%' }}
                        margin="normal"
                        required
                      />
                    </Row>
                  </CardContent>
                </Collapse>
              </Card>
            </Box>
          </StyledWordBreakDiv>
          <StyledWordBreakDiv style={{ paddingTop: '10px' }}>
            <Box clone mb={1}>
              <Card
                id="source-create-accounts"
                className="source__card-card"
                style={{ marginBottom: units(1) }}
              >
                <CardHeader
                  className="source__card-header"
                  style={{ paddingBottom: '0px' }}
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
                      onClick={() => this.setState({ expandAccounts: !this.state.expandAccounts })}
                    >
                      <KeyboardArrowDown />
                    </IconButton>
                  }
                />
                <Collapse in={this.state.expandAccounts} timeout="auto">
                  <CardContent className="source__card-text">
                    <Row>
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
                        value={this.state.primaryUrl.url}
                        error={this.state.primaryUrl.error}
                        helperText={this.state.primaryUrl.error}
                        onChange={e => this.handleChangePrimaryLink(e)}
                        style={{ width: '100%' }}
                        margin="normal"
                      />
                    </Row>
                    {links.length === 0 ?
                      null :
                      <h2>
                        <FormattedMessage
                          id="sourceInfo.secondaryAccounts"
                          defaultMessage="Secondary source URLs"
                          description="URLs for source accounts except first account"
                        />
                      </h2>
                    }
                    {links.map((link, index) => (
                      <div key={index.toString()} className="source__url-input">
                        <Row>
                          <TextField
                            id={`source__link-input${index.toString()}`}
                            name={`source__link-input${index.toString()}`}
                            value={link.url}
                            error={link.error}
                            helperText={link.error}
                            label={
                              <FormattedMessage
                                id="sourceInfo.addSecondaryLink"
                                defaultMessage="Add a secondary URL"
                                description="Label for add a new source secondary URL"
                              />
                            }
                            onChange={e => this.handleChangeLink(e, index)}
                            style={{ width: '85%' }}
                            margin="normal"
                          />
                          <StyledIconButton
                            className="source__remove-link-button"
                            onClick={() => this.handleRemoveNewLink(index)}
                          >
                            <CancelIcon />
                          </StyledIconButton>
                        </Row>
                      </div>))}
                    <Row>
                      <div>
                        <Button
                          onClick={this.handleAddLink.bind(this)}
                          startIcon={<AddCircleOutlineIcon />}
                        >
                          <FormattedMessage
                            id="sourceInfo.addLink"
                            defaultMessage="Add a secondary URL"
                            description="allow user to relate a new link to media source"
                          />
                        </Button>
                      </div>
                    </Row>
                  </CardContent>
                </Collapse>
              </Card>
            </Box>
          </StyledWordBreakDiv>
        </div>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(CreateMediaSource);
