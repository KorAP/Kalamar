import { describe, it, expect } from 'vitest';
import InfoLayer from '../infolayer.js';

describe('KorAP.InfoLayer', function () {
  it('should be initializable', function () {
    expect(
      function () { new InfoLayer(); }
    ).toThrow(new Error('Missing parameters'));

    expect(
      function () { new InfoLayer('base'); }
    ).toThrow(new Error('Missing parameters'));

    var layer = new InfoLayer('base', 's');
    expect(layer).toBeTruthy();
    expect(layer.foundry).toEqual('base');
    expect(layer.layer).toEqual('s');
    expect(layer.type).toEqual('tokens');

    layer = new InfoLayer('cnx', 'syn', 'spans');
    expect(layer).toBeTruthy();
    expect(layer.foundry).toEqual('cnx');
    expect(layer.layer).toEqual('syn');
    expect(layer.type).toEqual('spans');

    layer = new InfoLayer('base/s=spans');
    expect(layer).toBeTruthy();
    expect(layer.foundry).toEqual('base');
    expect(layer.layer).toEqual('s');
    expect(layer.type).toEqual('spans');

    layer = new InfoLayer('base/s');
    expect(layer).toBeTruthy();
    expect(layer.foundry).toEqual('base');
    expect(layer.layer).toEqual('s');
    expect(layer.type).toEqual('tokens');

  });
});
