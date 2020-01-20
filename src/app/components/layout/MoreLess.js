import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import styled from 'styled-components';
import { units } from '../../styles/js/shared';

const StyledMoreLessArea = styled.div`
  ${props => props.maxHeight ? `max-height: ${props.maxHeight};` : null}
  ${props => props.maxHeight ? 'overflow: hidden;' : null}
`;

class MoreLess extends React.Component {
  state = {
    expand: false,
  };

  toggleExpand = () => {
    this.setState({ expand: !this.state.expand });
  };

  render() {
    return (
      <div className="more-less">
        <StyledMoreLessArea
          className="more-less-area"
          maxHeight={this.state.expand ? null : units(20)}
        >
          {this.props.children}
        </StyledMoreLessArea>
        <Button color="primary" onClick={this.toggleExpand}>
          { this.state.expand ?
            <FormattedMessage id="moreLess.less" defaultMessage="Less" /> :
            <FormattedMessage id="moreLess.more" defaultMessage="More" />
          }
        </Button>
      </div>
    );
  }
}

export default MoreLess;
