jasmine.TrivialReporter = function() {
	this.specNumber = 0;
	this.totalSpecsPassed = 0;
	this.totalSpecsFailed = 0;
};

jasmine.TrivialReporter.prototype.createDom = function(type, attrs, childrenVarArgs) {
	var el = document.createElement(type);

	for (var i = 2; i < arguments.length; i++) {
		var child = arguments[i];

		if (typeof child === 'string') {
			el.appendChild(document.createTextNode(child));
		} else {
			el.appendChild(child);
		}
	}

	for (var attr in attrs) {
		if (attr == 'className') {
			el.setAttribute('class', attrs[attr]);
		} else {
			if (attr.indexOf('x-') == 0) {
				el.setAttribute(attr, attrs[attr]);
			} else {
				el[attr] = attrs[attr];
			}
		}
	}

	return el;
};

jasmine.TrivialReporter.prototype.reportRunnerResults = function(runner) {
	var div = this.createDom('div', {className: runner.getResults().passed() ? 'spec passed' : 'spec failed'});
	var passed = runner.getResults().passedCount;
	var failed = runner.getResults().failedCount;
	var total = runner.getResults().totalCount;
	var time = runner.getTimeElapsed();
	var runnerStatus = "<h3>Test Results</h3><br/><table><tr><th>type</th><th>passed</th><th>failed</th><th>total</th></tr>";
	
	runnerStatus += "<tr><td>specs</td><td>"+this.totalSpecsPassed+"</td><td>"+this.totalSpecsFailed+"</td><td>"+this.specNumber+"</td></tr>";
	runnerStatus += "<tr><td>expects</td><td>"+passed+"</td><td>"+failed+"</td><td>"+total+"</td></tr>";
	runnerStatus += "</table><br/><br/>Tests completed in "+time+" seconds";
	
	div.innerHTML = runnerStatus;
	document.body.appendChild(div);
};

jasmine.TrivialReporter.prototype.reportSuiteResults = function(suite) {
	var div = this.createDom('div', {className: suite.getResults().passed() ? 'spec passed' : 'spec failed'});
	var passed = suite.getResults().passedCount;
	var failed = suite.getResults().failedCount;
	var total = suite.getResults().totalCount;
	var time = suite.getTimeElapsed();
	var suiteStatus = suite.getFullName()+": "+passed+" expects passed, "+failed+" expects failed, "+total+" expects total, time: "+time+" sec";
	div.innerHTML = "<b>"+suiteStatus+"</b><br><hr><br>";
	document.body.appendChild(div);
};

jasmine.TrivialReporter.prototype.reportSpecResults = function(spec) {
	this.specNumber = this.specNumber + 1;
	var specDiv = this.createDom('div', {
		className: spec.getResults().passed() ? 'spec passed' : 'spec failed'
	}, "spec "+this.specNumber+": "+spec.getFullName()+ " time: "+spec.getTimeElapsed()+" sec");

	if(spec.getResults().passed()){
		this.totalSpecsPassed = this.totalSpecsPassed+1;
	} else {
		this.totalSpecsFailed = this.totalSpecsFailed+1;
	}

	var resultItems = spec.getResults().getItems();
	for (var i = 0; i < resultItems.length; i++) {
		var result = resultItems[i];
		if (!result.passed) {
			var resultMessageDiv = this.createDom('div', {className: 'resultMessage'});
			resultMessageDiv.innerHTML = result.message; // todo: lame; mend
			specDiv.appendChild(resultMessageDiv);
			if(result.trace.stack){
				specDiv.appendChild(this.createDom('div', {className: 'stackTrace'}, result.trace.stack));
			};
		}
		document.body.appendChild(specDiv);
	};
};

	jasmine.TrivialReporter.prototype.log = function() {
		console.log.apply(console, arguments);
	};
