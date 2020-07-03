import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import qs from 'qs';
import { LoadScript } from '@react-google-maps/api';
import Grid from '@material-ui/core/Grid';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Toolbar from '@material-ui/core/Toolbar';
import config from 'config';
import { withPusher, pusherShape } from '../../pusher';
import PageTitle from '../PageTitle';
import MediaDetail from './MediaDetail';
import MediaRelated from './MediaRelated';
import MediaTasks from './MediaTasks';
import MediaLocation from './MediaLocation';
import MediaAnalysis from './MediaAnalysis';
import MediaLog from './MediaLog';
import MediaComments from './MediaComments';
import MediaRequests from './MediaRequests';
import MediaUtil from './MediaUtil';
import MediaTimeline from './MediaTimeline';
import CheckContext from '../../CheckContext';
import { columnWidthMedium, columnWidthLarge, units } from '../../styles/js/shared';

const styles = theme => ({
  root: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    minHeight: 'auto',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
});

const StyledDrawerToolbar = withStyles(styles)(Toolbar);

const StyledTwoColumnLayout = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: center;
`;

const Column = styled.div`
  min-width: min(50%, ${columnWidthMedium});
  max-width: ${columnWidthLarge};
  padding: ${units(2)};
  flex-grow: 1;
`;

const GOOGLE_MAPS_LIBRARIES = ['places'];

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
    const isYoutubeVideo = props.media.media.type === 'Link' && props.media.media.metadata.provider === 'youtube';
    const isUploadedVideo = props.media.media.type === 'UploadedVideo';
    const showLocation = isYoutubeVideo || isUploadedVideo;
    const enabledBots = teamBots.edges.map(b => b.node.login);
    const showRequests = (enabledBots.indexOf('smooch') > -1 || props.media.requests_count > 0);
    const showTab = showRequests ? 'requests' : 'tasks';

    // https://www.w3.org/TR/media-frags/
    const { t: temporalInterval = '', id: clipId } = qs.parse(document.location.hash.substring(1));
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
      showLocation,
      showVideoAnnotation: Boolean(temporalInterval && clipId),
      fragment: { t: temporalInterval, id: clipId },
      playerRect: null,
      videoAnnotationTab: 'timeline',
    };

    this.playerRef = React.createRef();
  }

  componentDidMount() {
    this.setCurrentContext();
    MediaComponent.scrollToAnnotation();
    this.subscribe();
    window.addEventListener('resize', this.onWindowResize);
    this.setPlayerRect();
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
    window.removeEventListener('resize', this.onWindowResize);
    this.unsubscribe();
  }

  onWindowResize = () => {
    this.setPlayerRect();
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

    const { media } = this.props;
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
      <LoadScript
        googleMapsApiKey={config.googleMapsApiKey}
        libraries={GOOGLE_MAPS_LIBRARIES}
      >
        <PageTitle
          prefix={MediaUtil.title(media, media.metadata, this.props.intl)}
          team={media.team}
          data-id={media.dbid}
        >
          <StyledTwoColumnLayout className="media">
            <Column>
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
              <MediaRelated
                media={media}
              />
            </Column>
            <Column className="media__annotations-column">
              <Tabs
                indicatorColor="primary"
                onChange={this.handleTabChange}
                scrollButtons="auto"
                textColor="primary"
                variant="scrollable"
                value={this.state.showTab}
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
                      id="mediaComponent.tasks"
                      defaultMessage="Tasks"
                    />
                  }
                  value="tasks"
                  className="media-tab__tasks"
                />
                <Tab
                  label={
                    <FormattedMessage
                      id="mediaComponent.analysis"
                      defaultMessage="Analysis"
                    />
                  }
                  value="analysis"
                  className="media-tab__analysis"
                />

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
                { this.state.showLocation ?
                  <Tab
                    label={
                      <FormattedMessage
                        id="mediaComponent.location"
                        defaultMessage="Location"
                      />
                    }
                    value="location"
                    className="media-tab__location"
                  /> : null }
                <Tab
                  label={
                    <FormattedMessage
                      id="mediaComponent.activity"
                      defaultMessage="Activity"
                    />
                  }
                  value="activity"
                  className="media-tab__activity"
                />
              </Tabs>
              { this.state.showTab === 'location' ? <MediaLocation media={media} time={time} /> : null }
              { this.state.showTab === 'requests' ? <MediaRequests media={media} /> : null }
              { this.state.showTab === 'tasks' ? <MediaTasks media={media} /> : null }
              { this.state.showTab === 'analysis' ? <MediaAnalysis media={media} /> : null }
              { this.state.showTab === 'notes' ? <MediaComments media={media} onTimelineCommentOpen={this.onTimelineCommentOpen} /> : null }
              { this.state.showTab === 'activity' ? <MediaLog media={media} /> : null }
            </Column>
          </StyledTwoColumnLayout>

          {// render video annotation drawer only if we can anchor it to the bottom of the player:
            playerRect ?
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
                          ariaControls=""
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
              </Drawer>
              : null}
        </PageTitle>
      </LoadScript>
    );
  }
}

MediaComponent.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
  pusher: pusherShape.isRequired,
  clientSessionId: PropTypes.string.isRequired,
};

MediaComponent.contextTypes = {
  store: PropTypes.object,
};

export default withPusher(injectIntl(MediaComponent));
