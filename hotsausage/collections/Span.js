"use strict";

/*jslint undef: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, strict: true, newcap: true, immed: true */

HotSausage.Collections.extend(function (Collections, _Collections_HS) {
	// var HS = Collections.module();
	var _signValue = _Collections_HS.signValue;
	var _equalValues = _Collections_HS.equalValues;
	var _isNumber = _Collections_HS.isNumber;
	var createConstantAccessor = _Collections_HS.createConstantAccessor;

	var undefined;
	var POSTSPAN = "postspan";
	var PRESPAN = "prespan";
	var FORWARD = 1, BACKWARD = -1, NONDIRECTIONAL = 0, UNDEFINED; // for direction
	var FWD = 1, BWD = -1, EDGE = 0, UND; // for impliedDirection
	
	// If the direction is UNDEFINED or NONDIRECTIONAL, 
	//  the span can be either wrapping or nonwrapping
	// If the direction is FORWARD
	//  if the startEdge < endEdge it is nonwrapping, 
	//  if the startEdge >= endEdge it is wrapping
	// If the direction is BACKWARD
	//  if the startEdge > endEdge it is nonwrapping, 
	//  if the startEdge <= endEdge it is wrapping
	var Span = function (direction, impliedDirection, startEdge, endEdge, wraps) {
		this.direction = direction;
		this.impliedDirection = impliedDirection;
		this.start = startEdge;
		this.end = endEdge;
		this.wraps = wraps;
		// this.wrapIfNecessary = wrapIfNecessary_;
	};
	
	var _theDefaultSpan = new Span(NONDIRECTIONAL, EDGE, 0, 0, false);
		
	var _impliedDirectionFrom = function (startEdge, endEdge) {
		var zeroEndEdge, endSignValue;
		// c1     +0  ->  +0          EDGE
		// c2 c3  +0  ->  -0 | ±N     FWD
		// c4     -0  ->  -0          EDGE
		// c5 c6  -0  ->  +0 | ±N     BWD
		// c7     ±N  ->  +0          BWD
		// c8     ±N  ->  -0          FWD
		// c9      n  ->   n          EDGE
		// c10    +N  ->  -N          UND
		// c11    -N  ->  +N          UND
		// c12     m  ->   n          FWD
		// c13     n  ->   n          BWD
		zeroEndEdge = (endEdge === 0);
		if (startEdge === 0) {
			endSignValue = 1 / endEdge;
			return (1 / startEdge > 0) ?
				( (zeroEndEdge && (endSignValue > 0)) ? EDGE : FWD ) : // c1,c2,c3
				( (zeroEndEdge && (endSignValue < 0)) ? EDGE : BWD ); // c4,c5,c6
		}
		if (zeroEndEdge) {
			endSignValue = 1 / endEdge;
			return (endSignValue > 0) ? BWD : FWD; // c7,c8
		}
		if (startEdge === endEdge) {return EDGE;} // c9
		if ((startEdge > 0) !== (endEdge > 0)) {return UND;} // c10,c11
		return (startEdge < endEdge) ? FWD : BWD; // c12,c13
	};
	
	var _newSpan = function (declaredDirection, startEdge_, endEdge__, wrapIfNecessary__) {
		var startEdge, endEdge, wraps, impliedDirection, direction;
		if (_isNumber(endEdge__)) {
			startEdge = startEdge_;
			endEdge = endEdge__;
			wraps = wrapIfNecessary__ || false;
		} else {
			startEdge = _isNumber(startEdge_) ? startEdge_ : 0;
			endEdge = startEdge;
			wraps = endEdge__ || false;
		}
		impliedDirection = _impliedDirectionFrom(startEdge, endEdge); // FWD | BWD | NON | UND 
		direction = (declaredDirection === UNDEFINED) ? impliedDirection : declaredDirection;
		return new Span(direction, impliedDirection, startEdge, endEdge, wraps);
	};
		
	// This method is a convenience for performance
	var _newEdgeSpan = function (direction, edgeValue_, wraps__) {
		var edgeValue = _isNumber(edgeValue_) ? edgeValue_ : 0;
		var wraps = wraps__ || false;
		return new Span(direction, EDGE, edgeValue, edgeValue, wraps);
	};

	var edge = function (edgeValue) {
		return _newEdgeSpan(NONDIRECTIONAL, edgeValue, false);
	};

	var span = function basicSpan(startEdge_, endEdge__, directionSign___, wrapIfNecessary____) {
		return (arguments.length === 0) ? 
			_theDefaultSpan : 
			_newSpan(directionSign___, startEdge_, endEdge__, wrapIfNecessary____);
	};

	var inc = function (startEdge_, endEdge__, wrapIfNecessary__) {
		return (arguments.length <= 1) ?
			_newEdgeSpan(FORWARD, startEdge_, false) : 
			_newSpan(FORWARD, startEdge_, endEdge__, wrapIfNecessary__);
	};

	var dec = function (startEdge_, endEdge__, wrapIfNecessary__) {
		return (arguments.length <= 1) ?
			_newEdgeSpan(BACKWARD, startEdge_, false) : 
			_newSpan(BACKWARD, startEdge_, endEdge__, wrapIfNecessary__);
	};
		
	var basic = function basicSpan(startEdge_, endEdge__) {
		return span.apply(null, arguments);
	};

	var _isSpan = function () {return true;};
	
	var Collections_Span, Span_prototype;
	
	
	Collections.edge = edge;
	Collections.span = span;
	Collections.Span = span;
	Collections_Span = Collections.Span;
	
	Collections_Span.edge = edge;
	Collections_Span.basic = basic;
	Collections_Span.inc = inc;
	Collections_Span.dec = dec;
	
	Collections_Span.empty = createConstantAccessor(_theDefaultSpan);
	Collections_Span.allForward = createConstantAccessor(inc(0, true));	
	Collections_Span.allBackward = createConstantAccessor(dec(0, true));	
	
	Collections_Span.isSpan = function (target) {return (target.isSpan === _isSpan);};
	
	
	Span_prototype = Span.prototype;
	
	Span_prototype.isSpan = _isSpan;
	
	Span_prototype.isSameAs = function (that) {
		var thisStart = this.start, thisEnd = this.end; 
		var thatStart = that.start, thatEnd = that.end; 
		return (this === that) ||
			((this.direction === that.direction) && (this.wraps === that.wraps) &&
			(this.impliedDirection === that.impliedDirection) &&
			_equalValues(thisStart, thatStart) && _equalValues(thisEnd, thatEnd));
	};
	
	Span_prototype.size = function () {
		var direction = this.direction;
		if (direction === UNDEFINED || this.wraps) {return undefined;}
		if (_signValue(this.start) !== _signValue(this.end)) {return undefined;}
		if (direction * this.impliedDirection === -1) {return 0;}
		return this.direction * (this.end - this.start);
	};
	
	Span_prototype.asNormalizedFor = function (measure, outOfBoundsAction_) {
		var size = _isNumber(measure) ? measure : measure.size(),
			normalizeSpan, modifications = 2, 
			problems = {}, outOfBounds,
			upperEdge = size, lowerEdge = -upperEdge,
			start = this.start, end = this.end, 
			wraps = this.wraps, nonwrapping = !wraps,
			direction = this.direction, observedDirection,
			impliedDirection = this.impliedDirection,
			newStart, newEnd, normalizedStart, normalizedEnd;
	
		if (_signValue(start) < 0) {
			normalizedStart = start + size;
			if (start < lowerEdge) {
				problems.start = (outOfBounds = PRESPAN);
				if (nonwrapping && impliedDirection <= EDGE) {
					newStart = newEnd = start; // BWD || EDGE
				} else {newStart = 0;}         // FWD || UND
			} else {newStart = normalizedStart;}
		} else {
			normalizedStart = start;
			if (start > upperEdge) {
				problems.start = (outOfBounds = POSTSPAN);
				if (nonwrapping && impliedDirection >= EDGE) {
					newStart = newEnd = start; // FWD || EDGE
				} else {newStart = size;}      // BWD || UND
			} else {
				newStart = normalizedStart;
				modifications -= 1;
			}
		} 
		if (start === end) {newEnd = newStart;} // EDGE
		if (newEnd !== undefined) { // EDGE | both edges out of bounds
			normalizeSpan = (newEnd === end) ? // EDGE
				this : new Span(direction, EDGE, newStart, newEnd, wraps);
		} else {
		// In this branch, impliedDirection ≠ EDGE and direction ≠ NONDIRECTIONAL.
			if (_signValue(end) < 0) {
				normalizedEnd = end + size;
				if (end < lowerEdge) {
					problems.end = (outOfBounds = PRESPAN);
					if (nonwrapping && impliedDirection === FWD) {newStart = newEnd = end;}
					else {newEnd = 0;} // BWD || UND
				} else {newEnd = normalizedEnd;}
			} else {
				newEnd = normalizedEnd = end;
				if (end > upperEdge) {
					problems.end = (outOfBounds = POSTSPAN);
					if (nonwrapping && impliedDirection === BWD) {newStart = newEnd = end;}
					else {newEnd = size;} // FWD || UND
				} else {
					newEnd = normalizedEnd;
					modifications -= 1;
				}
			}
			
			observedDirection = (impliedDirection !== UND) ? impliedDirection : // FWD | BWD
				((normalizedStart === normalizedEnd) ? // UND
					NONDIRECTIONAL : ((normalizedStart < normalizedEnd) ? FORWARD : BACKWARD));
			if (direction === UNDEFINED) {
				direction = observedDirection;
				wraps = false;  // normalization of the direction always avoids the need to wrap.
				// being UNDEFINED means one edge < 0, so implicitly, there are modifications.
			} else if (nonwrapping) { // FORWARD | BACKWARD
				if (direction !== observedDirection) { // if opposite directions
					newEnd = newStart; // clamp
					observedDirection = NONDIRECTIONAL;
					modifications += 1;
				}
			} else { // wrapping
				if (direction === observedDirection) {
					wraps = false; // unwrap
					modifications += 1;
				}
			}
			normalizeSpan = (modifications) ? 
				new Span(direction, observedDirection, newStart, newEnd, wraps) : this;
		}
		return (outOfBounds && outOfBoundsAction_) ? 
			outOfBoundsAction_(normalizeSpan, problems, this) : normalizeSpan;
	};
});