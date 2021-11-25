import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

const ViewModeLonger = (props) => {
  const customStyle = props.style || {};
  const style = Object.assign({
    width: 18,
    height: 18,
    flexShrink: 0,
  }, customStyle);

  return (
    <SvgIcon viewBox="0 0 18 18" {...props} style={style}>
      <rect y="0" width="16" height="4" />
      <rect y="7" width="16" height="4" />
      <rect y="14" width="16" height="4" />
    </SvgIcon>
  );
};

export default ViewModeLonger;
