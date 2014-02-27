(function(g, Module) {

var _guid = 0;

function Base() {
	this.guid = ++_guid;
	this.options = {};
};

Base.unregister = function unregister(module) {
	if (!Module.manager) {
		return;
	}

	Module.manager.unregister(module);
};

Base.prototype = {

	document: null,

	element: null,

	guid: null,

	window: null,

	constructor: Base,

	init: function init(elementOrId, options) {
		if (elementOrId) {
			this.setElement(elementOrId);
		}

		if (options) {
			this.setOptions(options);
		}

		return this;
	},

	destructor: function destructor(keepElement) {
		Base.unregister(this);

		if (!keepElement && this.element && this.element.parentNode) {
			this.element.parentNode.removeChild(this.element);
		}

		this.element = this.options = this.document = this.window = null;
	},

	focus: function focus(anything) {
		var element,
			typeRegex = /checkbox|radio|submit|button|image|reset/,
		    selector = [
		    	"textarea",
		    	"select",
		    	"input[type=text]",
		    	"input[type=password]",
		    	"input[type=checkbox]",
		    	"input[type=radio]",
		    	"input[type=email]",
		    	"input[type=number]",
		    	"input[type=search]",
		    	"input[type=url]"
		    ];

		if (anything) {
			selector.push(
				"a",
				"button",
				"input[type=submit]",
				"input[type=button]",
				"input[type=image]",
				"input[type=reset]"
			);
		}

		element = this.element.querySelector(selector.join(", "));

		if (element && element.focus) {
			element.focus();

			if (element.select && !typeRegex.test(element.type)) {
				element.select();
			}
		}

		element = null;
	},

	_loading: function _loading(element) {
		(element || this.element).classList.add("loading");
		element = null;
	},

	_loaded: function _loaded(element) {
		(element || this.element).classList.remove("loading");
		element = null;
	},

	setElement: function setElement(elementOrId) {
		this.element = typeof elementOrId === "string"
		             ? document.getElementById(elementOrId)
		             : elementOrId;

		if (!this.element) {
			throw new Error("Could not find element: " + elementOrId);
		}

		this.document = this.element.ownerDocument;
		this.window = this.document.defaultView || this.document.parentWindow;
	},

	setOptions: function setOptions(overrides) {
		for (var key in overrides) {
			if (overrides.hasOwnProperty(key)) {
				this.options[key] = overrides[key];
			}
		}

		overrides = null;
	}

};

Module.Base = Base;





/*
Module.Base = Object.extend({

	prototype: {

		init: function init(elementOrId, options) {
			if (elementOrId) {
				this.setElement(elementOrId);
			}

			if (!this.hasOwnProperty("options")) {
				this.options = new Hash();
			}

			this._initOptions(this.options);

			if (options) {
				this.options.merge(options);
			}

			if (!this.delegator) {
				this.delegator = new dom.events.Delegator();
			}

			this.delegator.delegate = this;
			this.delegator.node = this.element;

			if (this.options.actionPrefix) {
				this.delegator.setActionPrefix(this.options.actionPrefix);
			}

			this.delegator.init();

			this._initActions();
			this._initCallbacks();
			this._initNotifications();
			this.initElementStore(this.element);
			this.callbacks.execute("beforeReady");
			this._ready();
			this.callbacks.execute("afterReady");

			if (this.options.defaultModule) {
				this.constructor.getManager().setDefaultModule(this);
			}

			return this;
		},

		destructor: function destructor(keepElement) {
			this.callbacks.execute("beforeDestroy");

			this.constructor.unregister(this);
			this.destroyElementStore();
			this.destroyCallbacks();

			if (this.delegator) {
				this.delegator.destructor();
			}

			if (!keepElement && this.element) {
				this.element.parentNode.removeChild(this.element);
			}

			if (this.options) {
				this.options.destructor();
			}

			this.actions = this.element = this.delegator = this.options = this.document = this.window = null;
		},

		cancel: function cancel(event, element, params) {
			event.stop();
			this.destructor();
			event = element = params = null;
		},

		_ready: function _ready() {

		},

		_initActions: function _initActions() {
			// TODO: Actions appear to be merging incorrectly here and making delegator double up on events
			var actions = new Hash(), proto = this.__proto__;

			while (proto) {
				if (proto.hasOwnProperty("actions")) {
					actions.safeMerge(proto.actions);
				}

				proto = proto.__proto__;
			}

			this.delegator.setEventActionMapping(actions);
		},

		_initCallbacks: function _initCallbacks() {
			var types = new Hash(), proto = this.__proto__;

			while (proto) {
				if (proto.hasOwnProperty("callbacks")) {
					types.safeMerge(proto.callbacks);
				}

				proto = proto.__proto__;
			}

			this.initCallbacks(types);
		},

		_initOptions: function _initOptions() {
			var proto = this.__proto__;

			while (proto) {
				if (proto.hasOwnProperty("options")) {
					this.options.safeMerge(proto.options);
				}

				proto = proto.__proto__;
			}
		},

	}

});
*/

// Make globally available
g.Module = Module;

})(this, this.Module || {});