import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import rtlDetect from 'rtl-detect';

class FloatedDiv extends Component {
  render() {
    const direction = this.props.direction;

    const fromDirection = rtlDetect.isRtlLang(this.props.intl.locale) ? 'right' : 'left';
    const toDirection = rtlDetect.isRtlLang(this.props.intl.locale) ? 'left' : 'right';

    const style = Object.assign({ float: direction === 'from' ? fromDirection : toDirection }, { display: 'flex' }, this.props.style ? this.props.style : {});

    return (
      <div style={this.props.style}>
        {this.props.children}
      </div>
    );
  }
}

export default injectIntl(FloatedDiv);

