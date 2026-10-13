import { readFileSync } from 'fs';
import { test } from 'node:test';
import { strict as assert } from 'node:assert';

const html = readFileSync('./index.html', 'utf8');

test('index.html exists and is valid HTML', () => {
  assert.ok(html.length > 0, 'HTML file should not be empty');
  assert.ok(html.toLowerCase().includes('<!doctype html>'), 'Should have HTML5 doctype');
  assert.ok(html.includes('<html'), 'Should have html tag');
  assert.ok(html.includes('</html>'), 'Should have closing html tag');
});

test('page has required meta tags', () => {
  assert.ok(html.includes('<meta charset=') || html.includes('<meta charset='), 'Should have charset meta tag');
  assert.ok(html.includes('viewport'), 'Should have viewport meta tag');
});

test('page has title', () => {
  assert.ok(html.includes('<title>'), 'Should have title tag');
  assert.ok(html.match(/<title>(.+?)<\/title>/), 'Title should not be empty');
});

test('page links to CSS and JS', () => {
  assert.ok(html.includes('styles.css'), 'Should link to styles.css');
  assert.ok(html.includes('motion.js'), 'Should link to motion.js');
});

test('required files exist', () => {
  assert.ok(readFileSync('./styles.css', 'utf8').length > 0, 'styles.css should exist');
  assert.ok(readFileSync('./motion.js', 'utf8').length > 0, 'motion.js should exist');
  assert.ok(readFileSync('./README.md', 'utf8').length > 0, 'README.md should exist');
});
