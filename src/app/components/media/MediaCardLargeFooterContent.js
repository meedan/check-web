import React from 'react';
import LongShort from '../layout/LongShort';

const MediaCardLargeFooterContent = ({
  body,
  showAll,
  title,
}) => {
  if (!body) return null;

  return (
    <>
      {title}
      <LongShort maxLines={2} showAll={showAll}>
        {body}
      </LongShort>
    </>
  );
};

export default MediaCardLargeFooterContent;
