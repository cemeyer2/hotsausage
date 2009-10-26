var _newPrivledged = function (_implementationFunction) {
	return function () {
		var params = _arguments2Array(arguments); 
		var actualCount = params.length;
		var formalCount = _implementationFunction.length;
		var privateProperties, theOwner;
		var loaderCallback = function (executor, transporterCallback) {
			if (executor !== _TheExecutor) {
				return onCounterfeitExecutor(executor, transporterCallback);
			}
			_TheExecutor(_TheValidation, transporterCallback, loader);
		};
		var loader = function (pObject) {
			privateProperties = pObject;
		};
		_BubblingSecret = {id: secretId++};
		this._ppAccessor(_TheTransporter, loaderCallback); /// <<<-----
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
	theOwner._ppAccessor = function (transporter, loaderCallback) {
		if (transporter !== _TheTransporter) {
			return onCounterfeitTransporter(this, transporter, loaderCallback);
		}
		_TheTransporter(_TheValidation, theOwner, protectedProperties, loaderCallback);
	}
	return protectedProperties;
};

var _TheTransporter = function (accessorPassword, theOwner, protectedObject, loaderCallback) {
	var transporterCallback = function (loaderPassword, loader) {
		if (loaderPassword !== _BubblingSecret) {
			return onCounterfeitLoader(theOwner, protectedObject);
		}
		loader(protectedObject);
	};
	
	if (accessorPassword !== _TheValidation) {
		return onCounterfeitAccessor(theOwner, protectedObject);
	}
	loaderCallback(_TheExecutor, transporterCallback);
};

var _TheExecutor = function (loaderCallbackValidation, transporterCallback, loader) {
	if (loaderCallbackValidation !== _TheValidation) {
		return this.onCounterfeitCallback(transporterCallback, loader);
	}
	transporterCallback(_BubblingSecret, loader);
};

//	1: Fake ppAccessor, is run and captures a real method's loaderCallback.
//	2: The Fake ppAccessor substitutes a fake loaderCallback to learn _TheExecutor.  
//	3: The Fake ppAccessor skips _TheTransporter, and executes the real loaderCallback with the _TheExecutor and a fake transporterCallback.  
// 	The _TheExecutor is running once! (Without the _TheTransporter being run first!)
//	The fake transporterCallback captures the transportCallback secret password, and the loader for the method
//	4a: The loader is run with faked sabotaged data!
	
	var fakeloaderCallback2 = function (executor, realTransporterCallback) {
		/// Ignore and skip the _TheExecutor
		realTransporterCallback(_BubblingSecret, loader);
	};

//	5: The re
	
/// The loader must be protected!!  (It must expire)
/// NOTE: _TheExecutor is only run once, and is
	
	But can't cause any other effect
