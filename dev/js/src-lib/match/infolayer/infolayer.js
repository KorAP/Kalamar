/**
 * Object representing information
 * about a match's layer annotation.
 */
const _AvailableRE =
    new RegExp("^([^\/]+?)\/([^=]+?)(?:=(spans|rels|tokens))?$");

export default class InfoLayer {
  /**
   * Create new match information
   * object for one layer.
   *
   * Alternatively pass a string as
   * <tt>base/s=span</tt>
   *
   * @param foundry
   */
  constructor (foundry, layer, type='tokens') {
    if (foundry === undefined)
	      throw new Error("Missing parameters");

    if (layer === undefined) {
        const match = _AvailableRE.exec(foundry);
        if (!match) throw new Error("Missing parameters");
	      
          this.foundry = match[1];
          this.layer = match[2];
          this.type = match[3] || 'tokens';
	      }
	    
    else {
        this.foundry = foundry;
        this.layer = layer;
        this.type = type;
    }

  }
}

