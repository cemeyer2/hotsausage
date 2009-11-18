//loads relative to location where rhino is invoked, not src file location
load("rhino/env.js");
load("../hotsausage/HotSausage.js");
load("../hotsausage/Privacy.js");

HotSausage.installCoreMethods();

var PersonHS = function(ssn){
	var purse = this.enablePrivacy();
	purse.ssn = ssn;
};
PersonHS.privilegedMethod("getSSN", function(){return this.ssn;});
HotSausage.lock();


var PersonClosure = function(ssn, a, b, c){
	this.getSSN = function(){return ssn;};
	this.getA = function(){return a;};
	this.getB = function(){return b;};
	this.getC = function(){return c;};
};

var PersonVar = function(ssn){
	this._pp = {};
	this._pp.ssn = ssn;
};

PersonVar.prototype.getSSN = function(){return this._pp.ssn;};

var times = [];
times["hs"] = [];
times["closure"] = [];
times["var"] = [];

var average = function(array){
	var accum = 0;
	for(var i = 0; i < array.length; i=i+1){
		accum += array[i];
	}
	return accum/array.length;
};

var stddev = function (array) {
	var total = 0;
	var sqrTotal = 0;
	for(var i = 0; i < array.length; i=i+1) {
		total = total + array[i];
		sqrTotal = sqrTotal + (array[i]*array[i]);
	}
	var variance = (sqrTotal - ((total * total)/array.length))/array.length;
	return Math.sqrt(variance);
};

var max = function (array) {
	var max = 0;
	for (var i = 0; i < array.length; i = i+1) {
		max = Math.max(max, array[i]);
	}
	return max;
};

var min = function (array) {
	var min = Number.MAX_VALUE;
	for (var i = 0; i < array.length; i=i+1) {
		min = Math.min(min, array[i]);
	}
	return min;
	
};

var testcount = 1000;
var iterations = 10000;

//move the accessing to a function to try to limit engine optimization
var accessor = function(p){
	p.getSSN();
};

java.lang.System.out.println("constructing:");
times["hs"] = [];
for(var count = 0; count < testcount; count=count+1){
	var now = new Date().getTime();
	for(var i = 0; i < iterations; i=i+1){
		var person = new PersonHS("123-45-6789");
	}
	var then = new Date().getTime();
	times["hs"].push(then-now);
}
java.lang.System.out.println("HS: avg:"+(average(times["hs"]))+" ms, stddev:"+(stddev(times["hs"]))+" ms, max:"+(max(times["hs"]))+" ms, min:"+(min(times["hs"]))+" ms");

times["closure"] = [];
for(var count = 0; count < testcount; count=count+1){
	var now = new Date().getTime();
	for(var i = 0; i < iterations; i=i+1){
		var person = new PersonClosure("123-45-6789");
	}
	var then = new Date().getTime();
	times["closure"].push(then-now);
}
java.lang.System.out.println("Closure: "+(average(times["closure"]))+" ms, stddev:"+(stddev(times["closure"]))+" ms, max:"+(max(times["closure"]))+" ms, min:"+(min(times["closure"]))+" ms");

times["var"] = [];
for(var count = 0; count < testcount; count=count+1){
	var now = new Date().getTime();
	for(var i = 0; i < iterations; i=i+1){
		var person = new PersonVar("123-45-6789");
	}
	var then = new Date().getTime();
	times["var"].push(then-now);
}
java.lang.System.out.println("Var: "+(average(times["var"]))+" ms, stddev:"+(stddev(times["var"]))+" ms, max:"+(max(times["var"]))+" ms, min:"+(min(times["var"]))+" ms");

java.lang.System.out.println("\n\naccessing properties:");
times["hs"] = [];
for(var count = 0; count < testcount; count=count+1){
	var now = new Date().getTime();
	var person = new PersonHS("123-45-6789");
	for(var i = 0; i < iterations; i++){
		accessor(person);
	}
	var then = new Date().getTime();
	times["hs"].push(then-now);
}
java.lang.System.out.println("HS: avg:"+(average(times["hs"]))+" ms, stddev:"+(stddev(times["hs"]))+" ms, max:"+(max(times["hs"]))+" ms, min:"+(min(times["hs"]))+" ms");

times["closure"] = [];
for(var count = 0; count < testcount; count=count+1){
	var now = new Date().getTime();
	var person = new PersonClosure("123-45-6789");
	for(var i = 0; i < iterations; i++){
		accessor(person);
	}
	var then = new Date().getTime();
	times["closure"].push(then-now);
}
java.lang.System.out.println("Closure: "+(average(times["closure"]))+" ms, stddev:"+(stddev(times["closure"]))+" ms, max:"+(max(times["closure"]))+" ms, min:"+(min(times["closure"]))+" ms");

times["var"] = [];
for(var count = 0; count < testcount; count=count+1){
	var now = new Date().getTime();
	var person = new PersonVar("123-45-6789");
	for(var i = 0; i < iterations; i++){
		accessor(person);
	}
	var then = new Date().getTime();
	times["var"].push(then-now);
}
java.lang.System.out.println("Var: "+(average(times["var"]))+" ms, stddev:"+(stddev(times["var"]))+" ms, max:"+(max(times["var"]))+" ms, min:"+(min(times["var"]))+" ms\n\n\n\n");