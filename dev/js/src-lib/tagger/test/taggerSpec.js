import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Tagger from '../tagger.js';
import '../../palette.js';

describe('Tagger', () => {
  let container;
  let tagger;

  beforeEach(() => {
    // Create a container element for the tagger
    container = document.createElement('div');
    document.body.appendChild(container);
    
    // Initialize the tagger
    tagger = new Tagger(container);
  });

  afterEach(() => {
    // Clean up
    document.body.removeChild(container);
  });

  it('should initialize with correct default values', () => {
    expect(tagger._nr).toBe(0);
    expect(tagger._elem).toBe(container);
    expect(Array.isArray(tagger._cat)).toBe(true);
    expect(tagger._cat.length).toBe(0);
  });

  it('should create a div element on initialization', () => {
    expect(container.children.length).toBeGreaterThan(0);
    expect(container.firstChild.tagName).toBe('DIV');
  });

  it('should create an input element on initialization', () => {
    const input = container.querySelector('input');
    expect(input).not.toBeNull();
    expect(input.getAttribute('type')).toBe('text');
  });

  it('should add a tag with addTag method', () => {
    const tagName = 'TestTag';
    tagger.addTag(tagName);

    expect(tagger._cat[0]).toBe(tagName);
    expect(tagger._nr).toBe(1);
  });

  it('should increment counter for each tag added', () => {
    tagger.addTag('Tag1');
    tagger.addTag('Tag2');
    tagger.addTag('Tag3');

    expect(tagger._nr).toBe(3);
    expect(tagger._cat.length).toBe(3);
  });

  it('should create span elements for added tags', () => {
    tagger.addTag('TestTag');

    const tagElement = container.firstChild.querySelector('span');
    expect(tagElement).not.toBeNull();
    expect(tagElement.textContent).toContain('TestTag');
  });

  it('should add a close button to each tag', () => {
    tagger.addTag('TestTag');

    const tagElement = container.firstChild.querySelector('span');
    const closeButton = tagElement.querySelector('span.close');
    expect(closeButton).not.toBeNull();
  });

  it('should assign colors to tags based on palette', () => {
    tagger.addTag('ColoredTag');

    const tagElement = container.firstChild.querySelector('span');
    const backgroundColor = tagElement.style.backgroundColor;

    expect(backgroundColor).toBeTruthy();
  });

  it('should trigger addTag on Enter key press', () => {
    const input = container.querySelector('input');
    const tagName = 'KeyPressTag';
    input.value = tagName;

    const event = new KeyboardEvent('keypress', {
      keyCode: 13,
      key: 'Enter',
      bubbles: true
    });

    input.dispatchEvent(event);

    expect(tagger._cat[0]).toBe(tagName);
    expect(input.value).toBe('');
    expect(tagger._nr).toBe(1);
  });

  it('should not trigger addTag on non-Enter keys', () => {
    const input = container.querySelector('input');
    input.value = 'ShouldNotBeAdded';

    const event = new KeyboardEvent('keypress', {
      keyCode: 65,
      key: 'a',
      bubbles: true
    });

    input.dispatchEvent(event);

    expect(tagger._cat.length).toBe(0);
    expect(tagger._nr).toBe(0);
    expect(input.value).toBe('ShouldNotBeAdded');
  });

  it('should handle multiple tags with different names', () => {
    tagger.addTag('JavaScript');
    tagger.addTag('Testing');
    tagger.addTag('Vitest');

    expect(tagger._nr).toBe(3);
    expect(tagger._cat.length).toBe(3);
    expect(tagger._cat[0]).toBe('JavaScript');
    expect(tagger._cat[1]).toBe('Testing');
    expect(tagger._cat[2]).toBe('Vitest');
  });

  it('should allow empty tag names', () => {
    tagger.addTag('');

    expect(tagger._cat[0]).toBe('');
    expect(tagger._nr).toBe(1);
  });

  it('should handle special characters in tag names', () => {
    const specialTag = '<script>alert("test")</script>';
    tagger.addTag(specialTag);

    expect(tagger._cat[0]).toBe(specialTag);
    expect(tagger._nr).toBe(1);
  });
});
