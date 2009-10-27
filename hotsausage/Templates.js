"use strict";

HotSausage.newSubmodule("Templates", function (Templates, _HierarchicalPurse) {
	var _newObject = _HierarchicalPurse.newObject;

	var SNAPSHOT_ID = "_snapshotId";
	
	var _putMethod = function (target, methodName, impFunc) {
		target[methodName] = impFunc;
		target._pp._methods[methodName] = impFunc;
		return (target._pp._methodCount += 1);
	};

	var _deleteMethod = function (target, methodName) {
		var purse = target._pp;
		if (methodName in purse._methods) {
			delete target[methodName];
			delete purse._methods[methodName];
			return (purse._methodCount -= 1);
		}
		return purse._methodCount;
	};
	
	var _ensureMethodDictionary = function (target) {
		var purse = target._pp;
		if (purse._methods) {return;}
		purse._methods = _newObject();
		purse._methodCount = 0;
	};

	var _deleteMethodDictionary = function (target) {
		var purse = target._pp;
		delete purse._methods;
		delete purse._methodCount;
	};
	
	var _nextSnapshotId = function (target) {
		return (_templateOf(target)._pp._snapshotCount += 1);
	};

	var _nextInstanceId = function (target) {
		return (_templateOf(target)._pp._instanceCount += 1);
	};
	
	var _behaviorOf = function (target) {
		return target._pp._behavior;
		// return Object.getPrototypeOf(target)
	};
	
	var _copyMethodDictionary = function (source, target) {
		var methods = source._pp._methods;
		var methodName;
		if (methods === undefined) {return;}
		for (methodName in methods) {
			_putMethod(target, methodName, methods[methodName]);
		}
	};
	
	var _copyMethods = function (target, sourceInstance, sourceTemplate) {
		var sourceBehavior = _behaviorOf(sourceInstance);
		_ensureMethodDictionary(target);
		if (sourceTemplate !== sourceBehavior) {
			_copyMethodDictionary(sourceBehavior, target);
		}
		_copyMethodDictionary(sourceInstance, target);
		return target;		
	};

	var _attachMethod_newInstance = function (_behavior) {
		var _constructor = function () {};
		_constructor.prototype = _behavior; 
		_behavior.newInstance = function () {
			var instance = new _constructor();
			instance._pp = _newObject();
			instance._pp._instanceId = _nextInstanceId(_behavior);
			return instance;
		};
		// newInstance is one of the few methods that doesn't go into the methodDict 
		// to avoid copying it when creating a new behavior only to overwrite it with 
		// a new newInstance method.
	};

	var _attachMethod_newInstance = function (_behavior) {
		var _constructor = function ConstructorType() {
			if (this instanceof ConstructorType) {
				this._pp = _newObject();
				this._pp._instanceId = _nextInstanceId(_behavior);
			} else {
				return new ConstructorType();
			}
		};
		_constructor.prototype = _behavior; 
		_behavior.newInstance = _constructor;
		};
		// newInstance is one of the few methods that doesn't go into the methodDict 
		// to avoid copying it when creating a new behavior only to overwrite it with 
		// a new newInstance method.
	};
	
	var _newBehavior = function (sourceTemplate) {
		var _behavior = _newObject(sourceTemplate);
		_behavior._pp = _newObject();
		_behavior.behavior = function () {return _behavior;};
	};
	
	var _newBehaviorSnapshotFrom = function (sourceInstance) {
		var sourceTemplate = sourceInstance.__template;
		var behaviorSnapshot = _newBehavior(sourceTemplate);
		behaviorSnapshot._pp._snapshotId = sourceInstance._pp._snapshotId;
		_copyMethods(behaviorSnapshot, sourceInstance, sourceTemplate);
		_attachMethod_newInstance(behaviorSnapshot);
		return behaviorSnapshot;
	};
	
	var _deferred_newInstance = function () {
		var behaviorSnapshot = _newBehaviorSnapshotFrom(this);
		var delegated_newInstance = behaviorSnapshot.newInstance;
		this.newInstance = delegated_newInstance;
		return delegated_newInstance();
	};
	
	var _setMethod = function (target, methodName, impFunc) {
		var behavior = _behaviorOf(target);
		var localMethodCount;
		
		if (behavior[methodName] === impFunc) {
			localMethodCount = _deleteMethod(target, methodName);
			if (localMethodCount <= 0) {_deleteMethodDictionary(target);}
			return;
		}
		if (target.isTemplate() || target.newInstance === _deferred_newInstance) {
			// target is template or has local methods but no copies yet
		} else {
			// target is either adding its first local method, or has already 
			// snapshotted a behavior, and since is adding a new local method.
			target.newInstance = _deferred_newInstance;
			target._pp._snapshotId = _nextSnapshotId(behavior);
			_ensureMethodDictionary(target);
		}
		_putMethod(target, methodName, impFunc);
	};	

	var _onUnexpectedConstructorArguments = function (constructor, newInstance) {
		_HierarchicalPurse.handleError(
			"UnexpectedConstructorArguments",
			"Not expecting any arguments!"
		);
		return newInstance;
	};

	var _newSafeDualUseConstructor = function (_template, templatePrototype) {
		var constructor = function ConstructedType(/* arguments */) {
			var newInstance;
			if (this instanceof ConstructedType) {
				newInstance = _template.newInstance();
				newInstance.initFromArgs(arguments);
				return newInstance;
			}
			if (arguments.length > 0) {
				return _onUnexpectedConstructorArguments(ConstructedType, _template);
			}
			return _template;
		};
		constructor.prototype = templatePrototype;
		return constructor;
	};

	var _onNameForTemplateAlreadyAssigned = function (module, name, factoryMethod) {
		_HierarchicalPurse.handleError(
			"CannotCreateTemplateName",
			"Property " + name + "already defined in " + module.toString()
		);
		return factoryMethod;
	};

	var _attachFactoryMethod = function (name, factoryMethod, targetModule_) {
		var module = targetModule_ || Templates;
		if (module[name]) {
			return _onNameForTemplateAlreadyAssigned(module, name, factoryMethod);
		}
		return (module[name] = factoryMethod);
	};

	var _newTemplate = function (sourceInstance, name, targetModule_) {
		var sourceTemplate = sourceInstance.template();
		var newTemplatePrototype = _newObject(sourceTemplate);
		var _newTemplate = _newBehavior(newTemplatePrototype);
		var factoryMethod = _newSafeDualUseConstructor(_newTemplate, newTemplatePrototype);
		_newTemplate.template = function () {return _newTemplate;};
		_newTemplate._pp._snapshotCount = 0;
		_newTemplate._pp._instanceCount = 0;
		_copyMethods(_newTemplate, sourceInstance, sourceTemplate);
		_attachMethod_newInstance(_newTemplate);
		_attachFactoryMethod(factoryMethod, targetModule_);
		return _newTemplate;
	};
 
	var originalInstance = _newTemplate({__template: Object.prototype}, "Clone");
	
	_setMethod(originalInstance, "method", function (methodName, impFunc) {
		_setMethod(this, methodName, impFunc);
	});
	
	originalInstance.method("isTemplate", function () {return this === this.__template;});
	
	originalInstance.method("template", function () {return this._pp._template;});
	
	originalInstance.method("basicName", function () {
		var purse = this._pp;
		var name = purse._templateName;
		if (this.isTemplate()) {return name;}
		if (this.hasOwnProperty(SNAPSHOT_ID)) {return "_" + name + purse._snapshotId;}
		/////// name = <== firstchar as lowercase;
		return name + purse._instanceId;
	});
	
	originalInstance.method("hasIdenticalBehaviorAs", function (that) {
		if (that === this) {return true;}
		return (that.newInstance === this.newInstance);
	});

	originalInstance.method("hasEqualBehaviorAs", originalInstance.hasIdenticalBehaviorAs);

	originalInstance.method("isIdentical", function (that) {return (that === this);};
				
	originalInstance.method("copyAsTemplate", function (templateName, targetModule_) {
		return _newTemplate(this, templateName, targetModule_);
	});
	
	originalInstance.method("initFromArgs", function (argumentsObject) {
		// Reimplement this method to initialize a blank copy.
	});
	
	originalInstance.method("name", function (that) {
		// This method can be overridden.
		return this.basicName();
	});
	
	originalInstance.method("isEqual", function (that) {
		// This method should be overridden.
		return this.isIdentical(that);
	});
	
	originalInstance.method("blankCopy", function () {return this.newInstance();});
	
	originalInstance.method("copy", function () {
		// This method should be overridden.
		return this.newInstance();
	});
	
});
