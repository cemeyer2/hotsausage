describe('Span test suite', function () { 
	var Span = HotSausage.Collections.Span;
	var equalValues = HotSausage.Collections.equalValues;
	var FWD = 1;
	var NON = 0;
	var BWD = -1;
	var UND = undefined;
	
	var _checkSpanProperties = function (span, wraps, start, end, direction, impliedDirection_) {
		var impliedDirection = (arguments.length === 5) ? direction : impliedDirection_;
		expect(span._wraps).toBe(wraps);
		expect( equalValues(span._start, start) ).toBe(true);
		expect( equalValues(span._end, end) ).toBe(true);
		expect(span._direction).toBe(direction);
		expect(span._impliedDirection).toBe(impliedDirection);
	};
	
	describe('When creating a basic span', function () { 
		var theEmptySpan = Span.empty();
		
		describe('When using 0 params', function () {
			it('should always answer the canonical basic span', function () {
				var span = Span.basic();
				expect(span).toBe(theEmptySpan);
				expect( span.isSameAs(Span.edge(0)) ).toBe( true );
				_checkSpanProperties(span, false, 0, 0, NON);
			});
		});
		
		describe('When using 1 params', function () {
			it('should answer a new edge span', function () {
				expect( Span.basic(0).isSameAs(theEmptySpan) ).toBe( true );
				expect( Span.basic(0) ).toNotBe( theEmptySpan );
				expect( Span.basic(3).isSameAs(Span.edge(3)) ).toBe( true );
				_checkSpanProperties( Span.basic(3), false, 3, 3, NON );
				_checkSpanProperties( Span.basic(-5), false, -5, -5, NON );
			});
			
			it('using -0 should be different from using 0', function () {
				expect( Span.basic(-0).isSameAs( Span.basic(0) )).toBe( false );
			});
		});
		
		describe('When using 2 params', function () {
			it('should be the same as an single edge when both edges are the same', function () {
				expect( Span.basic(5, 5).isSameAs( Span.edge(5) )).toBe( true );
				expect( Span.basic(-0, -0).isSameAs( Span.edge(-0) )).toBe( true );
			});
			
			it('using -0 should be different from using 0', function () {
				expect( Span.basic(-0, -0).isSameAs( Span.edge(0) )).toBe( false );
				expect( Span.basic(-0, -0).isSameAs( Span.basic(0, 0) )).toBe( false );
				expect( Span.basic(0, -0).isSameAs( Span.basic(0, 0) )).toBe( false );
				expect( Span.basic(0, -0).isSameAs( Span.basic(-0, 0) )).toBe( false );
			});
			
			it('should be forward direction when increasing', function () {
				_checkSpanProperties( Span.basic(5, 7), false, 5, 7, FWD );
				_checkSpanProperties( Span.basic(-100, -1), false, -100, -1, FWD );
			});
			
			it('should be backward direction when decreasing', function () {
				_checkSpanProperties( Span.basic(10, 3), false, 10, 3, BWD );
				_checkSpanProperties( Span.basic(-12, -20), false, -12, -20, BWD );				
			});
			
			it('should be nondirectional when the args are the same but non zero', function () {
				_checkSpanProperties( Span.basic(10, 10), false, 10, 10, NON );
				_checkSpanProperties( Span.basic(-3, -3), false, -3, -3, NON );
			});
			
			it('should be able to set the direction of spans beginning or ending with 0/-0', function () {
				_checkSpanProperties( Span.basic(0, 0), false, 0, 0, NON );		
				_checkSpanProperties( Span.basic(0, -0), false, 0, -0, FWD );		
				_checkSpanProperties( Span.basic(0, 3), false, 0, 3, FWD );	
				_checkSpanProperties( Span.basic(0, -3), false, 0, -3, FWD );	
				_checkSpanProperties( Span.basic(-0, -0), false, -0, -0, NON );			
				_checkSpanProperties( Span.basic(-0, 0), false, -0, 0, BWD );
				_checkSpanProperties( Span.basic(-0, 3), false, -0, 3, BWD );
				_checkSpanProperties( Span.basic(-0, -3), false, -0, -3, BWD );
				_checkSpanProperties( Span.basic(3, 0), false, 3, 0, BWD );
				_checkSpanProperties( Span.basic(-3, 0), false, -3, 0, BWD );
				_checkSpanProperties( Span.basic(3, 0), false, 3, 0, BWD );
			});
			
			it('should be of undefined direction when the args are of opposite sign, but non-zero', function () {
				_checkSpanProperties( Span.basic(5, -3), false, 5, -3, UND );		
				_checkSpanProperties( Span.basic(-5, 3), false, -5, 3, UND );		
			});
		});
	});

	describe('When creating an incrementing span', function () { 
		describe('When using 0 params', function () {
			it('should always answer a newforward nonwrapping 0 edge', function () {
				var span = Span.inc();
				expect( span.isSameAs(Span.inc()) ).toBe(true);
				expect( span === Span.inc() ).toBe(false);
				expect( span.isSameAs(Span.edge(0)) ).toBe( false );
				
				_checkSpanProperties(span, false, 0, 0, FWD, NON);
			});
		});
		
		describe('When using 1 params', function () {
			it('should answer a standard inc span span', function () {
				expect( Span.inc(0).isSameAs(Span.inc()) ).toBe( true );
				
				_checkSpanProperties( Span.inc(3), false, 3, 3, FWD, NON );
				_checkSpanProperties( Span.inc(-5), false, -5, -5, FWD, NON );
			});
			
			it('using -0 should be different from using 0', function () {
				expect( Span.inc(-0).isSameAs( Span.inc(0) )).toBe( false );
			});
		});
		
		describe('When using 2 edge params', function () {
			it('should be forward implied direction when increasing', function () {
				_checkSpanProperties( Span.inc(5, 7), false, 5, 7, FWD, FWD );
				_checkSpanProperties( Span.inc(-100, -1), false, -100, -1, FWD, FWD );
			});
			
			it('should be backward implied direction when decreasing', function () {
				_checkSpanProperties( Span.inc(10, 3), false, 10, 3, FWD, BWD );
				_checkSpanProperties( Span.inc(-12, -20), false, -12, -20, FWD, BWD );				
			});
			
			it('should be implied nondirectional when the args are the exactly the same', function () {
				_checkSpanProperties( Span.inc(10, 10), false, 10, 10, FWD, NON );
				_checkSpanProperties( Span.inc(0, 0), false, 0, 0, FWD, NON );
				_checkSpanProperties( Span.inc(-3, -3), false, -3, -3, FWD, NON );
			});
			
			it('should be of undefined direction when the args are of opposite sign, but non-zero', function () {
				_checkSpanProperties( Span.inc(5, -3), false, 5, -3, FWD, UND );		
				_checkSpanProperties( Span.inc(-5, 3), false, -5, 3, FWD, UND );		
			});
		});
		
		describe('When using the wraps param', function () {
			it('should be same as not using it when wraps is false', function () {
				expect( Span.inc(5, false).isSameAs(Span.inc(5)) ).toBe( true );
				expect( Span.inc(-0, false).isSameAs(Span.inc(-0)) ).toBe( true );
				expect( Span.inc(5, 7, false).isSameAs(Span.inc(5, 7)) ).toBe( true );
				expect( Span.inc(-100, -1, false).isSameAs(Span.inc(-100, -1)) ).toBe( true );
				expect( Span.inc(-1, 1, false).isSameAs(Span.inc(-1, 1)) ).toBe( true );		
			});
			
			it('should be set to true when wraps is true', function () {
				_checkSpanProperties( Span.inc(5, 7, true), true, 5, 7, FWD, FWD );
				_checkSpanProperties( Span.inc(-100, -1, true), true, -100, -1, FWD, FWD );
			});
			
			it('should not cause clamping when implied direction is decreasing', function () {
				_checkSpanProperties( Span.inc(10, 3, true), true, 10, 3, FWD, BWD );
				_checkSpanProperties( Span.inc(-12, -20, true), true, -12, -20, FWD, BWD );				
			});
			
			it('should be implied nondirectional when using one edge arg', function () {
				_checkSpanProperties( Span.inc(10, true), true, 10, 10, FWD, NON );
				_checkSpanProperties( Span.inc(0, true), true, 0, 0, FWD, NON );
				_checkSpanProperties( Span.inc(-3, true), true, -3, -3, FWD, NON );
			});
			
			it('should be implied nondirectional when the args are the exactly the same', function () {
				_checkSpanProperties( Span.inc(10, 10, true), true, 10, 10, FWD, NON );
				_checkSpanProperties( Span.inc(0, 0, true), true, 0, 0, FWD, NON );
				_checkSpanProperties( Span.inc(-3, -3, true), true, -3, -3, FWD, NON );
			});
			
			it('should be of undefined direction when the args are of opposite sign, but non-zero', function () {
				_checkSpanProperties( Span.inc(5, -3, true), true, 5, -3, FWD, UND );		
				_checkSpanProperties( Span.inc(-5, 3, true), true, -5, 3, FWD, UND );		
			});
		});
	});

	// ADD TESTS FOR THIS!!! -->> describe('When creating an decrementing span', function () {});
	
	describe('When getting the size of a span', function () {
		it('should answer 0 when it is a nonwrapping edge', function () {
			expect( Span.edge(4).size() ).toBe( 0 );
			expect( Span.basic(4).size() ).toBe( 0 );
			expect( Span.inc(4).size() ).toBe( 0 );
			expect( Span.dec(4).size() ).toBe( 0 );
		});
		
		it('should normally answer a positive integer', function () {
			expect( Span.inc(4, 8).size() ).toBe( 4 );
			expect( Span.dec(8, 4).size() ).toBe( 4 );
			expect( Span.basic(8, 4).size() ).toBe( 4 );
			expect( Span.inc(-7, -0).size() ).toBe( 7 );
			expect( Span(0, 0).size() ).toBe( 0 );
		});

		it('should answer 0 if the impliedDirection is opposite the direction', function () {
			expect( Span.dec(-7, -0).size() ).toBe( 0 );
			expect( Span(10, 4, FWD).size() ).toBe( 0 );
		});

		it('should answer undefined when the edge are in opposite directions', function () {
			expect( Span.basic(8, -4).size() ).toBe( UND );
			expect( Span.inc(7, -0).size() ).toBe( UND );
			expect( Span.inc(0, -0).size() ).toBe( UND );
			expect( Span.dec(5, -1).size() ).toBe( UND );
		});

		it('should answer undefined if it is wrapping', function () {
			expect( Span.basic(4, true).size() ).toBe( UND );
			expect( Span.inc(4, true).size() ).toBe( UND );
			expect( Span.dec(4, true).size() ).toBe( UND );

			expect( Span.inc(4, 8, true).size() ).toBe( UND );
			expect( Span.dec(4, 8, true).size() ).toBe( UND );

			expect( Span(10, 4, FWD, true).size() ).toBe( UND );

			expect( Span.dec(5, -1).size() ).toBe( UND );
		});
	});
	
	describe('When checking to see if an object is a span', function () {
		it('HotSausage.Collections.Span should be able to check if another object is a span', function () {
			expect( Span.isSpan(Span.inc()) ).toBe( true );
			expect( Span.isSpan({}) ).toBe( false );
			expect( Span.isSpan("") ).toBe( false );
			expect( Span.isSpan(34) ).toBe( false );
		});

		it('should be possible for a span to check to see if it is a span itself', function () {
			expect( Span.inc().isSpan() ).toBe( true );
		});
	});

	describe('When normalizing a span', function () {

	});
	
});
