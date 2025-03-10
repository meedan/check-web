import React from 'react';
import Slider from './Slider';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';

describe('<Slider />', () => {
  const props = {
    value: 10,
    onChange: () => {},
  };

  it('renders without crashing', () => {
    mountWithIntl(<Slider {...props} />);
  });

  const markedProps = {
    marked: 'true',
    marks: true,
    max: 5,
    min: 1,
    step: 1,
    value: 2,
    onChange: () => {},
  };

  it('renders marked slider', () => {
    const slider = mountWithIntl(<Slider {...markedProps} />);
    const marks = slider.find('.MuiSlider-mark');
    expect(marks).toHaveLength(5);
  });
});
