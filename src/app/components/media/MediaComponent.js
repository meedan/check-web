/* eslint-disable relay/unused-fields */
import React, { Component } from 'react';
import { graphql, createFragmentContainer, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { withPusher, pusherShape } from '../../pusher';
import PageTitle from '../PageTitle';
import MediaCardLarge from './MediaCardLarge';
import MediaSidebar from './MediaSidebar';
import MediaAnalysis from './MediaAnalysis'; // eslint-disable-line no-unused-vars
import MediaTags from './MediaTags'; // eslint-disable-line no-unused-vars
import MediaSlug from './MediaSlug';
import MediaAndRequestsDialogComponent from '../cds/menus-lists-dialogs/MediaAndRequestsDialogComponent';
import MediaComponentRightPanel from './MediaComponentRightPanel';
import MediaSimilarityBar from './Similarity/MediaSimilarityBar';
import MediaSimilaritiesComponent from './Similarity/MediaSimilaritiesComponent';
import UserUtil from '../user/UserUtil';
import CheckContext from '../../CheckContext';
import {
  units,
  brandBorder,
  grayBackground,
  Column,
} from '../../styles/js/shared';

const StyledThreeColumnLayout = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;

  /* Middle column */
  .media__column {
    background-color: ${grayBackground};
  }

  /* Middle column */
  .media-suggestions__center-column {
    background-color: white;
  }

  /* Right Column */
  .media__suggestions-column {
    max-width: none;
    background-color: white;
  }

  /* Right Column */
  .media__annotations-column {
    border-left: 1px solid ${brandBorder};
    border-top: 1px solid ${brandBorder};
    padding-top: 0;
    padding-left: 0;
    padding-right: 0;
    max-width: none;

    /* Container of tabs */
    .media__annotations-tabs {
      background-color: white;
      border-bottom: 1px solid ${brandBorder};
      padding-top: ${units(0.5)};
    }
  }
`;

const AnalysisColumn = styled.div`
  width: 420px;
  flex-grow: 0;
  padding: 0 ${units(2)} ${units(2)} ${units(2)};
  border-right: 1px solid ${brandBorder};
  border-top: 1px solid ${brandBorder};
  max-height: calc(100vh - 64px);
  overflow-y: auto;
`;

class MediaComponent extends Component {
  constructor(props) {
    super(props);

    const { team_bots: teamBots } = this.props.projectMedia.team;
    const enabledBots = teamBots.edges.map(b => b.node.login);
    const showRequests = (enabledBots.indexOf('smooch') > -1 || this.props.projectMedia.requests_count > 0);

    let initialTab = 'metadata';
    if (showRequests && this.props.view !== 'similarMedia') {
      initialTab = 'requests';
    } else if (this.props.view === 'similarMedia') {
      initialTab = 'suggestedMedia';
    }

    this.state = {
      showTab: initialTab,
      openMediaDialog: false,
    };
  }

  componentDidMount() {
    this.subscribe();

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


  setCurrentContext() {
    if (/^\/[^/]+\/project\/[0-9]+\/media\/[0-9]+/.test(window.location.pathname)) {
      const projectId = window.location.pathname.match(/^\/[^/]+\/project\/([0-9]+)\/media\/[0-9]+/)[1];
      if (this.props.relay.variables.contextId !== projectId) {
        this.props.relay.setVariables({ contextId: projectId });
      }
    }
  }

  getContext() {
    return new CheckContext(this).getContextStore();
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

    const setShowTab = value => this.setState({ showTab: value });

    const linkPrefix = window.location.pathname.match(/^\/[^/]+\/((project|list)\/[0-9]+\/)?media\/[0-9]+/);
    const isSuggestedOrSimilar = (projectMedia.is_suggested || projectMedia.is_confirmed_similar_to_another_item);

    const currentTeam = this.getContext().team || this.getContext().currentUser.current_team;
    const currentUserRole = UserUtil.myRole(
      this.getContext().currentUser,
      currentTeam.slug,
    );

    return (
      <div>
        <PageTitle prefix={projectMedia.title} team={projectMedia.team} />
        <StyledThreeColumnLayout className="media">
          <AnalysisColumn>
            <MediaSidebar projectMedia={projectMedia} />
          </AnalysisColumn>
          { view === 'default' || view === 'similarMedia' ?
            <React.Fragment>
              <Column className="media__column">
                { (linkPrefix && !isSuggestedOrSimilar) ? <MediaSimilarityBar projectMedia={projectMedia} setShowTab={setShowTab} /> : null }
                { this.state.openMediaDialog ?
                  <MediaAndRequestsDialogComponent
                    projectMediaId={projectMedia.dbid}
                    mediaSlug={
                      <MediaSlug
                        mediaType={projectMedia.type}
                        slug={projectMedia.title}
                        details={[]}
                      />
                    }
                    onClick={e => e.stopPropagation()}
                    onClose={() => this.setState({ openMediaDialog: false })}
                  />
                  : null }
                <MediaCardLarge
                  projectMedia={projectMedia}
                  currentUserRole={currentUserRole}
                  onClickMore={() => this.setState({ openMediaDialog: true })}
                />
                { isSuggestedOrSimilar ? null : <MediaSimilaritiesComponent projectMedia={projectMedia} setShowTab={setShowTab} /> }
              </Column>
              <Column className="media__annotations-column" overflow="hidden">
                <MediaComponentRightPanel
                  projectMedia={projectMedia}
                  showTab={this.state.showTab}
                  setShowTab={setShowTab}
                />
              </Column>
            </React.Fragment> : null }
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
    ...MediaCardLarge_projectMedia
    id
    dbid
    title
    type
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
        language
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
      file_path
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
      get_languages
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
