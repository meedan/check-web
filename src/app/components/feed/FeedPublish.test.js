import React from 'react';
import FeedPublish from './FeedPublish';
import { shallow } from 'enzyme';

describe('<FeedPublish />', () => {
  it('should not render license checkboxes', () => {
    const component = shallow(<FeedPublish />);
    expect(component.find('LicenseOption').length).toEqual(0);
  });

  it('should render license checkboxes when discoverable', () => {
    const component = shallow(<FeedPublish discoverable={true} discoverableNoLicense={true} />);
    expect(component.find('LicenseOption').length).toEqual(3);
    expect(component.find('#feed-publish__no-license-error').length).toEqual(1);
  });

  it('should render license checkboxes and no error when discoverable and licenses selected', () => {
    const component = shallow(<FeedPublish discoverable={true} academicLicense={true} />);
    expect(component.find('LicenseOption').length).toEqual(3);
    expect(component.find('#feed-publish__no-license-error').length).toEqual(0);
  });
});
