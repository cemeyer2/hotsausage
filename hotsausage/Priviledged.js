"use strict";

HotSausage.newSubmodule("Privacy", function (module, _module) {
	var _coreUseEnabled = false;
	var _usingSimpleEncapsulation = false;
	var _isLocked = false;
	var _Priviledged = {};
	var Priviledged = _Priviledged;
	// Priviledged and _Priviledged are references to the public and private contents of this
	// module.  Until the module is locked, both refer to the exact same object.  This allows the 
	// user of the module to change certain properies of the object, and be accessible to both the 
	// private and public view of the object.  Once the module is locked, the public one continues 
	// to reference the original object - with key properties removed; and the private one 
	// references a new object with the copies of the required properties.
	

	var _ActiveTransporters = _newEmptyObject();
	
	var _getPurseOf = function (target) {
		var _purse;
		var sessionKey = Math.random(),
			transporter = function (aPurse) {_purse = aPurse;};
		_ActiveTransporters[sessionKey] = transporter;
		target._pp(sessionKey); /// The purse is set here!
		delete _ActiveTransporters[sessionKey];
		return _purse;
		/// NOTE: 	_ActiveTransporters is not threadsafe, but is 
		///			straight forward to be made so when necessary.
	};
		
	var _newPriviledgedMethod = function (_behavior, _methodName, _impFunc) {
		return function priviledgedMethod(/* arguments */) {
			var purse, purseOwner, answer,
			receiver = this;
			
			if (_behavior[_methodName] !== priviledgedMethod) {
				return _Priviledged.onImproperMethod(
					this, _behavior, _methodName, priviledgedMethod
				);
			}
			purse = _getPurseOf(receiver);
			purseOwner = _delegate(purse);
			if (this !== purseOwner) {
				return _Priviledged.onImproperPurse(receiver, purseOwner);
			}
			answer = _impFunc.apply(purse, arguments);
			return (answer === purse) ? receiver : answer;
		};
	};

	var _setMethod = function (behavior, methodName, func) {
		if (!func) {return delete behavior[methodName];}
		behavior[methodName] = _newPriviledgedMethod(behavior, methodName, func);
	};
	
	var _simplePriviledgedMethod = function (_behavior, _methodName, _impFunc) {
		return function priviledgedMethod(/* arguments */) {
			var protectedProperties = this._pp();
			answer = _impFunc.apply(protectedProperties, arguments);
			return (answer === protectedProperties) ? this : answer;
		};
	};
	
	var _attachProtectedProperties = function (target) {
		if (target._pp !== undefined) {
			return _Priviledged.onPurseAlreadyPresent(target);
		}
		var	_purse = _newEmptyObject(target);
		target._pp = function getPurse(sessionKey) {
			var transporter = _ActiveTransporters[sessionKey];
			if (transporter === undefined) {
				return _Priviledged.onImproperPurseKey(this, sessionKey);
			}
			transporter(_purse);
		};
		return _purse;
	};

	casual
	var _simpleProtectedProperties = function (target) {
		var	protectedProperties = _newEmptyObject(target);
		target._pp = function getPP() {
			return protectedProperties;
		};
		return protectedProperties;
	};
	
	var _onAttemptToLockWhileInSimpleMode = function () {
		if (_module.handlesErrorsQuietly) {return Priviledged;}
		var error = new Error("Cannot lock which using simple encapsulation!");
		error.name = "ImproperAttemptToLockModule";
		throw error;
	};
	
	Priviledged.methodOn = _setMethod;
	Priviledged.enableOn = _attachProtectedProperties;
	
	Priviledged.onImproperMethod = function (target, behavior, methodName, method) {
		if (_module.handlesErrorsQuietly) {return target;}
		var error = new Error("Method has been moved where it doesn't belong!");
		error.name = "ImproperMethod";
		throw error;
	};
	
	Priviledged.onImproperPurse = function (target, actualPurseOwner) {
		if (_module.handlesErrorsQuietly) {return target;}
		var error = new Error("Another object's purse has been attached to the target object!");
		error.name = "ImproperPurse";
		throw error;
	};
	
	Priviledged.onImproperPurseKey = function (target, invalidKey) {
		if (_module.handlesErrorsQuietly) {return _newEmptyObject();}
		var error = new Error("Attempt to access the target's purse using the wrong session key!");
		error.name = "ImproperPurseKey";
		throw error;
	};
	
	Priviledged.onPurseAlreadyPresent = function (target) {
		if (_module.handlesErrorsQuietly) {return null;}
		var error = new Error("Target already has a purse!");
		error.name = "ImproperAttemptToAttachPurse";
		throw error;
	};
	
	Priviledged.useSimpleEncapsulation = function () {
		if (_usingSimpleEncapsulation) {return;} 
		_newPriviledgedMethod = _simplePriviledgedMethod;
		_attachProtectedProperties = _simpleProtectedProperties;
		Priviledged.enableOn = _simpleProtectedProperties;
	}
	
	Priviledged.installCoreMethods = function () {
		if (_module.coreMethodsEnabled) {return true;} 
		if (Object.prototype.enablePrivacy) {return false;}
		if (Object.prototype.priviledgedMethod) {return false;}
		if (Function.prototype.priviledgedMethod) {return false;}
		Object.prototype.enablePrivacy = function () {return _attachProtectedProperties(this);};
		Object.prototype.priviledgedMethod = function (methodName, func) {
			_setMethod(this, methodName, func);
		};
		Function.prototype.priviledgedMethod = function (methodName, func) {
			_setMethod(this.prototype, methodName, func);
		};
		return true;
	};
		
	Priviledged.lock = function () {
		if (_isLocked) {return;}
		if (_usingSimpleEncapsulation) {return _onAttemptToLockWhileInSimpleMode();}
		_Priviledged = {
			onImproperMethod: Priviledged.onImproperMethod,
			onImproperPurse: Priviledged.onImproperPurse,
			onImproperPurseKey: Priviledged.onImproperPurseKey,
			onPurseAlreadyPresent: Priviledged.onPurseAlreadyPresent
		};
		// Priviledged.enableOn remains!
		// Priviledged.lock remains!
		delete Priviledged.handleErrorsQuietly;
		delete Priviledged.enableUseFromCore;
		delete Priviledged.methodOn;
		delete Priviledged.onImproperMethod;
		delete Priviledged.onImproperPurse;
		delete Priviledged.onImproperPurseKey;
		delete Priviledged.onPurseAlreadyPresent;
		if (_module.coreMethodsEnabled) {
			// Object.prototype.enablePrivacy remains!
			delete Object.prototype.priviledgedMethod;
			delete Function.prototype.priviledgedMethod;
		}
	};
	
	return Priviledged;
});

