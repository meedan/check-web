import {
  emojify
} from '../../src/app/helpers';

describe('Helpers', function() {
  it('converts emojis', function() {
    expect(emojify('I :heart: U')).toEqual('I ❤️ U');
  });
});
