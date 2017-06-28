import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import rtlDetect from 'rtl-detect';

class FloatedDiv extends Component {
  render() {
    const direction = this.props.direction;

    const fromDirection = rtlDetect.isRtlLang(this.props.intl.locale) ? 'right' : 'left';
    const toDirection = rtlDetect.isRtlLang(this.props.intl.locale) ? 'left' : 'right';

    return (
      <div style={{ float: direction === 'from' ? fromDirection : toDirection }}>
        {this.props.children}
      </div>
    );
  }
}

export default injectIntl(FloatedDiv);

