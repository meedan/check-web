import React from 'react';
import Box from '@material-ui/core/Box';
import RemoveableWrapper from '../RemoveableWrapper';

const SearchFieldDummy = ({
  icon,
  label,
  readOnly,
  onRemove,
  version,
}) => (
  <RemoveableWrapper icon={icon} readOnly={readOnly} onRemove={onRemove} key={version}>
    <Box px={0.5} height={4.5} display="flex" alignItems="center" whiteSpace="nowrap">
      {label}
    </Box>
  </RemoveableWrapper>
);

export default SearchFieldDummy;
