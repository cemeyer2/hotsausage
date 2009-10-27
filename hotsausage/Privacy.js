"use strict";
/**
 * HotSausage Privacy Module
 * @author Marice Rabb
 * @author Charlie Meyer
 * @fileOverview defines the Privacy module of HotSausage
 */
/**
 * @namespace HotSausage.Privacy
 * @name HotSausage.Privacy
 * @augments _Module
 * @requires HotSausage
 */

HotSausage.newSubmodule("Privacy", function (Privacy, _HierarchicalPurse) {
	//returns the targets prototype
	var _delegateOf = _HierarchicalPurse.delegateOf;
	//gets an (possibly) empty object depending on the parameter
	var _newObject = _HierarchicalPurse.newObject;
	var _usingSimpleEncapsulation = false;
	var _SabotageHandlers = Privacy;
	var _ActiveTransporters = _newObject();
	
	/**
	 * The only way to get at the purse of a target
	 * @function
	 * @inner
	 * @name _getPurseOf
	 * @param {Object} target the target we wish to get the purse of
	 * @returns {Object} the purse of the target
	 */
	var _getPurseOf = function (target) {
		var _purse;
		var sessionKey = Math.random(),
			transporter = function (aPurse) {_purse = aPurse;};
		_ActiveTransporters[sessionKey] = transporter;
		target._pp(sessionKey); /// The purse is set here!
		delete _ActiveTransporters[sessionKey];
		return _purse;
		/// NOTE:   _ActiveTransporters is not threadsafe, but is 
		///			straight forward to be made so when necessary.
	};
		
	/**
	 * returns a new privileged method. in the implementation function, this
	 * will refer to the purse of the behavior the function is being added to,
	 * not the behavior itself
	 * @function
	 * @name _newPrivilegedMethod
	 * @inner
	 * @param {Object} _behavior the object that this new method will be added to
	 * @param {String} _methodName the name of the new privileged method
	 * @param {Function} _impFunc the implementation of the new privileged method
	 */
	var _newPrivilegedMethod = function (_behavior, _methodName, _impFunc) {
		return function privilegedMethod(/* arguments */) {
			var purse, purseOwner, answer,
			receiver = this;
			
			if (_behavior[_methodName] !== privilegedMethod) {
				return _SabotageHandlers.onImproperMethod(
					this, _behavior, _methodName, privilegedMethod
				);
			}
			purse = _getPurseOf(receiver);
			purseOwner = _delegateOf(purse);
			if (this !== purseOwner) {
				return _SabotageHandlers.onImproperPurse(receiver, purseOwner);
			}
			answer = _impFunc.apply(purse, arguments);
			return (answer === purse) ? receiver : answer;
		};
	};

	/**
	 * adds or removes a privileged method from an object
	 * @function
	 * @inner
	 * @name _setPrivilegedMethod
	 * @param {Object} behavior the object to add or remove a privileged method on
	 * @param {String} methodName the name of the function to add
	 * @param {Function} func the implementation of the new privileged method
	 */
	var _setPrivilegedMethod = function (behavior, methodName, func) {
		if (!func) {return delete behavior[methodName];}
		behavior[methodName] = _newPrivilegedMethod(behavior, methodName, func);
	};
	
	/**
	 * @deprecated
	 */
	var _simplePrivilegedMethod = function (_behavior, _methodName, _impFunc) {
		return function privilegedMethod(/* arguments */) {
			var protectedProperties = this._pp();
			var answer = _impFunc.apply(protectedProperties, arguments);
			return (answer === protectedProperties) ? this : answer;
		};
	};
	
	/**
	 * attaches a purse to a target
	 * @function
	 * @inner
	 * @name _attachProtectedProperties
	 * @param {Object} target the object to attach a purse to
	 * @return {Object} the purse for the target
	 */
	var _attachProtectedProperties = function (target) {
		if (target._pp !== undefined) {
			return _SabotageHandlers.onPurseAlreadyPresent(target);
		}
		var	_purse = _newObject(target);
		target._pp = function getPurse(sessionKey) {
			var transporter = _ActiveTransporters[sessionKey];
			if (transporter === undefined) {
				return _SabotageHandlers.onImproperPurseKey(this, sessionKey);
			}
			transporter(_purse);
		};
		return _purse;
	};

	// Most probably never going to use this since _pp pattern is adequate and simpler.
	// casualProtectedProperties
	/**
	 * @deprecated
	 */
	var _simpleProtectedProperties = function (target) {
		var	_protectedProperties = _newObject(target);
		target._pp = function getPP() {
			return _protectedProperties;
		};
		return _protectedProperties;
	};
	
	/**
	 * @function
	 * @name _onAttemptToLockWhileInSimpleMode
	 * @inner
	 * @throws error when trying to lock while in simple mode
	 * @deprecated
	 */
	var _onAttemptToLockWhileInSimpleMode = function () {
		if (_HierarchicalPurse.handlesErrorsQuietly) {return;}
		var error = new Error("Cannot lock which using simple encapsulation!");
		error.name = "ImproperAttemptToLockModule";
		throw error;
	};
	
	/**
	 * attaches a purse to a target
	 * @function
	 * @name enableOn
	 * @memberOf HotSausage.Privacy
	 * @param {Object} target the object to attach a purse to
	 * @return {Object} the purse for the target
	 */
	Privacy.enableOn = _attachProtectedProperties;
	
	/**
	 * adds or removes a privileged method from an object
	 * @function
	 * @name privilegedMethodOn
	 * @memberOf HotSausage.Privacy
	 * @param {Object} behavior the object to add or remove a privileged method on
	 * @param {String} methodName the name of the function to add
	 * @param {Function} func the implementation of the new privileged method
	 */
	Privacy.privilegedMethodOn = _setPrivilegedMethod;
	
	/**
	 * causes an error to be thrown when a method is improperly moved if errors are not handled quietly.
	 * if errrors are handled quietly, the target is returned
	 * @function
	 * @name onImproperMethod
	 * @memberOf HotSausage.Privacy
	 * @throws error if errors are not set to be handled quietly in the HotSausage module
	 * @param {Object} target the target of the action
	 * @param {Object} behavior the behavior the method is attached to
	 * @param {String} methodName the name of the method
	 * @param {Function} method the implementation of the method
	 * @returns {Object} the target, if errors are set to be handled quietly
	 */
	Privacy.onImproperMethod = function (target, behavior, methodName, method) {
		if (_HierarchicalPurse.handlesErrorsQuietly) {return target;}
		var error = new Error("Method has been moved where it doesn't belong!");
		error.name = "ImproperMethod";
		throw error;
	};
	
	/**
	 * causes an error to be thrown when another object's purse has already been attached to the target
	 * object if errors are not handled quietly. If errors are set to be handled quietly, then
	 * the target is returned
	 * @function
	 * @name onImproperPurse
	 * @memberOf HotSausage.Privacy
	 * @throws error if errors are not set to be handled quietly in the HotSausage module
	 * @param {Object} target the target object
	 * @param {Object} actualPurseOwner the actual owner of the purse
	 * @returns {Object} the target, if errors are set to be handled quietly
	 */
	Privacy.onImproperPurse = function (target, actualPurseOwner) {
		if (_HierarchicalPurse.handlesErrorsQuietly) {return target;}
		var error = new Error("Another object's purse has been attached to the target object!");
		error.name = "ImproperPurse";
		throw error;
	};
	
	/**
	 * causes an error to be thrown when an object purse is attempted to be accessed with an invalid key if errors are not handled quietly.
	 * if errors are set to be handled quietly, a new empty object is returned
	 * @function
	 * @name onImproperPurseKey
	 * @memberOf HotSausage.Privacy
	 * @throws error if errors are not set to be handled quietly in the HotSausage module
	 * @param {Object} target the object we were trying to get the purse of
	 * @param {Number} invalidKey the invalid session key that was used
	 * @param {Object} an empty object, if errors are set to be handled quietly
	 */
	Privacy.onImproperPurseKey = function (target, invalidKey) {
		if (_HierarchicalPurse.handlesErrorsQuietly) {return _newObject();}
		var error = new Error("Attempt to access the target's purse using the wrong session key!");
		error.name = "ImproperPurseKey";
		throw error;
	};
	
	/**
	 * causes an error to be thrown when a purse is attempted to be attached to an object that already
	 * has a purse if errors are not handled quietly. If errors are set to be handled quietly, then null
	 * is returned
	 * @function
	 * @name onPurseAlreadyPresent
	 * @memberOf HotSausage.Privacy
	 * @throws error if errors are not set to be handled quietly in the HotSausage module
	 * @param {Object} target the object that already has a purse
	 * @returns {null} null if errors are set to be handled quietly
	 */
	Privacy.onPurseAlreadyPresent = function (target) {
		if (_HierarchicalPurse.handlesErrorsQuietly) {return null;}
		var error = new Error("Target already has a purse!");
		error.name = "ImproperAttemptToAttachPurse";
		throw error;
	};
	
	/**
	 * @deprecated
	 * @name useSimpleEncapsulation
	 * @memberOf HotSausage.Privacy
	 */
	Privacy.useSimpleEncapsulation = function () {
		if (_usingSimpleEncapsulation) {return;} 
		_newPrivilegedMethod = _simplePrivilegedMethod;
		_attachProtectedProperties = _simpleProtectedProperties;
		Privacy.enableOn = _simpleProtectedProperties;
	};
	
	/**
	 * installs core methods for HotSausage.Privacy, namely Object.enablePrivacy, Object.privilegedMethod, and
	 * Function.privilegedMethod
	 * @function
	 * @name installCoreMethods
	 * @memberOf HotSausage.Privacy
	 * @return {Boolean} true if methods were successfully installed, false otherwise
	 */
	Privacy.installCoreMethods = function () {
		if (_HierarchicalPurse.coreMethodsEnabled) {return true;} 
		if (Object.prototype.enablePrivacy) {return false;}
		if (Object.prototype.privilegedMethod) {return false;}
		if (Function.prototype.privilegedMethod) {return false;}
		Object.prototype.enablePrivacy = function () {return _attachProtectedProperties(this);};
		Object.prototype.privilegedMethod = function (methodName, func) {
			_setPrivilegedMethod(this, methodName, func);
		};
		Function.prototype.privilegedMethod = function (methodName, func) {
			_setPrivilegedMethod(this.prototype, methodName, func);
		};
		return true;
	};
	
	/**
	 * enables privacy for this object. This must be called before adding privileged methods to an object.
	 * The purse is returned from this call, which must be safeguarded to ensure that it is not exposed. Use
	 * the reference to the purse to set protected properties of an object.
	 * @name enablePrivacy
	 * @memberOf Object
	 * @function
	 * @returns {Object} the purse
	 * @example 
	 * var Person = function(name, ssn){
	 * 		//make this variable private
	 * 		var purse = this.enablePrivacy();
	 * 		purse.ssn = ssn;
	 * 		
	 * 		this.privilegedMethod("getSSN", function(){
	 * 			return this.ssn;
	 * 		});
	 * };
	 * 
	 * var joe = new Person("Joe", "123-45-6789");
	 * var ssn = joe.getSSN(); //"123-45-6789"
	 */
		
	/**
	 * locks down this module by removing several methods: HotSausage.Privacy.privilegedMethodOn, HotSausage.Privacy.onImproperMethod,
	 * HotSausage.Privacy.onImproperPurse, HotSausage.Privacy.onImproperPurseKey, HotSausage.Privacy.onPurseAlreadyPresent,
	 * Object.prototype.privilegedMethod, Function.prototype.privilegedMethod
	 * @function
	 * @name lock
	 * @memberOf HotSausage.Privacy
	 */
	Privacy.lock = function () {
		if (_HierarchicalPurse.isLocked) {return;}
		if (_usingSimpleEncapsulation) {return _onAttemptToLockWhileInSimpleMode();}
		_SabotageHandlers = {
			onImproperMethod: Privacy.onImproperMethod,
			onImproperPurse: Privacy.onImproperPurse,
			onImproperPurseKey: Privacy.onImproperPurseKey,
			onPurseAlreadyPresent: Privacy.onPurseAlreadyPresent
		};
		// Privacy.enableOn remains!
		delete Privacy.privilegedMethodOn;
		delete Privacy.onImproperMethod;
		delete Privacy.onImproperPurse;
		delete Privacy.onImproperPurseKey;
		delete Privacy.onPurseAlreadyPresent;
		if (_HierarchicalPurse.coreMethodsEnabled) {
			// Object.prototype.enablePrivacy remains!
			delete Object.prototype.privilegedMethod;
			delete Function.prototype.privilegedMethod;
		}
	};
});

