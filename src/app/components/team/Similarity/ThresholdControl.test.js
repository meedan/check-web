import React from 'react';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';
import ThresholdControl from './ThresholdControl';

describe('<ThresholdControl />', () => {
  const label = <div />;

  const classes = {
    sliderRoot: 'sliderRoot',
    textFieldRoot: 'textFieldRoot',
  };

  it('should render suggestion message if type is not "matching"', () => {
    const wrapper = mountWithIntl(<ThresholdControl
      type="suggested"
      value={5}
      onChange={() => {}}
      handleInputChange={() => {}}
      disable={false}
      label={label}
      classes={classes}
    />);
    expect(wrapper.find('[data-testid="threshold-control__suggestion-explainer-message"]')).toHaveLength(1);
    expect(wrapper.find('[data-testid="threshold-control__matching-explainer-message"]')).toHaveLength(0);
  });

  it('should render matching message if type is "matching"', () => {
    const wrapper = mountWithIntl(<ThresholdControl
      type="matching"
      value={5}
      onChange={() => {}}
      handleInputChange={() => {}}
      disable={false}
      label={label}
      classes={classes}
    />);
    expect(wrapper.find('[data-testid="threshold-control__matching-explainer-message"]')).toHaveLength(1);
    expect(wrapper.find('[data-testid="threshold-control__suggestion-explainer-message"]')).toHaveLength(0);
  });

  it('should render error message if has a error', () => {
    const wrapper = mountWithIntl(<ThresholdControl
      type="matching"
      value={5}
      onChange={() => {}}
      handleInputChange={() => {}}
      disable={false}
      label={label}
      classes={classes}
      error
    />);
    expect(wrapper.find('[data-testid="threshold-control__error-message"]')).toHaveLength(1);
  });
});
