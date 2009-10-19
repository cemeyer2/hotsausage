

"use strict";

HotSausage.newSubmodule("Cloning", function (Cloning, _HS_Cloning) {
	var _newObject = _HS_Cloning.newObject;
	var _BehaviorOf = _HS_Cloning.delegateOf;
	
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
		target.__methods = _newObject();
		target.__methodCount = 0;
	};

	var _deleteMethodDictionary = function (target) {
		delete target.__methods;
		delete target.__methodCount;
	}

	var _setMethod = function (targetInstance, methodName, impFunc) {
		var targetBehavior = _sharedBehaviorOf(targetInstance);
		var localMethodCount;
		
		if (_hasOnlyOneInstance(targetBehavior)) {
			if (impFunc) {
				_putMethod(targetBehavior, methodName, impFunc);
			} else {
				_deleteMethod(targetBehavior, methodName);
			}
		} else if (targetBehavior[methodName] === impFunc)) {
			localMethodCount = _deleteMethod(targetInstance, methodName);
			if (localMethodCount <= 0) {_deleteMethodDictionary(targetInstance);}
		} else {
			_ensureMethodDictionary(targetInstance);
			_putMethod(targetInstance, methodName, impFunc);
			// _checkCanonicalInstanceStatus(targetInstance);
		};
	};	
	
	var _newInstance = function (behavior) {
		var instance = _newObject(behavior);
		instance.__cloneId = _nextCloneId(sharedBehavior);
		return instance;
	};
	
	var _blankCopyFrom = function (sourceInstance) {
		var targetBehavior = _hasLocalMethods(sourceInstance) ?
				_newBehaviorFrom(sourceInstance) : _behaviorOf(sourceInstance);
		return targetBehavior.constructor();
	};
		
	var _setNameAndId = function (behavior, sourceBehavior) {
		var sourceId = sourceBehavior.__id;
		var nextId = (sourceBehavior.__nextDerivedId += 1);
		behavior.__id = nextId;
		behavior.__name = sourceBehavior.__typeName + sourceId + ":" + nextId;
	};
	
	var _newBehavior = function (sourceBehavior_) {
		var sourceBehavior = sourceBehavior_ || _CloneBehavior;
		var behavior = _newObject(sourceBehavior);
		behavior.constructor = function () {};
		behavior.constructor.prototype = behavior; 
		_ensureMethodDictionary(behavior);
		_setNameAndIdFrom(behavior, sourceBehavior);
		behavior.__derivedBehaviors = [];
		sourceBehavior.__derivedBehaviors.push(newBehavior);
		return behavior;
	};

	var _newBehaviorFrom = function (sourceInstance) {
		var propertyName, property;
		var localMethods = sourceInstance.__methods;
		var sourceBehavior = _behaviorOf(sourceInstance);
		var behaviorMethods = sourceBehavior.__methods;
		var newBehavior = _newBehavior(sourceBehavior);
		
		for (propertyName in sourceInstance) {
			if (propertyName in localMethods || propertyName in behaviorMethods) {
				_putMethod(newBehavior, propertyName, sourceInstance[propertyName]);
			}
		};
		newBehavior.__derivedFromObject = sourceInstance;
		return newBehavior; 
	};
	
	var _onNameForTypeAlreadyAssigned = function (typeName, target) {
		_HS_Cloning.handleError(
			"CannotCreateTypeName",
			"Property " + typeName + "already defined in " + target.toString()
		);
	}
	
	var _asNamedType = function (sourceInstance, typeName, targetModule_) {
		var behavior;
		var module = targetModule_ || Cloning;
		if (module[typeName]) {_onNameForTypeAlreadyAssigned(target, typeName);}
		behavior =_newBehaviorFrom(sourceInstance);
		behavior.__name = behavior.__typeName = typeName;
		behavior.__id = behavior.__nextDerivedId = 0;
		module[typeName] = behavior;
	};

		// isLocalProperty isInstanceProperty


	cloneTypes
	
	classesForClones =
	classForClone = name;
	typeName = Function("")
	
	
	Eve.method("copyNamed", function (name) {
		var namedCopy = this.copy().setName(name);
		if (name.charAt(0).isCapital) {
			createConstructorForClone(name, namedCopy);
		}
		return namedCopy;
	});
	
	createConstructorForClone = function (className, canonicalInstance) {
		if (Module[className]) {
			throw Error("Class " + className + "already defined!");
		}
		var constructor = function type(/* args */) {
			if (this instanceof type) {
				return canonicalInstance.cloneWith(arguments);
			}
			if (arguments.length > 0) {throw Error("Not expecting any arguments!");}
			return canonicalInstance;
		};
		return (Module[className] = constructor);
	};
	
	List = function (elements) {
		if (this instanceof arguments.callee) {
			if (arguments.length > 0) {throw Error("Not expecting any arguments!");}
			return canonicalInstance;
		}
		return canonicalInstance.copyWith(elements);
	}
	
		
	