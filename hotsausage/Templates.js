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

	var __attachMethod_newInstance = function (_pBehavior) {
		var _Purse = function () {};
		var _Object = function () {};
		_Purse.prototype = _pBehavior; 
		_Instance.prototype = _pBehavior._public; 
		var _pNewObject = function () {
			return _attachMethod_purse(new _Object(), new _Purse());
		};
		var impFunc = function newInstance(snapshotId_) {
			var pObject = _pNewObject();
			pObject._instanceId = _pBehavior._nextInstanceId();
			return pObject._public;
		};
		_pBehavior._pNewObject = _pNewObject;
		_putMethod(pBehavior, NEW_INSTANCE, impFunc);
	};
			
	var _newBehaviorSnapshotFrom = function (sourceInstance) {
		var pSourceInstance = _purseOf(sourceInstance);
		var pTemplate = pSourceInstance._pTemplate;
		var pBehavior = pTemplate._pNewObject();
		pBehavior._snapshotId = pSourceInstance._snapshotId;
		pBehavior._pBehavior = pBehavior;
		__copyMethods(pBehavior, pSourceInstance, pTemplate);
		__attachMethod_newInstance(pSnapshot);
		return pBehavior._public;
	};
	
	var _deferred_newInstance = function () {
		var sourceInstance = this;
		var behaviorSnapshot = _newBehaviorSnapshotFrom(this);
		return (this.newInstance = behaviorSnapshot.newInstance)();
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
		if (target.isTemplate() || target.newInstance === _deferred_newInstance) {
			// target is template or has local methods but no copies yet
		} else {
			// target is either adding its first local method, or has already spawned 
			// a snapshot behavior, and since doing so, is adding a new local method again.
			target.newInstance = _deferred_newInstance;
			pTarget._snapshotId = pBehavior._nextSnapshotId();
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
	
	var __initPTemplate = function (pTemplate, templateName) {
		var _instanceCount = 0;
		var _snapshotCount = 0;
		pTemplate._pTemplate = pTemplate;
		pTemplate._pBehavior = pTemplate;
		pTemplate._templateName = templateName;
		pTemplate._nextInstanceId = function () {return _instanceCount += 1;};
		pTemplate._instanceCount = function () {return _instanceCount;};
		pTemplate._nextSnapshotId = function () {return _snapshotCount += 1;};
		pTemplate._snapshotCount = function () {return _snapshotCount;};
	};
	
	var _newTemplate = function (sourceInstance, templateName, targetModule) {
		var pSourceInstance =  _purseOf(sourceInstance);
		var pSourceTemplate = pSourceInstance._pTemplate;
		var sourceTemplate = pSourceTemplate._public;
		var newTemplatePrototype = _newObject(sourceTemplate);
		var newTemplate = _newObject(newTemplatePrototype);
		var pNewTemplate = _attachMethod_purse(newTemplate, _newObject());
		
		var factoryMethod = _newSafeDualUseConstructor(newTemplate, newTemplatePrototype);
		_attachFactoryMethod(templateName, factoryMethod, targetModule);
		
		__initPTemplate(pNewTemplate);
		if (pSourceInstance !== pSourceTemplate) {
			__copyMethods(pNewTemplate, pSourceInstance, pSourceTemplate);
		}
		__attachMethod_newInstance(pNewTemplate);
		return newTemplate;
	};
 	
	var instance0 = _newTemplate({template: function () {Object.prototype}}, "Clone");
	
	_setMethod(instance0, "method", function (methodName, impFunc) {
		_setMethod(this, methodName, impFunc);
	});
		
	instance0.method("isTemplate", function () {return this === this.template();});
		
	instance0.method("basicName", function () {
		var template = this.template();
		var name = this.templateName();
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
