import React from 'react';
import { shallow } from 'enzyme';
import { FormattedMessage } from 'react-intl';
import TextField from './TextField';
import VolumeUpIcon from '../../../icons/volume_up.svg';
import VolumeOffIcon from '../../../icons/volume_off.svg';

describe('<TextField />', () => {
  it('should render bare TextField component', () => {
    const textField = shallow(<TextField />);
    const input = textField.find('input');
    expect(input).toHaveLength(1);
    // If missing non-required props, it should not render any of those elements
    const label = textField.find('label');
    expect(label).toHaveLength(0);
    expect(textField.find(FormattedMessage)).toHaveLength(0);
    expect(textField.find('svg')).toHaveLength(0); // no icons
    expect(textField.find('.TextField-help')).toHaveLength(0);
    expect(input.prop('placeholder')).toBeFalsy();
    expect(input.prop('error')).toBeFalsy();
    expect(input.prop('disabled')).toBeFalsy();
    expect(input.prop('value')).toBeFalsy();
    expect(input.prop('className')).not.toContain('outline');
    const textArea = textField.find('textarea');
    expect(textArea).toHaveLength(0);
  });

  it('should render a label', () => {
    const textField = shallow(<TextField
      label="My label"
    />);
    const label = textField.find('label');
    expect(label.text()).toEqual('My label');
  });

  it('should render icons', () => {
    const textField = shallow(<TextField
      iconLeft={<VolumeUpIcon className="icon__vol-up" />}
      iconRight={<VolumeOffIcon className="icon__vol-off" />}
    />);
    const input = textField.find('input');
    expect(input).toHaveLength(1);
    expect(textField.find('.icon__vol-up')).toHaveLength(1);
    expect(textField.find('.icon__vol-off')).toHaveLength(1);
  });

  it('should render placeholder text', () => {
    const textField = shallow(<TextField
      placeholder="placeholder text"
    />);
    const input = textField.find('input');
    expect(input).toHaveLength(1);
    expect(input.prop('placeholder')).toEqual('placeholder text');
  });

  it('should render required message', () => {
    const textField = shallow(<TextField
      required
    />);
    const input = textField.find('input');
    expect(input).toHaveLength(1);
    expect(textField.find(FormattedMessage).prop('defaultMessage'))
      .toEqual('Required');
  });

  it('should render help content', () => {
    const textField = shallow(<TextField
      helpContent={<span className="TextField-help">My help text</span>}
    />);
    const input = textField.find('input');
    expect(input).toHaveLength(1);
    expect(textField.find('.TextField-help').text()).toContain('My help text');
  });

  it('should render error state', () => {
    const textField = shallow(<TextField
      error
    />);
    const input = textField.find('input');
    expect(input).toHaveLength(1);
    expect(input.prop('error')).toBeTruthy();
  });

  it('should render disabled state', () => {
    const textField = shallow(<TextField
      disabled
    />);
    const input = textField.find('input');
    expect(input).toHaveLength(1);
    expect(input.prop('disabled')).toBeTruthy();
  });

  it('should render value', () => {
    const textField = shallow(<TextField
      value="test text"
    />);
    const input = textField.find('input');
    expect(input).toHaveLength(1);
    expect(input.prop('value')).toEqual('test text');
  });

  it('should render a textarea', () => {
    const textField = shallow(<TextField
      textArea
    />);
    const input = textField.find('input');
    expect(input).toHaveLength(0);
    const textArea = textField.find('textarea');
    expect(textArea).toHaveLength(1);
  });

  it('should render everything', () => {
    const textField = shallow(<TextField
      disabled
      error
      helpContent={<span className="TextField-help">My help text</span>}
      iconLeft={<VolumeUpIcon className="icon__vol-up" />}
      iconRight={<VolumeOffIcon className="icon__vol-off" />}
      label="My label"
      placeholder="placeholder text"
      required
      textArea
      value="test text"
    />);
    const label = textField.find('label');
    expect(label.text()).toEqual('My label');
    const input = textField.find('input');
    expect(input).toHaveLength(0);
    const textArea = textField.find('textarea');
    expect(textArea).toHaveLength(1);
    expect(textArea.prop('value')).toEqual('test text');
    expect(textArea.prop('disabled')).toBeTruthy();
    expect(textArea.prop('error')).toBeTruthy();
    expect(textField.find('.TextField-help').text()).toContain('My help text');
    expect(textField.find(FormattedMessage).prop('defaultMessage'))
      .toEqual('Required');
    expect(textField.find('.icon__vol-up')).toHaveLength(1);
    expect(textField.find('.icon__vol-off')).toHaveLength(1);
  });
});
