var _ActiveLoaders = _newEmptyObject();

var _getPrivatePropertiesOf = function (target) {
	var privateProperties,
		loaderId = Math.random(),
		loader = function (pObject) {privateProperties = pObject;};
	_ActiveLoaders[loaderId] = loader;
	target._ppAccessor(loaderId); /// privateProperties are set here!
	delete _ActiveLoaders[loaderId];
	return privateProperties;
	/// NOTE: _ActiveLoaders is not threadsafe, but is easily made so.
};

var _newPrivledged = function (_implementationFunction) {
	return function (/* arguments */) {
		var params = _arguments2Array(arguments),
			actualCount = params.length, 
			formalCount = _implementationFunction.length,
			privateProperties = _getPrivatePropertiesOf(this),
			theOwner = privateProperties._owner;
		if (this !== theOwner) {
			return onPropertiesAreNotFromTarget(this, theOwner);
		}
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
	var protectedProperties = _newEmptyObject(),
		ppAccessor = function (loaderId) {
			var loader = _ActiveLoaders[loaderId];
			if (loader === undefined) {
				return onInvalidLoaderId(this, loaderId);
			}
			loader(protectedProperties);
		};
	protectedProperties._owner = theOwner;
	theOwner._ppAccessor = ppAccessor;
	return protectedProperties;
};
