import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import styled from 'styled-components';
import isEqual from 'lodash.isequal';
import { units } from '../../styles/js/shared';

const StyledMoreLessArea = styled.div`
  ${props => props.maxHeight ? `max-height: ${props.maxHeight};` : null}
  ${props => props.maxHeight ? 'overflow: hidden;' : null}
`;

class MoreLess extends React.PureComponent {
  state = {
    isExpanded: false,
    areaHeight: null,
    contentHeight: null,
  };

  componentDidMount() {
    window.addEventListener('resize', this.resetHeights);
    this.resetHeights();
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(this.props.children, prevProps.children)) {
      this.resetHeights();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resetHeights);
  }

  areaRef = React.createRef();
  contentRef = React.createRef();

  resetHeights = () => {
    let areaHeight = null;
    let contentHeight = null;

    if (this.areaRef.current) {
      areaHeight = this.areaRef.current.clientHeight;
    }
    if (this.contentRef.current) {
      contentHeight = this.contentRef.current.clientHeight;
    }

    this.setState({ contentHeight, areaHeight });
  }

  toggleExpand = () => {
    const isExpanded = !this.state.isExpanded;
    this.setState({ isExpanded });
  };

  render() {
    const { areaHeight, contentHeight, isExpanded } = this.state;

    return (
      <div className="more-less">
        <StyledMoreLessArea
          className="more-less-area"
          maxHeight={isExpanded ? null : units(12)}
          ref={this.areaRef}
        >
          <div className="more-less-content" ref={this.contentRef}>
            {this.props.children}
          </div>
        </StyledMoreLessArea>
        { contentHeight > areaHeight ?
          <Button color="primary" onClick={this.toggleExpand}>
            { this.state.isExpanded ?
              <FormattedMessage id="moreLess.less" defaultMessage="Less" /> :
              <FormattedMessage id="moreLess.more" defaultMessage="More" />
            }
          </Button> : null
        }
      </div>
    );
  }
}

export default MoreLess;
