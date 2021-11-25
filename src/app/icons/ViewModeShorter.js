import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

const ViewModeShorter = (props) => {
  const customStyle = props.style || {};
  const style = Object.assign({
    width: 18,
    height: 18,
    flexShrink: 0,
  }, customStyle);

  return (
    <SvgIcon viewBox="0 0 18 18" {...props} style={style}>
      <rect y="0" width="16" height="3" />
      <rect y="5" width="16" height="3" />
      <rect y="10" width="16" height="3" />
      <rect y="15" width="16" height="3" />
    </SvgIcon>
  );
};

export default ViewModeShorter;

