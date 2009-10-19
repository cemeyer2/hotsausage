undefined
// Will speed up references to window, and allows munging its name.
window = this,
// Will speed up references to undefined, and allows munging its name.
undefined,

instanceof
for each -> https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Object/propertyIsEnumerable

CouchDB JS





"use strict";

HotSausage.newSubmodule("Cloning", function (Cloning, _HS_Cloning) {
	var _newObject = _HS_Cloning.newObject;
	var _sharedBehaviorOf = _HS_Cloning.delegateOf;
	var _classicPrototypeOf = _HS_Cloning.delegateOf;
		
	var _setNameAndId = function (behavior, sourceBehavior, id) {
		var sourceId = sourceBehavior.__id;
		var sourceType = sourceBehavior.__typeName;
		behavior.__id = id;
		behavior.__name = "_" + sourceType + sourceId + ":" + id;
	};
	
	var _newBehavior = function (sourceBehavior) {
		var classicPrototype = _classicPrototypeOf(sourceBehavior);
		var newBehavior = _newObject(classicPrototype);
		var constructor = function () {};
		constructor.prototype = newBehavior; 
		newBehavior.blankCopy = constructor;
		newBehavior.__sourceBehavior = sourceBehavior;
		newBehavior.__derivedBehaviors = [];
		sourceBehavior.__derivedBehaviors.push(newBehavior);
		_ensureMethodDictionary(newBehavior);
		return newBehavior;
	};

	var _newBehaviorFrom = function (sourceInstance) {
		var propertyName, property;
		var localMethods = sourceInstance.__methods;
		var sharedBehavior = sourceInstance.__derivedBehavior || _sharedBehaviorOf(sourceInstance);
		var sharedMethods = sharedBehavior.__methods;
		var newBehavior = _newBehavior(sharedBehavior);
		
		_setNameAndId(newBehavior, sourceBehavior, sourceInstance.__id);
		for (propertyName in sourceInstance) {
			if (propertyName in localMethods || propertyName in sharedMethods) {
				_putMethod(newBehavior, propertyName, sourceInstance[propertyName]);
			}
		};
		return newBehavior; 
	};

	var _deleteMethod = function (target, methodName) {
		if (methodName in target.__methods) {
			delete target[methodName];
			delete target.__methods[methodName];
	 		return target.__methodCount -= 1;
		}
		return target.__methodCount;
	};
	
	var _deferredBlankCopy = function () {
		var newBehavior = _newBehaviorFrom(this);
		var blankCopyViaDelegate = newBehavior.blankCopy;
		this.__derivedBehavior = newBehavior;
		this.blankCopy = function () {return blankCopyViaDelegate();};
		return blankCopyViaDelegate();
	}
	
	var _setMethod = function (target, methodName, impFunc) {
		var sharedBehavior = _sharedBehaviorOf(target);
		var localMethodCount;
		
		if (target.__id === 0) {
			(impFunc) {
				_putMethod(target, methodName, impFunc);
			} else {
				_deleteMethod(target, methodName);
			}
		} else if (sharedBehavior[methodName] === impFunc)) {
			localMethodCount = _deleteMethod(target, methodName);
			if (localMethodCount <= 0) {_deleteMethodDictionary(target);}
		} else if (target.blankCopy === _deferredBlankCopy) {
			_putMethod(target, methodName, impFunc);
		} else {
			target.__id = _nextDerivedId(sharedBehavior);
			target.blankCopy = _deferredBlankCopy;
			_ensureMethodDictionary(target);
			_putMethod(target, methodName, impFunc);
		};
	};	
	
	namedCopy
	
		// isLocalProperty isInstanceProperty
