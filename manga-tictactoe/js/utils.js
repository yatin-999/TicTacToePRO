/**
 * utils.js — Shared utility functions
 * Manga Tic Tac Toe — INK & CHAOS
 */

'use strict';

const Utils = (() => {

  /**
   * Clamp a number between min and max
   */
  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  /**
   * Random float between min and max
   */
  const randBetween = (min, max) => Math.random() * (max - min) + min;

  /**
   * Random integer between min (inclusive) and max (inclusive)
   */
  const randInt = (min, max) => Math.floor(randBetween(min, max + 1));

  /**
   * Random item from array
   */
  const randItem = (arr) => arr[randInt(0, arr.length - 1)];

  /**
   * Deep clone an object/array
   */
  const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

  /**
   * Debounce function
   */
  const debounce = (fn, delay) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), delay);
    };
  };

  /**
   * Format date as readable string
   */
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  /**
   * Load from localStorage with fallback
   */
  const loadStorage = (key, fallback) => {
    try {
      const val = localStorage.getItem(key);
      return val !== null ? JSON.parse(val) : fallback;
    } catch {
      return fallback;
    }
  };

  /**
   * Save to localStorage
   */
  const saveStorage = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('localStorage unavailable:', e);
    }
  };

  /**
   * Create an element with attributes and children
   */
  const createElement = (tag, attrs = {}, ...children) => {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'class') el.className = v;
      else if (k === 'style') Object.assign(el.style, v);
      else el.setAttribute(k, v);
    });
    children.forEach(child => {
      if (typeof child === 'string') el.appendChild(document.createTextNode(child));
      else if (child instanceof Element) el.appendChild(child);
    });
    return el;
  };

  /**
   * Wait (promise-based sleep)
   */
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  /**
   * Linear interpolation
   */
  const lerp = (a, b, t) => a + (b - a) * t;

  /**
   * Get center coordinates of an element relative to viewport
   */
  const getCenter = (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };

  /**
   * Shuffle an array (Fisher-Yates)
   */
  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = randInt(0, i);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  return {
    clamp, randBetween, randInt, randItem, deepClone,
    debounce, formatDate, loadStorage, saveStorage,
    createElement, wait, lerp, getCenter, shuffle
  };

})();

window.Utils = Utils;
