var _lockbox;

var _newPrivledged = function (_implementationFunction) {
	return function () {
		var params = _arguments2Array(arguments); 
		var actualCount = params.length;
		var formalCount = _implementationFunction.length;
		var privateProperties, theOwner;
		this._ppAccessor(_TheTunnel); /// <<<-----
		privateProperties = _lockbox;
		theOwner = privateProperties._owner;
		if (this !== theOwner) {
			return onPropertiesAreNotFromTarget(this, theOwner);
		};
		if (actualCount < formalCount) {
			params[formalCount - 1] = privateProperties;
			params.length = formalCount;
		} else if (formalCount === 0) {
			params[actualCount] = privateProperties;
			params.length = actualCount + 1;
		} else {
			return this.onInvalidParameterList(params);
		}
		return _implementationFunction.apply(this, params);
	};
};

var _attachNewProtectedProperties = function (theOwner) {
	var protectedProperties = _newEmptyObject();
	protectedProperties._owner = theOwner;
	theOwner._ppAccessor = function (tunnel) {
		if (tunnel !== _TheTunnel) {
			return onCounterfeitTransporter(this, tunnel);
		}
		_TheTunnel(_SecretValidation, theOwner, protectedProperties);
	}
	return protectedProperties;
};

var _TheTunnel = function (accessorValidation, theOwner, protectedObject) {
	if (accessorValidation !== _SecretValidation) {
		return onCounterfeitAccessor(theOwner, protectedObject);
	}
	_lockbox = protectedObject;
};

/// This version is simple and secure, but is NOT thread safe.  One would need a lockbox per thread.
