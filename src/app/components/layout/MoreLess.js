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

class MoreLess extends React.Component {
  state = {
    expand: false,
    canExpand: false,
  };

  componentDidMount() {
    const contentArea = document.querySelector('div.more-less-content');
    window.addEventListener('resize', this.canExpand);
    contentArea.addEventListener('resize', this.canExpand);
    this.canExpand();
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(this.props.children, prevProps.children)) {
      this.canExpand();
    }
  }

  componentWillUnmount() {
    const contentArea = document.querySelector('div.more-less-content');
    window.removeEventListener('resize', this.canExpand);
    contentArea.removeEventListener('resize', this.canExpand);
  }

  canExpand = () => {
    const actualHeight = document.querySelector('div.more-less-content').clientHeight;
    const limitHeight = document.querySelector('div.more-less-area').clientHeight;
    const canExpand = actualHeight > limitHeight;
    if (canExpand !== this.state.canExpand) {
      this.setState({ canExpand });
    }
  };

  toggleExpand = () => {
    const expand = !this.state.expand;
    this.setState({ expand, canExpand: true });
  };

  render() {
    return (
      <div className="more-less">
        <StyledMoreLessArea
          className="more-less-area"
          maxHeight={this.state.expand ? null : units(12)}
        >
          <div className="more-less-content">
            {this.props.children}
          </div>
        </StyledMoreLessArea>
        { this.state.canExpand ?
          <Button color="primary" onClick={this.toggleExpand}>
            { this.state.expand ?
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
