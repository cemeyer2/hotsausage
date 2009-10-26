"use strict";

HotSausage.newSubmodule("Privacy", function (Privacy, _HS_Privacy) {
	var _usingSimpleEncapsulation = false;
	var _SabotageHandlers = Privacy;
	var _ActiveTransporters = _HS_Privacy._newObject();
	
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
				return _SabotageHandlers.onImproperMethod(
					this, _behavior, _methodName, priviledgedMethod
				);
			}
			purse = _getPurseOf(receiver);
			purseOwner = _delegate(purse);
			if (this !== purseOwner) {
				return _SabotageHandlers.onImproperPurse(receiver, purseOwner);
			}
			answer = _impFunc.apply(purse, arguments);
			return (answer === purse) ? receiver : answer;
		};
	};

	var _setPriviledgedMethod = function (behavior, methodName, func) {
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
			return _SabotageHandlers.onPurseAlreadyPresent(target);
		}
		var	_purse = _newEmptyObject(target);
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
	var _simpleProtectedProperties = function (target) {
		var	protectedProperties = _newEmptyObject(target);
		target._pp = function getPP() {
			return protectedProperties;
		};
		return protectedProperties;
	};
	
	var _onAttemptToLockWhileInSimpleMode = function () {
		if (_HS_Privacy.handlesErrorsQuietly) {return;}
		var error = new Error("Cannot lock which using simple encapsulation!");
		error.name = "ImproperAttemptToLockModule";
		throw error;
	};
	
	Privacy.enableOn = _attachProtectedProperties;
	Privacy.priviledgedMethodOn = _setPriviledgedMethod;
	
	Privacy.onImproperMethod = function (target, behavior, methodName, method) {
		if (_HS_Privacy.handlesErrorsQuietly) {return target;}
		var error = new Error("Method has been moved where it doesn't belong!");
		error.name = "ImproperMethod";
		throw error;
	};
	
	Privacy.onImproperPurse = function (target, actualPurseOwner) {
		if (_HS_Privacy.handlesErrorsQuietly) {return target;}
		var error = new Error("Another object's purse has been attached to the target object!");
		error.name = "ImproperPurse";
		throw error;
	};
	
	Privacy.onImproperPurseKey = function (target, invalidKey) {
		if (_HS_Privacy.handlesErrorsQuietly) {return _newEmptyObject();}
		var error = new Error("Attempt to access the target's purse using the wrong session key!");
		error.name = "ImproperPurseKey";
		throw error;
	};
	
	Privacy.onPurseAlreadyPresent = function (target) {
		if (_HS_Privacy.handlesErrorsQuietly) {return null;}
		var error = new Error("Target already has a purse!");
		error.name = "ImproperAttemptToAttachPurse";
		throw error;
	};
	
	Privacy.useSimpleEncapsulation = function () {
		if (_usingSimpleEncapsulation) {return;} 
		_newPriviledgedMethod = _simplePriviledgedMethod;
		_attachProtectedProperties = _simpleProtectedProperties;
		Privacy.enableOn = _simpleProtectedProperties;
	}
	
	Privacy.installCoreMethods = function () {
		if (_HS_Privacy.coreMethodsEnabled) {return true;} 
		if (Object.prototype.enablePrivacy) {return false;}
		if (Object.prototype.priviledgedMethod) {return false;}
		if (Function.prototype.priviledgedMethod) {return false;}
		Object.prototype.enablePrivacy = function () {return _attachProtectedProperties(this);};
		Object.prototype.priviledgedMethod = function (methodName, func) {
			_setPriviledgedMethod(this, methodName, func);
		};
		Function.prototype.priviledgedMethod = function (methodName, func) {
			_setPriviledgedMethod(this.prototype, methodName, func);
		};
		return true;
	};
		
	Privacy.lock = function () {
		if (_HS_Privacy.isLocked) {return;}
		if (_usingSimpleEncapsulation) {return _onAttemptToLockWhileInSimpleMode();}
		_SabotageHandlers = {
			onImproperMethod: Privacy.onImproperMethod,
			onImproperPurse: Privacy.onImproperPurse,
			onImproperPurseKey: Privacy.onImproperPurseKey,
			onPurseAlreadyPresent: Privacy.onPurseAlreadyPresent
		};
		// Privacy.enableOn remains!
		delete Privacy.priviledgedMethodOn;
		delete Privacy.onImproperMethod;
		delete Privacy.onImproperPurse;
		delete Privacy.onImproperPurseKey;
		delete Privacy.onPurseAlreadyPresent;
		if (_HS_Privacy.coreMethodsEnabled) {
			// Object.prototype.enablePrivacy remains!
			delete Object.prototype.priviledgedMethod;
			delete Function.prototype.priviledgedMethod;
		}
	};
});

