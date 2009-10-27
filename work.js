undefined
// Will speed up references to window, and allows munging its name.
window = this,
// Will speed up references to undefined, and allows munging its name.
undefined,

instanceof
for each -> https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Object/propertyIsEnumerable

CouchDB JS


// isLocalProperty isInstanceProperty
	
	
	_Eve.localAttributesAreEqual = function (that) {
		var propertyName;
		for (propertyName in this) {
			if (_notPrivateProperty(propertyName) && ) {
				if (this.hasOwnProperty(propertyName)) {
					if (! that.hasOwnProperty(propertyName)) {return false;}
					if (this[propertyName] !== that[propertyName]) {return false;}
				}
			}
		}
		return true;
	};
	


	var A = function () {
		this.count = 0;
	};
	var B = function () {};
	B.prototype = new A;

	var b1 = new B();

	alert(b1.count);
