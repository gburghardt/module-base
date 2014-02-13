var WelcomeModule = Module.Base.extend({
	prototype: {
		options: {
			backgroundColor: "#f0f0f0"
		},

		_ready: function() {
			Module.Base.prototype._ready.call(this);
			this.element.innerHTML = "Welcome!";
			this.element.style.backgroundColor = this.options.backgroundColor;
		}
	}
});
