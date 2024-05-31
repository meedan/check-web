import React from 'react';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';
import EmptyMediaIcon from '../../../icons/empty_media.svg';
import VisibilityOffIcon from '../../../icons/visibility_off.svg';
import ItemThumbnail from './ItemThumbnail';
import MediaTypeDisplayIcon from '../../media/MediaTypeDisplayIcon';

describe('<ItemThumbnail />', () => {
  it('should render ItemThumbnail', () => {
    const wrapper = mountWithIntl(
      <ItemThumbnail
        type="image"
        picture="test.jpg"
        maskContent={false}
        url="http://test.com"
      />);
    expect(wrapper.find('img').length).toEqual(1);
    expect(wrapper.find(EmptyMediaIcon).length).toEqual(0);
    expect(wrapper.find(VisibilityOffIcon).length).toEqual(0);
  });

  it('should render when there is no media type', () => {
    const wrapper = mountWithIntl(
      <ItemThumbnail
        picture="test.jpg"
        maskContent={false}
        url="http://test.com"
      />);
    expect(wrapper.find('img').length).toEqual(1);
    expect(wrapper.find(EmptyMediaIcon).length).toEqual(0);
  });

  it('should render EmptyMediaIcon when there is no media type and no picture', () => {
    const wrapper = mountWithIntl(
      <ItemThumbnail
        maskContent={false}
        url="http://test.com"
      />);
    expect(wrapper.find(EmptyMediaIcon).length).toEqual(1);
  });

  it('should render VisibilityOffIcon when maskcontent', () => {
    const wrapper = mountWithIntl(
      <ItemThumbnail
        maskContent
        picture="test.jpg"
        url="http://test.com"
      />);
    expect(wrapper.find(VisibilityOffIcon).length).toEqual(1);
  });

  it('should render MediaTypeDisplayIcon when there is no picture', () => {
    const wrapper = mountWithIntl(
      <ItemThumbnail
        maskContent={false}
        type="image"
      />);
    expect(wrapper.find(MediaTypeDisplayIcon).length).toEqual(1);
  });
});
