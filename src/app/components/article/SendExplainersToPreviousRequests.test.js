import React from 'react';
import { SendExplainersToPreviousRequests } from './SendExplainersToPreviousRequests';
import { shallowWithIntl, mountWithIntl } from '../../../../test/unit/helpers/intl-test';

const onClose = () => {};
const onSubmit = () => {};
const projectMedia = {
  ranges: {
    1: 1,
    7: 2,
    30: 3,
  },
};
const defaultProps = {
  onClose,
  onSubmit,
  projectMedia,
  explainerItemDbidsToSend: [1, 2],
};

describe('<SendExplainersToPreviousRequests />', () => {
  it('should render the component', () => {
    const wrapper = shallowWithIntl(<SendExplainersToPreviousRequests {...defaultProps} />);
    expect(wrapper.find('ConfirmProceedDialog')).toHaveLength(1);
  });

  it('should show the alert for 7 or 30 days but not for 1 day', () => {
    let wrapper = mountWithIntl(<SendExplainersToPreviousRequests {...defaultProps} projectMedia={{ ranges: { 1: 0, 7: 1, 30: 0 } }} />);
    expect(wrapper.find('Alert')).toHaveLength(1);

    wrapper = mountWithIntl(<SendExplainersToPreviousRequests {...defaultProps} projectMedia={{ ranges: { 1: 0, 7: 0, 30: 1 } }} />);
    expect(wrapper.find('Alert')).toHaveLength(1);

    wrapper = mountWithIntl(<SendExplainersToPreviousRequests {...defaultProps} projectMedia={{ ranges: { 1: 1, 7: 0, 30: 0 } }} />);
    expect(wrapper.find('Alert')).toHaveLength(0);
  });

  it('should show counter based on selected range', () => {
    const wrapper = mountWithIntl(<SendExplainersToPreviousRequests {...defaultProps} projectMedia={{ ranges: { 1: 1, 7: 10, 30: 100 } }} />);
    expect(wrapper.text()).toContain('Articles will be delivered to one user');

    wrapper.find('select').simulate('change', { target: { value: 7 } });
    expect(wrapper.text()).toContain('Articles will be delivered to 10 users');

    wrapper.find('select').simulate('change', { target: { value: 30 } });
    expect(wrapper.text()).toContain('Articles will be delivered to 100 users');

    wrapper.find('select').simulate('change', { target: { value: 1 } });
    expect(wrapper.text()).toContain('Articles will be delivered to one user');
  });

  it('should disable the button if there are no users', () => {
    const props = { ...defaultProps, projectMedia: { ranges: { 1: 1, 7: 0, 30: 0 } } };

    let wrapper = mountWithIntl(<SendExplainersToPreviousRequests {...props} explainerItemDbidsToSend={[]} />);
    let button = wrapper.find('#confirm-dialog__confirm-action-button');
    expect(button.prop('disabled')).toBe(true);

    wrapper = mountWithIntl(<SendExplainersToPreviousRequests {...props} />);
    button = wrapper.find('#confirm-dialog__confirm-action-button');
    expect(button.prop('disabled')).toBe(false);

    wrapper.find('select').simulate('change', { target: { value: 7 } });
    button = wrapper.find('#confirm-dialog__confirm-action-button');
    expect(button.prop('disabled')).toBe(true);

    wrapper.find('select').simulate('change', { target: { value: 30 } });
    button = wrapper.find('#confirm-dialog__confirm-action-button');
    expect(button.prop('disabled')).toBe(true);

    wrapper.find('select').simulate('change', { target: { value: 1 } });
    button = wrapper.find('#confirm-dialog__confirm-action-button');
    expect(button.prop('disabled')).toBe(false);
  });
});
