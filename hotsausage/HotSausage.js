


"use strict";

/**
 * HotSausage JavaScript Framework
 * @fileOverview this file sets up the HotSausage JavaScript Framework
 * @author Maurice Rabb
 * @author Charlie Meyer
 */

/*jslint undef: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, strict: true, newcap: true, immed: true */

(function () {
	var UNDEFINED = 'undefined';
	var STRING = 'string';
	var BOOLEAN = 'boolean';
	var HAS_OWN_PROPERTY = Object.prototype.hasOwnProperty;
	
	// the purse
	var _HotSausage;
	
	/**
	 * creates a new object, either having a null prototype or having the
	 * prototype of the delegate supplied as a parameter
	 * @function
	 * @inner
	 * @param {Function} delegate_ supplied optional prototype of the returned object
	 * @returns {Function} a new object, as described above
	 */
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
	
	/**
	 * returns whether or not an object is defined
	 * @function
	 * @inner
	 * @param target the target to check
	 * @returns {Boolean} true if the object is defined, false otherwise
	 */
	var _isDefined = function (target) {return typeof target !== UNDEFINED;};
	
	var _createConstantAccessor = function (_value) {
		return function () {return _value;};
	};
	
	var _handleError = function (errorName, errorMessage) {
		if (_HotSausage.handlesErrorsQuietly) {return;}
		var error = new Error(errorMessage);
		error.name = errorName;
		throw error;
	};
	
	/**
	 * is called when creating a submodule that already exists in the parent that it
	 * was trying to be added to
	 * @function
	 * @inner
	 * @param {Object} module the module which already contains the submodule referenced by parameter name
	 * @param {String} name the name of the submodule that is already defined
	 * @throws {Error} due to the new submodule already existing if handle errors quietly is not set to true
	 */
	var _onSubmoduleNameAssigned = function (module, name) {
		_handleError("CannotCreateSubmodule", "Property " + name + " already defined in module!");
		return null;
	};
	
	var _attachResultingModule = function (target, name, moduleAction) {
		//check to see if the submodule already exists, if so, call the failure function
		if (_isDefined(target[name])) {return _onSubmoduleNameAssigned(target, name);}
		return (target[name] = moduleAction());
	};

	/**
	 * Creates an empty module with basic functionality. The purse's module
	 * attribute is set to a reference to this object when the construction
	 * of the object is finished.
	 * @constructor
	 * @param {String} name the name of the new module
	 * @param {Object} the parent module the new module
	 * @param {Object} the parent purse of the new module
	 */
	var _HSModule = function (name, parent, parentPurse) {
		var _submodules = [];
		var _hierarchicalPurse = _newObject(parentPurse);
		_hierarchicalPurse.sharedPurse = parentPurse;
		_hierarchicalPurse.module = this;
		
		/**
		 * returns the name of the module
		 * @function
		 * @return {String} the name of the module
		 */
		this.name = _createConstantAccessor(name);
		
		this.module = _createConstantAccessor(parent);
		
		/**
		 * returns all current submodules of this module
		 * @function
		 * @returns {Array} an array of submodules
		 */
		this.currentSubmodules = function () {return _submodules.slice(0);};
		
		/**
		 * executes an action on each submodule of this module
		 * 
		 * CM --> M3: Array.forEach is listed as an extension to the ECMA-262 standard,
		 * will it be guaranteed to be on all implementations? I think it would be safer
		 * to implement our own forEach
		 * 
		 * @function
		 * @private
		 * @param {Function} action a function that takes a single parameter, a submodule object,
		 * and executes some action on that submodule
		 */
		this.submodulesDo = function (action) {_submodules.forEach(action);};
		
		/**
		 * gives controlled access to the hierarchical purse of the module.
		 * @function
		 * @param {Function} extendAction take two parameters, the module itself 
		 * and the purse for the module
		 */		
		this.extend = function (extendAction) {extendAction(this, _hierarchicalPurse);};

		/**
		 * adds a new submodule to this module. this module is set as the parent
		 * of the new submodule and this module's purse's prototype is set as
		 * the prototype for the new submodule's purse
		 * @function
		 * @param {String} submoduleName the name of the submodule to create
		 */
		this.newSubmodule = function (_submoduleName, _setupAction_) {
			return _attachResultingModule(this, _submoduleName, function () {
				var submodule = new _HSModule(_submoduleName, this, _hierarchicalPurse);
				_submodules.push(submodule);
				if (_setupAction_) {this.extend(_setupAction_);}
				return submodule;
			});
		};
	};	

	/**
	 * executes an action on this module and all submodules of
	 * this module
	 * @param {Function} action the action to execute, should take one
	 * parameter, the module that is being acted upon
	 */
	_HSModule.prototype.withAllSubmodulesDo = function (action) {
		action(this);
		this.allSubmodulesDo(action);
	};
	
	/**
	 * executes an action on all submodules of this module
	 * @param {Function} action the action to execute, should take one
	 * parameter, the module that is being acted upon
	 */
	_HSModule.prototype.allSubmodulesDo = function (_action) {
		this.submodulesDo(function (submodule) {
			submodule.withAllSubmodulesDo(_action);
		});
	};

	_HSModule.prototype.isModule = function () {return true;};

	_HSModule.prototype.renameAs = function (_newName) {
		var _submodule = this;
		var _parentModule = _submodule.module();
		return _attachResultingModule(_parentModule, _newName, function () {
			delete _parentModule[_submodule.name];
			_submodule.name = _createConstantAccessor(_newName);
			return _submodule;
		});
	};
		
	//create the HotSausage module and bind it to the global namespace
	//switch to @class maybe, not quite sure which one fits better
	/**
	 * @namespace HotSausage
	 * @name HotSausage
	 * @augments _HSModule
	 */
	(new _HSModule("HotSausage", this, null)).extend(function (HS, _HS) {
		/**
		 * adds a new method to an object if the implementation function is
		 * supplied, if it is not, then the method is removed from the
		 * behavior object
		 * @name _setMethod
		 * @memberOf HotSausage
		 * @inner
		 * @function
		 * @param {Object} behavior the object we are adding the new method to
		 * @param {String} methodName the name of the method to add/delete
		 * @param {Function} implementationFunc the implementation of the method
		 */
		var _setMethod = function (behavior, methodName, implementationFunc) {
			if (implementationFunc) { 
				behavior[methodName] = implementationFunc;
			} else {
				delete behavior[methodName];
			}
		};
		
		/**
		 * calls a given function of each of the submodules of this module
		 * @function
		 * @name _allSubmodulesOfPerform
		 * @memberOf HotSausage
		 * @inner
		 * @param {String} _methodName the name of the method to call on each submodule
		 */
		var _allSubmodulesOfPerform = function (_methodName) {
			HS.allSubmodulesDo(function (submodule) {
				if (HAS_OWN_PROPERTY.call(submodule, _methodName)) {submodule[_methodName]();}
			});
		};
		
		_HotSausage = _HS;
		_HS.handlesErrorsQuietly = false;
		_HS.coreMethodsEnabled = false;
		_HS.isLocked = false; //addition
		
		//set the newObject attribute of the purse to _newObject, defined way above
		_HS.newObject = _newObject;
		
		//returns the targets prototype
		_HS.delegateOf = function (target) {
			// Alternate ways to access the target's prototype (aka delegate):
					return target.__proto__;
			//		return target.constructor.prototype;
			//		return Object.getPrototypeOf(target);
		};
		
		//I tried using @borrows here, it wouldnt work for some reason, so copy/pasting comments instead
		
		/**
		 * returns whether or not an object is defined
		 * @function
		 * @name isDefined
		 * @memberOf HotSausage
		 * @param {Object} target the target to check
		 * @returns {Boolean} true if the object is defined, false otherwise
		 */
		HS.isDefined = _isDefined;
		
		HS.createConstantAccessor = _createConstantAccessor;

		HS.handleError = _handleError;
		
		HS.isPrivate = function (propertyName) {return propertyName.charAt(0) === "_";};

		HS.isPublic = function (propertyName) {return propertyName.charAt(0) !== "_";};
		
		/**
		 * adds a new method to an object if the implementation function is
		 * supplied, if it is not, then the method is removed from the
		 * behavior object
		 * @name methodOn
		 * @memberOf HotSausage
		 * @function
		 * @param {Object} behavior the object we are adding the new method to
		 * @param {String} methodName the name of the method to add/delete
		 * @param {Function} implementationFunc the implementation of the method
		 */
		HS.methodOn = _setMethod;
		
		HS.isModule = function (target_) {
			if (target_ === undefined) {return true;} // Just like normal Module.isModule
			return (target_ instanceof Module);
		};
		
		/**
		 * returns whether or not an object is undefined
		 * @function
		 * @name isUndefined
		 * @memberOf HotSausage
		 * @param {Object} target the target to check
		 * @returns {Boolean} true if the object is undefined, false otherwise
		 */
		HS.isUndefined = function (target) {return typeof target === UNDEFINED;};

		/**
		 * returns whether or not an object is a string
		 * @function
		 * @name isString
		 * @memberOf HotSausage
		 * @param {Object} target the target to check
		 * @returns {Boolean} true if the object is a string, false otherwise
		 */
		HS.isString = function (target) {return typeof target === STRING;};
		
		/**
		 * returns whether or not an object is a string
		 * @function
		 * @name isBoolean
		 * @memberOf HotSausage
		 * @param {Object} target the target to check
		 * @returns {Boolean} true if the object is a boolean, false otherwise
		 */
		HS.isBoolean = function (target) {return typeof target === BOOLEAN;};
		
		/**
		 * returns whether or not an object is a string
		 * @function
		 * @name hasLocalProperty
		 * @memberOf HotSausage
		 * @param {Object} the target
		 * @param {String} the name of the property to check
		 * @returns {Boolean} true if the object has a local copy of the property, false otherwise
		 * @borrows Object#hasOwnProperty as this.isLocalProperty
		 */
		HS.hasLocalProperty = function (target, propertyName) {
			return HAS_OWN_PROPERTY.call(target, propertyName);
		};
				
		/**
		 * sets the handle errors value to the parameter flag. If the flag is
		 * omitted, errors will be handled quietly
		 * @function
		 * @name handleErrorsQuietly
		 * @memberOf HotSausage
		 * @param {Boolean} flag set to true to handle errors quietly, false to cause
		 * errors to throw Errors
		 */
		// CM, not sure if this method should allow the state to be toggled.  
		// I think it should be one-way. M3
		HS.handleErrorsQuietly = function (flag) {  
			if(flag !== undefined && typeof flag === BOOLEAN){
				_HS.handlesErrorsQuietly = flag;
			} else {
				_HS.handlesErrorsQuietly = true;
			}
		};
		
		/**
		 * determines whether or not this module respects the core
		 * @function
		 * @name respectsCore
		 * @memberOf HotSausage
		 * @returns {Boolean} true if core methods are not enabled, false otherwise
		 */
		HS.respectsCore = function () {return !_HS.coreMethodsEnabled;};
		
		/**
		 * installs core methods, namely Object.method and Function.method. If Object.method is 
		 * already defined, then this will cause this function to return false, otherwise it will 
		 * return true. Both methods will take 2 parameters, the name of the method to install as 
		 * a string and a function as its implementation. These are defined to both be the same 
		 * implementation as HotSausage#methodOn, except that for Object.methodOn the behavior is 
		 * a reference to this whereas for Function.method, the behavior is a reference to 
		 * this.prototype. Once this function is complete, the function named "installCoreMethods" 
		 * will be run on all submodules registered to this module.
		 * @function
		 * @name installCoreMethods
		 * @memberOf HotSausage
		 * @return {Boolean} true if core methods were successfully installed, false otherwise
		 * @see HotSausage#respectsCore
		 */
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
		
		/**
		 * Installs a method. This function is only available if core methods have been installed.
		 * @function
		 * @name method
		 * @memberOf Object.prototype
		 * @param {String} methodName the name of the method to install
		 * @param {Function} implementationFunc the implementation of the method to install
		 * @see HotSausage#installCoreMethods
		 */
		
		/**
		 * Installs a method. This function is only available if core methods have been installed.
		 * @function
		 * @name method
		 * @memberOf Function.prototype
		 * @param {String} methodName the name of the method to install
		 * @param {Function} implementationFunc the implementation of the method to install
		 * @see HotSausage#installCoreMethods
		 */
		
		/**
		 * Locks this module and all submodules registered to this module. For this module,
		 * it deletes HotSausage#methodOn, HotSausage#installCoreMethods, Object.method,
		 * and Function.method. The function "lock" will then be called on all submodules
		 * of this module.
		 * @function
		 * @name lock
		 * @memberOf HotSausage
		 * @see HotSausage#isLocked
		 * @see HotSausage#methodOn
		 * @see HotSausage#installCoreMethods
		 */
		HS.lock = function () {
			if(_HS.isLocked) {return;}
			delete HS.methodOn;
			delete HS.handleErrorsQuietly;
			delete HS.installCoreMethods;
			if (_HS.coreMethodsEnabled) {
				delete Object.prototype.method;
				delete Function.prototype.method;
			}
			_allSubmodulesOfPerform("lock");
			_HS.isLocked = true;
		};
		
		/**
		 * Tests to see if HotSausage#lock has been called already on this module
		 * @function
		 * @name isLocked
		 * @memberOf HotSausage
		 * @return {Boolean} true if this module has been locked, false otherwise
		 * @see HotSausage#lock
		 */
		HS.isLocked = function () {
			return _HS.isLocked;
		};		
	});	
})();
