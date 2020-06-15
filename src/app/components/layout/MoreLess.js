import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import styled from 'styled-components';
import isEqual from 'lodash.isequal';
import { units } from '../../styles/js/shared';

const MaxHeight = units(12);

const StyledMoreLessArea = styled.div`
  ${props => props.isExpanded ? null : `max-height: ${MaxHeight}; overflow: hidden;`}
`;

/**
 * Show `children` with a "More"/"Less" button if there's lots of text.
 */
class MoreLess extends React.PureComponent {
  state = {
    userWantsExpand: false,
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

  contentRef = React.createRef();

  resetHeights = () => {
    const div = this.contentRef.current;
    const contentHeight = div ? div.clientHeight : null;
    this.setState({ contentHeight });
  }

  toggleExpand = () => {
    const userWantsExpand = !this.state.userWantsExpand;
    this.setState({ userWantsExpand });
  };

  render() {
    const { children } = this.props;
    const { contentHeight, userWantsExpand } = this.state;
    // if contentHeight is null, canExpand is NaN -- falsy
    const canExpand = contentHeight > parseInt(MaxHeight, 10);
    const isExpanded = !canExpand || userWantsExpand;

    return (
      <div className="more-less">
        <StyledMoreLessArea className="more-less-area" isExpanded={isExpanded} ref={this.areaRef}>
          <div className="more-less-content" ref={this.contentRef}>
            {children}
          </div>
        </StyledMoreLessArea>
        {canExpand ? (
          <Button color="primary" onClick={this.toggleExpand}>
            {isExpanded ?
              <FormattedMessage id="moreLess.less" defaultMessage="Less" /> :
              <FormattedMessage id="moreLess.more" defaultMessage="More" />
            }
          </Button>
        ) : null}
      </div>
    );
  }
}
MoreLess.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MoreLess;
