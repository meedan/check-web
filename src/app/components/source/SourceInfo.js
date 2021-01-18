import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Collapse from '@material-ui/core/Collapse';
import { Link } from 'react-router';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import CancelIcon from '@material-ui/icons/Cancel';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import { withStyles } from '@material-ui/core/styles';
import Relay from 'react-relay/classic';
import styled from 'styled-components';
import Message from '../Message';
import UploadFile from '../UploadFile';
import { can } from '../Can';
import UpdateSourceMutation from '../../relay/mutations/UpdateSourceMutation';
import CreateAccountSourceMutation from '../../relay/mutations/CreateAccountSourceMutation';
import DeleteAccountSourceMutation from '../../relay/mutations/DeleteAccountSourceMutation';
import SourcePicture from './SourcePicture';
import globalStrings from '../../globalStrings';
import { urlFromSearchQuery } from '../search/Search';
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

const styles = {
  headerRow: {
    display: 'flex',
    alignItems: 'top',
    justifyContent: 'space-between',
  },
};

class SourceInfo extends Component {
  static handleRemoveLink(asId, source) {
    const onFailure = () => {};
    const onSuccess = () => {};

    Relay.Store.commitUpdate(
      new DeleteAccountSourceMutation({
        id: asId,
        source,
      }),
      { onSuccess, onFailure },
    );
  }

  constructor(props) {
    super(props);

    const sourceName = props.source ? props.source.name : '';

    this.state = {
      expandName: true,
      expandAccounts: true,
      sourceName,
      sourceError: '',
      secondaryUrl: { url: '', error: '', addNewLink: false },
      primaryUrl: { url: '', error: '', addNewLink: false },
    };
  }

  handleChangeLink(e, type) {
    if (type === 'primary') {
      const { primaryUrl } = this.state;
      primaryUrl.url = e.target.value;
      this.setState({ primaryUrl });
    } else {
      const { secondaryUrl } = this.state;
      secondaryUrl.url = e.target.value;
      this.setState({ secondaryUrl });
    }
  }

  handleChangeName(e) {
    this.setState({ sourceName: e.target.value });
  }

  updateName = (ev, source) => {
    if (ev.key === 'Enter' && !ev.shiftKey) {
      ev.preventDefault();
      this.updateSource('name', source);
      this.setState({ sourceError: '' });
    }
  };

  handleKeyPress = (ev, source, type) => {
    if (ev.key === 'Enter' && !ev.shiftKey) {
      ev.preventDefault();
      this.createAccountSource(type, source);
    }
  };

