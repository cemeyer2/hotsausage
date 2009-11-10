"use strict";

/*jslint undef: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, strict: true, newcap: true, immed: true */

HotSausage.Collections.extend(function (Collections, _Collections_HS) {
	// var HS = Collections.module();
	var _newObject = _Collections_HS.newObject;
	var _direction = _Collections_HS.direction;
	var _isBoolean = _Collections_HS.isBoolean;
	var _isNumber = _Collections_HS.isNumber;
	var _notNumber = _Collections_HS.notNumber;
	var _createConstantAccessor = _Collections_HS.createConstantAccessor;

	var _Span = function (direction, startEdge, endEdge, wraps) {
		this.direction = direction;
		this.start = startEdge;
		this.end = endEdge;
		this.wraps = wraps;
	};
	
	var _calculateDirection = function (startEdge, endEdge) {
		var startDirection = _direction(startEdge);
		var endDirection = _direction(endEdge);
		if (startDirection !== endDirection) {return undefined;}
		return (startEdge < endEdge) ? 1 : -1;
	};
	
	var _newDirectionalSpan = function (direction, startEdge_, endEdge__, wraps__) {
		var startEdge = startEdge_ || 0;
		var endEdge, wraps, calculatedDirection;
		if (_isNumber(endEdge__)) {
			endEdge = endEdge__;
			wraps = !!wraps__;
			calculatedDirection = _calculateDirection(startEdge, endEdge);
			if (calculatedDirection !== undefined) {
				if (wraps) {
					wraps = (calculatedDirection !== direction);
				} else {
					endEdge = (calculatedDirection === direction) ? endEdge__ : startEdge;
				}
			}
		} else {
			endEdge = startEdge;
			wrap = !!endEdge__;
		}
		return new _Span(direction, startEdge, endEdge, wraps);
	};
	
	var Span = function (startEdge_, endEdge__) {
		var startEdge = startEdge_ || 0;
		var endEdge = endEdge__ || startEdge;
		var direction = _calculateDirection(startEdge, endEdge);
		return new _Span(direction, startEdge, endEdge, false);
	};
	
	var _inc = function (startEdge_, endEdge__, wraps__) {
		return _newDirectionalSpan(1, startEdge_, endEdge__, wraps__);
	};

	var _dec = function (startEdge_, endEdge__, wraps__) {
		return _newDirectionalSpan(-1, startEdge_, endEdge__, wraps__);
	};

	Collection.Span = Span;
	Collection.span = Span;
	Span.span = Span;
	Span.inc = _inc;
	Span.dec = _dec;
	
	Span.Empty = _createConstantAccessor(_inc());
	
	Span.Entire = function () {return _inc(0, true);};
	
	Span.isSpan = function (target) {return (target instanceof _Span);};
	
	Span.prototype.isSpan = function () {return true;};
	
	Span.prototype.size = function () {
		var start = this.start;
		var end = this.end;
		if (this.direction === undefined) {return undefined;}
		
		if (this.direction > 0) {
			if (end > start) {return end - start;}
		} else {
			if (start > end) {return start - end;}
		}
		return (this.wraps) ? undefined : 0;
	};
	
	Span.prototype.asNormalizedFor = function (sizeOrList, outOfBoundsAction_) {
		var size = (_isNumber(sizeOrList)) ? sizeOrList : sizeOrList.size(),
			normalizedSpan = this,
			problem, problems = {},
			upperEdge = size, lowerEdge = -upperEdge,
			start = this.start, end = this.end, 
			wraps = this.wraps, direction = this.direction,
			hasNegativeStart = _direction(start) < 0,
			hasNegativeEnd = _direction(end) < 0,
			edgeForEmptySpan = start,
			linearStart = start, normStart = start, 
			linearEnd = end, normEnd = end;
		
		if (start > upperEdge) {
			problems.start = (problem = "postspan");
			normStart = size;
			normalizedSpan = ORIGINAL_NOT_OK;
		} else if (hasNegativeStart) {
			linearStart = start + size;
			if (start < lowerEdge) {
				problems.start = (problem = "prespan");
				normStart = 0;
			} else {
				edgeForEmptySpan = normStart = linearStart;
			}
			normalizedSpan = ORIGINAL_NOT_OK;
		}
		if (end > upperEdge) {
			problems.end = (problem = "postspan");
			normEnd = size;
			normalizedSpan = ORIGINAL_NOT_OK;
		} else if (hasNegativeEnd) {
			linearEnd = end + size;
			if (end < lowerEdge) {
				problems.end = (problem = "prespan");
				normEnd = 0;
			} else {
				normEnd = linearEnd;
			}
			normalizedSpan = ORIGINAL_NOT_OK;
		}
		if (wraps) {
			if (direction >= 0) {
				if (linearStart < linearEnd) {
					normalizedSpan = ORIGINAL_NOT_OK;
					wraps = false;
				}
			} else {
				if (linearEnd < linearStart) {
					normalizedSpan = ORIGINAL_NOT_OK;
					wraps = false;
				}
			}
		} else {
			if (direction === undefined) {
				direction = (linearEnd - linearStart) >= 0 ? 1 : -1;
			} else if (direction >= 0) {
				if (linearEnd < linearStart) {
					normalizedSpan = _inc(edgeForEmptySpan);
				} else if (problem) {
					if (start === end) {normalizedSpan = ORIGINAL_IS_AN_EDGE;}
					else if (end < lowerEdge) {
						normalizedSpan = _inc(end);
					} else if (start > upperEdge) {
						normalizedSpan = _inc(start);
					}
				}
			} else {
				if (linearStart < linearEnd) {
					normalizedSpan = _dec(edgeForEmptySpan);
				} else if (problem) {
					if (start === end) {normalizedSpan = ORIGINAL_IS_AN_EDGE;}
					else if (start < lowerEdge) {
						normalizedSpan = _dec(start);
					} else if (end > upperEdge) {
						normalizedSpan = _dec(end);
					}
				}
			}
		}
		if (normalizedSpan === this) {return this;}
		if (normalizedSpan === ORIGINAL_NOT_OK) {
		 	normalizedSpan = new _Span(direction, normStart, normEnd, wraps);
		}
		if (problem) {
			if (normalizedSpan === ORIGINAL_IS_AN_EDGE) {normalizedSpan = this;}
			if (outOfBoundsAction_) {
				return outOfBoundsAction_(problems, normalizedSpan);
			}
		}
		return normalizedSpan;
	};
})();	