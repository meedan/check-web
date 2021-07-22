import React, { Component } from 'react';
import { graphql, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import qs from 'qs';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Toolbar from '@material-ui/core/Toolbar';
import { withPusher, pusherShape } from '../../pusher';
import PageTitle from '../PageTitle';
import MediaDetail from './MediaDetail';
import MediaTasks from './MediaTasks';
import MediaComments from './MediaComments';
import MediaRequests from './MediaRequests';
import MediaTimeline from './MediaTimeline';
import MediaAnalysis from './MediaAnalysis';
import MediaSource from './MediaSource';
import SelectProjectDialog from './SelectProjectDialog';
import MediaSimilarityBar from './Similarity/MediaSimilarityBar';
import MediaSuggestions from './Similarity/MediaSuggestions';
import MediaSimilarities from './Similarity/MediaSimilarities';
import MediaRelated from './Similarity/MediaRelated';
import CheckContext from '../../CheckContext';

import {
  units,
  brandSecondary,
  backgroundMain,
  Column,
} from '../../styles/js/shared';

const styles = theme => ({
  root: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    minHeight: 'auto',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
});

const StyledDrawerToolbar = withStyles(styles)(Toolbar);

const StyledThreeColumnLayout = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;

  /* Middle column */
  .media__column {
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
  padding: ${units(2)};
  border-right: 2px solid ${brandSecondary};
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

    const { team_bots: teamBots } = props.media.team;
    const enabledBots = teamBots.edges.map(b => b.node.login);
    const showRequests = (enabledBots.indexOf('smooch') > -1 || props.media.requests_count > 0);
    const showTab = showRequests ? 'requests' : 'metadata';

    // https://www.w3.org/TR/media-frags/
    const { t: temporalInterval = '', id: instanceId } = qs.parse(document.location.hash.substring(1));
    const [start, end] = temporalInterval.split(',').map(s => parseFloat(s));

    const gaps = [];
    if (start) gaps.push([0, start]);
    if (end) gaps.push([end, Number.MAX_VALUE]);

    this.state = {
      playerState: {
        start,
        end,
        gaps,
        time: 0,
        duration: 0,
        playing: false,
        progress: 0,
      },
      showRequests,
      showTab,
      showVideoAnnotation: Boolean(temporalInterval && instanceId),
      fragment: { t: temporalInterval, id: instanceId },
      playerRect: null,
      videoAnnotationTab: 'timeline',
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

  onTimelineCommentOpen = (fragment) => {
    // this call will come from Annotation.js
    // or from MediaTags.js
    if (!fragment) return;
    const parsedFragment = parseInt(fragment.substring(2), 10);
    this.setState({ showVideoAnnotation: true, videoAnnotationTab: 'timeline' });
    this.setPlayerState({ seekTo: parsedFragment });
  };

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

  handleTabChange = (e, value) => this.setState({ showTab: value });

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
        time,
        duration,
        playing,
        progress,
        scrubTo,
        seekTo,
      },
      fragment,
      playerRect,
      showVideoAnnotation,
    } = this.state;

    const { currentUser } = this.getContext();

    return (
      <div>
        <SelectProjectDialog
          open
          title="Bli"
          cancelLabel="Cancel"
          submitLabel="Subme"
          onSubmit={() => {}}
          onCancel={() => {}}
        />
        <PageTitle prefix={media.title} team={media.team} />
        <StyledThreeColumnLayout className="media">
          <AnalysisColumn>
            <MediaAnalysis projectMedia={media} onTimelineCommentOpen={this.onTimelineCommentOpen} />
          </AnalysisColumn>
          { view === 'default' ?
            <React.Fragment>
              <Column className="media__column">
                <MediaSimilarityBar
                  projectMedia={media}
                />
                <MediaDetail
                  hideBorder
                  hideRelated
                  media={media}
                  onPlayerReady={this.setPlayerRect}
                  onReady={this.handleMediaDetailReady}
                  onTimelineCommentOpen={this.onTimelineCommentOpen}
                  onVideoAnnoToggle={() => this.setState({ showVideoAnnotation: true })}
                  playerRef={this.playerRef}
                  setPlayerState={this.setPlayerState}
                  {...{
                    playing, start, end, gaps, seekTo, scrubTo, showVideoAnnotation,
                  }}
                />
                {this.props.extras}
              </Column>
              <Column className="media__annotations-column" overflow="hidden">
                <Tabs
                  indicatorColor="primary"
                  onChange={this.handleTabChange}
                  scrollButtons="auto"
                  textColor="primary"
                  variant="scrollable"
                  value={this.state.showTab}
                  className="media__annotations-tabs"
                >
                  { this.state.showRequests ?
                    <Tab
                      label={
                        <FormattedMessage
                          id="mediaComponent.requests"
                          defaultMessage="Requests"
                        />
                      }
                      value="requests"
                      className="media-tab__requests"
                    />
                    : null }
                  <Tab
                    label={
                      <FormattedMessage
                        id="mediaComponent.metadata"
                        defaultMessage="Metadata"
                      />
                    }
                    value="metadata"
                    className="media-tab__metadata"
                  />
                  <Tab
                    label={
                      <FormattedMessage
                        id="mediaComponent.source"
                        defaultMessage="Source"
                      />
                    }
                    value="source"
                    className="media-tab__source"
                  />
                  { media.team.get_tasks_enabled ?
                    <Tab
                      label={
                        <FormattedMessage
                          id="mediaComponent.tasks"
                          defaultMessage="Tasks"
                        />
                      }
                      value="tasks"
                      className="media-tab__tasks"
                    /> : null }
                  <Tab
                    label={
                      <FormattedMessage
                        id="mediaComponent.notes"
                        defaultMessage="Notes"
                      />
                    }
                    value="notes"
                    className="media-tab__comments"
                  />
                  <Tab
                    label={
                      <FormattedMessage
                        id="mediaComponent.related"
                        defaultMessage="Related"
                      />
                    }
                    value="related"
                    className="media-tab__related"
                  />
                </Tabs>
                { /* Set maxHeight to screen height - (media bar + tabs) */ }
                <Box maxHeight="calc(100vh - 112px)" style={{ overflowY: 'auto' }}>
                  { this.state.showTab === 'requests' ? <MediaRequests media={media} all={!media.is_confirmed_similar_to_another_item} /> : null }
                  { this.state.showTab === 'metadata' ? <MediaTasks media={media} fieldset="metadata" /> : null }
                  { this.state.showTab === 'source' ? <MediaSource projectMedia={media} /> : null }
                  { this.state.showTab === 'tasks' ? <MediaTasks media={media} fieldset="tasks" /> : null }
                  { this.state.showTab === 'notes' ? <MediaComments media={media} onTimelineCommentOpen={this.onTimelineCommentOpen} /> : null }
                  { this.state.showTab === 'related' ? <MediaRelated projectMedia={media} /> : null }
                </Box>
              </Column>
            </React.Fragment> : null }
          { view === 'suggestedMatches' ? <MediaSuggestions projectMedia={media} /> : null }
          { view === 'similarMedia' ? <MediaSimilarities projectMedia={media} /> : null }
        </StyledThreeColumnLayout>

        {// render video annotation drawer only if we can anchor it to the bottom of the player:
          playerRect && view === 'default' ?
            <Drawer
              PaperProps={{ style: { top: (playerRect.bottom + 10) || 'auto' } }}
              anchor="bottom"
              elevation={3}
              open={showVideoAnnotation}
              variant="persistent"
            >
              <StyledDrawerToolbar>
                <Grid alignItems="center" container justify="space-between">
                  <Grid item>
                    <Tabs value={this.state.videoAnnotationTab}>
                      <Tab
                        disabled
                        id="TimelineTab"
                        label={
                          <FormattedMessage
                            id="mediaComponent.timelineTab"
                            defaultMessage="Timeline"
                          />
                        }
                        value="timeline"
                      />
                    </Tabs>
                  </Grid>
                  <Grid item>
                    <IconButton onClick={() => this.setState({ showVideoAnnotation: false })} size="small"><CloseIcon /></IconButton>
                  </Grid>
                </Grid>
              </StyledDrawerToolbar>
              <div aria-labelledby="TimelineTab" role="tabpanel" hidden={this.state.videoAnnotationTab !== 'timeline'}>
                <MediaTimeline
                  setPlayerState={this.setPlayerState}
                  {...{
                    media,
                    fragment,
                    playing,
                    duration,
                    time,
                    progress,
                    seekTo,
                    scrubTo,
                    currentUser,
                  }}
                />
              </div>
            </Drawer> :
            null
        }
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
