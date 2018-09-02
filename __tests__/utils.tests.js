const { smartDiff } = require('../utils.js');

describe('smartDiff', () => {
  describe('diffRatio', () => {
    test('identical', () => {
      const text1 = 'aaa bbb';
      const text2 = 'aaa bbb';
      const diff = smartDiff(text1, text2);
      expect(diff.diffRatio).toBe(0);
    });
    test('similar with same prefix', () => {
      const text1 = 'aaa bbb ccc';
      const text2 = 'aaa bbb ddd';
      const diff = smartDiff(text1, text2);
      expect(diff.diffRatio).toBe(6 / 14);
    });
    test('similar with different prefix', () => {
      const text1 = 'f aaa bbb ccc';
      const text2 = 'aaa bbb ddd';
      const diff = smartDiff(text1, text2);
      expect(diff.diffRatio).toBe(8 / 16);
    });
  });
  describe('prefixMatch', () => {
    test('identical', () => {
      const text1 = 'aaa bbb';
      const text2 = 'aaa bbb';
      const diff = smartDiff(text1, text2);
      expect(diff.prefixMatch).toBe(text1.length);
    });
    test('similar with same prefix', () => {
      const text1 = 'aaa bbb ccc';
      const text2 = 'aaa bbb ddd';
      const diff = smartDiff(text1, text2);
      expect(diff.prefixMatch).toBe(8);
    });
    test('similar with different prefix', () => {
      const text1 = 'f aaa bbb ccc';
      const text2 = 'aaa bbb ddd';
      const diff = smartDiff(text1, text2);
      expect(diff.prefixMatch).toBe(0);
    });
  });
  describe('suffixMatch', () => {
    test('identical', () => {
      const text1 = 'aaa bbb';
      const text2 = 'aaa bbb';
      const diff = smartDiff(text1, text2);
      expect(diff.suffixMatch).toBe(text1.length);
    });
    test('similar with same suffix', () => {
      const text1 = 'ccc bbb ddd';
      const text2 = 'aaa bbb ddd';
      const diff = smartDiff(text1, text2);
      expect(diff.suffixMatch).toBe(8);
    });
    test('similar with different suffix', () => {
      const text1 = 'aaa bbb ccc';
      const text2 = 'aaa bbb ccc f';
      const diff = smartDiff(text1, text2);
      expect(diff.suffixMatch).toBe(0);
    });
  });
});
