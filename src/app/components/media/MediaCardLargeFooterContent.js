import React from 'react';
import LongShort from '../layout/LongShort';

const MediaCardLargeFooterContent = ({
  body,
  showAll,
  title,
}) => {
  if (!body) return null;

  return (
    <div className="typography-body2">
      {title}
      <LongShort maxLines={2} showAll={showAll}>
        {body}
      </LongShort>
    </div>
  );
};

export default MediaCardLargeFooterContent;
