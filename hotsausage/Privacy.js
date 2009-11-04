"use strict";
/**
 * HotSausage Privacy Module
 * @author Maurice Rabb
 * @author Charlie Meyer
 * @fileOverview defines the Privacy module of HotSausage
 */
/**
 * @namespace HotSausage.Privacy
 * @name HotSausage.Privacy
 * @augments _Module     <<<<--- I am planning to remove this. M3
 * @requires HotSausage
 */

HotSausage.newSubmodule("Privacy", function (Privacy, _Privacy_HS) {
	var HS = Privacy.module();
	//returns the targets prototype
	//gets an (possibly) empty object depending on the parameter
	var _newObject = _Privacy_HS.newObject;
	var _SabotageHandlers = Privacy;
	var _ActiveTransporter = _newObject();
	var _CurrentSlot = _newObject();

	var FLOOR = Math.floor;
	var RANDOM = Math.random;

	/**
	 * The only way to get at the purse of a target
	 * @function
	 * @inner
	 * @name _newSessionKey
	 * @returns {String} a string representing the new session key
	 */
	var _newSessionKey = function () {
		var a = FLOOR(RANDOM() * 0x10000);
		var b = FLOOR(RANDOM() * 0x10000);
		return String.fromCharCode(a, b);
	};
	
	/**
	 * The only way to get at the purse of a target
	 * @function
	 * @inner
	 * @name _purseOf
	 * @param {Object} target the target we wish to get the purse of
	 * @returns {Object} the purse of the target
	 */
	var _purseOf = function (target) {
		var purse;
		var sessionKey = _newSessionKey();
		_ActiveTransporter[sessionKey] = _CurrentSlot;
		target._purse(sessionKey); /// The current transporter slot is written here!
		purse = _ActiveTransporter[sessionKey];
		delete _ActiveTransporter[sessionKey];
		return purse;
		/// NOTE:   _ActiveTransporter is not threadsafe, but is 
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
			purse = _purseOf(receiver);
			purseOwner = purse._public;
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
	

	var _createProtectedAccessorFor = function (_purse) {
		return function protectedPurse(sessionKey) {
			if (_ActiveTransporter[sessionKey] !== _CurrentSlot) {
				return _SabotageHandlers.onImproperPurseKey(this, sessionKey);
			}
			_ActiveTransporter[sessionKey] = _purse;
			return null;
		};
	};
	
	/**
	 * attaches a purse to a target
	 * @function
	 * @inner
	 * @name _attachMethod_purse
	 * @param {Object} target the object to attach a purse to
	 * @param {Object} delegatePurse_ is purse of its delegate object
	 * @return {Object} the purse for the target
	 */
	var _attachMethod_purse = function (target, purse_) {
		if (target._purse !== undefined) {
			return _SabotageHandlers.onPurseAlreadyPresent(target);
		}
		var	purse = purse_ || _newObject();
		purse._public = target;
		target._purse = _createProtectedAccessorFor(purse);
		return purse;
	};
	
	/**
	 * attaches a purse to a target
	 * @function
	 * @name enableOn
	 * @memberOf HotSausage.Privacy
	 * @param {Object} target the object to attach a purse to
	 * @return {Object} the purse for the target
	 */
	Privacy.enableOn = _attachMethod_purse;
	
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
	 * causes an error to be thrown when a method is improperly moved if errors are not handled 
	 * quietly. if errrors are handled quietly, the target is returned
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
		HS.handleError("ImproperMethod", "Method has been moved where it doesn't belong!");
		return target;
	};
	
	/**
	 * causes an error to be thrown when another object's purse has already been attached to 
	 * the target object if errors are not handled quietly. If errors are set to be handled 
	 * quietly, then the target is returned
	 * @function
	 * @name onImproperPurse
	 * @memberOf HotSausage.Privacy
	 * @throws error if errors are not set to be handled quietly in the HotSausage module
	 * @param {Object} target the target object
	 * @param {Object} actualPurseOwner the actual owner of the purse
	 * @returns {Object} the target, if errors are set to be handled quietly
	 */
	Privacy.onImproperPurse = function (target, actualPurseOwner) {
		HS.handleError(
			"ImproperPurse", "Another object's purse has been attached to the target object!"
		);
		return target;
	};
	
	/**
	 * causes an error to be thrown when an object purse is attempted to be accessed with an 
	 * invalid key if errors are not handled quietly. if errors are set to be handled quietly, 
	 * a new empty object is returned
	 * @function
	 * @name onImproperPurseKey
	 * @memberOf HotSausage.Privacy
	 * @throws error if errors are not set to be handled quietly in the HotSausage module
	 * @param {Object} target the object we were trying to get the purse of
	 * @param {Number} invalidKey the invalid session key that was used
	 * @param {Object} an empty object, if errors are set to be handled quietly
	 */
	Privacy.onImproperPurseKey = function (target, invalidKey) {
		HS.handleError(
			"ImproperPurseKey", "Attempt to access the target's purse using the wrong session key!"
		);
		return null;
	};
	
	/**
	 * causes an error to be thrown when a purse is attempted to be attached to an object that 
	 * already has a purse if errors are not handled quietly. If errors are set to be handled 
	 * quietly, then null is returned
	 * @function
	 * @name onPurseAlreadyPresent
	 * @memberOf HotSausage.Privacy
	 * @throws error if errors are not set to be handled quietly in the HotSausage module
	 * @param {Object} target the object that already has a purse
	 * @returns {null} null if errors are set to be handled quietly
	 */
	Privacy.onPurseAlreadyPresent = function (target) {
		HS.handleError("ImproperAttemptToAttachPurse", "Target already has a purse!");
		return null;
	};
	
	/**
	 * installs core methods for HotSausage.Privacy, namely Object.enablePrivacy, 
	 * Object.privilegedMethod, and Function.privilegedMethod
	 * @function
	 * @name installCoreMethods
	 * @memberOf HotSausage.Privacy
	 * @return {Boolean} true if methods were successfully installed, false otherwise
	 */
	Privacy.installCoreMethods = function () {
		if (_Privacy_HS.coreMethodsEnabled) {return true;} 
		if (Object.prototype.enablePrivacy) {return false;}
		if (Object.prototype.privilegedMethod) {return false;}
		if (Function.prototype.privilegedMethod) {return false;}
		Object.prototype.enablePrivacy = function () {return _attachMethod_purse(this);};
		Object.prototype.privilegedMethod = function (methodName, func) {
			_setPrivilegedMethod(this, methodName, func);
		};
		Function.prototype.privilegedMethod = function (methodName, func) {
			_setPrivilegedMethod(this.prototype, methodName, func);
		};
		return true;
	};
	
	/**
	 * enables privacy for this object. This must be called before adding privileged methods to 
	 * an object.  The purse is returned from this call, which must be safeguarded to ensure that 
	 * it is not exposed. Use the reference to the purse to set protected properties of an object.
	 * @name enablePrivacy
	 * @memberOf Object
	 * @function
	 * @returns {Object} the purse
	 * @example 
	 *
	 * var Person = function (name, ssn) {
	 * 		// make this variable private
	 * 		var purse = HotSausage.Privacy.enableOn();
	 * 		purse.name = name;
	 * 		purse.ssn = ssn;
	 * };
	 * 
	 * HotSausage.Privacy.privilegedMethodOn(Person, "safeSSN", function () {
	 * 		var ssn = this.ssn;
	 * 		var length = ssn.length;
	 *		var lastFour = ssn.slice(length - 5, length - 1);
	 * 		return lastFour;
	 * });
	 *
	 * var joe = new Person("Joe", "123-45-6789");
	 * var ssn = joe.safeSSN(); //"6789"
	 *
	 * - OR -
	 *
	 * HotSausage.Privacy.installCoreMethods();
	 *
	 * var Person = function (name, ssn) {
	 * 		// make this variable private
	 * 		var purse = this.enablePrivacy();
	 * 		purse.name = name;
	* 		purse.ssn = ssn;
	 * };
	 * 
	 * Person.privilegedMethod("safeSSN", function () {
	 * 		var ssn = this.ssn;
	 * 		var length = ssn.length;
	 *		var lastFour = ssn.slice(length - 5, length - 1);
	 * 		return lastFour;
	 * });
	 *
	 * var joe = new Person("Joe", "123-45-6789");
	 * var ssn = joe.safeSSN(); //"6789"
	 *
	 */
		
	/**
	 * locks down this module by removing several methods: HotSausage.Privacy.privilegedMethodOn, 
	 * HotSausage.Privacy.onImproperMethod, HotSausage.Privacy.onImproperPurse, 
	 * HotSausage.Privacy.onImproperPurseKey, HotSausage.Privacy.onPurseAlreadyPresent,
	 * Object.prototype.privilegedMethod, Function.prototype.privilegedMethod
	 * @function
	 * @name lock
	 * @memberOf HotSausage.Privacy
	 */
	Privacy.lock = function () {
		if (_Privacy_HS.isLocked) {return;}
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
		if (_Privacy_HS.coreMethodsEnabled) {
			// Object.prototype.enablePrivacy remains!
			delete Object.prototype.privilegedMethod;
			delete Function.prototype.privilegedMethod;
		}
	};
});

