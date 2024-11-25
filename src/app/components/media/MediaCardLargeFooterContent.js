import React from 'react';

const MediaCardLargeFooterContent = ({
  body,
  title,
}) => {
  if (!body) return null;

  return (
    <>
      {title}
      <blockquote>
        {body}
      </blockquote>
    </>
  );
};

export default MediaCardLargeFooterContent;