  createAccountSource(type, source) {
    const onFailure = (transaction) => {
      const message = getErrorMessage(transaction, <GenericUnknownErrorMessage />);
      if (type === 'primary') {
        const { primaryUrl } = this.state;
        primaryUrl.error = message;
        this.setState({ primaryUrl });
      } else {
        const { secondaryUrl } = this.state;
        secondaryUrl.error = message;
        this.setState({ secondaryUrl });
      }
    };

    const onSuccess = () => {
      if (type === 'primary') {
        this.setState({ primaryUrl: { url: '', error: '', addNewLink: false } });
      } else {
        this.handleRemoveNewLink();
      }
    };

    const url = type === 'primary' ? this.state.primaryUrl.url : this.state.secondaryUrl.url;
    if (!url) {
      return;
    }

    Relay.Store.commitUpdate(
      new CreateAccountSourceMutation({
        id: source.dbid,
        url,
        source,
      }),
      { onSuccess, onFailure },
    );
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

  handleCancelEditProfileImg() {
    this.setState({ editProfileImg: false, message: null });
  }

  updateSource(type, source) {
    const onFailure = (transaction) => {
      const message = getErrorMessage(transaction, <GenericUnknownErrorMessage />);
      if (type === 'name') {
        this.setState({ sourceError: message });
      } else {
        this.setState({ message });
      }
    };

    const onSuccess = () => {
      this.setState({ editProfileImg: false, message: null });
    };

    const { sourceName, image } = this.state;

    if (source.name === sourceName && !this.state.image) {
      return false;
    }

    Relay.Store.commitUpdate(
      new UpdateSourceMutation({
        source: {
          id: source.id,
          name: sourceName,
          image,
        },
      }),
      { onSuccess, onFailure },
    );

    return true;
  }

  handleRemoveNewLink() {
    this.setState({ secondaryUrl: { url: '', error: '', addNewLink: false } });
  }

  handleAddLink() {
    this.setState({ secondaryUrl: { url: '', error: '', addNewLink: true } });
  }

  updateImage(e, source) {
    this.updateSource('image', source);
    this.setState({ message: null });
  }

  handleCancel() {
    this.setState({ editProfileImg: false });
  }

  render() {
    const { classes, team, source } = this.props;
    const accountSources = source.account_sources.edges;
    const mainAccount = accountSources[0];
    const secondaryAccounts = accountSources.slice(1);
    const sourceMediasLink = urlFromSearchQuery({ sources: [source.dbid] }, `/${team.slug}/all-items`);

    return (
      <React.Fragment>
        <div id={`source-${source.dbid}`} style={this.props.style}>
          <div className={classes.headerRow}>
            <StyledTwoColumns>
              <StyledSmallColumn>
                <SourcePicture
                  object={source}
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
                      <div className="source__edit-buttons-cancel-save">
                        <Button
                          className="source__edit-cancel-button"
                          onClick={this.handleCancelEditProfileImg.bind(this)}
                        >
                          <FormattedMessage {...globalStrings.cancel} />
                        </Button>
                        <Button
                          className="source__edit-save-button"
                          disabled={!this.state.image}
                          onClick={e => this.updateImage(e, source)}
                        >
                          <FormattedMessage {...globalStrings.save} />
                        </Button>
                      </div>
                    </div>
                    : null}
                  <StyledName className="source__name">
                    <Row>
                      {this.state.sourceName}
                    </Row>
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
                </div>
              </StyledBigColumn>
            </StyledTwoColumns>
            <div id="media-source-change">
              <Button
                style={{
                  color: 'blue',
                  textDecoration: 'underline',
                }}
              >
                <FormattedMessage
                  id="mediaSource.changeSource"
                  defaultMessage="Change"
                  description="allow user to change a project media source"
                />
              </Button>
            </div>
          </div>
          <StyledWordBreakDiv>
            <Box clone mb={1}>
              <Card
                id={`source__card-${source.dbid}`}
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
                  id={`source__label-${source.id}`}
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
                  <CardContent>
                    <Row>
                      <TextField
                        id="source__name-input"
                        name="source__name-input"
                        value={this.state.sourceName}
                        disabled={!can(source.permissions, 'update Source')}
                        error={this.state.sourceError.length !== 0}
                        helperText={this.state.sourceError}
                        onKeyPress={e => this.updateName(e, source)}
                        onChange={e => this.handleChangeName(e)}
                        style={{ width: '100%' }}
                        margin="normal"
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
                id={`source-accounts-${source.dbid}`}
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
                  id={`source__accounts-${source.id}`}
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
                  <CardContent>
                    <Row>
                      {mainAccount ?
                        <TextField
                          id="main_source__link"
                          defaultValue={mainAccount.node.account.url}
                          style={{ width: '100%' }}
                          margin="normal"
                          disabled
                        /> : null
                      }
                      {!mainAccount && can(source.permissions, 'create Account') ?
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
                          error={this.state.primaryUrl.error.length !== 0}
                          helperText={this.state.primaryUrl.error}
                          onKeyPress={e => this.handleKeyPress(e, source, 'primary')}
                          onChange={e => this.handleChangeLink(e, 'primary')}
                          style={{ width: '100%' }}
                          margin="normal"
                        /> : null
                      }
                    </Row>
                    {secondaryAccounts.length === 0 ?
                      null :
                      <h2>
                        <FormattedMessage
                          id="sourceInfo.secondaryAccounts"
                          defaultMessage="Secondary source URLs"
                          description="URLs for source accounts except first account"
                        />
                      </h2>
                    }
                    {secondaryAccounts.map((as, index) => (
                      <div key={as.node.id} className="source__url">
                        <Row>
                          <TextField
                            id={`source__link-item${index.toString()}`}
                            defaultValue={as.node.account.url}
                            style={{ width: '100%' }}
                            margin="normal"
                            disabled
                          />
                          {can(as.node.permissions, 'destroy AccountSource') ?
                            <StyledIconButton
                              className="source__remove-link-button"
                              onClick={() => SourceInfo.handleRemoveLink(as.node.id, source)}
                            >
                              <CancelIcon />
                            </StyledIconButton> : null
                          }
                        </Row>
                      </div>))}
                    { this.state.secondaryUrl.addNewLink ?
                      <div key="source-add-new-link" className="source__url-input">
                        <Row>
                          <TextField
                            id="source__link-input-new"
                            name="source__link-input-new"
                            value={this.state.secondaryUrl.url}
                            error={this.state.secondaryUrl.error.length !== 0}
                            helperText={this.state.secondaryUrl.error}
                            onKeyPress={e => this.handleKeyPress(e, source, 'secondary')}
                            onChange={e => this.handleChangeLink(e, 'secondary')}
                            style={{ width: '100%' }}
                            margin="normal"
                          />
                          <StyledIconButton
                            className="source__remove-link-button"
                            onClick={this.handleRemoveNewLink.bind(this)}
                          >
                            <CancelIcon />
                          </StyledIconButton>
                        </Row>
                      </div> : null
                    }
                    {can(source.permissions, 'create Account') ?
                      <Row>
                        <div>
                          <Button
                            onClick={this.handleAddLink.bind(this)}
                            disabled={this.state.secondaryUrl.addNewLink}
                          >
                            <AddCircleOutlineIcon />
                            <FormattedMessage
                              id="sourceInfo.addLink"
                              defaultMessage="Add a secondary URL"
                              description="allow user to relate a new link to media source"
                            />
                          </Button>
                        </div>
                      </Row> : null
                    }
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

export default withStyles(styles)(SourceInfo);
