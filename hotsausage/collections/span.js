"use strict";

if (!Sausage) {var Sausage = {};}
if (!Sausage.Collections) {Sausage.Collections = {};}

Sausage.Collections.Span = (function () {
	var _direction = Sausage.Util.direction;

	var Span = function (startEdge, endEdge, wraps, direction) {
		this.start = startEdge;
		this.end = endEdge;
		this.wraps = wraps || false;
		this.direction = direction;
	};

	var __span = function (direction, startEdge, endEdge_, wraps_) {
		var endEdge;
		if (typeof endEdge_ === 'boolean') { 
			return new Span(startEdge, startEdge, endEdge_, direction);
		}
		endEdge = (endEdge_ !== undefined) ? endEdge_ : startEdge;
		return new Span(startEdge, endEdge, wraps_, direction);		
	};

	var inc = function (startEdge, endEdge_, wraps_) {
		return __span(1, startEdge, endEdge_, wraps_);
	};

	var dec = function (startEdge, endEdge_, wraps_) {
		return __span(-1, startEdge, endEdge_, wraps_);
	};

	var span = function (startEdge, endEdge_) {
		var startDirection, endDirection, direction;
		if (endEdge_ === undefined || startEdge === endEdge_) {
			return new Span(startEdge, startEdge, false, 0);
		}
		startDirection = _direction(startEdge);
		endDirection = _direction(endEdge_);
		if (startDirection === endDirection) {
			direction = (startEdge < endEdge_) ? 1 : -1;
		}
		return new Span(startEdge, endEdge_, false, direction);
	};
	
	Span.isSpan = function (target) {return (target instanceof Span);};

	Span.inc = inc;
	Span.dec = dec;
	Span.span = span;
	Span.empty = function () {return inc(0);};
	Span.entire = function () {return inc(0, true);};
	
	Span.prototype.isSpan = function () {return true;};
	
	Span.prototype.asNormalizedFor = function (sizeOrList, outOfBoundsAction_) {
		var size = (typeof sizeOrList === 'number') ? 
				sizeOrList : sizeOrList.size(),
			normalizedSpan = this,
			problem, problems = {},
			upperEdge = size, lowerEdge = -upperEdge,
			start = this.start, end = this.end, 
			wraps = this.wraps, direction = this.direction,
			hasNegativeStart = _direction(start) < 0,
			hasNegativeEnd = _direction(end) < 0,
			thinEdge = start, 
			linearStart = start, linearEnd = end,
			normStart = linearStart, normEnd = linearEnd;
		
		if (start > upperEdge) {
			problems.start = (problem = "postspan");
			normStart = size;
			normalizedSpan = false;
		} else if (hasNegativeStart) {
			linearStart = start + size;
			if (linearStart < lowerEdge) {
				problems.start = (problem = "prespan");
				normStart = 0;
			} else {
				thinEdge = normStart = linearStart;
			}
			normalizedSpan = false;
		}
		if (end > upperEdge) {
			problems.end = (problem = "postspan");
			normEnd = size;
			normalizedSpan = false;
		} else if (hasNegativeEnd) {
			linearEnd = end + size;
			if (linearEnd < lowerEdge) {
				problems.end = (problem = "prespan");
				normEnd = 0;
			} else {
				normEnd = linearEnd;
			}
			normalizedSpan = false;
		}
		if (wraps) {
			if (direction >= 0) {
				if (linearStart < linearEnd) {normalizedSpan = wraps = false;}
			} else {
				if (linearEnd < linearStart) {normalizedSpan = wraps = false;}
			}
		} else {
			if (!direction) {
				direction = (linearEnd - linearStart) >= 0 ? 1 : -1;
			} else if (direction >= 0) {
				if (linearEnd < linearStart) {
					normalizedSpan = inc(thinEdge);
				} else if (problem) {
					if (start === end) {normalizedSpan = true;}
					else if (end < lowerEdge) {
						normalizedSpan = inc(end);
					} else if (start > upperEdge) {
						normalizedSpan = inc(start);
					}
				}
			} else {
				if (linearStart < linearEnd) {
					normalizedSpan = dec(thinEdge);
				} else if (problem) {
					if (start === end) {normalizedSpan = true;}
					else if (start < lowerEdge) {
						normalizedSpan = dec(start);
					} else if (end > upperEdge) {
						normalizedSpan = dec(end);
					}
				}
			}
		}
		if (normalizedSpan === this) {return this;}
		if (normalizedSpan === false) {
			normalizedSpan = new Span(normStart, normEnd, wraps, direction);
		}
		if (problem) {
			if (normalizedSpan === true) {normalizedSpan = this;}
			if (outOfBoundsAction_) {
				return outOfBoundsAction_(problems, normalizedSpan);
			}
		}
		return normalizedSpan;
	};

	return Span;
})();	