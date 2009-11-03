"use strict";

HotSausage.newSubmodule("Templates", function (Templates, _Templates_HS) {
	var HS = Templates.module();
	var _newObject = _Templates_HS.newObject;
	var _hasLocalProperty = _Templates_HS.hasLocalProperty;
	var _isPublic = HS.isPublic;
	
	var NEW_INSTANCE = "newInstance";
	
	var _purseOf = function (target) {return target._purse();};

	var _attachMethod_purse = function (target, purse) {
		target._purse = HS.createConstantAccessor(purse);
	};
	
	var _copyPurseFrom = function (source, target) {
		var sourcePurse = _purseOf(source);
		var targetPurse = _purseOf(target);
		var propertyName;
		for (propertyName in sourcePurse) {
			if (_isPublic(propertyName) && _hasLocalProperty(sourcePurse, propertyName)) {
				targetPurse[propertyName] = sourcePurse[propertyName];
			}
		}
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
	
	var _copyMethodDictionary = function (source, target) {
		var methods = _purseOf(source)._methods;
		var methodName;
		if (methods === undefined) {return;}
		for (methodName in methods) {
			_putMethod(target, methodName, methods[methodName]);
		}
	};
	
	var _copyMethods = function (target, sourceInstance, sourceTemplate) {
		var sourceBehavior = _purseOf(sourceInstance)._behavior;
		_ensureMethodDictionary(target);
		if (sourceBehavior !== sourceTemplate) {
			_copyMethodDictionary(sourceBehavior, target);
		}
		_copyMethodDictionary(sourceInstance, target);
		return target;		
	};

	var _attachMethod_newObject = function (behavior, behaviorPurse) {
		var _Purse = function () {};
		var _Object = function () {};
		_Purse.prototype = behaviorPurse; 
		_Instance.prototype = behavior; 
		behaviorPurse._newInstance = function (isSnapshot_) {
			var instance = new _Object();
			var purse = _attachMethod_purse(this, new _Purse());
			if (isSnapshot_) {
				purse._snapshotId = purse._nextSnapshotId();
				purse._behavior = instance;
			} else {
				purse._instanceId = purse._nextInstanceId();
			}
			return instance;
		});
	};

	var _newBehavior = function (sourceTemplate) {
		var behavior = _newObject(sourceTemplate);
		var purse = _attachPurse(behavior);
		purse._behavior = behavior;
		return behavior;
	};
	
	var _newBehaviorSnapshotFrom = function (sourceInstance) {
		var sourceTemplate = sourceInstance.template();
		var behaviorSnapshot = _newBehavior(sourceTemplate);
		var sharedPurse = _purseOf(behaviorSnapshot);
		sharedPurse._snapshotId = _purseOf(sourceInstance)._snapshotId;
		_copyMethods(behaviorSnapshot, sourceInstance, sourceTemplate);
		_attachMethod_newInstance(behaviorSnapshot, sharedPurse);
		return behaviorSnapshot;
	};
	
	var _deferred_newInstance = function () {
		var behaviorSnapshot = _newBehaviorSnapshotFrom(this);
		var delegated_newInstance = behaviorSnapshot.newInstance;
		this.newInstance = delegated_newInstance;// Not sure if should use _putMethod here M3.
		return delegated_newInstance();
	};
	
	var _setMethod = function (target, methodName, impFunc) {
		var behavior = _purseOf(target)._behavior;
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
			_purseOf(target)._snapshotId = _purseOf(behavior)._snapshotCount += 1;
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

	var _attachMethod_template = function (_template) {
		_putMethod(_template, "template", function () {return _template});
	};
	
	
	var attachMethodsFor_instanceId = function (target) {
		var _instanceCount = 0;
		target._nextInstanceId = function () {return _instanceCount += 1;};
		target._instanceCount = function () {return _instanceCount;};
	}
	
	
	var _newTemplate = function (sourceInstance, templateName, targetModule) {
		var sourceTemplate = sourceInstance.template();
		var newTemplatePrototype = _newObject(sourceTemplate);
		var newTemplate = _newBehavior(newTemplatePrototype);
		var newPurse = _purseOf(newTemplate);
		var factoryMethod = _newSafeDualUseConstructor(newTemplate, newTemplatePrototype);
		_attachFactoryMethod(templateName, factoryMethod, targetModule);
		
		purse._templateName = templateName;
		purse._snapshotCount = 0;
		purse._instanceCount = 0;
		if (sourceInstance !== sourceTemplate) {
			_copyMethods(newTemplate, sourceInstance, sourceTemplate);
		}
		_attachMethod_newInstance(newTemplate, newPurse);
		_attachMethod_template(newTemplate);
		return newTemplate;
	};
 
	var instance0 = _newTemplate({template: function () {Object.prototype}}, "Clone");
	
	_setMethod(instance0, "method", function (methodName, impFunc) {
		_setMethod(this, methodName, impFunc);
	});
	
	instance0.method("template", function () {return _purseOf(this)._template;});
	
	instance0.method("templateName", function () {return _purseOf(this)._templateName;});
	
	instance0.method("isTemplate", function () {return this === this.template();});
		
	instance0.method("basicName", function () {
		var template = this.template();
		var name = _purseOf(template)._templateName;
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
	
	var _attachMethod_newInstance = function (behavior, behaviorPurse) {
		_putMethod(behavior, NEW_INSTANCE, behaviorPurse._newInstance);
	};
	
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
