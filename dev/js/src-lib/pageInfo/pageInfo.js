export default class PageInfo {
  constructor() {
    const p = document.getElementById('pagination');
    this.ds = p ? p.dataset : {};
  }

  page() {
    return parseInt(this.ds["page"] || 0);
  }

  total() {
    return parseInt(this.ds["total"] || 0);
  }

  count() {
    return parseInt(this.ds["count"] || 0);
  }
}
