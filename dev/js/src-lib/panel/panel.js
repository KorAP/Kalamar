/**
 * Create a panel for a certain aspect of the system, like
 * the result, a match, or the VC.
 *
 * The buttons are associated with the panel's views,
 * though they are integrated independently
 */
import buttonGroupClass from '../buttongroup/buttongroup.js';
import '../util/util.js';

class Panel {

    type = 'base';
    
    constructor (classes) {
      this.views = [];

      /**
       * Main action buttons for the panel,
       * may be at the bottom (for matches)
       * or as tabs (for the result).
       */

      this._classes = classes;
      const c = ['action', 'button-panel'];

      if (classes)
        c.push.apply(c,classes);

      this._actions = new buttonGroupClass(c).bind(this);

      //prepend or append views of the panel
      this.prepend = false;
      
      // Warning: This is circular
      this._actions.panel = this;
    }


    /**
     * The actions of the panel.
     * Can be represented as a buttongroup,
     * a list, ..., requires an "add()" minimum at least.
     */
    actions () {
      return this._actions;
    }
    

    /**
     * The element of the panel
     */
    element () {
      if (this._el)
        return this._el;

      // Create panel element
      const e = document.createElement('div');
      const cl = e.classList;
      cl.add('panel');
   
      if (this._classes)
        cl.add.apply(cl, this._classes);

      this._viewE = e.addE('div');

      // Per default the action buttons are below the view
      // and integrated
      const aElem = this.actions().element();
      if (!aElem.parentNode)
        e.appendChild(aElem);

      return this._el = e;
    }


    /*
     * The element of the views
     */
    _viewElement () {
      this.element();
      return this._viewE;
    }


    /**
     * Add a view to the panel
     */
    add (view) {

      // Add view to views list
      this.views.push(view);

      // Append or prepend element to panel element
      if (this.prepend){
        this._viewElement().prepend(
          view.element()
        );
      }
      else{
        this._viewElement().appendChild(
          view.element()
        );
      }
      
      if (view.afterEmbed)
        view.afterEmbed();
      
      view.panel = this;
    }


    /**
     * Delete a closed view from panel
     */
    delView (view) {
      this.views.forEach(function(e, i, a) {
        if (e === view)
          a[i] = undefined;
      });
    }
}

export default Panel;
