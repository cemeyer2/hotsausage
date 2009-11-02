"use strict";

HotSausage.newSubmodule("Templates", function (Templates, _Templates_HS) {
	var HS = Templates.module();
	var _newObject = _Templates_HS.newObject;

	var NEW_INSTANCE = "newInstance";
	
	var _purseOf = function (target) {
		return target._pp;
	};

	var _setPurseOf = function (target, purse) {
		return target._pp = purse;
	};
	
	var _putMethod = function (target, methodName, impFunc) {
		var purse = _purseOf(target);
		target[methodName] = impFunc;
		purse._methods[methodName] = impFunc;
		return (purse._methodCount += 1);
	};

	var _deleteMethod = function (target, methodName) {
		var purse = _purseOf(target);
		if (methodName in purse._methods) {
			delete target[methodName];
			delete purse._methods[methodName];
			return (purse._methodCount -= 1);
		}
		return purse._methodCount;
	};
	
	var _ensureMethodDictionary = function (target) {
		var purse = _purseOf(target);
		if (purse._methods) {return;}
		purse._methods = _newObject();
		purse._methodCount = 0;
	};

	var _deleteMethodDictionary = function (target) {
		var purse = _purseOf(target);
		delete purse._methods;
		delete purse._methodCount;
	};
	
	var _nextSnapshotId = function (target) {
		return (_purseOf(target.template())._snapshotCount += 1);
	};

	var _nextInstanceId = function (target) {
		return (_purseOf(target.template())._instanceCount += 1);
	};
	
	var _behaviorOf = function (target) {
		return _purseOf(target)._behavior;
		// return Object.getPrototypeOf(target)
	};
	
	var _copyMethodDictionary = function (source, target) {
		var methods = _purseOf(source)._methods;
		var methodName;
		if (methods === undefined) {return;}
		for (methodName in methods) {
			_putMethod(target, methodName, methods[methodName]);
		}
	};
	
	var _copyMethods = function (target, sourceInstance, sourceTemplate) {
		var sourceBehavior = _behaviorOf(sourceInstance);
		_ensureMethodDictionary(target);
		if (sourceBehavior !== sourceTemplate) {
			_copyMethodDictionary(sourceBehavior, target);
		}
		_copyMethodDictionary(sourceInstance, target);
		return target;		
	};

	var _attachMethod_newInstance = function (_behavior) {
		var _instanceConstructor = function () {};
		var impfunc = function () {
			var instance = new _instanceConstructor();
			var purse = _setPurseOf(instance, _newObject());
			purse._behavior = _behavior;
			purse._instanceId = _nextInstanceId(_behavior);
			return instance;
		};
		_instanceConstructor.prototype = _behavior; 
		_putMethod(_behavior, NEW_INSTANCE, impfunc);
	};

/*
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
*/
	
	var _newBehavior = function (sourceTemplate) {
		var behavior = _newObject(sourceTemplate);
		_setPurseOf(behavior, _newObject());
		return behavior;
	};
	
	var _newBehaviorSnapshotFrom = function (sourceInstance) {
		var sourceTemplate = sourceInstance.template();
		var behaviorSnapshot = _newBehavior(sourceTemplate);
		_purseOf(behaviorSnapshot)._snapshotId = _purseOf(sourceInstance)._snapshotId;
		_copyMethods(behaviorSnapshot, sourceInstance, sourceTemplate);
		_attachMethod_newInstance(behaviorSnapshot);
		return behaviorSnapshot;
	};
	
	var _deferred_newInstance = function () {
		var behaviorSnapshot = _newBehaviorSnapshotFrom(this);
		var delegated_newInstance = behaviorSnapshot.newInstance;
		this.newInstance = delegated_newInstance;// Not sure if should use _putMethod here M3.
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
			// target is either adding its first local method, or has already spawned 
			// a snapshot behavior, and since doing so, is adding a new local method again.
			target.newInstance = _deferred_newInstance;// Not sure if should use _putMethod here M3.
			_purseOf(target)._snapshotId = _nextSnapshotId(behavior);
			_ensureMethodDictionary(target);
		}
		_putMethod(target, methodName, impFunc);
	};	

	var _onUnexpectedConstructorArguments = function (template) {
		HS.handleError(
			"UnexpectedConstructorArguments", 
			"No arguments expected to simply return the " + template.name() + " template object!"
		);
		return template;
	};

	var _newSafeDualUseConstructor = function (_template, templatePrototype) {
		var constructor = function CopyFromTemplate(/* arguments */) {
			var newInstance;
			if (this instanceof CopyFromTemplate) {
				newInstance = _template.newInstance();
				newInstance.initFromArgs(arguments);
				return newInstance;
			}
			if (arguments.length > 0) {return _onUnexpectedConstructorArguments(_template);}
			return _template;
		};
		constructor.prototype = templatePrototype;
		return constructor;
	};

	var _onNameForTemplateAlreadyAssigned = function (module, name) {
		HS.handleError(
			"CannotCreateTemplateName",
			"Property " + name + "already defined in " + module.toString()
		);
		return factoryMethod;
	};

	var _attachFactoryMethod = function (templateName, factoryMethod, targetModule_) {
		var module = targetModule_ || Templates;
		if (module[templateName]) {return _onNameForTemplateAlreadyAssigned(module, name);}
		return (module[templateName] = factoryMethod);
	};

	var _attachMethod_template = function (template) {
		_putMethod(template, "template", HS.constantGetterFor(template));
	};
	
	var _newTemplate = function (sourceInstance, templateName, targetModule) {
		var sourceTemplate = sourceInstance.template();
		var newTemplatePrototype = _newObject(sourceTemplate);
		var newTemplate = _newBehavior(newTemplatePrototype);
		var purse = _purseOf(newTemplate);
		var factoryMethod = _newSafeDualUseConstructor(newTemplate, newTemplatePrototype);
		_attachFactoryMethod(templateName, factoryMethod, targetModule);
		
		purse._name = templateName;
		purse._snapshotCount = 0;
		purse._instanceCount = 0;
		if (sourceInstance !== sourceTemplate) {
			_copyMethods(newTemplate, sourceInstance, sourceTemplate);
		}
		_attachMethod_newInstance(newTemplate);
		_attachMethod_template(newTemplate);
		return newTemplate;
	};
 
	var instance0 = _newTemplate({template: function () {Object.prototype}}, "Clone");
	
	_setMethod(instance0, "method", function (methodName, impFunc) {
		_setMethod(this, methodName, impFunc);
	});
	
	instance0.method("isTemplate", function () {return this === this.template();});
	
	instance0.method("templateName", function () {return _purseOf(this.template())._name;});
	
	instance0.method("basicName", function () {
		var template = this.template();
		var name = _purseOf(template)._name;
		var purse, instanceId, snapshotId;
		if (this === template) {return name;}
		purse = _purseOf(this);
		instanceId = purse._instanceId;
		snapshotId = purse._snapshotId;
		if (instanceId === undefined) {return ["_", name, ":s", snapshotId].join("");}  // Behavior
		snapshotId = (snapshotId) ? ":s" + snapshotId : "";
		return [name.charAt(0).toLowerCase(), name.slice(1), instanceId, snapshotId].join("");
	});
	
	instance0.method("isSameTypeAs", function (that) {
		if (this === that) {return true;}
		return (this.template() === that.template());
	});

	instance0.method("hasIdenticalBehaviorAs", function (that) {
		if (this === that) {return true;}
		return (this.newInstance === that.newInstance);
	});

	instance0.method("hasEqualBehaviorAs", function (that) {
		// This method can be overridden.
		return this.hasIdenticalBehaviorAs(that);
	});

	instance0.method("isIdentical", function (that) {return (this === that);};
				
	instance0.method("copyAsTemplate", function (templateName, targetModule_) {
		return _newTemplate(this, templateName, targetModule_);
	});
	
	instance0.method("initFromArgs", function (argumentsObject) {
		// Reimplement this method to initialize a new blank instance copy.
	});
	
	instance0.method("name", function (that) {
		// This method can be overridden.
		return this.basicName();
	});
	
	instance0.method("isEqual", function (that) {
		// This method SHOULD be overridden.
		return this.isIdentical(that);
	});
	
	instance0.method("blankCopy", instance0.newInstance});
	
	instance0.method("copy", function () {
		// This method SHOULD be overridden.
		return this.newInstance();
	});
	
});
