import React from 'react';
import config from 'config';

// You need a Google Maps Static API key... get one at https://console.developers.google.com
// and add to config.js with key "googleStaticMapsKey"

const LocationField = (props) => {
  const params = 'zoom=13&scale=false&size=600x300&maptype=roadmap&format=png&visual_refresh=true';
  const key = config.googleStaticMapsKey || '';
  const src = `https://maps.googleapis.com/maps/api/staticmap?center=${props.coordinates}&${params}&key=${key}`;
  return (<img width="600" src={src} alt="" />);
};

export default LocationField;
