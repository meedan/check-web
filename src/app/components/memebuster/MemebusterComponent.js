import React from 'react';
import { injectIntl } from 'react-intl';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import MemeEditor from './MemeEditor';
import SVGViewport from './SVGViewport';
import MediaUtil from '../media/MediaUtil';
import { getStatus, getStatusStyle } from '../../helpers';
import { mediaStatuses, mediaLastStatus } from '../../customHelpers';
import { ContentColumn, mediaQuery, units } from '../../styles/js/shared';

const StyledTwoColumnLayout = styled(ContentColumn)`
  flex-direction: column;
  ${mediaQuery.desktop`
    display: flex;
    justify-content: center;
    max-width: ${units(120)};
    padding: 0;
    flex-direction: row;

    .memebuster__editor-column {
      max-width: ${units(50)} !important;
    }

    .memebuster__viewport-column {
      max-width: ${units(150)};
    }
  `}
`;

class MemebusterComponent extends React.Component {
  constructor(props) {
    super(props);

    const status = getStatus(mediaStatuses(props.media), mediaLastStatus(props.media));

    this.state = {
      params: {
        headline: MediaUtil.title(props.media, props.media.embed, props.intl),
        image: props.media.media.picture,
        description: props.media.embed.description,
        overlayColor: getStatusStyle(status, 'backgroundColor'),
        statusText: status.label,
        statusColor: getStatusStyle(status, 'color'),
        teamName: props.media.team.name,
        teamAvatar: props.media.team.avatar,
        teamUrl: props.media.team.contacts.edges[0] ? props.media.team.contacts.edges[0].node.web : '',
      },
    };
  }

  handleParamChange = (param) => {
    const params = Object.assign(this.state.params, param);
    this.setState({ params });
  };

  handleSaveImage = () => {
    console.log('saving image!');
    const node = document.getElementById('svg-viewport');
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(node);
    const svgData = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;
    console.log('svgData', svgData);
    window.open(svgData, '_blank');
  };

  render() {
    return (
      <div>
        <StyledTwoColumnLayout>
          <ContentColumn className="memebuster__editor-column">
            <MemeEditor params={this.state.params} onParamChange={this.handleParamChange} />
          </ContentColumn>
          <ContentColumn className="memebuster__viewport-column">
            <SVGViewport params={this.state.params} />
          </ContentColumn>
        </StyledTwoColumnLayout>
        <Button variant="contained" color="primary" onClick={this.handleSaveImage}>
          Save
        </Button>
      </div>
    );
  }
}

export default injectIntl(MemebusterComponent);
