describe("Module.Base", function() {

	var module,
	    element,
	    parentElement,
	    field;

	beforeEach(function() {
		element = document.createElement("div");
	});

	it("does not require constructor arguments", function() {
		module = new Module.Base();

		expect(module.element).toBe(null);
		expect(module.document).toBe(null);
		expect(module.window).toBe(null);
		expect(module.options).toEqual({});
		expect(typeof module.guid).toBe("number");
	});

	describe("init", function() {

		beforeEach(function() {
			module = new Module.Base();
			spyOn(module, "setElement");
			spyOn(module, "setOptions");
		});

		it("does not require arguments", function() {
			module.init();

			expect(module.setElement).not.toHaveBeenCalled();
			expect(module.setOptions).not.toHaveBeenCalled();
		});

		it("takes an HTML tag Id", function() {
			module.init("test");

			expect(module.setElement).toHaveBeenCalledWith("test");
			expect(module.setOptions).not.toHaveBeenCalled();
		});

		it("takes an HTML tag Id with option overrides", function() {
			module.init("test", {foo: "bar"});

			expect(module.setElement).toHaveBeenCalledWith("test");
			expect(module.setOptions).toHaveBeenCalledWith({foo: "bar"});
		});

		it("takes a DOM node reference", function() {
			module.init(element);

			expect(module.setElement).toHaveBeenCalledWith(element);
			expect(module.setOptions).not.toHaveBeenCalled();
		});

		it("takes a DOM node reference with option overrides", function() {
			module.init(element, {foo: "bar"});

			expect(module.setElement).toHaveBeenCalledWith(element);
			expect(module.setOptions).toHaveBeenCalledWith({foo: "bar"});
		});

		it("returns itself", function() {
			expect(module.init()).toBe(module);
		});

	});

	describe("destructor", function() {

		beforeEach(function() {
			parentElement = document.createElement("div");

			spyOn(parentElement, "removeChild").and.callThrough();

			module = new Module.Base();
			module.init(element);

			Module.manager = {
				unregister: function() {}
			};

			spyOn(Module.manager, "unregister");
		});

		afterEach(function() {
			Module.manager = null;
		});

		it("unregisters the module", function() {
			module.destructor();

			expect(Module.manager.unregister).toHaveBeenCalledWith(module);
		});

		it("removes the root element", function() {
			parentElement.appendChild(element);
			module.destructor();

			expect(parentElement.removeChild).toHaveBeenCalledWith(element);
			expect(element.parentNode).toBe(null);
		});

		it("does not attempt to remove the root element if already detached", function() {
			module.destructor();

			expect(parentElement.removeChild).not.toHaveBeenCalled();
		});

		it("keeps the root element attached to the parent node", function() {
			parentElement.appendChild(element);
			module.destructor(true);

			expect(element.parentNode).toBe(parentElement);
		});

		it("nullifies object references", function() {
			module.destructor();

			expect(module.element).toBe(null);
			expect(module.options).toBe(null);
			expect(module.document).toBe(null);
			expect(module.window).toBe(null);
		});

	});

	describe("focus", function() {

		beforeEach(function() {
			module.init(element);
		});

		all("form fields the user can type in receive focus and the text selected",
			[
				'<input type="text">',
				'<input type="search">',
				'<input type="url">',
				'<input type="email">',
				'<input type="password">',
				'<input type="number">',
				'<textarea rows="3" cols="2"></textarea>'
			],
			function(html) {
				element.innerHTML = html;
				field = element.firstChild;
				spyOn(field, "focus");
				spyOn(field, "select");

				module.focus();

				expect(field.focus).toHaveBeenCalled();
				expect(field.select).toHaveBeenCalled();
			}
		);

		it("does not set focus to hidden inputs", function() {
			element.innerHTML = '<input type="hidden">';
			field = element.firstChild;
			spyOn(field, "focus");
			spyOn(field, "select");

			module.focus();

			expect(field.focus).not.toHaveBeenCalled();
			expect(field.select).not.toHaveBeenCalled();
		});

		it("does not set focus to file inputs", function() {
			element.innerHTML = '<input type="file">';
			field = element.firstChild;
			spyOn(field, "focus");

			module.focus();

			expect(field.focus).not.toHaveBeenCalled();
		});

		all("form fields the user cannot type in receive focus",
			[
				'<input type="checkbox">',
				'<input type="radio">'
			],
			function(html) {
				element.innerHTML = html;
				field = element.firstChild;
				spyOn(field, "focus");
				spyOn(field, "select");

				module.focus();

				expect(field.focus).toHaveBeenCalled();
				expect(field.select).not.toHaveBeenCalled();
			}
		);

		all("focusable inputs may receive focus",
			[
				'<input type="submit">',
				'<input type="button">',
				'<input type="image">',
				'<input type="reset">'
			],
			function(html) {
				element.innerHTML = html;
				field = element.firstChild;
				spyOn(field, "focus");
				spyOn(field, "select");

				module.focus(true);

				expect(field.focus).toHaveBeenCalled();
				expect(field.select).not.toHaveBeenCalled();
			}
		);

		all("focusable elements may receive focus",
			[
				'<button></button>',
				'<a href="#">foo</a>'
			],
			function(html) {
				element.innerHTML = html;
				field = element.firstChild;
				spyOn(field, "focus");

				module.focus(true);

				expect(field.focus).toHaveBeenCalled();
			}
		);

		it("sets focus to dropdown lists", function() {
			element.innerHTML = '<select></select>';
			field = element.firstChild;
			spyOn(field, "focus");

			module.focus(true);

			expect(field.focus).toHaveBeenCalled();
		});

	});

	describe("setElement", function() {

		var origGetElementById;

		beforeEach(function() {
			origGetElementById = document.getElementById;
			module = new Module.Base();
		});

		afterEach(function() {
			document.getElementById = origGetElementById;
		});

		it("accepts a DOM node", function() {
			spyOn(document, "getElementById");
			module.setElement(element);

			expect(module.element).toBe(element);
			expect(document.getElementById).not.toHaveBeenCalled();
		});

		it("accepts an HTML tag Id", function() {
			spyOn(document, "getElementById").and.returnValue(element);
			module.setElement("foo");

			expect(module.element).toBe(element);
			expect(document.getElementById).toHaveBeenCalledWith("foo");
		});

		it("throws an error if the HTML tag Id is not found", function() {
			spyOn(document, "getElementById").and.returnValue(null);

			expect(function() {
				module.setElement("foo");
			}).toThrowError("Could not find element: foo");

			expect(document.getElementById).toHaveBeenCalledWith("foo");
		});

		it("sets the document and window properties based on the element", function() {
			module.setElement(element);

			expect(module.document).toBe(document);
			expect(module.window).toBe(window);
		});

	});

	describe("setOptions", function() {

		beforeEach(function() {
			module = new Module.Base();
		});

		it("overrides options", function() {
			module.options = {
				foo: "bar"
			};

			module.setOptions({
				foo: "foo"
			});

			expect(module.options.foo).toBe("foo");
		});

		it("performs a shallow copy", function() {
			var a = {
				x: 0
			};
			var b = {
				y: 5
			};

			module.options = {
				a: a
			};

			module.setOptions({
				a: b
			});

			expect(module.options.a).toBe(b);
			expect(module.options.a.x).toBe(undefined);
			expect(module.options.a.y).toBe(5);
		});

	});

});
