(function () {
	/**
	 *
	 */
	
	var __Array_slice = Array.prototype.slice;
	var __Object_hasOwnProperty = Object.prototype.hasOwnProperty;	
	// Preserves this function from sabotage!
	
		
	var _newEmptyObject = function (delegate_) {
		var SingleUseConstructor = function () {};
		SingleUseConstructor.prototype = delegate_ || null;
		return new SingleUseConstructor();
	};

	var _ActiveTransporters = _newEmptyObject();

	var _attachNewPurse = function (target) {
		var purse = _newEmptyObject();
		if (target._openPurse) {return;}
		target._openPurse = function (key) {
			var transporter = _ActiveTransporters[key];
			if (transporter === undefined) {
				return onInvalidTransporterKey(target, key);
			}
			transporter(purse);
		};
		purse._owner = target;
	};
	
	var _getPurseOf = function (target) {
		var key = Math.random(),
			transporter = function (aPurse) {purse = aPurse;};
		var purse;
		_ActiveTransporters[key] = transporter;
		target._openPurse(key); /// The purse is set here!
		delete _ActiveTransporters[key];
		return purse;
		/// NOTE: _ActiveTransporters is not threadsafe, but is easily made so.
	};

	var _arguments2ParamArray = function (argumentsObject) {
		return __Array_slice.call(argumentsObject); 
	};

	var _newPrivledged = function (_implementationFunction) {
		return function (/* arguments */) {
			var paramArray = _arguments2ParamArray(arguments),
				actualCount = paramArray.length, 
				formalCount = _implementationFunction.length,
				purse = _getPurseOf(this),
				theOwner = purse._owner;
			if (this !== theOwner) {
				return onPurseOnWrongTarget(this, theOwner);
			}
			if (actualCount < formalCount) {
				paramArray[formalCount - 1] = purse;
				paramArray.length = formalCount;
			} else if (formalCount === 0) {
				paramArray[actualCount] = purse;
				paramArray.length = actualCount + 1;
			} else {
				return this.onInvalidParameterList(paramArray);
			}
			return _implementationFunction.apply(this, paramArray);
		};
	};

	var __newMethod = function (methodName, impFunc, hasPrivledgedAccess_) {
		var method = hasPrivledgedAccess_ ? _newPrivledged(impFunc) : impFunc;
		var purse = _attachNewPurse(method);
		
		purse._methodName = methodName;
		purse._implementation = impFunc;
		if (hasPrivledgedAccess_) {purse._isPrivledged = true;};
		return method;
	};
	
	var __setMethod = function (behavior, methodName, method) {
		if (method) {
			behavior[methodName] = method;
		} else {
			delete behavior[methodName];
		};
	};
	
	var _addMethod_ = function (methodName, impFunc, isPrivledged_) {
		var method = __newMethod(methodName impFunc, isPrivledged_);
		__setMethod(this, methodName, method);
	};

	Function.prototype.addMethod = function (methodName, impFunc, hasPrivledgedAccess_) {
		__addMethod(methodName, impFunc, hasPrivledgedAccess_);
	}
	
	var __lockBehavior = function () {
		delete Function.prototype.addMethod;
	}
