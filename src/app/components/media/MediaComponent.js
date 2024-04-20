/* eslint-disable relay/unused-fields */
import React, { Component } from 'react';
import { graphql, createFragmentContainer, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedDate } from 'react-intl';
import cx from 'classnames/bind';
import { withPusher, pusherShape } from '../../pusher';
import PageTitle from '../PageTitle';
import MediaCardLarge from './MediaCardLarge';
import MediaSidebar from './MediaSidebar';
import MediaSlug from './MediaSlug';
import MediaAndRequestsDialogComponent from '../cds/menus-lists-dialogs/MediaAndRequestsDialogComponent';
import MediaComponentRightPanel from './MediaComponentRightPanel';
import MediaSimilarityBar from './Similarity/MediaSimilarityBar';
import MediaSimilaritiesComponent from './Similarity/MediaSimilaritiesComponent';
import MediaFeedInformation from './MediaFeedInformation';
import SuperAdminControls from './SuperAdminControls';
import UserUtil from '../user/UserUtil';
import CheckContext from '../../CheckContext';
import { getSuperAdminMask } from '../../helpers';
import styles from './media.module.css';

class MediaComponent extends Component {
  static handleSuperAdminMaskSession(value) {
    sessionStorage.setItem('superAdminMaskSession', value);
  }

  constructor(props) {
    super(props);

    const { team_bots: teamBots } = this.props.projectMedia.team;
    const enabledBots = teamBots.edges.map(b => b.node.login);
    const showRequests = (enabledBots.indexOf('smooch') > -1 || this.props.projectMedia.requests_count > 0);

    let initialTab = 'metadata';
    if (showRequests && this.props.view !== 'similarMedia') {
      initialTab = 'requests';
      if (this.props.projectMedia.suggested_similar_items_count > 0 && !this.props.projectMedia.is_suggested) {
        initialTab = 'suggestedMedia';
      }
    } else if (this.props.view === 'similarMedia') {
      initialTab = 'suggestedMedia';
    }

    this.state = {
      showTab: initialTab,
      openMediaDialog: false,
      superAdminMask: true,
      superAdminMaskAction: 'session',
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

  handlesuperAdminMask(value) {
    this.setState({ superAdminMask: value, superAdminMaskAction: 'page' });
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

    const isAdmin = this.getContext().currentUser.is_admin;

    return (
      <>
        <PageTitle prefix={projectMedia.title} team={projectMedia.team} />
        <MediaSidebar projectMedia={projectMedia} />
        { view === 'default' || view === 'similarMedia' ?
          <React.Fragment>
            <div className={cx('media__column', styles['media-item-medias'])}>
              <div className={styles['media-item-content']}>
                { (linkPrefix && !isSuggestedOrSimilar) ? <MediaSimilarityBar projectMedia={projectMedia} setShowTab={setShowTab} /> : null }
                { this.state.openMediaDialog ?
                  <MediaAndRequestsDialogComponent
                    projectMediaId={projectMedia.dbid}
                    mediaSlug={
                      <MediaSlug
                        mediaType={projectMedia.type}
                        slug={projectMedia.title}
                        details={[(
                          <FormattedMessage
                            id="mediaComponent.lastSeen"
                            defaultMessage="Last submitted on {date}"
                            description="Header for the date when the media item was last received by the workspace"
                            values={{
                              date: (
                                <FormattedDate
                                  value={projectMedia.last_seen * 1000}
                                  year="numeric"
                                  month="short"
                                  day="numeric"
                                />
                              ),
                            }}
                          />
                        ), (
                          <FormattedMessage
                            id="mediaComponent.requests"
                            defaultMessage="{count, plural, one {# request} other {# requests}}"
                            description="Number of times a request has been sent about this media"
                            values={{
                              count: projectMedia.requests_count,
                            }}
                          />
                        )]}
                      />
                    }
                    mediaHeader={<MediaFeedInformation projectMedia={projectMedia} />}
                    onClick={e => e.stopPropagation()}
                    onClose={() => this.setState({ openMediaDialog: false })}
                  />
                  : null }
                <MediaCardLarge
                  projectMedia={projectMedia}
                  currentUserRole={currentUserRole}
                  superAdminMask={isAdmin ? getSuperAdminMask(this.state) : false}
                  onClickMore={() => this.setState({ openMediaDialog: true })}
                />
                { isSuggestedOrSimilar ?
                  null
                  :
                  <MediaSimilaritiesComponent projectMedia={projectMedia} setShowTab={setShowTab} superAdminMask={isAdmin ? getSuperAdminMask(this.state) : false} />
                }
              </div>
            </div>
            <div className={cx('media__annotations-column', styles['media-item-annotations'])}>
              <MediaComponentRightPanel
                projectMedia={projectMedia}
                showTab={this.state.showTab}
                setShowTab={setShowTab}
                superAdminMask={isAdmin ? getSuperAdminMask(this.state) : false}
              />
            </div>
          </React.Fragment> : null }
        {
          isAdmin ?
            <SuperAdminControls
              handleSuperAdminMask={this.handlesuperAdminMask.bind(this)}
              handleSuperAdminMaskSession={MediaComponent.handleSuperAdminMaskSession.bind(this)}
            /> : null
        }
      </>
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
    ...MediaSimilaritiesComponent_projectMedia
    ...MediaCardLarge_projectMedia
    ...MediaFeedInformation_projectMedia
    id
    dbid
    title
    type
    read_by_someone: is_read
    read_by_me: is_read(by_me: true)
    permissions
    pusher_channel
    project_id
    last_seen
    demand
    requests_count
    picture
    show_warning_cover
    creator_name
    user_id
    channel
    notes_count: annotations_count(annotation_type: "comment")
    report_status
    suggested_similar_items_count
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
