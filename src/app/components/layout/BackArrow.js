import React from 'react';
import { Link } from 'react-router';
import IconArrowBack from '@material-ui/icons/ArrowBack';
import IconButton from '@material-ui/core/IconButton';
import { HeaderTitle, FadeIn, SlideIn, black54 } from '../../styles/js/shared';

const BackArrow = (props) => {
  if (props.url) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <Link to={props.url}>
          <IconButton className="header__back-button">
            <FadeIn>
              <SlideIn>
                <IconArrowBack color={black54} />
              </SlideIn>
            </FadeIn>
          </IconButton>
        </Link>
        <HeaderTitle>{props.label}</HeaderTitle>
      </div>
    );
  }
  return null;
};

export default BackArrow;
