import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { stripUnit } from 'polished';
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
import MediaRelated from './MediaRelated';
import MediaTasks from './MediaTasks';
import MediaAnalysis from './MediaAnalysis';
import MediaLog from './MediaLog';
import MediaComments from './MediaComments';
import MediaRequests from './MediaRequests';
import MediaUtil from './MediaUtil';
import MediaTimeline from './MediaTimeline';
import CheckContext from '../../CheckContext';
import {
  ContentColumn,
  headerHeight,
  gutterMedium,
  units,
  mediaQuery,
} from '../../styles/js/shared';

// const TimelineDrawer = styled.div`
//   position: absolute;
//   bottom: 0;
//   left: 0;
//   height: 33vh;
//   width: 100%;
//   background-color: white;
// `;
const styles = theme => ({
  root: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    minHeight: 'auto',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  }
})

const StyledDrawerToolbar = withStyles(styles)(Toolbar);

const StyledTwoColumnLayout = styled(ContentColumn)`
  flex-direction: column;
  ${mediaQuery.desktop`
    display: flex;
    justify-content: center;
    width: 100%;
    max-width: 100%;
    padding: 0;
    flex-direction: row;

    .media__media-column {
      max-width: 100%;
    }

    .media__annotations-column {
      max-width: 100%;
    }
  `}
`;

const StyledBackgroundColor = styled.div`
  margin-top: -${stripUnit(headerHeight) + stripUnit(gutterMedium)}px;
  padding-bottom: ${units(6)};
  padding-top: ${stripUnit(headerHeight) + stripUnit(gutterMedium)}px;
  min-height: 100vh;
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
    const showTab = showRequests ? 'requests' : 'tasks';

    this.state = {
      showTab,
      showRequests,
      showVideoAnnotation: false,
      videoAnnotationTab: 'timeline',
      duration: 0,
      playing: false,
      time: 0,
      progress: 0,
    };
  }

  componentDidMount() {
    this.setCurrentContext();
    MediaComponent.scrollToAnnotation();
    this.subscribe();
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

  getContext() {
    return new CheckContext(this).getContextStore();
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

  handleToggleVideoAnnotation = () => this.setState({ showVideoAnnotation: !this.state.showVideoAnnotation }) 

  render() {
    if (this.props.relay.variables.contextId === null && /\/project\//.test(window.location.pathname)) {
      return null;
    }

    const { media } = this.props;
    const data = media.metadata;
    media.url = media.media.url;
    media.quote = media.media.quote;
    media.embed_path = media.media.embed_path;

    const {
      playing, duration, time, progress, seekTo, scrubTo, showVideoAnnotation
    } = this.state;

    const { currentUser } = this.getContext();

    return (
      <PageTitle
        prefix={MediaUtil.title(media, data, this.props.intl)}
        team={media.team}
        data-id={media.dbid}
      >
        <StyledBackgroundColor
          className="media"
        >
          <StyledTwoColumnLayout>
            <ContentColumn className="media__media-column">
              <MediaDetail
                media={media}
                hideBorder
                hideRelated
                setPlayerState={payload => this.setState(payload)}
                handleToggleVideoAnnotation={this.handleToggleVideoAnnotation}
                {...{ playing, seekTo, scrubTo, showVideoAnnotation }}
              />
              {this.props.extras}
              <MediaRelated
                media={media}
              />
            </ContentColumn>
            <ContentColumn className="media__annotations-column">
              <Tabs
                indicatorColor="primary"
                textColor="primary"
                value={this.state.showTab}
                onChange={this.handleTabChange}
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
              { this.state.showTab === 'requests' ? <MediaRequests media={media} /> : null }
              { this.state.showTab === 'tasks' ? <MediaTasks media={media} /> : null }
              { this.state.showTab === 'analysis' ? <MediaAnalysis media={media} /> : null }
              { this.state.showTab === 'notes' ? <MediaComments media={media} /> : null }
              { this.state.showTab === 'activity' ? <MediaLog media={media} /> : null }
            </ContentColumn>
          </StyledTwoColumnLayout>
        </StyledBackgroundColor>
        <Drawer anchor="bottom" elevation={3} ModalProps={{}} open={showVideoAnnotation} PaperProps={{}} SliderProps={{}} variant="persistent">
          <StyledDrawerToolbar>
            <Grid alignItems="center" container justify="space-between">
              <Grid item>
                {/* <Tabs onChange={val => this.setState({videoAnnotationTab: val})}> */}
                <Tabs value={this.state.videoAnnotationTab} onChange={args => console.log({args})}>
                  <Tab label="Timeline" disabled id="TimelineTab" ariaControls="simple-tabpanel-${index}" value="timeline" />
                </Tabs>
              </Grid>
              <Grid item>
                <IconButton onClick={this.handleToggleVideoAnnotation} size="small"><CloseIcon /></IconButton>
              </Grid>
            </Grid>
          </StyledDrawerToolbar>
          <div aria-labelledby={`TimelineTab`} role="tabpanel" hidden={this.state.videoAnnotationTab !== 'timeline'}>
            <MediaTimeline
              setPlayerState={payload => this.setState(payload)}
              {...{
                media, playing, duration, time, progress, seekTo, scrubTo, currentUser,
              }}
            />
          </div>
        </Drawer>
      </PageTitle>
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
