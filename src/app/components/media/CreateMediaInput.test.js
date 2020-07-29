/* global describe, expect, it */
import React from 'react';
import { mountWithIntlProvider } from '../../../../test/unit/helpers/intl-test';
import CreateMediaInput from './CreateMediaInput';
import UploadFile from '../UploadFile';

describe('<CreateMediaInput />', () => {
  it('should render all input tabs buttons', () => {
    const wrapper = mountWithIntlProvider(<CreateMediaInput />);
    expect(wrapper.find('#create-media__link').hostNodes()).toHaveLength(1);
    expect(wrapper.find('#create-media__quote').hostNodes()).toHaveLength(1);
    expect(wrapper.find('#create-media__image').hostNodes()).toHaveLength(1);
  });

  it('should render input fields', () => {
    const wrapper = mountWithIntlProvider(<CreateMediaInput />);
    expect(wrapper.find('#create-media-input').hostNodes()).toHaveLength(1);
    wrapper.find('#create-media__quote').hostNodes().simulate('click');
    expect(wrapper.find('#create-media-quote-input').hostNodes()).toHaveLength(1);
    wrapper.find('#create-media__image').hostNodes().simulate('click');
    expect(wrapper.find(UploadFile)).toHaveLength(1);
  });
});
