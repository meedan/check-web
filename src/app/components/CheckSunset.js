import React from 'react';
import { Link } from 'react-router';
import config from 'config';

const CheckSunset = () => (
  <>
    {
      config.enableSunset ?
        <Link target="_blank" to="/">
          <img
            alt="Sunset"
            height="200px"
            src="/images/sunset.jpg"
            width="100%"
          />
        </Link>
        : null
    }
  </>
);

export default CheckSunset;
