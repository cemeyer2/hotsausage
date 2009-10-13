(function () {
	var	_respectsCoreObjects = true;
	var _attachModule = function (name, createModuleAction) {
		var newModule;
		if (typeof this[name] !== 'undefined') {
			throw Error("Module named " name + " already globally defined!");
		}
		newModule = createModuleAction(this);
		newModule.module = _attachModule;
		this[name] = newModule;
	};

	_attachModule("HotSausage", function () {
		return {
			enableUseFromCore: function () {_respectsCoreObjects = false;},
			respectsCore: function () {return _respectsCoreObjects;},
			module: _attachModule
		};
	};
})();

	