	var _hasLocalMethods = function (target) {
		return !! target.__methods;
	};

	var _copyLocalPropertiesFromTo = function (source, target) {
		var propertyName;
		for (propertyName in source) {
			if (source.hasOwnProperty(propertyName)) {
				target[propertyName] = source[propertyName];
			};
		};
	};

	var _newEmptyObject = function (delegate_) {
		var SingleUseConstructor = function () {};
		SingleUseConstructor.prototype = delegate_ || null;
		return new SingleUseConstructor();
	};

	var _newBehavior = function (delegate_) {
		var newBehavior = _newEmptyObject(delegate_ || _SharedImplementation);
		var privateProperties = _attachNewProtectedProperties(newBehavior);
		privateProperties.cloneId = aBehavior.nextCloneId();
		return newInstance;
	};

	var _behaviorOf = function (target) {
		return Object.getPrototypeOf(target);
		// return target.constructor.prototype;
		// return target.__proto__;
	};
	
	var _putMethod = function (target, methodName, impFunc) {
		target[methodName] = impFunc;
		target.__methods[methodName] = impFunc;
		return target.__methodCount += 1;
	};

	var _deleteMethod = function (target, methodName) {
		delete target[methodName];
		delete target.__methods[methodName];
	 	return target.__methodCount -= 1;
	};
	
	var _ensureMethodDictionary = function (target) {
		if (target.__methods) {return;};
		target.__methods = _newEmptyObject();
		target.__methodCount = 0;
	};

	var _deleteMethodDictionary = function (target) {
		delete target.__methods;
		delete target.__methodCount;
	}
	
	var _setMethod = function (targetInstance, methodName, impFunc) {
		var targetBehavior = _behaviorOf(targetInstance);

		if (_hasOnlyOneInstance(targetBehavior)) {
			if (impFunc) {
				_putMethod(targetBehavior, methodName, impFunc);
			} else {
				_deleteMethod(targetBehavior, methodName);
			};
		} else if (targetBehavior[methodName] === impFunc)) {
			if (_deleteMethod(targetInstance, methodName) <= 0) {
				_deleteMethodDictionary(targetInstance);
			};
		} else {
			_ensureMethodDictionary(targetInstance);
			_putMethod(targetInstance, methodName, impFunc);
		};
	};	

	
	var _copyInstance = function (sourceInstance) {
		var sharedBehavior, newInstance;	
	
		if (_hasLocalMethods(sourceInstance)) {
			return _copyWithNewBehavior(sourceInstance);
		};
	
		sharedBehavior = _behaviorOf(sourceInstance);
		newInstance = _newEmptyObject(sharedBehavior);
		_copyLocalPropertiesFromTo(sourceInstance, newInstance);
		
		newInstance._cloneId = sharedBehavior.nextCloneId();
		return newInstance;
	};
	
	var _copyWithNewBehavior = function (sourceInstance) {
		var propertyName, property;
		var localMethods = sourceInstance.__methods;
		var sourceBehavior = _behaviorOf(sourceInstance);
		var newBehavior = _newBehavior();
		var newInstance = _newEmptyObject(newBehavior);
	
		for (propertyName in sourceInstance) {
			if (sourceInstance.hasOwnProperty(propertyName)) {
				property = sourceInstance[propertyName];
				if (propertyName in localMethods) {
					_putMethod(newBehavior, propertyName, property);
				} else {
					newInstance[propertyName] = property;
				};
			} else if (sourceBehavior.hasOwnProperty(propertyName)) {
				property = sourceBehavior[propertyName];
				_putMethod(newBehavior, propertyName, property);
			};
		};
		delete newInstance.__methods; // Copied from source but not needed yet by new instance.
		
		newInstance.__cloneId = newBehavior.nextCloneId();
		return newInstance; 
	}

	var Point = Eve.copy();
	Point.addMethod("x", function () {
		
	});

