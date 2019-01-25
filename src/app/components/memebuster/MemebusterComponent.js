import React from 'react';
import styled from 'styled-components';
import MemeEditor from './MemeEditor';
import SVGViewport from './SVGViewport';
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
    this.state = {
      params: {
        headline: 'ATTRACTIVE HEADLINE',
        // eslint-disable-next-line no-multi-str
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. \
        Sed mollis mollis mi ut ultricies. \
        Nullam magna ipsum, porta vel dui convallis, rutrum imperdiet eros. \
        Aliquam erat volutpat.',
        overlayColor: '#ff000077',
        statusText: 'FALSE',
        statusColor: '#ff0000',
      },
    };
  }

  handleParamChange = (param) => {
    const params = Object.assign(this.state.params, param);
    this.setState({ params });
  };

  render() {
    return (
      <StyledTwoColumnLayout>
        <ContentColumn className="memebuster__editor-column">
          <MemeEditor params={this.state.params} onParamChange={this.handleParamChange} />
        </ContentColumn>
        <ContentColumn className="memebuster__viewport-column">
          <SVGViewport params={this.state.params} />
        </ContentColumn>
      </StyledTwoColumnLayout>
    );
  }
}

export default MemebusterComponent;
