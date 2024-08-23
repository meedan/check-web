import React from 'react';
import ThresholdControl from './ThresholdControl';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';

describe('<ThresholdControl />', () => {
  const label = <div />;

  const classes = {
    sliderRoot: 'sliderRoot',
    textFieldRoot: 'textFieldRoot',
  };

  it('should render suggestion message if type is not "matching"', () => {
    const wrapper = mountWithIntl(<ThresholdControl
      classes={classes}
      disable={false}
      handleInputChange={() => {}}
      label={label}
      type="suggested"
      value={5}
      onChange={() => {}}
    />);
    expect(wrapper.find('[data-testid="threshold-control__suggestion-explainer-message"]')).toHaveLength(1);
    expect(wrapper.find('[data-testid="threshold-control__matching-explainer-message"]')).toHaveLength(0);
  });

  it('should render matching message if type is "matching"', () => {
    const wrapper = mountWithIntl(<ThresholdControl
      classes={classes}
      disable={false}
      handleInputChange={() => {}}
      label={label}
      type="matching"
      value={5}
      onChange={() => {}}
    />);
    expect(wrapper.find('[data-testid="threshold-control__matching-explainer-message"]')).toHaveLength(1);
    expect(wrapper.find('[data-testid="threshold-control__suggestion-explainer-message"]')).toHaveLength(0);
  });

  it('should render error message if has a error', () => {
    const wrapper = mountWithIntl(<ThresholdControl
      classes={classes}
      disable={false}
      error
      handleInputChange={() => {}}
      label={label}
      type="matching"
      value={5}
      onChange={() => {}}
    />);
    expect(wrapper.find('[data-testid="threshold-control__error-message"]')).toHaveLength(1);
  });
});
