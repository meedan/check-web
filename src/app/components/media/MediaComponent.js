import React, { Component } from 'react';
import { graphql, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import qs from 'qs';
import { withPusher, pusherShape } from '../../pusher';
import PageTitle from '../PageTitle';
import MediaDetail from './MediaDetail';
import MediaSidebar from './MediaSidebar';
import MediaComponentRightPanel from './MediaComponentRightPanel';
import MediaSimilarityBar from './Similarity/MediaSimilarityBar';
import MediaSuggestions from './Similarity/MediaSuggestions';
import CheckContext from '../../CheckContext';

import {
  units,
  brandSecondary,
  backgroundMain,
  Column,
} from '../../styles/js/shared';

const StyledThreeColumnLayout = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;

  /* Middle column */
  .media__column {
    background-color: ${backgroundMain};
  }

  /* Middle column */
  .media-suggestions__center-column {
    background-color: white;
  }

  /* Right Column */
  .media__suggestions-column {
    border-left: 2px solid ${brandSecondary};
    max-width: none;
    background-color: ${backgroundMain};
  }

  /* Right Column */
  .media__annotations-column {
    border-left: 2px solid ${brandSecondary};
    padding-top: 0;
    padding-left: 0;
    padding-right: 0;
    max-width: none;

    /* Container of tabs */
    .media__annotations-tabs {
      background-color: white;
      border-bottom: 1px solid ${brandSecondary};
      padding-top: ${units(0.5)};
    }
  }
`;

const AnalysisColumn = styled.div`
  width: 420px;
  flex-grow: 0;
  padding: 0 ${units(2)} ${units(2)} ${units(2)};
  border-right: 1px solid ${brandSecondary};
  max-height: calc(100vh - 64px);
  overflow-y: auto;
`;

class MediaComponent extends Component {
  static scrollToAnnotation() {
    if (window.location.hash !== '') {
      const id = window.location.hash.replace(/^#/, '');
      const element = document.getElementById(id);
      if (element && element.scrollIntoView !== undefined) {
        element.scrollIntoView();
      }
    }
  }

  constructor(props) {
    super(props);

    // https://www.w3.org/TR/media-frags/
    const { t: temporalInterval = '' } = qs.parse(document.location.hash.substring(1));
    const [start, end] = temporalInterval.split(',').map(s => parseFloat(s));

    const gaps = [];
    if (start) gaps.push([0, start]);
    if (end) gaps.push([end, Number.MAX_VALUE]);

    this.state = {
      playerState: {
        start,
        end,
        gaps,
        playing: false,
      },
    };

    this.playerRef = React.createRef();
  }

  componentDidMount() {
    this.setCurrentContext();
    MediaComponent.scrollToAnnotation();
    this.subscribe();
    window.addEventListener('resize', this.updatePlayerRect);
    window.addEventListener('scroll', this.updatePlayerRect);
    this.setPlayerRect();
    if (!this.props.media.read_by_me) {
      commitMutation(Store, {
        mutation: graphql`
          mutation MediaComponentCreateProjectMediaUserMutation($input: CreateProjectMediaUserInput!) {
            createProjectMediaUser(input: $input) {
              project_media {
                id
                read_by_someone: is_read
                read_by_me: is_read(by_me: true)
              }
            }
          }
        `,
        variables: {
          input: {
            project_media_id: this.props.media.dbid,
            read: true,
          },
        },
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const oldState = JSON.parse(JSON.stringify(this.state));
    const newState = JSON.parse(JSON.stringify(nextState));
    if (oldState.playerState) {
      delete oldState.playerState;
    }
    if (newState.playerState) {
      delete newState.playerState;
    }
    return JSON.stringify(newState) !== JSON.stringify(oldState) ||
    JSON.stringify(this.props) !== JSON.stringify(nextProps);
  }

  componentWillUpdate(nextProps) {
    if (this.props.media.dbid !== nextProps.media.dbid) {
      this.unsubscribe();
    }
  }

  componentDidUpdate(prevProps) {
    this.setCurrentContext();
    MediaComponent.scrollToAnnotation();
    if (this.props.media.dbid !== prevProps.media.dbid) {
      this.subscribe();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updatePlayerRect);
    window.removeEventListener('scroll', this.updatePlayerRect);
    this.unsubscribe();
  }

  setCurrentContext() {
    if (/^\/[^/]+\/project\/[0-9]+\/media\/[0-9]+/.test(window.location.pathname)) {
      const projectId = window.location.pathname.match(/^\/[^/]+\/project\/([0-9]+)\/media\/[0-9]+/)[1];
      if (this.props.relay.variables.contextId !== projectId) {
        this.props.relay.setVariables({ contextId: projectId });
      }
    }
  }

  setPlayerRect = () => {
    // update player rect used to anchor video annotation drawer
    if (this.playerRef && this.playerRef.current) {
      this.setState({ playerRect: this.playerRef.current.getBoundingClientRect() });
    }
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  setPlayerState = payload =>
    this.setState({ playerState: { ...this.state.playerState, ...payload } });

  updatePlayerRect = () => {
    this.setPlayerRect();
  }

  subscribe() {
    const { pusher, clientSessionId, media } = this.props;
    pusher.subscribe(media.pusher_channel).bind('relationship_change', 'MediaComponent', (data, run) => {
      const relationship = JSON.parse(data.message);
      if (
        (!relationship.id || clientSessionId !== data.actor_session_id) &&
        (relationship.source_id === media.dbid ||
        relationship.target_id === media.dbid)
      ) {
        if (run) {
          this.props.relay.forceFetch();
          return true;
        }
        return {
          id: `media-${media.dbid}`,
          callback: this.props.relay.forceFetch,
        };
      }
      return false;
    });

    pusher.subscribe(media.pusher_channel).bind('media_updated', 'MediaComponent', (data, run) => {
      const annotation = JSON.parse(data.message);
      if (annotation.annotated_id === media.dbid && clientSessionId !== data.actor_session_id) {
        if (run) {
          this.props.relay.forceFetch();
          return true;
        }
        return {
          id: `media-${media.dbid}`,
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

  render() {
    if (this.props.relay.variables.contextId === null && /\/project\//.test(window.location.pathname)) {
      return null;
    }

    const { media, view } = this.props;
    media.url = media.media.url;
    media.quote = media.media.quote;
    media.embed_path = media.media.embed_path;

    const {
      playerState: {
        start,
        end,
        gaps,
        playing,
        scrubTo,
        seekTo,
      },
    } = this.state;

    return (
      <div>
        <PageTitle prefix={media.title} team={media.team} />
        <StyledThreeColumnLayout className="media">
          <AnalysisColumn>
            <MediaSidebar projectMedia={media} />
          </AnalysisColumn>
          { view === 'default' ?
            <React.Fragment>
              <Column className="media__column">
                <MediaSimilarityBar projectMedia={media} />
                <MediaDetail
                  hideBorder
                  hideRelated
                  media={media}
                  onPlayerReady={this.setPlayerRect}
                  onReady={this.handleMediaDetailReady}
                  playerRef={this.playerRef}
                  setPlayerState={this.setPlayerState}
                  {...{
                    playing, start, end, gaps, seekTo, scrubTo,
                  }}
                />
                {this.props.extras}
              </Column>
              <Column className="media__annotations-column" overflow="hidden">
                <MediaComponentRightPanel
                  projectMedia={media}
                />
              </Column>
            </React.Fragment> : null }
          { view === 'suggestedMatches' || view === 'similarMedia' ? <MediaSuggestions projectMedia={media} /> : null }
        </StyledThreeColumnLayout>
      </div>
    );
  }
}

MediaComponent.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  pusher: pusherShape.isRequired,
  clientSessionId: PropTypes.string.isRequired,
};

MediaComponent.contextTypes = {
  store: PropTypes.object,
};

export default withPusher(MediaComponent);
