// Copyright Maurice Rabb, 2009
// All rights reserved
// Licensing@MauriceRabb.com

/**
 *	CODING CONVENTIONS
 *	_privateVar, _paramUsedAsPrivateVar
 *  optionalParam_
 *	_privateFunction
 * 	_PrivateSharedVar
**/


//	Behavior
M3R = {};

(function () {
	/**
	 *
	 */
		
	var _newEmptyObject = function (delegate_) {
		var SingleUseConstructor = function () {};
		SingleUseConstructor.prototype = delegate_ || null;
		return new SingleUseConstructor();
	};
	
	var ProtoProperties = _newEmptyObject();
	
	var newPropertiesObject = function () {
		return _newEmptyObject(ProtoProperties);
	};
	
	var _createValidatingRequestor = function (theValidation) {
		return function (aValidation, protectedProperties) {
			if (aValidation !== theValidation) {
				return this.onInvalidAccessorFailure(aValidation);
			}
			return protectedProperties;
		}
	};
	
	var _TheValidatingRequestor = _createValidatingRequestor(_AccessorValidation);
	var _TheAccessorValidation = _newEmptyObject();
	
	/// This version of the library is vulnerable to the man in the middle attack. e.g. an imposter _pp that wrapped around the real _pp and is monitoring the params and return values.
	var _attachNewProtectedProperties = function (theOwner) {
		var protectedProperties = _newEmptyObject();
		var ppAccessor = function (aRequestor) {
			if (aRequestor !== _TheValidatingRequestor) {
				return onInvalidRequestorFailure(this, aRequestor);
			}
			return aRequestor(_TheAccessorValidation, protectedProperties);
		}
		protectedProperties._owner = theOwner;
		theOwner._pp = ppAccessor;
		return protectedProperties;
	};
	
	var _newInstanceObject = function (aBehavior) {
		var newInstance = _newEmptyObject(aBehavior);
		var privateProperties = _attachNewProtectedProperties(newInstance);
		privateProperties._cloneId = aBehavior.nextCloneId();
		return newInstance;
	};
	
	var _newMethod = function (methodName, impFunc, hasPrivledgedAccess_) {
		var method = hasPrivledgedAccess_ 
			? _newPrivledged(impFunc) : impFunc;
		var privateProperties = _attachNewProtectedProperties(method);
		
		privateProperties.methodName = methodName;
		privateProperties.implementation = impFunc;
		if (hasPrivledgedAccess_) {
			privateProperties.privledged = true;
		};
		return method;
	};
	
	var _Slice_Arguments_to_Array = Array.prototype.slice;
	
	var _arguments2Array = function (argumentsObject) {
		return _Slice_Arguments_to_Array.call(argumentsObject); 
	};

	var _privatePropertiesOf = function (target) {
		return target._pp(_TheValidatingRequestor);
	};
		
	var _newPrivledged = function (_implementationFunction) {
		return function () {
			var params = _arguments2Array(arguments); 
			var actualCount = params.length;
			var formalCount = implementationFunction.length;
			var privateProperties = _privatePropertiesOf(this);
			var theOwner = privateProperties._owner;
			
			if (this !== theOwner) {
				return onInvalidTargetFailure(this, theOwner);
			};
			if (actualCount < formalCount) {
				params[formalCount - 1] = privateProperties;
				params.length = formalCount;
			} else if (formalCount === 0) {
				params[actualCount] = privateProperties;
				params.length = actualCount + 1;
			} else {
				return this.onInvalidParameterListFailure(params);
			}
			
			return _implementationFunction.apply(this, params);
		};
	};
	
	var _delegateOf = function (target) {
		return target.__proto__;
		// return target.constructor.prototype;
		// return Object.getPrototypeOf( )
	};
	
	var behaviorOf = function (instanceObject) {
		var behavior = _delegateOf(instanceObject);
		return checkValidBehavior(behavior);
	};

	var checkValidBehavior = function (target) {
		if (target === _SharedImplementation) { return target };
		if (_delegateOf(target) !== _SharedImplementation) {
			return outerObject.onInvalidShared(target);
		}
		return target;
	};
	
	var _getMethod = function (target, methodName) {
		var behavior = behaviorOf(target);
		var behaviorProperties = privatePropertiesOf(behavior);
		var method = behaviorProperties._methods[methodName];
		return method;
	};
	
	var _setMethod = function (target, methodName, method) {
		var behavior = behaviorOf(target);
		var behaviorProperties = privatePropertiesOf(behavior);
		if (method) {
			behavior[methodName] = method;
			behaviorProperties._methods[methodName] = method;
		} else {
			delete behavior[methodName];
			delete behaviorProperties._methods[methodName];
		};
	};
	
	var _addSharedMethod = function (methodName, impFunc, hasPrivledgedAccess_) {
		var method = _newMethod(methodName impFunc, hasPrivledgedAccess_);
		_setMethod(this, methodName, method);
	};

	var _SharedImplementation = _newEmptyObject(Object.prototype);
	var _OriginalBehavior = _newInstanceObject(_SharedImplementation);
	var _OriginalInstance = _newInstanceObject(_OriginalBehavior);
	
	_setMethod(_SharedImplementation, "addMethod", _addSharedMethod);
	
	_SharedImplementation
		.addMethod("addPrivledgedMethod", function (methodName, impFunc) {
			this.addMethod(methodName, impFunc, true);
		});
	
	M3R.Eve = _OriginalInstance;
})();