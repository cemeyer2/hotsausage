var Sausage = {};

(function () {
	var _newEmptyObject = function (delegate_) {
		var SingleUseConstructor = function () {};
		SingleUseConstructor.prototype = delegate_ || null;
		return new SingleUseConstructor();
	};
	
	var _newBehavior = function (delegate) {
		var newBehavior = _newEmptyObject(delegate || _SharedImplementation);
		var privateProperties = _attachNewProtectedProperties(newBehavior);
		privateProperties.cloneId = aBehavior.nextCloneId();
		return newInstance;
	};

	var _copyLocalPropertiesFromTo = function (source, target) {
		var propertyName;
		for (propertyName in source) {
			if (source.hasOwnProperty(propertyName)) {
				target[propertyName] = source[propertyName];
			};
		};
	};

	var _copyMethodsFromTo = function (source, destination) {
		_copyPropertiesFromTo(source._methods, destination);
	};
	
	var _hasLocalBehavior = function (target) {
		return !! target._methods;
	};
	
	var _hasMultipleInstances = function () {
		return _cloneCount > 1;
	};

	var _copyInstance = function (sourceInstance) {
		var propertyName;
		var localMethods = sourceInstance._method;
		var newBehavior;
		var newInstance;	
		
		if (localMethods) {
			targetBehavior = _newBehavior();
			targetInstance = _newEmptyObject(targetBehavior);	
			
			for (propertyName in sourceInstance) {
				if (sourceInstance.hasOwnProperty(propertyName)) {
					if (propertyName in localMethods) {
						targetBehavior[propertyName] = sourceInstance[propertyName];
					} else {
						targetInstance[propertyName] = sourceInstance[propertyName];
					}
				} else {
					targetBehavior[propertyName] = sourceInstance[propertyName];
				}
			}
		} else {
			targetBehavior = _behaviorOf(sourceInstance);
			targetInstance = _newEmptyObject(targetBehavior);	

			for (propertyName in sourceInstance) {
				if (sourceInstance.hasOwnProperty(propertyName)) {
					targetInstance[propertyName] = sourceInstance[propertyName];
				} else {
					targetBehavior[propertyName] = sourceInstance[propertyName];
				}
			}
		}



	
	var _copyInstance = function (target) {
		var newInstance = _hasLocalBehavior(target) 
			? _copyFromNewBehavior(target) 
			: _newEmptyObject(_behaviorOf(target));	
		_copyPropertiesFromTo(target, newInstance);
		return newInstance;
	}
	
	var _copyWithNewBehavior = function (sourceInstance) {
		var sourceBehavior = _behaviorOf(sourceInstance);
		var newBehavior = _newBehavior();
		var newInstance = _newEmptyObject(newBehavior);	
		_copyPropertiesFromTo(sourceBehavior, destinationBehavior);
		_copyPropertiesFromTo(sourceInstance._methods, destinationBehavior);
		return destinationBehavior;
	};


	var _cloneCount = 0;
	var _snapshot;
	

	
	

});

behavior/snapshot
	_cloneCount
	_version
	_original
	
	
instance
	_typeInterface
	_currentSnapshot

var sss = (function () {
	return 
});

	

	

	
	
	
var newObject = function () {
	var 
	return function () {
		
	}
}