'use strict';

const fs = require('fs');
const path = require('path');
const { assert, section, test } = require('./harness');

const AUDIO_DIR = path.join(__dirname, '..', 'audio');
const REQUIRED = [
  'sfx_screw_out.wav',
  'sfx_slot_in.wav',
  'sfx_match.wav',
  'sfx_collapse.wav',
  'sfx_warn.wav',
  'sfx_win.wav',
  'sfx_lose.wav'
];

section('Audio assets');

test('all 7 sfx files exist', () => {
  for (let i = 0; i < REQUIRED.length; i++) {
    const p = path.join(AUDIO_DIR, REQUIRED[i]);
    assert(fs.existsSync(p), 'missing ' + REQUIRED[i]);
  }
});

test('each sfx under 100KB', () => {
  for (let i = 0; i < REQUIRED.length; i++) {
    const p = path.join(AUDIO_DIR, REQUIRED[i]);
    const st = fs.statSync(p);
    assert(st.size > 0, REQUIRED[i] + ' empty');
    assert(st.size < 100 * 1024, REQUIRED[i] + ' too big: ' + st.size);
  }
});

test('wav headers valid (RIFF, mono, 22050Hz)', () => {
  for (let i = 0; i < REQUIRED.length; i++) {
    const p = path.join(AUDIO_DIR, REQUIRED[i]);
    const buf = fs.readFileSync(p);
    assert(buf.toString('ascii', 0, 4) === 'RIFF', REQUIRED[i] + ' not RIFF');
    assert(buf.toString('ascii', 8, 12) === 'WAVE', REQUIRED[i] + ' not WAVE');
    const channels = buf.readUInt16LE(22);
    const rate = buf.readUInt32LE(24);
    assert(channels === 1, REQUIRED[i] + ' not mono');
    assert(rate === 22050, REQUIRED[i] + ' wrong rate ' + rate);
  }
});
