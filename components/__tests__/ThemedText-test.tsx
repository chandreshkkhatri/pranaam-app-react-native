import * as React from 'react';
import renderer from 'react-test-renderer';

import { ThemedText } from '../ThemedText';

it(`renders correctly`, () => {
  const tree = renderer.create(<ThemedText>Snapshot test!</ThemedText>).toJSON();

  expect(tree).toMatchSnapshot();
});

it('applies title styles', () => {
  const tree = renderer.create(<ThemedText type="title">Styled</ThemedText>).toJSON() as renderer.ReactTestRendererJSON;

  const style = Array.isArray(tree.props.style)
    ? tree.props.style.filter(Boolean)
    : [tree.props.style];
  const mergedStyle = Object.assign({}, ...style);

  expect(mergedStyle.fontSize).toBe(32);
  expect(mergedStyle.fontWeight).toBe('bold');
  expect(mergedStyle.lineHeight).toBe(32);
});
