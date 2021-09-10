"use strict";

define(function () {
  return {
    create : function () {
      const o = Object.create(this);
      const p = document.getElementById('pagination');
      o.ds = p ? p.dataset : {};
      return o;
    },
    page : function () {
      return parseInt(this.ds["page"] || 0);
    },
    total : function () {
      return parseInt(this.ds["total"] || 0);
    },
    count : function () {
      return parseInt(this.ds["count"] || 0);
    }
  }
});
