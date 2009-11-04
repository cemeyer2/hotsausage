"use strict";

HotSausage.newSubmodule("Templates", function (Templates, _Templates_HS) {
	var HS = Templates.module();
	var _newObject = _Templates_HS.newObject;
	var _hasLocalProperty = _Templates_HS.hasLocalProperty;
	var _isPublic = HS.isPublic;
	var _createConstantAccessor = HS.createConstantAccessor;
	
	var NEW_INSTANCE = "newInstance";
	
	var _purseOf = function (target) {return target._purse();};

	var _attachMethod_purse = function (target, purse) {
		target._purse = _createConstantAccessor(purse);
		purse._public = target;
		return purse;
	};
	
	var __copyPurseFrom = function (pSource, pTarget) {
		var propertyName;
		for (propertyName in pSource) {
			if (_isPublic(propertyName) && _hasLocalProperty(pSource, propertyName)) {
				pTarget[propertyName] = pSource[propertyName];
			}
		}
	};
	
	var __putMethod = function (pTarget, methodName, impFunc) {
		pTarget._public[methodName] = impFunc;
		pTarget._methods[methodName] = impFunc;
		return (pTarget._methodCount += 1);
	};

	var __deleteMethod = function (pTarget, methodName) {
		if (methodName in pTarget._methods) {
			delete pTarget._public[methodName];
			delete pTarget._methods[methodName];
			return (pTarget._methodCount -= 1);
		}
		return pTarget._methodCount;
	};
	
	var __ensureMethodDictionary = function (pTarget) {
		if (pTarget._methods) {return;}
		pTarget._methods = _newObject();
		pTarget._methodCount = 0;
	};

	var __deleteMethodDictionary = function (pTarget) {
		delete pTarget._methods;
		delete pTarget._methodCount;
	};
	
	var __copyMethodDictionary = function (pSource, pTarget) {
		var methods = pSource._methods;
		var methodName;
		if (methods === undefined) {return;}
		for (methodName in methods) {
			__putMethod(pTarget, methodName, methods[methodName]);
		}
	};
	
	var __copyMethods = function (pTarget, pSourceInstance, pSourceTemplate) {
		var pSourceBehavior = pSourceInstance._pBehavior;
		__ensureMethodDictionary(pTarget);
		if (pSourceBehavior !== pSourceTemplate) {
			__copyMethodDictionary(pSourceBehavior, pTarget);
		}
		__copyMethodDictionary(pSourceInstance, pTarget);
	};

	var __attach_newPObject = function (pBehavior) {
		var _Purse = function () {};
		var _Object = function () {};
		_Purse.prototype = pBehavior; 
		_Instance.prototype = pBehavior._public; 
		pBehavior._newPObject = function () {
			return _attachMethod_purse(new _Object(), new _Purse());
		});
	};

	var _newInstance = function (source) {
		var pInstance = this._newPObject();
		pInstance._instanceId = _nextInstanceId(this);
		return pInstance._public;
	};
	
	var _newPBehavior = function (pSourceTemplate) {
		var pBehavior = pSourceTemplate._newPObject();
		return (pBehavior._pBehavior = pBehavior);
	};
	
		
	var _newBehaviorSnapshotFrom = function (sourceInstance) {
		var sourceTemplate = sourceInstance.template();
		var sharedPurse = _purseOfNewBehavior(sourceTemplate);
		sharedPurse._snapshotId = _purseOf(sourceInstance)._snapshotId;
		__copyMethods(behaviorSnapshot, sourceInstance, sourceTemplate);
		__attach_newPObject(sharedPurse);
		return behaviorSnapshot;
	};
	
	var _deferred_newPObject = function () {
		var behaviorSnapshot = _newBehaviorSnapshotFrom(this);
		var delegated_newInstance = behaviorSnapshot.newInstance;
		this.newInstance = delegated_newInstance;
		return delegated_newInstance();
	};
	
	var _setMethod = function (target, methodName, impFunc) {
		var pTarget = _purseOf(target);
		var pBehavior = pTarget._pBehavior;
		var localMethodCount;
		
		if (pBehavior._methods[methodName] === impFunc) {
			localMethodCount = __deleteMethod(pTarget, methodName);
			if (localMethodCount <= 0) {__deleteMethodDictionary(pTarget);}
			return;
		}
		if (target.isTemplate() || pTarget._newPObject === _deferred_newPObject) {
			// target is template or has local methods but no copies yet
		} else {
			// target is either adding its first local method, or has already spawned 
			// a snapshot behavior, and since doing so, is adding a new local method again.
			pTarget._newPObject = _deferred_newPObject;
			pTarget._snapshotId = pBehavior._snapshotCount += 1; ???
			__ensureMethodDictionary(pTarget);
		}
		__putMethod(pTarget, methodName, impFunc);
	};	

	var _onUnexpectedConstructorArguments = function (template) {
		HS.handleError(
			"UnexpectedConstructorArguments", 
			"No arguments expected to simply return the " + template.name() + " template object!"
		);
		return template;
	};

	var _newSafeDualUseConstructor = function (_template, templatePrototype) {
		var constructor = function CopyFromUsingNewOnTemplate(/* arguments */) {
			var newInstance;
			if (this instanceof CopyFromUsingNewOnTemplate) {
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
		__putMethod(template, "template", _createConstantAccessor(template););
	};
	
	
	var _initTemplatePurse = function (templatePurse, templateName) {
		var _instanceCount = 0;
		var _snapshotCount = 0;
		templatePurse._nextInstanceId = function () {return _instanceCount += 1;};
		templatePurse._instanceCount = function () {return _instanceCount;};
		templatePurse._nextSnapshotId = function () {return _snapshotCount += 1;};
		templatePurse._snapshotCount = function () {return _snapshotCount;};
		templatePurse._templateName = templateName;
	}
	
	
	var _newTemplate = function (sourceInstance, templateName, targetModule) {
		var pSourceInstance =  _purseOf(sourceInstance);
		
		var sourceTemplate = sourceInstance.template();
		var pSourceTemplate = _purseOf(sourceTemplate);
		var pTargetPrototype = pSourceTemplate._newObject();
		var newTemplatePurse = _purseOfNewBehavior(pTargetPrototype);
		var factoryMethod = _newSafeDualUseConstructor(newTemplatePrototype);
		var newTemplate = newTemplate._public;
		_attachFactoryMethod(templateName, factoryMethod, targetModule);
		
		newTemplatePurse._templateName = templateName;
		newTemplatePurse._instanceCount = 0;
		newTemplatePurse._snapshotCount = 0;
		if (sourceInstance !== sourceTemplate) {
			__copyMethods(newTemplatePurse, sourcePurse, pSourceTemplate);
		}
		__attach_newPObject(newTemplatePurse);
		_attachMethod_template(newTemplate);
		return newTemplate;
	};
 
	
	var instance0 = _newTemplate({template: function () {Object.prototype}}, "Clone");
	
	///////?????
	instance0.method("newInstance", function () {});
	
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
	
		templatePurse._nextInstanceId = function () {return _instanceCount += 1;};

	
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
