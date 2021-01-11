import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
import Relay from 'react-relay/classic';
import styled from 'styled-components';
import { can } from '../Can';
import CreateAccountSourceMutation from '../../relay/mutations/CreateAccountSourceMutation';
import DeleteAccountSourceMutation from '../../relay/mutations/DeleteAccountSourceMutation';
import { withPusher, pusherShape } from '../../pusher';
import MediaRoute from '../../relay/MediaRoute';
import MediasLoading from './MediasLoading';
import SourcePicture from '../source/SourcePicture';
import { getCurrentProjectId, getErrorMessage } from '../../helpers';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import {
  Row,
  units,
  separationGray,
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

  .source {
    width: 100%;
    pa
    box-shadow: none;
    border-bottom: 1px solid ${separationGray};
    border-radius: 0;
    margin-bottom: 0 !important;

    .source__card-header {
      padding: ${units(3)} 0;
      flex-direction: row-reverse;
      display: flex;
      align-items: flex-start;

      .source__card-expand {
        margin: ${units(0)} ${units(1)} 0 0;
      }

      .source__card-description {
        padding: ${units(2)} 0 0 0;
      }
    }
  }

  .source__card-text {
    padding-bottom: 0 !important;
    padding-top: 0 !important;
  }
`;

class MediaSourceComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      expandName: true,
      expandAccounts: true,
      addNewLink: false,
    };
  }

  componentDidMount() {
    this.subscribe();
  }

  componentWillUpdate(nextProps) {
    if (this.props.media.dbid !== nextProps.media.dbid) {
      this.unsubscribe();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.media.dbid !== prevProps.media.dbid) {
      this.subscribe();
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  subscribe() {
    const { pusher, clientSessionId, media } = this.props;
    pusher.subscribe(media.pusher_channel).bind('media_updated', 'MediaSource', (data, run) => {
      const annotation = JSON.parse(data.message);
      if (annotation.annotated_id === media.dbid && clientSessionId !== data.actor_session_id) {
        if (run) {
          this.props.relay.forceFetch();
          return true;
        }
        return {
          id: `media-requests-${media.dbid}`,
          callback: this.props.relay.forceFetch,
        };
      }
      return false;
    });
  }

  unsubscribe() {
    const { pusher, media } = this.props;
    pusher.unsubscribe(media.pusher_channel);
  }

  handleChangeLink(e) {
    this.setState({ linkUrl: e.target.value });
  }

  handleKeyPress = (ev, source) => {
    if (ev.key === 'Enter' && !ev.shiftKey) {
      ev.preventDefault();
      this.createAccountSource(this.state.linkUrl, source);
    }
  };

  createAccountSource(url, source) {
    const onFailure = (transaction) => {
      const message = getErrorMessage(transaction, <GenericUnknownErrorMessage />);
      this.setState({ linkError: message });
    };

    const onSuccess = () => {
      this.handleRemoveNewLink();
    };

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

  handleRemoveNewLink() {
    this.setState({ linkUrl: '', linkError: '', addNewLink: false });
  }

  handleAddLink() {
    this.setState({ linkUrl: '', linkError: '', addNewLink: true });
  }

  handleRemoveLink(asId, source) {
    const onFailure = () => { };
    const onSuccess = () => { this.handleRemoveNewLink(); };

    Relay.Store.commitUpdate(
      new DeleteAccountSourceMutation({
        id: asId,
        source,
      }),
      { onSuccess, onFailure },
    );
  }

  render() {
    const media = Object.assign(this.props.cachedMedia, this.props.media);
    const { source } = media;
    const accountSources = source.account_sources.edges;
    const mainAccount = accountSources[0];
    const secondaryAccounts = accountSources.slice(1);

    return (
      <React.Fragment>
        <div>
          <Row style={{ padding: '8px 5px' }}>
            <StyledTwoColumns>
              <StyledSmallColumn>
                <SourcePicture
                  size="large"
                  object={media.source}
                  type="user"
                  className="source__avatar"
                />
              </StyledSmallColumn>
              <StyledBigColumn>
                <div className="source__primary-info">
                  <StyledName className="source__name">
                    <Row>
                      {source.name}
                    </Row>
                  </StyledName>
                  <Link to="sawy">
                    <FormattedMessage
                      id="userSource.mediasCount"
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
          </Row>
          <StyledWordBreakDiv>
            <Box clone mb={1}>
              <Card
                id={`source-${source.dbid}`}
                className="source source__card-card"
                style={{ marginBottom: units(1) }}
              >
                <CardHeader
                  className="media-source__card-header"
                  style={{ paddingBottom: '0px' }}
                  disableTypography
                  title={
                    <FormattedMessage
                      id="MediaSource.mainName"
                      defaultMessage="Main name"
                      description="souce name"
                    />
                  }
                  id={`media-source__label-${source.id}`}
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
                        id="main_source__name"
                        defaultValue={source.name}
                        style={{ width: '100%' }}
                        margin="normal"
                        disabled
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
                className="source source__card-card"
                style={{ marginBottom: units(1) }}
              >
                <CardHeader
                  className="media-source__card-header"
                  style={{ paddingBottom: '0px' }}
                  disableTypography
                  title={
                    <FormattedMessage
                      id="MediaSource.mainAccount"
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
                  <CardContent className="source__card-text">
                    <Row>
                      <TextField
                        id="main_source__link"
                        defaultValue={mainAccount.node.account.url}
                        style={{ width: '100%' }}
                        margin="normal"
                        disabled
                      />
                    </Row>
                    {secondaryAccounts.length === 0 ?
                      null :
                      <h2>
                        <FormattedMessage
                          id="mediaSource.secondaryAccounts"
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
                              onClick={() => this.handleRemoveLink(as.node.id, source)}
                            >
                              <CancelIcon />
                            </StyledIconButton> : null
                          }
                        </Row>
                      </div>))}
                    { this.state.addNewLink ?
                      <div key="source-add-new-link" className="source__url-input">
                        <Row>
                          <TextField
                            id="source__link-input-new"
                            name="source__link-input-new"
                            value={this.state.linkUrl}
                            error={this.state.linkError}
                            helperText={this.state.linkError}
                            onKeyPress={e => this.handleKeyPress(e, source)}
                            onChange={e => this.handleChangeLink(e)}
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
                            disabled={this.state.addNewLink}
                          >
                            <AddCircleOutlineIcon />
                            <FormattedMessage
                              id="mediaSource.addLink"
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

MediaSourceComponent.propTypes = {
  pusher: pusherShape.isRequired,
  clientSessionId: PropTypes.string.isRequired,
};

const MediaSourceContainer = Relay.createContainer(withPusher(MediaSourceComponent), {
  fragments: {
    media: () => Relay.QL`
      fragment on ProjectMedia {
        id
        dbid
        archived
        pusher_channel
        source {
          id
          dbid
          image
          name
          description
          created_at
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
                  provider
                }
              }
            }
          }
        }
      }
    `,
  },
});

const MediaSource = (props) => {
  const projectId = getCurrentProjectId(props.media.project_ids);
  const ids = `${props.media.dbid},${projectId}`;
  const route = new MediaRoute({ ids });
  const { media } = props;

  return (
    <Relay.RootContainer
      Component={MediaSourceContainer}
      renderFetched={data =>
        <MediaSourceContainer cachedMedia={media} {...data} />}
      route={route}
      renderLoading={() => <MediasLoading count={1} />}
      forceFetch
    />
  );
};

export default MediaSource;
