"use strict";

HotSausage.module("Priviledged", function (HS) {
	var	_handleErrorsQuietly = false;
	var _coreUseEnabled = false;
	var _isLocked = false;
	var Priviledged = {};
	var _Priviledged = Priviledged;
	// Priviledged and _Priviledged are references to the public and private contents of this
	// module.  Until the module is locked, both refer to the exact same object.  This allows the 
	// user of the module to change certain properies of the object, and be accessible to both the 
	// private and public view of the object.  Once the module is locked, the public one continues 
	// to reference the original object - with key properties removed; and the private one 
	// references a new object with the copies of the required properties.
	
	var _delegate = function (target) {
		return target.contructor.prototype;
		// Below are alternate ways to access the target's prototype (aka delegate).
		// return Object.getPrototypeOf(target);
		// return target.__proto__;
	};
	
	var _newEmptyObject = function (delegate_) {
		var SingleUseConstructor = function () {};
		SingleUseConstructor.prototype = delegate_ || null;
		return new SingleUseConstructor();
	};

	var _ActiveTransporters = _newEmptyObject();
	
	var _getPurseOf = function (target) {
		var _purse;
		var sessionKey = Math.random(),
			transporter = function (aPurse) {_purse = aPurse;};
		_ActiveTransporters[sessionKey] = transporter;
		target.__pp(sessionKey); /// The purse is set here!
		delete _ActiveTransporters[sessionKey];
		return _purse;
		/// NOTE: 	_ActiveTransporters is not threadsafe, but is 
		///			straight forward to be made so when necessary.
	};
		
	var _newPriviledgedMethod = function (_behavior, _methodName, _impFunc) {
		return function priviledgedMethod(/* arguments */) {
			var purse, purseOwner, answer;
			
			if (_behavior[_methodName] !== priviledgedMethod) {
				return _Priviledged.onImproperMethod(
					this, _behavior, _methodName, priviledgedMethod
				);
			}
			purse = _getPurseOf(this);
			purseOwner = _delegate(purse);
			if (this !== purseOwner) {
				return _Priviledged.onImproperPurse(this, purseOwner);
			}
			answer = _impFunc.apply(purse, arguments);
			return (answer === purse) ? this : answer;
		};
	};

	var _setMethod = function (behavior, methodName, func) {
		if (!func) {return delete behavior[methodName];}
		behavior[methodName] = _newPriviledgedMethod(behavior, methodName, func);
	};
	
	var _attachPurse = function (target) {
		if (target.__pp !== undefined) {
			return _Priviledged.onPurseAlreadyPresent(target);
		}
		var	_purse = _newEmptyObject(target);
		target.__pp = function getPurse(sessionKey) {
			var transporter = _ActiveTransporters[sessionKey];
			if (transporter === undefined) {
				return _Priviledged.onImproperPurseKey(this, sessionKey);
			}
			transporter(_purse);
		};
		return _purse;
	};
	
	Priviledged.methodOn = _setMethod;
	Priviledged.enableOn = _attachPurse;
	
	Priviledged.onImproperMethod = function (target, behavior, methodName, method) {
		if (_handleErrorsQuietly) {return target;}
		var error = new Error("Method has been moved where it doesn't belong!");
		error.name = "ImproperMethod";
		throw error;
	};
	
	Priviledged.onImproperPurse = function (target, actualPurseOwner) {
		if (_handleErrorsQuietly) {return target;}
		var error = new Error("Another object's purse has been attached to the target object!");
		error.name = "ImproperPurse";
		throw error;
	};
	
	Priviledged.onImproperPurseKey = function (target, invalidKey) {
		if (_handleErrorsQuietly) {return _newEmptyObject();}
		var error = new Error("Attempt to access the target's purse using the wrong session key!");
		error.name = "ImproperPurseKey";
		throw error;
	};
	
	Priviledged.onPurseAlreadyPresent = function (target) {
		if (_handleErrorsQuietly) {return null;}
		var error = new Error("Target already has a purse!");
		error.name = "ImproperAttemptToAttachPurse";
		throw error;
	};
	
	Priviledged.handleErrorsQuietly = function () {_handleErrorsQuietly = true;};
	
	Priviledged.enableUseFromCore = function () {
		if (_coreUseEnabled) {return true;} 
		if (Object.prototype.enablePrivacy) {return false;}
		if (Object.prototype.priviledgedMethod) {return false;}
		if (Function.prototype.priviledgedMethod) {return false;}
		Object.prototype.enablePrivacy = function () {return _attachPurse(this);};
		Object.prototype.priviledgedMethod = function (methodName, func) {
			_setMethod(this, methodName, func);
		};
		Function.prototype.priviledgedMethod = function (methodName, func) {
			_setMethod(this.prototype, methodName, func);
		};
		return (_coreUseEnabled = true);
	};
	
	Priviledged.lock = function () {
		if (_isLocked) {return;}
			_Priviledged = {
			onImproperMethod: Priviledged.onImproperMethod,
			onImproperPurse: Priviledged.onImproperPurse,
			onImproperPurseKey: Priviledged.onImproperPurseKey,
			onPurseAlreadyPresent: Priviledged.onPurseAlreadyPresent
		};
		// Priviledged.attachPurse remains!
		// Priviledged.lock remains!
		delete Priviledged.handleErrorsQuietly;
		delete Priviledged.enableUseFromCore;
		delete Priviledged.methodOn;
		delete Priviledged.onImproperMethod;
		delete Priviledged.onImproperPurse;
		delete Priviledged.onImproperPurseKey;
		delete Priviledged.onPurseAlreadyPresent;
		if (_coreUseEnabled) {
			// Object.prototype.enablePurse remains!
			delete Object.prototype.priviledgedMethod;
			delete Function.prototype.priviledgedMethod;
		}
	};
	
	return Priviledged;
});

