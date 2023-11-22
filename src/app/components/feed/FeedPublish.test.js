import React from 'react';
import { shallow } from 'enzyme';
import FeedPublish from './FeedPublish';

describe('<FeedPublish />', () => {
  it('should not render license checkboxes', () => {
    const component = shallow(<FeedPublish />);
    expect(component.find('LicenseOption').length).toEqual(0);
  });

  it('should render license checkboxes when discoverable', () => {
    const component = shallow(<FeedPublish discoverable discoverableNoLicense />);
    expect(component.find('LicenseOption').length).toEqual(3);
    expect(component.find('#feed-publish__no-license-error').length).toEqual(1);
  });

  it('should render license checkboxes and no error when discoverable and licenses selected', () => {
    const component = shallow(<FeedPublish discoverable academicLicense />);
    expect(component.find('LicenseOption').length).toEqual(3);
    expect(component.find('#feed-publish__no-license-error').length).toEqual(0);
  });
});
