"use strict";

(function () {
	var _HotSausage;
	
	var _newObject = (function () {
			var _BehaviorlessObject = function () {};
			_BehaviorlessObject.prototype = null;
			return function (delegate_) {
				var SingleUseConstructor;
				if (delegate_) {
					SingleUseConstructor = function () {};
					SingleUseConstructor.prototype = delegate_;
					return new SingleUseConstructor();
				}
				return new _BehaviorlessObject();
			};
		})();
		
	var _isDefined = function (target) {return typeof target !== 'undefined';};
	
	var _onSubmoduleNameAssigned = function (module, name) {
		if (_HotSausage.handlesErrorsQuietly) {return;}
		var error = new Error("Property " + name + " already defined in module!");
		error.name = "CannotCreateSubmodule";
		throw error;
	};
	
	var _newModule, _Module;
	
	_newModule = function (parent, parentPurse, name, setupAction_) {
		var module, purse;
		if (_isDefined(parent[name])) {return _onSubmoduleNameAssigned(parent, name);}
		purse = _newObject(parentPurse);
		module = new _Module(name, purse);
		setupAction_ && setupAction_(module, purse);
		return (parent[name] = module);
	};
	
	_Module = function (_name, _purse) {
		var _submodules = [];
		this.name = function () {return _name;};
		this.currentSubmodules = function () {_submodules.slice();};
		this.submodulesDo = function (action) {_submodules.forEach(action);};
		this.newSubmodule = function (submoduleName, setupAction_) {
			_submodules.push(_newModule(this, _purse, submoduleName, setupAction_));
		};
		_purse.module = this;
	};	

	_Module.prototype.withAllSubmodulesDo = function (action) {
		action(this);
		this.allSubmodulesDo(action);
	};

	_Module.prototype.allSubmodulesDo = function (_action) {
		this.submodulesDo(function (submodule) {
			submodule.withAllSubmodulesDo(_action);
		});
	};

	_Module.prototype.hasOwnProperty = Object.prototype.hasOwnProperty;
		
	_newModule(this, null, "HotSausage", function (HS, _HS) {
		var _setMethod = function (behavior, methodName, implementationFunc) {
			if (implementationFunc) { 
				behavior[methodName] = implementationFunc;
			} else {
				delete behavior[methodName];
			}
		};
		
		var _allSubmodulesOfPerform = function (_methodName) {
			HS.allSubmodulesDo(function (submodule) {
				if (submodule.hasOwnProperty(_methodName)) {submodule[_methodName]();}
			});
		};
		
		_HotSausage = _HS;
		_HS.handlesErrorsQuietly = false;
		_HS.coreMethodsEnabled = false;

		_HS.newObject = _newObject;		
		_HS.delegateOf = function (target) {
			return target.constructor.prototype;
			// Alternate ways to access the target's prototype (aka delegate):
			// 		return target.__proto__;
			// 		return target.constructor.prototype;
			// 		return Object.getPrototypeOf(target);
		};

		HS.methodOn = _setMethod;
		HS.isDefined = _isDefined;
		HS.isUndefined = function (target) {return typeof target === 'undefined';};
		HS.isString = function (target) {return typeof target === 'string';};
		HS.isPrivateProperty = function (propertyName) {return propertyName.charAt(0) === '_';};
		HS.notPrivateProperty = function (propertyName) {return propertyName.charAt(0) !== '_';};
		
		HS.handleErrorsQuietly = function () {_HS.handlesErrorsQuietly = true;};		
		
		HS.respectsCore = function () {return !_HS.coreMethodsEnabled;};
		HS.installCoreMethods = function () {
			if (_HS.coreMethodsEnabled) {return true;} 
			if (Object.prototype.method) {return false;}
			if (Function.prototype.method) {return false;}
			Object.prototype.method = function (methodName, implementationFunc) {
				_setMethod(this, methodName, implementationFunc);
			};
			Function.prototype.method = function (methodName, implementationFunc) {
				_setMethod(this.prototype, methodName, implementationFunc);
			};
			_allSubmodulesOfPerform("installCoreMethods");
			_HS.coreMethodsEnabled = true;
			return true;
		};
		
		HS.lock = function () {
			if(_HS.isLocked) {return;}
			delete HS.methodOn;
			delete HS.handleErrorsQuietly;
			delete HS.enableCoreMethods;
			if (_HS.coreMethodsEnabled) {
				delete Object.prototype.method;
				delete Function.prototype.method;
			}
			_allSubmodulesOfPerform("lock");
			_HS.isLocked = true;
		};
	});	
})();
	