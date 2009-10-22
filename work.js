undefined
// Will speed up references to window, and allows munging its name.
window = this,
// Will speed up references to undefined, and allows munging its name.
undefined,

instanceof
for each -> https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Object/propertyIsEnumerable

CouchDB JS





"use strict";

HotSausage.newSubmodule("Templates", function (Templates, _HS_Templates) {
	var _newObject = _HS_Templates.newObject;
	var _delegateOf = _HS_Templates.delegateOf;
	
	var _putMethod = function (target, methodName, impFunc) {
		target[methodName] = impFunc;
		target.__methods[methodName] = impFunc;
		return target.__methodCount += 1;
	};

	var _deleteMethod = function (target, methodName) {
		if (methodName in target.__methods) {
			delete target[methodName];
			delete target.__methods[methodName];
	 		return target.__methodCount -= 1;
		}
		return target.__methodCount;
	};
	
	var _ensureMethodDictionary = function (target) {
		if (target.__methods) {return;};
		target.__methods = _newObject();
		target.__methodCount = 0;
	};

	var _deleteMethodDictionary = function (target) {
		delete target.__methods;
		delete target.__methodCount;
	};
	
	
	var _newInstance_whenHasLocalMethodsButNoCopiesYet = function () {
		var snapshot = _newBehaviorSnapshotFrom(this);
		var delegated_newInstance = snapshot.__newInstance;
		this.__newInstance = delegated_newInstance;
		return delegated_newInstance();
	};
	
	var _setMethod = function (target, methodName, impFunc) {
		var sharedBehavior = _delegateOf(target);
		var localMethodCount;
		
		if (sharedBehavior[methodName] === impFunc)) {
			localMethodCount = _deleteMethod(target, methodName);
			if (localMethodCount <= 0) {_deleteMethodDictionary(target);}
		} else {
			if (target.__newInstance !== 
					_newInstance_whenHasLocalMethodsButNoCopiesYet) {
				// _deferredBlankInstance
				// target is either adding its first local method, or has already 
				// snapshotted a behavior, and since is adding a new local method.
				target.__snapshotId = _nextSnapshotId(sharedBehavior);
				_ensureMethodDictionary(target);
				target.__newInstance = _newInstance_whenHasLocalMethodsButNoCopiesYet;
			}
			_putMethod(target, methodName, impFunc);
		}
	};	
	
	var _isTemplateInstance = function (target) {
		return target === target.__template;
		// return target.__snapshotId === 0;
	};
	
	var _hasLocalMethodsButNoCopies = function (target) {
		return target.blankCopy === _newInstance_whenHasLocalMethodsButNoCopiesYet;
		// _deferredBlankCopy;
	};
	
	var _nextSnapshotId = function (templateInstance) {
		return templateInstance.__behaviorSnapshotsCount += 1;
	};

	var _nextInstanceId = function (templateInstance) {
		return templateInstance.__instanceCount += 1;
	};
	
	
	var _onNameForTypeAlreadyAssigned = function (templateName, target) {
		_HS_Templates.handleError(
			"CannotCreateTemplateName",
			"Property " + templateName + "already defined in " + target.toString()
		);
	};
	
	var _name = function (target) {
		var name = target.__name;
		if (_isTemplateInstance(target)) {return name;}
		if (target.hasOwnProperty(__snapshotId) {return "_" + name + target.__snapshotId;}
		name = <== firstchar as lowercase;
		return name + target.__instanceId;
	}
	
	var _attachMethod_newInstance = function (_target) {
		var constructor = function () {};
		constructor.prototype = _target; 
		_target.__newInstance = function () {
			var instance = new constructor();
			instance.__instanceId = (instance.__nextInstanceId += 1); // check this!	
			return instance;
		};
	};
	
	var _newBehaviorSnapshotFrom = function (sourceInstance) {
		var sourceTemplate = sourceInstance.__template;
		var behaviorSnapshot = _newObject(sourceTemplate);
		var snapshotId = sourceInstance.__snapshotId;
		behaviorSnapshot.__snapshotId = snapshotId;
		_attachMethod_newInstance(behaviorSnapshot);
		_loadMethods(behaviorSnapshot, sourceInstance, sourceTemplate);
		return behaviorSnapshot;
	};
	
	var _loadMethods = function (target, sourceInstance, sourceTemplate) {
		var sourceBehavior = _behaviorOf(sourceInstance);
		var localMethods = sourceInstance.__methods;
		var methodName, sourceMethods;
		
		_ensureMethodDictionary(target);
		if (sourceTemplate !== sourceBehavior) {
			sourceMethods = sourceBehavior.__methods;
			for (methodName in sourceMethods) {
				_putMethod(target, methodName, sourceMethods[methodName]);
			}
		}
		for (methodName in localMethods) {
			_putMethod(target, methodName, localMethods[methodName]);
		}
		return target;		
	};
	
	
	
	var _onUnexpectedConstructorArguments = function (constructor) {
		_HS_Templates.handleError(
			"UnexpectedConstructorArguments",
			"Not expecting any arguments!"
		);
	};

	_newSafeDualUseConstructor = function (template, templatePrototype) {
		var constructor = function ConstructedType(/* arguments */) {
			if (this instanceof ConstructedType) {
				newInstance = template.__newInstance();
				newInstance.initFromArgs(arguments);
				return newInstance;
			}
			if (arguments.length > 0) {
				return _onUnexpectedConstructorArguments(constructor);
			}
			return template;
		};
		constructor.prototype = templatePrototype;
		return constructor;
	};

	var _newTemplate = function (sourceInstance, name, targetModule_) {
		var sourceTemplate = sourceInstance.__template;
		var templatePrototype = _newObject(sourceTemplate);
		var template = _newObject(templatePrototype);
		var factoryMethod = _newSafeDualUseConstructor(template, templatePrototype);
		template.__template = template;
		template.__name = name;
		template.__snapshotCount = 0;
		template.__instanceCount = 0;
		_attachMethod_newInstance(template);
		_loadMethods(template, sourceInstance, sourceTemplate);
		_attachFactoryMethod(factoryMethod, targetModule_);
		return template;
	};
	
	var _attachFactoryMethod = function (name, factoryMethod, targetModule_) {
		var module = targetModule_ || _defaultModule;
		if (module[name]) {
			return _onNameForTypeAlreadyAssigned(module, name, factoryMethod);
		}
		module[name] = factoryMethod;
	};
	

		// isLocalProperty isInstanceProperty
	
