import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import styled from 'styled-components';
import { stripUnit } from 'polished';
import PageTitle from '../PageTitle';
import MediaDetail from './MediaDetail';
import MediaRelated from './MediaRelated';
import MediaTasks from './MediaTasks';
import MediaLog from './MediaLog';
import MediaUtil from './MediaUtil';
import CheckContext from '../../CheckContext';
import { getStatus, getStatusStyle } from '../../helpers';
import { mediaStatuses, mediaLastStatus } from '../../customHelpers';
import {
  ContentColumn,
  headerHeight,
  transitionSpeedSlow,
  gutterMedium,
  units,
  mediaQuery,
} from '../../styles/js/shared';

const StyledTwoColumnLayout = styled(ContentColumn)`
  flex-direction: column;
  ${mediaQuery.desktop`
    display: flex;
    justify-content: center;
    max-width: ${units(120)};
    padding: 0;
    flex-direction: row;

    .media__media-column {
      max-width: ${units(150)} !important;
    }

    .media__annotations-column {
      max-width: ${units(50)};
    }
  `}
`;

const StyledBackgroundColor = styled.div`
  margin-top: -${stripUnit(headerHeight) + stripUnit(gutterMedium)}px;
  padding-bottom: ${units(6)};
  padding-top: ${stripUnit(headerHeight) + stripUnit(gutterMedium)}px;
  transition: background-color ${transitionSpeedSlow} ease;
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

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  setCurrentContext() {
    const { project } = this.getContext();
    if (project && project.dbid) {
      this.props.relay.setVariables({ contextId: project.dbid });
    }
  }

  subscribe() {
    const { pusher } = this.getContext();
    if (pusher) {
      pusher.subscribe(this.props.media.pusher_channel).bind('relationship_change', 'MediaComponent', (data, run) => {
        const relationship = JSON.parse(data.message);
        if (
          (!relationship.id || this.getContext().clientSessionId !== data.actor_session_id) &&
          (relationship.source_id === this.props.media.dbid ||
          relationship.target_id === this.props.media.dbid)
        ) {
          if (run) {
            this.props.relay.forceFetch();
            return true;
          }
          return {
            id: `media-${this.props.media.dbid}`,
            callback: this.props.relay.forceFetch,
          };
        }
        return false;
      });

      pusher.subscribe(this.props.media.pusher_channel).bind('media_updated', 'MediaComponent', (data, run) => {
        const annotation = JSON.parse(data.message);
        if (annotation.annotated_id === this.props.media.dbid &&
          this.getContext().clientSessionId !== data.actor_session_id
        ) {
          if (run) {
            this.props.relay.forceFetch();
            return true;
          }
          return {
            id: `media-${this.props.media.dbid}`,
            callback: this.props.relay.forceFetch,
          };
        }
        return false;
      });
    }
  }

  unsubscribe() {
    const { pusher } = this.getContext();
    if (pusher) {
      pusher.unsubscribe(this.props.media.pusher_channel);
    }
  }

  render() {
    if (this.props.relay.variables.contextId === null) {
      return null;
    }

    const { media } = this.props;
    const data = media.embed;
    media.url = media.media.url;
    media.quote = media.media.quote;
    media.embed_path = media.media.embed_path;
    const status = getStatus(mediaStatuses(media), mediaLastStatus(media));

    let smoochBotInstalled = false;
    if (media.team && media.team.team_bot_installations) {
      media.team.team_bot_installations.edges.forEach((edge) => {
        if (edge.node.team_bot.identifier === 'smooch') {
          smoochBotInstalled = true;
        }
      });
    }

    return (
      <PageTitle
        prefix={MediaUtil.title(media, data, this.props.intl)}
        skipTeam={false}
        team={this.getContext().team}
        data-id={media.dbid}
      >
        <StyledBackgroundColor
          className="media"
          style={{
            backgroundColor: getStatusStyle(status, 'backgroundColor'),
          }}
        >
          <StyledTwoColumnLayout>
            <ContentColumn>
              <MediaDetail
                smoochBotInstalled={smoochBotInstalled}
                media={media}
                initiallyExpanded
                hideBorder
                hideRelated
              />
              {this.props.extras}
              <MediaTasks media={media} />
            </ContentColumn>
            <ContentColumn className="media__annotations-column">
              <div style={{ paddingBottom: units(5) }}>
                <MediaRelated
                  media={media}
                  showHeader
                  smoochBotInstalled={smoochBotInstalled}
                />
              </div>
              <MediaLog media={media} />
            </ContentColumn>
          </StyledTwoColumnLayout>
        </StyledBackgroundColor>
      </PageTitle>
    );
  }
}

MediaComponent.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

MediaComponent.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(MediaComponent);
