// Comments on Douglas Crockford's "JavaScript: The Good Parts"

// Maurice Rabb
// m3rabb@illinois.edu
// 312-735-0580


// JS:TGP p39
// BAD EXAMPLE
var add_the_handlers = function (nodes) {
	var i;
	for (i = 0; i < nodes.length; i += 1) {
		nodes[i].onclick = function (e) {
			alert(i);
		};
	}
};

// BETTER EXAMPLE
var add_the_handlers = function (nodes) {
	var i;
	for (i = 0; i < nodes.length; i += 1) {
		nodes[i].onclick = function (i) {
			return function (e) {
				alert(i);
			};
		}(i);
	}
};

// EVEN BETTER EXAMPLE
var add_the_handlers = function (nodes) {
	var newHandlerWithBoundValue, index, last;
	
	newHandlerWithBoundValue = function (value) {
		return function (e) {
			alert(value);
		};
	};
	
	for (index = 0, last = nodes.length; index < last; index += 1) {
		nodes[index] = newHandlerWithBoundValue(index);
	}
};

// JS:TGP p41-42
var serial_maker = function () {
	
// Produce an object that produces unique strings. A
// unique string is made up of two parts: a prefix
// and a sequence number. The object comes with
// methods for setting the prefix and sequence
// number, and a gensym method that produces unique
// strings.
	
	var prefix = '';
	var seq = 0;
	return {
		set_prefix: function (p) {
			prefix = String(p);
		},
		set_seq: function (s) {
			seq = s;
		},
		gensym: function () {
			var result = prefix + seq;
			seq += 1;
			return result;
		}
	};
}();

var seqer = serial_maker();
seqer.set_prefix = 'Q';
seqer.set_seq = 1000;
var unique = seqer.gensym();	// unique is "Q1000"



// BETTER VERSION
var serial_maker = function (prefixString, seedNumber) {
	var index = seedNumber;
	return function () {
		var result = prefixString + index;
		index += 1;
		return result;
	};
};

var nextSerial = serial_maker('Q', 1000);
var unique1 = nextSerial();	// unique is "Q1000"
var unique2 = nextSerial();	// unique is "Q1001"



// JS:TGP p47
// In the first code example, the following line is missing an ";".


	var that = Object.beget(this.prototype) // ';' <== missing here!




// JSLint Request
// In addition to the "standard" immediate function invocation pattern:


(function () {}());


// It would be great if JSLint accepted the following pattern as well:


(function () {})();
