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
import LinkifyIt from 'linkify-it';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import CancelIcon from '@material-ui/icons/Cancel';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import { withStyles } from '@material-ui/core/styles';
import Relay from 'react-relay/classic';
import styled from 'styled-components';
import { can } from '../Can';
import UpdateSourceMutation from '../../relay/mutations/UpdateSourceMutation';
import CreateAccountSourceMutation from '../../relay/mutations/CreateAccountSourceMutation';
import DeleteAccountSourceMutation from '../../relay/mutations/DeleteAccountSourceMutation';
import SourcePicture from './SourcePicture';
import { urlFromSearchQuery } from '../search/Search';
import { getErrorMessage } from '../../helpers';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import {
  Row,
  units,
  StyledIconButton,
} from '../../styles/js/shared';
import {
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
      primaryUrl: { url: '', error: '' },
    };
  }

  handleChangeLink(e, type) {
    if (type === 'primary') {
      const { primaryUrl } = this.state;
      primaryUrl.url = e.target.value;
      primaryUrl.error = '';
      this.setState({ primaryUrl });
    } else {
      const { secondaryUrl } = this.state;
      secondaryUrl.url = e.target.value;
      secondaryUrl.error = '';
      this.setState({ secondaryUrl });
    }
  }

  handleChangeName(e) {
    this.setState({ sourceName: e.target.value });
  }

  updateName = (source, value) => {
    if (value && source.name !== value) {
      const onFailure = (transaction) => {
        const message = getErrorMessage(transaction, <GenericUnknownErrorMessage />);
        this.setState({ sourceError: message });
      };

      const onSuccess = () => {
        this.setState({ sourceError: '' });
      };

      Relay.Store.commitUpdate(
        new UpdateSourceMutation({
          source: {
            id: source.id,
            name: value,
          },
        }),
        { onSuccess, onFailure },
      );
    }
  };

  handleAddLinkFail(type, message) {
    if (type === 'primary') {
      const { primaryUrl } = this.state;
      primaryUrl.error = message;
      this.setState({ primaryUrl });
    } else {
      const { secondaryUrl } = this.state;
      secondaryUrl.error = message;
      this.setState({ secondaryUrl });
    }
  }

  createAccountSource(type, source, value) {
    if (!value) {
      return;
    }
    const linkify = new LinkifyIt();
    const validateUrl = linkify.match(value);
    if (Array.isArray(validateUrl) && validateUrl[0] && validateUrl[0].url) {
      const { url } = validateUrl[0];
      const onFailure = (transaction) => {
        const message = getErrorMessage(transaction, <GenericUnknownErrorMessage />);
        this.handleAddLinkFail(type, message);
      };
      const onSuccess = () => {
        if (type === 'primary') {
          this.setState({ primaryUrl: { url: '', error: '' } });
        } else {
          this.handleRemoveNewLink();
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
      this.handleAddLinkFail(type, message);
    }
  }

  handleRemoveNewLink() {
    this.setState({ secondaryUrl: { url: '', error: '', addNewLink: false } });
  }

  handleAddLink() {
    this.setState({ secondaryUrl: { url: '', error: '', addNewLink: true } });
  }

  render() {
    const { classes, team, source } = this.props;
    const accountSources = source.account_sources.edges;
    const mainAccount = accountSources[0];
    const secondaryAccounts = accountSources.slice(1);
    const sourceMediasLink = urlFromSearchQuery({ sources: [source.dbid] }, `/${team.slug}/all-items`);
    const { primaryUrl, secondaryUrl } = this.state;

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
              </StyledSmallColumn>
              <StyledBigColumn>
                <div className="source__primary-info">
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
                onClick={this.props.onChangeClick}
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
                        onBlur={(e) => { this.updateName(source, e.target.value); }}
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
                          value={primaryUrl.url}
                          error={primaryUrl.error.length !== 0}
                          helperText={primaryUrl.error}
                          onBlur={(e) => { this.createAccountSource('primary', source, e.target.value.trim()); }}
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
                    { secondaryUrl.addNewLink ?
                      <div key="source-add-new-link" className="source__url-input">
                        <Row>
                          <TextField
                            id="source__link-input-new"
                            name="source__link-input-new"
                            value={secondaryUrl.url}
                            error={secondaryUrl.error.length !== 0}
                            helperText={secondaryUrl.error}
                            onBlur={(e) => { this.createAccountSource('secondary', source, e.target.value.trim()); }}
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
                            disabled={secondaryUrl.addNewLink || !mainAccount || primaryUrl.error}
                            startIcon={<AddCircleOutlineIcon />}
                          >
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
