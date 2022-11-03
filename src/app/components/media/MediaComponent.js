/* eslint-disable relay/unused-fields */
import React, { Component } from 'react';
import { graphql, createFragmentContainer, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import qs from 'qs';
import { withPusher, pusherShape } from '../../pusher';
import PageTitle from '../PageTitle';
import MediaDetail from './MediaDetail';
import MediaSidebar from './MediaSidebar';
import MediaAnalysis from './MediaAnalysis'; // eslint-disable-line no-unused-vars
import MediaTags from './MediaTags'; // eslint-disable-line no-unused-vars
import MediaComponentRightPanel from './MediaComponentRightPanel';
import MediaSimilarityBar from './Similarity/MediaSimilarityBar';
import MediaSimilaritiesComponent from './Similarity/MediaSimilaritiesComponent';
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

    const { team_bots: teamBots } = this.props.projectMedia.team;
    const enabledBots = teamBots.edges.map(b => b.node.login);
    const showRequests = (enabledBots.indexOf('smooch') > -1 || this.props.projectMedia.requests_count > 0);

    this.state = {
      playerState: {
        start,
        end,
        gaps,
        playing: false,
      },
      showTab: showRequests ? 'requests' : 'metadata',
    };

    this.playerRef = React.createRef();
  }

  componentDidMount() {
    // this.setCurrentContext();
    MediaComponent.scrollToAnnotation();
    this.subscribe();
    window.addEventListener('resize', this.updatePlayerRect);
    window.addEventListener('scroll', this.updatePlayerRect);
    this.setPlayerRect();
    if (!this.props.projectMedia.read_by_me) {
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
            project_media_id: this.props.projectMedia.dbid,
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

  // componentWillUpdate(nextProps) {
  //   if (this.props.projectMedia.dbid !== nextProps.media.dbid) {
  //     this.unsubscribe();
  //   }
  // }

  // componentDidUpdate(prevProps) {
  //   this.setCurrentContext();
  //   MediaComponent.scrollToAnnotation();
  //   if (this.props.projectMedia.dbid !== prevProps.media.dbid) {
  //     this.subscribe();
  //   }
  // }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updatePlayerRect);
    window.removeEventListener('scroll', this.updatePlayerRect);
    // this.unsubscribe();
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
    const { pusher, clientSessionId, projectMedia } = this.props;
    pusher.subscribe(projectMedia.pusher_channel).bind('relationship_change', 'MediaComponent', (data, run) => {
      const relationship = JSON.parse(data.message);
      if (
        (!relationship.id || clientSessionId !== data.actor_session_id) &&
        (relationship.source_id === projectMedia.dbid ||
        relationship.target_id === projectMedia.dbid)
      ) {
        if (run) {
          this.props.relay.forceFetch();
          return true;
        }
        return {
          id: `media-${projectMedia.dbid}`,
          callback: this.props.relay.forceFetch,
        };
      }
      return false;
    });

    pusher.subscribe(projectMedia.pusher_channel).bind('media_updated', 'MediaComponent', (data, run) => {
      const annotation = JSON.parse(data.message);
      if (annotation.annotated_id === projectMedia.dbid && clientSessionId !== data.actor_session_id) {
        if (run) {
          this.props.relay.forceFetch();
          return true;
        }
        return {
          id: `media-${projectMedia.dbid}`,
          callback: this.props.relay.forceFetch,
        };
      }
      return false;
    });
  }

  unsubscribe() {
    const { pusher, projectMedia } = this.props;
    pusher.unsubscribe(projectMedia.pusher_channel);
  }

  render() {
    // if (this.props.relay.variables.contextId === null && /\/project\//.test(window.location.pathname)) {
    //   return null;
    // }
    // TODO: New Relay `relay` prop has no  `variables`, `setVariables` or `forceFetch`
    // What will be of pusher?

    const { projectMedia, view } = this.props;

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

    const setShowTab = value => this.setState({ showTab: value });

    const linkPrefix = window.location.pathname.match(/^\/[^/]+\/((project|list)\/[0-9]+\/)?media\/[0-9]+/);

    return (
      <div>
        <PageTitle prefix={projectMedia.title} team={projectMedia.team} />
        <StyledThreeColumnLayout className="media">
          <AnalysisColumn>
            <MediaSidebar projectMedia={projectMedia} />
          </AnalysisColumn>
          { view === 'default' ?
            <React.Fragment>
              <Column className="media__column">
                { linkPrefix ? <MediaSimilarityBar projectMedia={projectMedia} setShowTab={setShowTab} /> : null }
                <MediaDetail
                  hideBorder
                  hideRelated
                  media={projectMedia}
                  onPlayerReady={this.setPlayerRect}
                  onReady={this.handleMediaDetailReady}
                  playerRef={this.playerRef}
                  setPlayerState={this.setPlayerState}
                  {...{
                    playing, start, end, gaps, seekTo, scrubTo,
                  }}
                />
                <MediaSimilaritiesComponent projectMedia={projectMedia} setShowTab={setShowTab} />
              </Column>
              <Column className="media__annotations-column" overflow="hidden">
                <MediaComponentRightPanel
                  projectMedia={projectMedia}
                  showTab={this.state.showTab}
                  setShowTab={setShowTab}
                />
              </Column>
            </React.Fragment> : null }
          { view === 'suggestedMatches' || view === 'similarMedia' ? <MediaSuggestions projectMedia={projectMedia} /> : null }
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

export default createFragmentContainer(withPusher(MediaComponent), graphql`
  fragment MediaComponent_projectMedia on ProjectMedia {
    ...MediaAnalysis_projectMedia
    ...MediaTags_projectMedia
    ...MediaSimilaritiesComponent_projectMedia
    id
    dbid
    title
    read_by_someone: is_read
    read_by_me: is_read(by_me: true)
    permissions
    pusher_channel
    project_id
    requests_count
    picture
    show_warning_cover
    creator_name
    user_id
    channel
    suggested_similar_relationships(first: 10000) {
      edges {
        node {
          id
            relationship_type
            dbid
            source_id
            target_id
        }
      }
    }
    suggested_main_item { # used by MediaClaim, MediaFactCheck
      dbid
      team {
        slug
      }
      claim_description {
        id
        dbid
        context
        description
        user {
          name
        }
        updated_at
        fact_check {
          id
          summary
          title
          url
          user {
            name
          }
          updated_at
        }
      }
    }
    confirmed_main_item {
      dbid
      team {
        slug
      }
    }
    is_confirmed_similar_to_another_item
    is_suggested
    is_secondary
    claim_description {
      id
      dbid
      description
      context
      updated_at
      user {
        name
      }
      fact_check {
        id
        title
        summary
        url
        updated_at
        user {
          name
        }
      }
    }
    media {
      url
      quote
      embed_path
      metadata
      type
      picture
    }
    last_status
    last_status_obj {
      id
      data
      updated_at
    }
    report: dynamic_annotation_report_design {
      id
      data
    }
    comments: annotations(first: 10000, annotation_type: "comment") {
      edges {
        node {
          ... on Comment {
            id
            dbid
            text
            parsed_fragment
            annotator {
              id
              name
              profile_image
            }
            comments: annotations(first: 10000, annotation_type: "comment") {
              edges {
                node {
                  ... on Comment {
                    id
                    created_at
                    text
                    annotator {
                      id
                      name
                      profile_image
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    clips: annotations(first: 10000, annotation_type: "clip") {
      edges {
        node {
          ... on Dynamic {
            id
            data
            parsed_fragment
          }
        }
      }
    }
    tags(first: 10000) {
      edges {
        node {
          id
          dbid
          fragment
          parsed_fragment
          annotated_id
          annotated_type
          annotated_type
          tag_text_object {
            id
            text
          }
        }
      }
    }
    geolocations: annotations(first: 10000, annotation_type: "geolocation") {
      edges {
        node {
          ... on Dynamic {
            id
            parsed_fragment
            content
          }
        }
      }
    }
    team {
      id
      dbid
      slug
      name
      get_language
      get_report
      verification_statuses
      permissions
      team_bots(first: 10000) {
        edges {
          node {
            login
          }
        }
      }
      smooch_bot: team_bot_installation(bot_identifier: "smooch") {
        id
      }
    }
  }
`);
