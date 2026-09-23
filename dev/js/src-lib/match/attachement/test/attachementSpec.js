import { describe, it, expect } from 'vitest';
import attachementClass from '../attachement.js';

describe('KorAP.Attachement', function () {
  it('should handle attachements', function () {
    let uri = new attachementClass("data:text/plain;title=new,Hallo");
    expect(uri.contentType).toEqual("text/plain");

    expect(uri.payload).toEqual("Hallo");
    expect(uri.base64).toBeFalsy();
    expect(uri.isLink).toBeFalsy();
    expect(uri.param["title"]).toEqual("new");

    uri = new attachementClass("data:application/x.korap-link,https://de.wikipedia.org/wiki/Beispiel");
    expect(uri.contentType).toEqual("application/x.korap-link");
    expect(uri.payload).toEqual("https://de.wikipedia.org/wiki/Beispiel");
    expect(uri.base64).toBeFalsy();
    expect(uri.isLink).toBeTruthy();
    expect(uri.inline().textContent).toEqual("https://de.wikipedia.org/wiki/Beispiel");
    expect(uri.inline().nodeType).toEqual(1);
    expect(uri.inline().tagName).toEqual("A");
    expect(uri.inline().getAttribute("rel")).toEqual("noopener noreferrer");


    uri = new attachementClass("data:application/x.korap-link;title=Das ist ein Titel,https://de.wikipedia.org/wiki/Beispiel");
    expect(uri.contentType).toEqual("application/x.korap-link");
    expect(uri.payload).toEqual("https://de.wikipedia.org/wiki/Beispiel");
    expect(uri.base64).toBeFalsy();
    expect(uri.isLink).toBeTruthy();
    expect(uri.inline().textContent).toEqual("Das ist ein Titel");
    expect(uri.inline().nodeType).toEqual(1);
    expect(uri.inline().tagName).toEqual("A");
    expect(uri.inline().getAttribute("rel")).toEqual("noopener noreferrer");


    uri = new attachementClass("data:text/plain;base64,SGVsbG8sIFdvcmxkIQ%3D%3D");
    expect(uri.contentType).toEqual("text/plain");
    expect(uri.payload).toEqual("Hello, World!");
    expect(uri.base64).toBeTruthy();
    expect(uri.isLink).toBeFalsy();
    expect(uri.inline().nodeType).toEqual(3);
    expect(uri.inline().textContent).toEqual("Hello, World!");

    uri = new attachementClass("data:text/plain;title= new ; subTitle = old ;base64,SGVsbG8sIFdvcmxkIQ%3D%3D");
    expect(uri.contentType).toEqual("text/plain");
    expect(uri.payload).toEqual("Hello, World!");
    expect(uri.param["title"]).toEqual("new");
    expect(uri.param["subTitle"]).toEqual("old");
    expect(uri.base64).toBeTruthy();
    expect(uri.isLink).toBeFalsy();
    expect(uri.inline().nodeType).toEqual(3);
    expect(uri.inline().textContent).toEqual("Hello, World!");
  });
});
