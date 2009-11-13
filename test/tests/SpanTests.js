describe('Span test suite', function () { 
	var Span = HotSausage.Collections.Span;
	
	var _checkSpanProperties = function (span, start, end, direction, wraps) {
		expect(span.start).toBe(start);
		expect(span.end).toBe(end);
		expect(span.direction).toBe(direction);
		expect(span.wraps).toBe(wraps);
	};
	
	describe('When creating a basic span', function () { 
		var theEmptySpan = Span.basic();
		
		describe('When using 0 params', function () {
			it('should always answer the canonical basic span', function () {
				var span0 = Span.basic();
				expect(span0).toBe(theEmptySpan);
				_checkSpanProperties(span0, 0, 0, 1, false);
			});
		};
		
		describe('When using 1 params', function () {
			it('should answer a new basic edge span', function () {
				expect( Span.basic(0).isSameAs(theEmptySpan) ).toBe( true );
				expect( Span.basic(0) ).notToBe( theEmptySpan );
				_checkSpanProperties( Span.basic(3), 3, 3, 1, false );
				_checkSpanProperties( Span.basic(-5), -5, -5, 1, false );
			});
		};
		
		describe('When using 2 params', function () {
			it('should be the same as an single edge when both edges are the same', function () {
				expect( Span.basic(5, 5).isSameAs( Span.basic(5) )).toBe( true );
				expect( Span.basic(-0, -0).isSameAs( Span.basic(-0) )).toBe( true );
				expect( Span.basic(-0, -0).isSameAs( Span.basic(0) )).toBe( false );
			};
		};
		it('two identical edges should make a nondirectional nonwrapping edge span', function () {
			_checkSpanProperties( Span.basic(5, 5), 5, 5, 0, false );
			_checkSpanProperties( Span.basic(-0, -0), 0, 0, 0, false );
		});
		
		it('two different same signed args should make a directional nonwrapping span', function () {
			_checkSpanProperties( Span.basic(5, 7), 5, 7, 1, false );
			_checkSpanProperties( Span.basic(10, 3), 10, 3, -1, false );
			_checkSpanProperties( Span.basic(-100, -1), -100, -1, 1, false );
			_checkSpanProperties( Span.basic(-12, -20), -12, -20, -1, false );
		});
		
		it('the direction of two opposite signed args should be undefined', function () {
			expect( Span.basic(-0, 0) ).notToBe( Span.basic(0, -0) );
			
			_checkSpanProperties( Span.basic(5, -7), 5, -7, undefined, false );
			_checkSpanProperties( Span.basic(-1, 2), -1, 2, undefined, false );
			_checkSpanProperties( Span.basic(-0, 0), 0, 0, undefined, false );
			_checkSpanProperties( Span.basic(0, -0), 0, 0, undefined, false );
		});
				
	});
});

/*	
	describe('When creating a incrementing span', function () { 
		describe('When using 0 params', function () {
			it('should answer a new incrementing nonwrapping 0 edge span', function () {
				_checkSpanProperties( Span.inc(), 0, 0, 1, false );
				_checkSpanProperties( Span.dec(), 0, 0, -1, false );			
			};
		};
		
		describe('When using 1 params', function () {
			it('should answer a new incrementing nonwrapping edge span', function () {
				_checkSpanProperties( Span.inc(-5), -5, -5, 1, false );
				_checkSpanProperties( Span.inc(6), 6, 6, -1, false );						
			};
		};
		
		describe('When using 2 number params', function () {
			describe('When params are the same sign value', function () {
				describe('When the start <= end', function () {
					it('should set the start and end as expected', function () {
						_checkSpanProperties( Span.inc(1, 2), 1, 2, 1, false );
						_checkSpanProperties( Span.inc(-3, -1), -3, -1, 1, false );	
					
						_checkSpanProperties( Span.inc(-0, -0), 0, 0, 1, false );
						_checkSpanProperties( Span.inc(5, 5), 5, 5, 1, false );
					});
				});
				
				describe('When the start > end', function () {
					it('should set the start and end as expected', function () {
						_checkSpanProperties( Span.inc(2, 1), 2, 2, 1, false );
						_checkSpanProperties( Span.inc(-1, -3), -1, -1, 1, false );	
					});
				});
			});
			
			describe('When params are the same direction', function () {
				it('should set the start and end as expected', function () {
					_checkSpanProperties( Span.inc(1, 2), 1, 2, 1, false );
					_checkSpanProperties( Span.inc(-3, -1), -3, -1, 1, false );	
					
					_checkSpanProperties( Span.inc(-0, -0), 0, 0, 1, false );
					_checkSpanProperties( Span.inc(5, 5), 5, 5, 1, false );
				};
			};
			
			
			it('should answer a new clamped nonwrapping span', function () {
				_checkSpanProperties( Span.inc(1, 2), 1, 2, 1, false );
				_checkSpanProperties( Span.inc(9, 3), 9, 9, 1, false );
				_checkSpanProperties( Span.inc(-4, -12), -4, -4, 1, false );
				_checkSpanProperties( Span.inc(-3, -1), -3, -1, 1, false );	

				_checkSpanProperties( Span.dec(1, 2), 1, 1, -1, false );
				_checkSpanProperties( Span.dec(9, 3), 9, 3, -1, false );
				_checkSpanProperties( Span.dec(-4, -12), -4, -12, -1, false );
				_checkSpanProperties( Span.dec(-3, -1), -3, -3, -1, false );					
			};
		};
		
		describe('When the optional wrapping param is false', function () {
			it('should answer exactly the same as without it', function () {
				_checkSpanProperties( Span.inc(-5), -5, -5, 1, false );
				_checkSpanProperties( Span.dec(1), 1, 1, -1, false );
				
				expect( Span.inc(-5).isSameAs( Span.inc(-5, false) )).toBe(true);
				expect( Span.dec(1).isSameAs( Span.dec(1, false) )).toBe(true);
				
				expect( Span.dec(1, 2).isSameAs( Span.dec(1, 2, false) )).toBe(true);
				expect( Span.inc(1, 2).isSameAs( Span.inc(1, 2, false) )).toBe(true);
				expect( Span.dec(1, 2).isSameAs( Span.dec(1, 2, false) )).toBe(true);
				expect( Span.inc(1, 2).isSameAs( Span.inc(1, 2, false) )).toBe(true);
				
				_checkSpanProperties( Span.inc(1, 2), 1, 2, 1, false );
				_checkSpanProperties( Span.inc(9, 3), 9, 9, 1, false );
				_checkSpanProperties( Span.inc(-4, -12), -4, -4, 1, false );
				_checkSpanProperties( Span.inc(-3, -1), -3, -1, 1, false );	

				_checkSpanProperties( Span.dec(1, 2), 1, 1, -1, false );
				_checkSpanProperties( Span.dec(9, 3), 9, 3, -1, false );
				_checkSpanProperties( Span.dec(-4, -12), -4, -12, -1, false );
				_checkSpanProperties( Span.dec(-3, -1), -3, -3, -1, false );					
			};
		};
		
	});
});
*/