"use strict";

if (!HotSausage) {var HotSausage = {};}

HotSausage.Priviledged = (function () {
	var Priviledged = {};
	var _Priviledged = Priviledged;
	var	_handleErrorsQuietly = false;
	var _nativeUseEnabled = false;
	
	var _delegate = function (target) {
		return target.contructor.prototype;
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
		target._getPurse(sessionKey); /// The purse is set here!
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
		if (target._getPurse !== undefined) {
			return _Priviledged.onPurseAlreadyPresent(target);
		}
		var	_purse = _newEmptyObject(target);
		target._getPurse = function (sessionKey) {
			var transporter = _ActiveTransporters[sessionKey];
			if (transporter === undefined) {
				return _Priviledged.onImproperPurseKey(this, sessionKey);
			}
			transporter(_purse);
		};
		return _purse;
	};
	
	Priviledged.setMethod = _setMethod;
	Priviledged.attachPurse = _attachPurse;
	
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
	
	Priviledged.enableNativeUse = function () {
		if (_nativeUseEnabled) {return true;} 
		if (Object.prototype.enablePurse) {return false;}
		if (Object.prototype.priviledgedMethod) {return false;}
		if (Function.prototype.priviledgedMethod) {return false;}
		Object.prototype.enablePurse = function () {return _attachPurse(this);};
		Object.prototype.priviledgedMethod = function (methodName, func) {
			_setMethod(this, methodName, func);
		};
		Function.prototype.priviledgedMethod = function (methodName, func) {
			_setMethod(this.prototype, methodName, func);
		};
		return (_nativeUseEnabled = true);
	};
	
	Priviledged.lock = function () {
		if (Priviledged.setMethod !== undefined) {
			_Priviledged = {
				onImproperMethod: Priviledged.onImproperMethod,
				onImproperPurse: Priviledged.onImproperPurse,
				onImproperPurseKey: Priviledged.onImproperPurseKey,
				onPurseAlreadyPresent: Priviledged.onPurseAlreadyPresent
			};
			// Priviledged.attachPurse remains!
			// Priviledged.lock remains!
			delete Priviledged.handleErrorsQuietly;
			delete Priviledged.enableNativeUse;
			delete Priviledged.setMethod;
			delete Priviledged.onImproperMethod;
			delete Priviledged.onImproperPurse;
			delete Priviledged.onImproperPurseKey;
			delete Priviledged.onPurseAlreadyPresent;
			if (_nativeUseEnabled) {
				// Object.prototype.enablePurse remains!
				delete Object.prototype.priviledgedMethod;
				delete Function.prototype.priviledgedMethod;
			}
		}
	};
	
	return Priviledged;
})();


Priviledged.Examples = {};

Priviledged.Examples.Person = (function () {
	var Person = function (name) {
		var purse = Priviledged.attachPurse(this);
		var pair = KeyGenerator.newPair();
		purse.name = name;
		purse.favoritePassword = 'abc123';
		purse.secretLover = 'Gumby';
		purse.privateKey = pair.privateKey;
		purse.publickey = pair.publicKey;
	};
	
	Priviledged.setMethod(Person, "publicKey")
})();

Priviledged.Examples.Person

Priviledged.setMethod = _setMethod;
Priviledged.attachPurse = _attachPurse;

	
	Priviledged.enableNativeUse();
	Priviledged.handleErrorsQuietly();
	
	Thingy = function (name) {
		var purse = this.enablePurse();
		purse.secretCode = "ABC123";
		purse.ssn = "344-55-6677";
		purse.batPhoneNumber = "312-234-5678";
	};
	
	Thingy.priviledgedMethod("didTheyCall", function (phoneNumber) {
		return this.batPhoneNumber === phoneNumber;
	});
	
	Priviledged.onImproperPurse = function (target, actualPurseOwner) {
		if (_handleErrorsQuietly) {return target;}
		var error = new Error("Another object's purse has been attached to the target object!");
		error.name = "ImproperPurse";
		throw error;
	}
	Priviledged.lock();
	
	
