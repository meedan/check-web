import React from 'react';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';
import SmoochBotResourceEditor from './SmoochBotResourceEditor';

describe('<SmoochBotResourceEditor />', () => {
  it('should contain a title field by default', () => {
    const wrapper = mountWithIntl(<SmoochBotResourceEditor
      installationId="foo"
      resource={{
        foo: 'bar',
      }}
      onChange={() => {}}
    />);

    expect(wrapper.html()).toMatch(/Bot resource title/);
  });

  it('should not contain a title field if hasTitle=false', () => {
    const wrapper = mountWithIntl(<SmoochBotResourceEditor
      hasTitle={false}
      installationId="foo"
      resource={{
        foo: 'bar',
      }}
      onChange={() => {}}
    />);

    expect(wrapper.html()).not.toMatch(/Bot resource title/);
  });

  it('should render Delete resource button if onDelete callback is provided', () => {
    const wrapper = mountWithIntl(<SmoochBotResourceEditor
      installationId="foo"
      resource={{
        foo: 'bar',
      }}
      onChange={() => {}}
      onDelete={() => {}}
    />);

    expect(wrapper.html()).toMatch(/Delete resource/);
  });

  it('should render inactive toggle if no resource feed URL in data', () => {
    const wrapper = mountWithIntl(<SmoochBotResourceEditor
      installationId="foo"
      resource={{
        foo: 'bar',
      }}
      onChange={() => {}}
    />);

    expect(wrapper.find('WithStyles(ForwardRef(Switch))').props().checked).toBe(false);
    expect(wrapper.html()).not.toMatch(/Number of articles to return/);
  });

  it('should render active toggle if resource feed URL in data', () => {
    const wrapper = mountWithIntl(<SmoochBotResourceEditor
      installationId="foo"
      resource={{
        smooch_custom_resource_feed_url: 'http://foo.com/bar',
      }}
      onChange={() => {}}
    />);

    expect(wrapper.find('WithStyles(ForwardRef(Switch))').props().checked).toBe(true);
    expect(wrapper.html()).toMatch(/Number of articles to return/);
  });
});
